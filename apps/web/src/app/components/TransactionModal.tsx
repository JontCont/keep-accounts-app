import React, { useState, useEffect, useRef } from 'react';
import {
  IonModal,
  IonDatetimeButton,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonInput,
} from '@ionic/react';
import {
  Transaction,
  AccountGroup,
  InstallmentReminderConfig,
  getLocalISOString,
} from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';
import { isNotificationSupported } from '../services/notifications';

interface CustomSelectProps {
  value: string;
  options: { value: string; label: string; icon: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid var(--input-border)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          minHeight: '40px',
          fontSize: '1rem',
          fontFamily: 'var(--font-family)',
          transition: 'var(--transition-smooth)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedOption ? (
            <>
              <AppIcon name={selectedOption.icon} size={18} style={{ color: 'var(--primary-color)' }} />
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-tertiary)' }}>{placeholder}</span>
          )}
        </div>
        <AppIcon name="chevron-down" size={16} style={{ color: 'var(--text-tertiary)' }} />
      </div>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'transparent',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: 'var(--modal-card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--border-radius-sm)',
              boxShadow: 'var(--card-shadow)',
              zIndex: 10000,
              maxHeight: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              padding: '4px',
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: option.value === value ? 'var(--primary-color)' : 'var(--text-primary)',
                  background: option.value === value ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  transition: 'background 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.background = 'var(--input-bg)';
                  }
                }}
                onMouseOut={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <AppIcon
                  name={option.icon}
                  size={18}
                  style={{
                    color: option.value === value ? 'var(--primary-color)' : 'var(--text-secondary)',
                  }}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: option.value === value ? 600 : 400 }}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx: Transaction | null;
  accountGroups: AccountGroup[];
  initialTab?: 'basic' | 'installment';
  onSave: (
    description: string,
    amount: string,
    type: 'income' | 'expense',
    category: string,
    date: string,
    accountGroupId: string,
    installment?: {
      periods: number;
      reminder: InstallmentReminderConfig;
    } | null
  ) => void;
}

const DEFAULT_NOTIFICATION_TITLE = '信用卡分期繳費提醒';
const DEFAULT_NOTIFICATION_BODY = '今天有一期分期款項需要繳納，別忘了！';
const SYSTEM_INSTALLMENT_CATEGORY = '分期';

export const resolveTransactionCategory = (category: string, useInstallment: boolean) => {
  return useInstallment ? SYSTEM_INSTALLMENT_CATEGORY : category;
};

const shiftDateMonthsWithDayClamp = (base: Date, monthDelta: number) => {
  const shifted = new Date(base);
  const originalDay = shifted.getDate();
  shifted.setDate(1);
  shifted.setMonth(shifted.getMonth() + monthDelta);
  const monthLastDay = new Date(
    shifted.getFullYear(),
    shifted.getMonth() + 1,
    0
  ).getDate();
  shifted.setDate(Math.min(originalDay, monthLastDay));
  return shifted;
};

export const shiftLocalIsoMonth = (isoDate: string, monthDelta: number) => {
  const base = new Date(isoDate);
  if (Number.isNaN(base.getTime())) {
    return isoDate;
  }
  return getLocalISOString(shiftDateMonthsWithDayClamp(base, monthDelta));
};

export const applyYearMonthToLocalIso = (isoDate: string, yearMonth: string) => {
  const base = new Date(isoDate);
  if (Number.isNaN(base.getTime())) {
    return isoDate;
  }

  const matched = yearMonth.match(/^(\d{4})-(\d{2})$/);
  if (!matched) {
    return isoDate;
  }

  const targetYear = parseInt(matched[1], 10);
  const targetMonthIndex = parseInt(matched[2], 10) - 1;
  if (targetMonthIndex < 0 || targetMonthIndex > 11) {
    return isoDate;
  }

  const adjusted = new Date(base);
  const originalDay = adjusted.getDate();
  adjusted.setDate(1);
  adjusted.setFullYear(targetYear, targetMonthIndex, 1);
  const monthLastDay = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  adjusted.setDate(Math.min(originalDay, monthLastDay));
  return getLocalISOString(adjusted);
};

const formatLocalYearMonth = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
};

