import React, { useState, useEffect } from 'react';
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
  getLocalISOString,
} from '@keep-accounts-app/domain';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx: Transaction | null;
  accountGroups: AccountGroup[];
  onSave: (
    description: string,
    amount: string,
    type: 'income' | 'expense',
    category: string,
    date: string,
    accountGroupId: string
  ) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTx,
  accountGroups,
  onSave,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getLocalISOString());
  const [accountGroupId, setAccountGroupId] = useState('1');

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
      setDescription('');
      setAmount('');
      setType('expense');
      setAccountGroupId(accountGroups[0]?.id || '1');
      setDate(getLocalISOString());
    }
  }, [editingTx, isOpen, accountGroups]);

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
    onSave(description, amount, type, category, date, accountGroupId);
  };

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

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
          }}
        >
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
          {/* Type Switcher */}
          <div>
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
                onClick={() => setType('expense')}
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
                onClick={() => setType('income')}
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
            <IonSelect
              value={accountGroupId}
              interface="action-sheet"
              onIonChange={(e) => setAccountGroupId(e.detail.value!)}
              style={{
                width: '100%',
              }}
            >
              {accountGroups.map((group) => (
                <IonSelectOption key={group.id} value={group.id}>
                  {group.emoji} {group.name}
                </IonSelectOption>
              ))}
            </IonSelect>
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
              交易說明
            </label>
            <IonInput
              type="text"
              placeholder="例如: 買咖啡、午餐、薪水"
              value={description}
              onIonInput={(e) => setDescription(e.detail.value ?? '')}
              required
            />
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
            <IonSelect
              value={category}
              interface="action-sheet"
              onIonChange={(e) => setCategory(e.detail.value!)}
              style={{
                width: '100%',
              }}
            >
              {(
                accountGroups.find((g) => g.id === accountGroupId)?.categories.filter(
                  (c) => c.type === type
                ) || []
              ).map((cat) => (
                <IonSelectOption key={cat.name} value={cat.name}>
                  {cat.emoji} {cat.name}
                </IonSelectOption>
              ))}
            </IonSelect>
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
