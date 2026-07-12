import React, { useEffect, useRef, useState } from 'react';
import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
} from '@ionic/react';
import { Transaction, AccountGroup } from '@keep-accounts-app/domain';
import {
  queryHistoryPage,
  queryNativeHistoryPage,
} from '@keep-accounts-app/state';
import { AppIcon } from './AppIcon';
import { TransactionLedgerRow } from './TransactionLedgerRow';

interface HistoryTabProps {
  accountGroups: AccountGroup[];
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onDeleteInstallmentGroup: (installmentId: string) => void;
  onSettleInstallmentGroup: (installmentId: string) => void;
  getCategoryEmoji: (catName: string, groupId: string) => string;
  getGroupName: (groupId: string) => string;
  onEditTransaction: (tx: Transaction) => void;
  onAddTransaction: () => void;
  showFab?: boolean;
  preferNativeQueries?: boolean;
}

const HISTORY_PAGE_SIZE = 50;
const HISTORY_SKELETON_COUNT = 3;

export const HistoryTab: React.FC<HistoryTabProps> = ({
  accountGroups,
  transactions,
  onDeleteTransaction,
  onDeleteInstallmentGroup,
  onSettleInstallmentGroup,
  getCategoryEmoji,
  getGroupName,
  onEditTransaction,
  onAddTransaction,
  showFab = true,
  preferNativeQueries = false,
}) => {
  const formatAmount = (value: number) => value.toLocaleString('zh-TW');

  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'installment'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [visibleFlatTxs, setVisibleFlatTxs] = useState<Transaction[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMoreFlatTxs, setHasMoreFlatTxs] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const loadingRef = useRef(false);

  const installmentFilteredTxs = visibleFlatTxs
    .filter((tx) => !!tx.installmentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  type InstallmentGroup = {
    installmentId: string;
    transactions: Transaction[];
  };

  const installmentGroups = Object.values(
    installmentFilteredTxs.reduce<Record<string, InstallmentGroup>>((groups, tx) => {
      const installmentId = tx.installmentId as string;
      if (!groups[installmentId]) {
        groups[installmentId] = {
          installmentId,
          transactions: [],
        };
      }
      groups[installmentId].transactions.push(tx);
      return groups;
    }, {})
  )
    .map((group) => ({
      ...group,
      transactions: [...group.transactions].sort(
        (a, b) => (a.installmentPeriod ?? 0) - (b.installmentPeriod ?? 0) || a.date.localeCompare(b.date)
      ),
      latestDate: group.transactions.reduce(
        (latest, tx) => (tx.date.localeCompare(latest) > 0 ? tx.date : latest),
        group.transactions[0]?.date || ''
      ),
    }))
    .sort((a, b) => b.latestDate.localeCompare(a.latestDate));

  const isInstallmentView = filter === 'installment';

  const [groupBy, setGroupBy] = useState<'year' | 'month' | 'day'>('month');
  const fetchPage = async (offset: number) => {
    if (preferNativeQueries) {
      const nativePage = await queryNativeHistoryPage({
        filterType: filter,
        filterGroup,
        offset,
        pageSize: HISTORY_PAGE_SIZE,
      });
      if (nativePage) {
        return nativePage;
      }
    }

    return queryHistoryPage({
      transactions,
      filterType: filter,
      filterGroup,
      offset,
      pageSize: HISTORY_PAGE_SIZE,
    });
  };

  useEffect(() => {
    if (!preferNativeQueries) {
      const firstPage = queryHistoryPage({
        transactions,
        filterType: filter,
        filterGroup,
        offset: 0,
        pageSize: HISTORY_PAGE_SIZE,
      });
      setVisibleFlatTxs(firstPage.items);
      setNextOffset(firstPage.nextOffset);
      setHasMoreFlatTxs(firstPage.hasMore);
      setLoadFailed(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
      return;
    }

    let cancelled = false;

    const loadFirstPage = async () => {
      const firstPage = await fetchPage(0);

      if (!firstPage || cancelled) {
        return;
      }
      setVisibleFlatTxs(firstPage.items);
      setNextOffset(firstPage.nextOffset);
      setHasMoreFlatTxs(firstPage.hasMore);
      setLoadFailed(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    };

    void loadFirstPage();
    return () => {
      cancelled = true;
    };
  }, [transactions, filter, filterGroup, preferNativeQueries]);

  const getGroupKey = (dateStr: string, mode: 'day' | 'month' | 'year') => {
    const datePart = dateStr.substring(0, 10);
    if (mode === 'day') return datePart;
    if (mode === 'month') return datePart.substring(0, 7);
    return datePart.substring(0, 4);
  };

  const formatGroupHeader = (key: string, mode: 'day' | 'month' | 'year') => {
    if (mode === 'day') {
      const parts = key.split('-');
      if (parts.length === 3) {
        return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
      }
      return key;
    }
    if (mode === 'month') {
      const parts = key.split('-');
      if (parts.length === 2) {
        return `${parts[0]}年${parseInt(parts[1])}月`;
      }
      return key;
    }
    return `${key}年`;
  };

  const getGroupTotals = (groupTxs: Transaction[]) => {
    const income = groupTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = groupTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expense };
  };

  // Group transactions by date key
  const groupedTxs: Record<string, Transaction[]> = {};
  visibleFlatTxs.forEach((tx) => {
    const key = getGroupKey(tx.date, groupBy);
    if (!groupedTxs[key]) {
      groupedTxs[key] = [];
    }
    groupedTxs[key].push(tx);
  });

  // Sort keys descending
  const sortedGroupKeys = Object.keys(groupedTxs).sort((a, b) => b.localeCompare(a));

  const loadNextPage = async (event: any) => {
    const complete = () => event?.target?.complete?.();
    if (!hasMoreFlatTxs || loadingRef.current) {
      complete();
      return;
    }

    loadingRef.current = true;
    setLoadFailed(false);
    setIsLoadingMore(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 160));
      const nextPage = preferNativeQueries
        ? await fetchPage(nextOffset)
        : queryHistoryPage({
            transactions,
            filterType: filter,
            filterGroup,
            offset: nextOffset,
            pageSize: HISTORY_PAGE_SIZE,
          });
      if (!nextPage) {
        throw new Error('history page unavailable');
      }
      setVisibleFlatTxs((prev) => [...prev, ...nextPage.items]);
      setNextOffset(nextPage.nextOffset);
      setHasMoreFlatTxs(nextPage.hasMore);
    } catch {
      setLoadFailed(true);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
      complete();
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px', position: 'relative' }}>

      {/* Filter controls row */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Filter Group Selector */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            帳戶：
          </span>
          <IonSelect
            value={filterGroup}
            interface="action-sheet"
            onIonChange={(e) => setFilterGroup(e.detail.value!)}
            style={{
              fontSize: '0.85rem',
            }}
          >
            <IonSelectOption value="all">顯示全部帳戶</IonSelectOption>
            {accountGroups.map((g) => (
              <IonSelectOption key={g.id} value={g.id}>
                {g.emoji} {g.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>

        {!isInstallmentView && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              分組：
            </span>
            <div className="segment-btn-group" style={{ padding: '3px' }}>
              {(['year', 'month', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGroupBy(mode)}
                  className={`segment-btn ${groupBy === mode ? 'active' : ''}`}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                  }}
                >
                  {mode === 'year' ? '年' : mode === 'month' ? '月' : '日'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter buttons for type */}
      <div className="segment-btn-group">
        {(['all', 'income', 'expense', 'installment'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`segment-btn ${filter === t ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {t === 'all' ? '全部' : t === 'income' ? '收入' : t === 'expense' ? '支出' : '分期'}
          </button>
        ))}
      </div>

      {/* History Ledger List */}
      {!isInstallmentView ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedGroupKeys.map((groupKey) => {
            const groupTransactions = groupedTxs[groupKey];
            const { income, expense } = getGroupTotals(groupTransactions);
            return (
              <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Group Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'var(--sub-card-bg)',
                    border: '1px solid var(--sub-card-border)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatGroupHeader(groupKey, groupBy)}
                  </span>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontWeight: 500 }}>
                    {income > 0 && <span style={{ color: 'var(--income-color)' }}>收入: +${income}</span>}
                    {expense > 0 && <span style={{ color: 'var(--expense-color)' }}>支出: -${expense}</span>}
                  </div>
                </div>

                {/* Transactions list in group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {groupTransactions.map((tx) => (
                    <TransactionLedgerRow
                      key={tx.id}
                      dataTestId="history-flat-row"
                      tx={tx}
                      getCategoryEmoji={getCategoryEmoji}
                      getGroupName={getGroupName}
                      onEditTransaction={tx.installmentId ? undefined : onEditTransaction}
                      onDeleteTransaction={
                        tx.installmentId
                          ? undefined
                          : (id) => {
                              if (window.confirm('確定要刪除此筆記帳嗎？')) {
                                onDeleteTransaction(id);
                              }
                            }
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {visibleFlatTxs.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 0',
                color: 'var(--text-tertiary)',
                fontSize: '0.9rem',
              }}
            >
              沒有找到符合條件的明細
            </div>
          )}

          {isLoadingMore && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array.from({ length: HISTORY_SKELETON_COUNT }).map((_, index) => (
                <div
                  key={`history-skeleton-${index}`}
                  className="glass-card"
                  data-testid="history-skeleton-card"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <IonSkeletonText animated style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <IonSkeletonText animated style={{ width: '45%', height: '14px' }} />
                      <IonSkeletonText animated style={{ width: '30%', height: '11px' }} />
                      <IonSkeletonText animated style={{ width: '40%', height: '11px' }} />
                    </div>
                  </div>
                  <IonSkeletonText animated style={{ width: '70px', height: '14px' }} />
                </div>
              ))}
            </div>
          )}

          {loadFailed && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.82rem',
              }}
            >
              載入失敗，請繼續下滑重試
            </div>
          )}

          {!hasMoreFlatTxs && visibleFlatTxs.length > 0 && (
            <div
              data-testid="history-end-of-list"
              style={{
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.82rem',
                padding: '8px 0',
              }}
            >
              已載入全部
            </div>
          )}

          <IonInfiniteScroll
            data-testid="history-infinite-scroll"
            threshold="120px"
            disabled={!hasMoreFlatTxs || isLoadingMore}
            onIonInfinite={loadNextPage}
          >
            <IonInfiniteScrollContent />
          </IonInfiniteScroll>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {installmentGroups.map((group) => {
            const totalPeriods = group.transactions.length;
            const completedPeriods = group.transactions.filter(
              (tx) => new Date(tx.date).getTime() <= Date.now()
            ).length;
            const remainingAmount = group.transactions
              .filter((tx) => new Date(tx.date).getTime() > Date.now())
              .reduce((sum, tx) => sum + tx.amount, 0);
            const totalAmount = group.transactions.reduce((sum, tx) => sum + tx.amount, 0);
            const groupTx = group.transactions[0];
            const installLabel =
              groupTx.installmentPeriod && groupTx.installmentCount
                ? `第 ${groupTx.installmentPeriod} / ${groupTx.installmentCount} 期`
                : `共 ${totalPeriods} 期`;

            return (
              <div
                key={group.installmentId}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{groupTx.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {groupTx.category} • {getGroupName(groupTx.accountGroupId)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      已繳 {completedPeriods} / {totalPeriods} 期 · 總額 ${formatAmount(totalAmount)} · 剩餘 ${formatAmount(remainingAmount)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--border-radius-sm)', padding: '2px 8px' }}>
                      {installLabel}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {remainingAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => onSettleInstallmentGroup(group.installmentId)}
                          style={{
                            border: 'none',
                            background: 'var(--primary-color)',
                            color: 'white',
                            borderRadius: 'var(--border-radius-sm)',
                            padding: '6px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          提前結清
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('確定要刪除整組分期嗎？')) {
                            onDeleteInstallmentGroup(group.installmentId);
                          }
                        }}
                        style={{
                          border: '1px solid var(--card-border)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        刪除整組
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.transactions.map((tx) => {
                    const datePart = tx.date.substring(0, 10);
                    const timePart = tx.date.includes('T') ? tx.date.substring(11, 16) : '';
                    return (
                      <div
                        key={tx.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: 'var(--border-radius-sm)',
                          background: 'var(--sub-card-bg)',
                          border: '1px solid var(--sub-card-border)',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                            第 {tx.installmentPeriod} 期
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {datePart}
                            {timePart ? ` ${timePart}` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--expense-color)' }}>
                            -${formatAmount(tx.amount)}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--border-radius-sm)', padding: '2px 6px', whiteSpace: 'nowrap' }}>
                            {tx.installmentPeriod && tx.installmentCount ? `${tx.installmentPeriod}/${tx.installmentCount}` : '分期'}
                          </span>
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="編輯單期"
                          >
                            <AppIcon name="edit" size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('確定要刪除此期分期嗎？')) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="刪除單期"
                          >
                            <AppIcon name="trash" size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {installmentGroups.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 0',
                color: 'var(--text-tertiary)',
                fontSize: '0.9rem',
              }}
            >
              沒有找到符合條件的分期群組
            </div>
          )}
        </div>
      )}
    </div>
  );
};