export const resolveDefaultTransactionGroupId = (groups: AccountGroup[]) => {
  const preferredDailyGroup = groups.find((group) => group.id === '1' && !group.isSource);
  if (preferredDailyGroup) {
    return preferredDailyGroup.id;
  }

  const firstNonSourceGroup = groups.find((group) => !group.isSource);
  if (firstNonSourceGroup) {
    return firstNonSourceGroup.id;
  }

  return groups[0]?.id || '1';
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTx,
  accountGroups,
  initialTab = 'basic',
  onSave,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getLocalISOString());
  const [accountGroupId, setAccountGroupId] = useState(resolveDefaultTransactionGroupId(accountGroups));

  // Installment (分期) configuration state
  const [activeTab, setActiveTab] = useState<'basic' | 'installment'>('basic');
  const [installmentPeriods, setInstallmentPeriods] = useState('');
  const [installmentStartDate, setInstallmentStartDate] = useState(getLocalISOString());
  const [remindOnDueDate, setRemindOnDueDate] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState(DEFAULT_NOTIFICATION_TITLE);
  const [notificationBody, setNotificationBody] = useState(DEFAULT_NOTIFICATION_BODY);
  const basicNameInputRef = useRef<any>(null);
  const installmentNameInputRef = useRef<any>(null);

  const reminderSupported = isNotificationSupported();
  // Installment configuration only applies to new expense entries.
  const canConfigureInstallment = !editingTx && type === 'expense';
  // When editing a single period of an existing installment, the amount is a
  // computed split and must not be edited directly.
  const isEditingInstallment = !!editingTx?.installmentId;

  // Sync form states with editingTx when modal opens or editingTx changes
  useEffect(() => {
    if (editingTx) {
      setDescription(editingTx.description);
      setAmount(editingTx.amount.toString());
      setType(editingTx.type);
      setAccountGroupId(editingTx.accountGroupId);
      setDate(editingTx.date);
      setCategory(editingTx.category);
    } else {
      const now = getLocalISOString();
      setDescription('');
      setAmount('');
      setType('expense');
      setAccountGroupId(resolveDefaultTransactionGroupId(accountGroups));
      setDate(now);
      setInstallmentStartDate(now);
    }
    if (editingTx) {
      setInstallmentStartDate(editingTx.date);
    }
    // Reset installment config each time the modal opens.
    setActiveTab(editingTx ? 'basic' : initialTab);
    setInstallmentPeriods('');
    setRemindOnDueDate(false);
    setNotificationTitle(DEFAULT_NOTIFICATION_TITLE);
    setNotificationBody(DEFAULT_NOTIFICATION_BODY);
  }, [editingTx, isOpen, accountGroups, initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      const targetInput = canConfigureInstallment && activeTab === 'installment'
        ? installmentNameInputRef.current
        : basicNameInputRef.current;

      targetInput?.setFocus?.();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen, activeTab, canConfigureInstallment]);

  // Dynamically set category when group, type, or groups change
  useEffect(() => {
    const currentGroup = accountGroups.find((g) => g.id === accountGroupId);
    if (currentGroup && currentGroup.categories) {
      const filtered = currentGroup.categories.filter((c) => c.type === type);
      if (filtered.length > 0) {
        if (!filtered.some((c) => c.name === category)) {
          setCategory(filtered[0].name);
        }
      } else {
        setCategory('');
      }
    }
  }, [accountGroupId, type, accountGroups, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Entering a valid total + period count on the 分期 tab implies installment.
    const useInstallment =
      canConfigureInstallment && activeTab === 'installment' && hasValidInstallment;
    const periodsNum = parseInt(installmentPeriods, 10);
    const submitDate = useInstallment ? installmentStartDate : date;
    const submitAccountGroupId = useInstallment
      ? resolveDefaultTransactionGroupId(accountGroups)
      : accountGroupId;
    onSave(
      description,
      amount,
      type,
      resolveTransactionCategory(category, useInstallment),
      submitDate,
      submitAccountGroupId,
      useInstallment
        ? {
            periods: periodsNum,
            reminder: {
              remindOnDueDate: reminderSupported && remindOnDueDate,
              notificationTitle,
              notificationBody,
            },
          }
        : null
    );
  };

  // Per-period preview: base amount for periods 1..N-1, last period absorbs the
  // remainder (Taiwan convention).
  const totalNum = parseFloat(amount);
  const periodsNum = parseInt(installmentPeriods, 10);
  const hasValidInstallment =
    !isNaN(totalNum) &&
    totalNum > 0 &&
    Number.isInteger(periodsNum) &&
    periodsNum >= 1;
  const basePerPeriod = hasValidInstallment ? Math.floor(totalNum / periodsNum) : 0;
  const lastPerPeriod = hasValidInstallment
    ? totalNum - basePerPeriod * (periodsNum - 1)
    : 0;

  if (!isOpen) return null;

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--modal-backdrop-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px',
      } as React.CSSProperties}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '400px',
          maxHeight: '85vh',
          overflow: 'hidden',
          padding: '24px',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--card-border)',
          background: 'var(--modal-card-bg)',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
        }}
      >
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            textAlign: 'center',
            margin: 0,
            marginBottom: '16px',
          }}
        >
          {editingTx ? '修改收支記帳' : '新增收支記帳'}
        </h3>

        {isEditingInstallment && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'rgba(99, 102, 241, 0.08)',
              color: 'var(--primary-color)',
              fontSize: '0.8rem',
            }}
          >
            <AppIcon name="credit-card" size={16} />
            <span>
              分期交易{' '}
              {editingTx?.installmentPeriod && editingTx?.installmentCount
                ? `· 第 ${editingTx.installmentPeriod} / ${editingTx.installmentCount} 期`
                : ''}
              ·可修改金額與日期
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Type Switcher (Fixed at top) */}
          <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--card-border)', marginBottom: '12px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              交易類型
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--input-bg)',
                padding: '4px',
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (!isEditingInstallment) {
                    setType('expense');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontWeight: 600,
                  background:
                    type === 'expense' ? 'var(--expense-color)' : 'transparent',
                  color: type === 'expense' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                支出 💸
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isEditingInstallment) {
                    setType('income');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontWeight: 600,
                  background:
                    type === 'income' ? 'var(--income-color)' : 'transparent',
                  color: type === 'income' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                收入 💰
              </button>
            </div>
          </div>

          {/* Tab bar: 基本 / 分期 (new expense entries only) */}
          {canConfigureInstallment && (
            <div
              style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '12px',
                background: 'var(--input-bg)',
                padding: '4px',
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              {([
                { key: 'basic', label: '基本' },
                { key: 'installment', label: '分期' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--border-radius-sm)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background:
                      activeTab === tab.key ? 'var(--primary-color)' : 'transparent',
                    color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Scrollable form fields wrapper */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              paddingRight: '4px',
              paddingBottom: '16px',
            }}
          >
          {(!canConfigureInstallment || activeTab === 'basic') && (
          <>
          {/* Account Group selection */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              選擇資金帳戶大項
            </label>
            {isEditingInstallment ? (
              <div
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  minHeight: '40px',
                  fontSize: '1rem',
                }}
              >
                {accountGroups.find((group) => group.id === accountGroupId)?.name || '未指定帳戶'}
              </div>
            ) : (
              <CustomSelect
                value={accountGroupId}
                onChange={(val) => setAccountGroupId(val)}
                options={accountGroups.map((group) => ({
                  value: group.id,
                  label: group.name,
                  icon: group.emoji,
                }))}
                placeholder="選擇資金帳戶"
              />
            )}
          </div>

          {/* Category */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              選擇分類
            </label>
            {isEditingInstallment ? (
              <div
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  minHeight: '40px',
                  fontSize: '1rem',
                }}
              >
                {category || '未指定分類'}
              </div>
            ) : (
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={(
                  accountGroups.find((g) => g.id === accountGroupId)?.categories.filter(
                    (c) => c.type === type
                  ) || []
                ).map((cat) => ({
                  value: cat.name,
                  label: cat.name,
                  icon: cat.emoji,
                }))}
                placeholder="選擇分類"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              名稱
            </label>
            <IonInput
                    ref={basicNameInputRef}
                    autofocus={true}
              type="text"
              placeholder="例如: 買咖啡、午餐、薪水"
              value={description}
              readonly={isEditingInstallment}
              disabled={isEditingInstallment}
              onIonInput={(e) => setDescription(e.detail.value ?? '')}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              金額 ($)
            </label>
            <IonInput
              type="number"
              inputmode="decimal"
              placeholder="輸入金額"
              value={amount}
              onIonInput={(e) => setAmount(e.detail.value ?? '')}
              required
            />
          </div>

          {/* Date & Time */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              交易日期與時間
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonDatetimeButton
                datetime="tx-datetime"
                style={
                  {
                    '--background': 'var(--input-bg)',
                    '--color': 'var(--text-primary)',
                    '--border-radius': 'var(--border-radius-sm)',
                  } as React.CSSProperties
                }
              />
            </div>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                id="tx-datetime"
                presentation="date-time"
                value={date}
                onIonChange={(e) =>
                  setDate(
                    Array.isArray(e.detail.value)
                      ? e.detail.value[0] ?? getLocalISOString()
                      : e.detail.value ?? getLocalISOString()
                  )
                }
                style={
                  {
                    '--background': 'var(--modal-card-bg)',
                  } as React.CSSProperties
                }
              />
            </IonModal>
          </div>
          </>
          )}

          {/* 分期 (Installment) tab */}
          {canConfigureInstallment && activeTab === 'installment' && (
            <>
              <div>
                {/* Name (mirrors the basic 名稱 field) */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    名稱
                  </label>
                  <IonInput
                    ref={installmentNameInputRef}
                    autofocus={true}
                    type="text"
                    placeholder="例如: 手機分期、家電分期"
                    value={description}
                    onIonInput={(e) => setDescription(e.detail.value ?? '')}
                  />
                </div>

                {/* Total amount (mirrors the basic 金額 field) */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    分期總額 ($)
                  </label>
                  <IonInput
                    type="number"
                    inputmode="decimal"
                    placeholder="輸入分期總額"
                    value={amount}
                    onIonInput={(e) => setAmount(e.detail.value ?? '')}
                  />
                </div>

                {/* Period count */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    分期期數
                  </label>
                  <IonInput
                    type="number"
                    inputmode="numeric"
                    placeholder="例如: 12"
                    value={installmentPeriods}
                    onIonInput={(e) => setInstallmentPeriods(e.detail.value ?? '')}
                  />
                </div>

                {/* Installment start month */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    開始扣款月份
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setInstallmentStartDate(date)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--card-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      本期
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallmentStartDate(shiftLocalIsoMonth(date, 1))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--card-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      下一期
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallmentStartDate(shiftLocalIsoMonth(date, -1))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--card-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      前一個月
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallmentStartDate(shiftLocalIsoMonth(date, -3))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--card-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      前三個月
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="month"
                      value={formatLocalYearMonth(installmentStartDate)}
                      onChange={(e) =>
                        setInstallmentStartDate(
                          applyYearMonthToLocalIso(installmentStartDate, e.target.value)
                        )
                      }
                      style={{
                        width: '100%',
                        padding: '10px 0',
                        border: 'none',
                        borderBottom: '1px solid var(--input-border)',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-family)',
                        fontSize: '1rem',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      首期扣款：{new Date(installmentStartDate).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                </div>

                {/* Read-only per-period preview */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    每期繳交額度
                  </label>
                  <div
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid var(--input-border)',
                      color: 'var(--text-primary)',
                      minHeight: '40px',
                      fontSize: '1rem',
                    }}
                  >
                    {hasValidInstallment ? (
                      periodsNum > 1 ? (
                        <span>
                          每期 ${basePerPeriod.toLocaleString('zh-TW')}，末期 $
                          {lastPerPeriod.toLocaleString('zh-TW')}
                        </span>
                      ) : (
                        <span>${lastPerPeriod.toLocaleString('zh-TW')}</span>
                      )
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        輸入總額與期數後自動計算
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment-reminder switch */}
                <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      啟用通知
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={remindOnDueDate}
                      onClick={() => setRemindOnDueDate((v) => !v)}
                      style={{
                        width: '48px',
                        height: '28px',
                        borderRadius: '14px',
                        padding: '3px',
                        display: 'flex',
                        justifyContent: remindOnDueDate ? 'flex-end' : 'flex-start',
                        background: remindOnDueDate
                          ? 'var(--primary-color)'
                          : 'var(--input-border)',
                        transition: 'var(--transition-smooth)',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#fff',
                          display: 'block',
                        }}
                      />
                    </button>
                  </div>

                {/* Notification message fields (only relevant once the reminder switch is on) */}
                {remindOnDueDate && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '8px',
                        }}
                      >
                        通知標題
                      </label>
                      <IonInput
                        type="text"
                        placeholder="通知標題"
                        value={notificationTitle}
                        onIonInput={(e) => setNotificationTitle(e.detail.value ?? '')}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '8px',
                        }}
                      >
                        通知內容
                      </label>
                      <IonInput
                        type="text"
                        placeholder="通知內容"
                        value={notificationBody}
                        onIonInput={(e) => setNotificationBody(e.detail.value ?? '')}
                      />
                    </div>

                    {!reminderSupported && (
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-tertiary)',
                          margin: '8px 0 0',
                        }}
                      >
                        繳費通知僅在手機 App 上發送。
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          </div>

          {/* Submit Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              paddingTop: '16px',
              borderTop: '1px solid var(--card-border)',
              background: 'var(--modal-card-bg)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                color: '#fff',
                fontWeight: 600,
                boxShadow: '0 4px 15px var(--primary-glow)',
              }}
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </IonModal>
  );
};
