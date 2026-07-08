import React, { useState, useEffect } from 'react';
import {
  IonSelect,
  IonSelectOption,
  IonInput,
} from '@ionic/react';
import {
  AccountGroup,
  ACCOUNT_EMOJIS,
  ACCOUNT_COLORS,
} from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountGroups: AccountGroup[];
  onSaveGroups: (groups: AccountGroup[]) => boolean;
  onDeleteGroup: (groupId: string) => void;
  onAddGroup: (
    name: string,
    emoji: string,
    color: string,
    budget: string
  ) => void;
  onAddCategory: (
    groupId: string,
    name: string,
    emoji: string,
    color: string,
    type: 'income' | 'expense'
  ) => void;
  onDeleteCategory: (
    groupId: string,
    catName: string,
    type: 'income' | 'expense'
  ) => void;
  onUpdateGroupBudget: (groupId: string, budget: number | undefined) => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  accountGroups,
  onSaveGroups,
  onDeleteGroup,
  onAddGroup,
  onAddCategory,
  onDeleteCategory,
  onUpdateGroupBudget,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroups, setEditingGroups] = useState<AccountGroup[] | null>(null);

  // Form State for Adding Account Group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('💳');
  const [newGroupColor, setNewGroupColor] = useState('#6366f1');
  const [newGroupBudget, setNewGroupBudget] = useState('');

  // State for Managing Categories (小項)
  const [catEditType, setCatEditType] = useState<'expense' | 'income'>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#f59e0b');

  useEffect(() => {
    if (isOpen) {
      setEditingGroups(JSON.parse(JSON.stringify(accountGroups)));
    } else {
      setEditingGroups(null);
      setEditingGroupId(null);
    }
  }, [isOpen, accountGroups]);

  if (!isOpen || !editingGroups) return null;

  const handleSave = () => {
    const success = onSaveGroups(editingGroups);
    if (success) {
      onClose();
    }
  };

  const handleAddGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onAddGroup(newGroupName, newGroupEmoji, newGroupColor, newGroupBudget);
    setNewGroupName('');
    setNewGroupColor('#6366f1');
    setNewGroupBudget('');
  };

  const targetSum = editingGroups.reduce(
    (s, g) => s + (g.targetRatio || 0),
    0
  );
  const isInvalidRatio = targetSum !== 100;

  return (
    <div
      className="glass-card fade-in"
      style={{
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
          ⚙️ 編輯資金帳戶與設定
        </h3>
        <button
          onClick={handleSave}
          disabled={isInvalidRatio}
          style={{
            background: 'transparent',
            color: isInvalidRatio ? 'var(--text-tertiary)' : 'var(--primary-color)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: isInvalidRatio ? 'not-allowed' : 'pointer',
          }}
        >
          完成編輯
        </button>
      </div>

      {/* Account Groups List (Edit Mode) */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
        {editingGroups.map((group) => {
          const targetRatio = group.targetRatio || 0;
          return (
            <div
              key={group.id}
              className="glass-card"
              style={{
                flexShrink: 0,
                width: '150px',
                padding: '16px',
                borderRadius: 'var(--border-radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%',
                  }}
                >
                  <AppIcon name={group.emoji} size={18} />
                  <span>{group.name}</span>
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                目標: {targetRatio}%
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                }}
              >
                {group.id !== '1' && (
                  <button
                    type="button"
                    onClick={() => onDeleteGroup(group.id)}
                    style={{
                      background: '#f43f5e',
                      color: '#fff',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                    title="刪除帳戶"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setEditingGroupId(editingGroupId === group.id ? null : group.id)
                  }
                  style={{
                    background:
                      editingGroupId === group.id
                        ? 'var(--primary-color)'
                        : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                  }}
                  title="管理分類小項"
                >
                  ⚙️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Ratio Editor Panel */}
      <div
        className="glass-card fade-in"
        style={{
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', margin: 0 }}>
          🎯 設定資金大項目標配比
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {editingGroups.map((group) => (
            <div
              key={group.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <AppIcon name={group.emoji} size={18} />
                <span>{group.name}</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={group.targetRatio ?? ''}
                  onChange={(e: any) => {
                    const raw = e.target.value ?? '';
                    const val = raw === '' ? 0 : Math.max(0, parseInt(raw, 10));
                    const updated = editingGroups.map((eg) => {
                      if (eg.id === group.id) {
                        return { ...eg, targetRatio: val };
                      }
                      return eg;
                    });
                    setEditingGroups(updated);
                  }}
                  style={{
                    width: '80px',
                    fontSize: '1rem',
                    padding: '6px',
                    textAlign: 'right',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>配比總和:</span>
            <span
              style={{
                fontWeight: 600,
                color: isInvalidRatio ? 'var(--expense-color)' : 'var(--income-color)',
              }}
            >
              {targetSum}%
            </span>
          </div>
          {isInvalidRatio && (
            <div
              style={{
                color: 'var(--expense-color)',
                fontSize: '0.8rem',
                marginTop: '6px',
                fontWeight: 500,
              }}
            >
              ⚠️ 目標比例加總必須為 100%（目前: {targetSum}%）
            </div>
          )}
        </div>
      </div>

      {/* Category Management Sub-panel */}
      {editingGroupId && (() => {
        const group = editingGroups.find((g) => g.id === editingGroupId);
        if (!group) return null;
        const filteredCats = group.categories.filter((c) => c.type === catEditType);
        return (
          <div
            className="glass-card fade-in"
            style={{
              padding: '16px',
              border: '1px solid rgba(99, 102, 241, 0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: 0,
                }}
              >
                <AppIcon name={group.emoji} size={18} />
                <span>管理「{group.name}」分類小項</span>
              </h4>
              <button
                onClick={() => setEditingGroupId(null)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                關閉
              </button>
            </div>

            {/* Budget Edit Section */}
            <div
              style={{
                marginBottom: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: '16px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}
              >
                設定每月預算 (未設置或 0 表示不限制)
              </label>
              <IonInput
                type="number"
                min={0}
                placeholder="例如: 10000"
                value={group.budget ?? ''}
                onIonInput={(e) => {
                  const raw = e.detail.value ?? '';
                  const val = raw === '' ? undefined : Math.max(0, parseInt(raw, 10));
                  onUpdateGroupBudget(group.id, val);
                  const updated = editingGroups.map((eg) => {
                    if (eg.id === group.id) {
                      return { ...eg, budget: val };
                    }
                    return eg;
                  });
                  setEditingGroups(updated);
                }}
                style={
                  {
                    width: '100%',
                    fontSize: '1rem',
                  } as React.CSSProperties
                }
              />
            </div>

            {/* Type Switcher */}
            <div
              className="segment-btn-group"
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                padding: '4px',
              }}
            >
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCatEditType(t)}
                  className={`segment-btn ${catEditType === t ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {t === 'expense' ? '支出分類' : '收入分類'}
                </button>
              ))}
            </div>

            {/* Categories List */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {filteredCats.map((cat) => (
                <div
                  key={cat.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${cat.color}33`,
                    fontSize: '0.8rem',
                  }}
                >
                  <AppIcon name={cat.emoji} size={16} />
                  <span>{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteCategory(group.id, cat.name, catEditType);
                      // sync local editingGroups categories
                      const updated = editingGroups.map((eg) => {
                        if (eg.id === group.id) {
                          return {
                            ...eg,
                            categories: eg.categories.filter(
                              (c) => !(c.name === cat.name && c.type === catEditType)
                            ),
                          };
                        }
                        return eg;
                      });
                      setEditingGroups(updated);
                    }}
                    style={{
                      background: 'transparent',
                      color: 'var(--text-tertiary)',
                      fontSize: '0.75rem',
                      marginLeft: '4px',
                      padding: '2px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {filteredCats.length === 0 && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-tertiary)',
                    width: '100%',
                    textAlign: 'center',
                    padding: '10px 0',
                  }}
                >
                  無此類型分類，請新增
                </div>
              )}
            </div>

            {/* Add Category Form */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <h5
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '10px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                新增分類小項
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <IonSelect
                    value={newCatEmoji}
                    interface="action-sheet"
                    onIonChange={(e) => setNewCatEmoji(e.detail.value!)}
                    style={{ width: '70px', padding: '8px', fontSize: '0.85rem' }}
                  >
                    {[
                      'coffee',
                      'car',
                      'film',
                      'shopping-cart',
                      'home',
                      'zap',
                      'tag',
                      'briefcase',
                      'gift',
                      'landmark',
                      'credit-card',
                      'shield',
                    ].map((em) => (
                      <IonSelectOption key={em} value={em}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AppIcon name={em} size={16} />
                          {em}
                        </div>
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                  <IonInput
                    type="text"
                    placeholder="分類名稱"
                    value={newCatName}
                    onIonInput={(e) => setNewCatName(e.detail.value ?? '')}
                    style={
                      {
                        flex: 1,
                        fontSize: '1rem',
                      } as React.CSSProperties
                    }
                  />
                </div>

                {/* Category Color Picker */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      marginBottom: '6px',
                    }}
                  >
                    選擇分類顏色
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {ACCOUNT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: newCatColor === c ? '2px solid #fff' : '2px solid transparent',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newCatName.trim()) return;
                    onAddCategory(group.id, newCatName, newCatEmoji, newCatColor, catEditType);
                    // sync local editingGroups
                    const updated = editingGroups.map((eg) => {
                      if (eg.id === group.id) {
                        return {
                          ...eg,
                          categories: [
                            ...eg.categories,
                            { name: newCatName.trim(), emoji: newCatEmoji, color: newCatColor, type: catEditType },
                          ],
                        };
                      }
                      return eg;
                    });
                    setEditingGroups(updated);
                    setNewCatName('');
                  }}
                  style={{
                    background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginTop: '4px',
                  }}
                >
                  新增分類
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Inline Account group editor panel */}
      <div
        className="glass-card fade-in"
        style={{ padding: '16px', borderStyle: 'dashed' }}
      >
        <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600, margin: 0 }}>
          新增資金大項
        </h4>
        <form
          onSubmit={handleAddGroupSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <IonSelect
              value={newGroupEmoji}
              interface="action-sheet"
              onIonChange={(e) => setNewGroupEmoji(e.detail.value!)}
              style={{ width: '70px', fontSize: '0.85rem' }}
            >
              {ACCOUNT_EMOJIS.map((e) => (
                <IonSelectOption key={e} value={e}>
                  {e}
                </IonSelectOption>
              ))}
            </IonSelect>
            <IonInput
              type="text"
              placeholder="帳戶大項名稱"
              value={newGroupName}
              onIonInput={(e) => setNewGroupName(e.detail.value ?? '')}
              style={
                {
                  flex: 1,
                  fontSize: '1rem',
                } as React.CSSProperties
              }
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              每月預算 (選填，未設定或0為不限制)
            </label>
            <IonInput
              type="number"
              min={0}
              placeholder="每月預算金額 ($)"
              value={newGroupBudget}
              onIonInput={(e) => setNewGroupBudget(e.detail.value ?? '')}
              style={
                {
                  fontSize: '1rem',
                } as React.CSSProperties
              }
            />
          </div>

          {/* Color selection for new group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              選擇資金大項顏色
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewGroupColor(c)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: newGroupColor === c ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: newGroupColor === c ? '0 0 8px ' + c : 'none',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
              color: '#fff',
              padding: '10px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginTop: '6px',
            }}
          >
            確認加入
          </button>
        </form>
      </div>
    </div>
  );
};
