import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, renderHook, act, within, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useKeepAccounts } from '@keep-accounts-app/state';

import App from './app';
import { getCurrentMonthExpenseForGroup, Transaction } from '@keep-accounts-app/domain';

vi.mock('@ionic/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('@ionic/react')>();
  const React = await import('react');
  return {
    ...original,
    IonModal: ({ children, isOpen }: any) => {
      if (!isOpen) return null;
      return React.createElement('div', { 'data-testid': 'ion-modal' }, children);
    },
  };
});

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(baseElement).toBeTruthy();
  });

  it('shows installment rows as read-only in flat history views', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'inst-flat';
    const mockTxs: Transaction[] = [
      { id: `${installmentId}-1`, description: '手機分期', amount: 1000, type: 'expense', category: '購物消費', date: '2026-01-15T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 1, installmentCount: 3 },
      { id: `${installmentId}-2`, description: '手機分期', amount: 1000, type: 'expense', category: '購物消費', date: '2026-02-15T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 2, installmentCount: 3 },
      { id: 'normal-1', description: '午餐', amount: 150, type: 'expense', category: '餐飲食品', date: '2026-02-16T10:00:00+08:00', accountGroupId: '1' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getByText, getByTitle, getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    fireEvent.click(getByText('明細'));
    const installmentRow = getAllByText('手機分期')[0].closest('.glass-card') as HTMLElement;
    expect(installmentRow.textContent).toContain('分期');
    expect(within(installmentRow).queryByTitle('編輯')).toBeNull();
    expect(within(installmentRow).queryByTitle('刪除')).toBeNull();

    expect(getByTitle('新增記帳')).toBeTruthy();
  });

  it('should have Keep Accounts as the title', () => {
    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(getAllByText(new RegExp('Keep Accounts', 'gi')).length > 0).toBeTruthy();
  });

  it('should show over-allocation warning only when target ratios are greater than 100% and still allow saving', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '3', name: '儲蓄資金', emoji: 'piggy-bank', color: '#10b981', targetRatio: 40, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 30, categories: [] },
      { id: '2', name: '投資理財', emoji: 'trending-up', color: '#3b82f6', targetRatio: 30, categories: [] }
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const { getByText, getAllByPlaceholderText, queryByText } = render(<BrowserRouter><App /></BrowserRouter>);
    
    // Enter edit mode
    const editBtn = getByText(/編輯帳戶/);
    fireEvent.click(editBtn);
    
    expect(getByText('完成編輯')).toBeTruthy();
    
    // Find all number inputs by placeholder "0"
    const inputs = getAllByPlaceholderText('0');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    
    // Non-source groups sum to 100% (40 + 30 + 30). Change the first (儲蓄資金) input to 50
    fireEvent.change(inputs[0], { target: { value: '50' } });
    
    // Over-allocation warning should be present
    expect(getByText(/目前超配 10%/)).toBeTruthy();

    // Save button (完成編輯) should remain enabled
    const saveBtn = getByText('完成編輯').closest('button');
    expect(saveBtn?.hasAttribute('disabled')).toBe(false);

    // Change to under-allocation sum (30 + 30 + 30 = 90)
    fireEvent.change(inputs[0], { target: { value: '30' } });

    // Warning should disappear when not over 100%
    expect(queryByText(/目前超配/)).toBeNull();

    fireEvent.click(getByText('完成編輯'));
    expect(queryByText('完成編輯')).toBeNull();
  });

  it('shows first-use setup guidance and prioritizes setup before add transaction', () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<BrowserRouter><App /></BrowserRouter>);

    expect(getByText('首次使用設定引導')).toBeTruthy();
    expect(getByText('1.')).toBeTruthy();
    expect(getByText('2.')).toBeTruthy();

    fireEvent.click(getByText('新增記帳明細'));
    expect(getByText('完成編輯')).toBeTruthy();
    expect(queryByText('新增收支記帳')).toBeNull();

    fireEvent.change(getByPlaceholderText('輸入總資產'), { target: { value: '120000' } });
    fireEvent.click(getByText('儲存'));
    expect(localStorage.getItem('keep_accounts_onboarding_baseline_asset')).toBe('120000');
  });

  it('hides first-use setup guidance after baseline and major groups are ready', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));
    localStorage.setItem('keep_accounts_onboarding_baseline_asset', '80000');

    const { queryByText } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(queryByText('首次使用設定引導')).toBeNull();
  });

  it('should migrate target ratios when localStorage has no target ratios or sum is not 100%', () => {
    const oldGroups = [
      { id: '1', name: '主資金', emoji: '💳' },
      { id: '2', name: '投資資金', emoji: '📈' },
      { id: '3', name: '存款資金', emoji: '🐷' }
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(oldGroups));
    
    const { getByText, getAllByPlaceholderText } = render(<BrowserRouter><App /></BrowserRouter>);
    
    const editBtn = getByText(/編輯帳戶/);
    fireEvent.click(editBtn);
    
    const inputs = getAllByPlaceholderText('0') as HTMLInputElement[];
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    
    // Verifying default target migration rules were applied: (Group 1 -> 30, Group 2 -> 30, Group 3 -> 40)
    expect(Number(inputs[0].value)).toBe(30);
    expect(Number(inputs[1].value)).toBe(30);
    expect(Number(inputs[2].value)).toBe(40);
  });

  it('should display period-specific sums (today vs this month)', () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = now.getDate();
    const otherDay = day === 1 ? '02' : '01';
    const sameMonthStr = `${year}-${month}-${otherDay}`;
    
    const mockTxs: Transaction[] = [
      { id: '1', description: 'today tx', amount: 100, type: 'expense', category: '餐飲食品', date: todayStr, accountGroupId: '1' },
      { id: '2', description: 'yesterday tx', amount: 200, type: 'expense', category: '餐飲食品', date: sameMonthStr, accountGroupId: '1' },
      { id: '3', description: 'income today', amount: 500, type: 'income', category: '薪資收入', date: todayStr, accountGroupId: '1' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));
    
    const { getByText, getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    
    // By default, period is 'month'.
    expect(getByText('本月支出')).toBeTruthy();
    expect(getAllByText('-$300').length).toBe(1);
    expect(getAllByText('+$500').length).toBe(2);
    
    // Click '今日' toggle
    const todayToggle = getByText('今日');
    fireEvent.click(todayToggle);
    
    // Today's expense sum should be 100. Monthly income should be 500.
    expect(getByText('今日支出')).toBeTruthy();
    expect(getAllByText('-$100').length).toBe(2);
    expect(getAllByText('+$500').length).toBe(2);
  });

  it('should calculate and display daily allowed consumption and remaining budget when period is today', () => {
    const groups = [
      { id: '1', name: '日常開銷', emoji: '💳', color: '#6366f1', targetRatio: 30, budget: 30000, categories: [] },
      { id: '2', name: '投資理財', emoji: '📈', color: '#3b82f6', targetRatio: 30, categories: [] },
      { id: '3', name: '長期儲蓄', emoji: '🐷', color: '#10b981', targetRatio: 40, categories: [] }
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayDay = now.getDate();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sameMonthStr = `${year}-${month}-01`;
    
    const mockTxs: Transaction[] = [];
    let cumulativeYesterday = 0;
    
    if (todayDay > 1) {
      mockTxs.push({ id: '1', description: 'past tx', amount: 500, type: 'expense', category: '餐飲食品', date: sameMonthStr, accountGroupId: '1' });
      cumulativeYesterday = 500;
    }
    
    mockTxs.push({ id: '2', description: 'today tx', amount: 300, type: 'expense', category: '餐飲食品', date: todayStr, accountGroupId: '1' });
    
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));
    
    const { getByText, queryByText } = render(<BrowserRouter><App /></BrowserRouter>);
    
    expect(queryByText(/當日可消費/)).toBeNull();
    
    const todayToggle = getByText('今日');
    fireEvent.click(todayToggle);
    
    const expectedAllowed = todayDay * 1000 - cumulativeYesterday;
    const expectedRemaining = expectedAllowed - 300;
    
    expect(getByText('當日可消費 (累計昨天)')).toBeTruthy();
    expect(getByText(`$${expectedAllowed.toLocaleString('zh-TW')}`)).toBeTruthy();
    expect(getByText(/當日消費/)).toBeTruthy();
    expect(getByText(/當日剩餘/)).toBeTruthy();
    expect(getByText(`$${expectedRemaining.toLocaleString('zh-TW')}`)).toBeTruthy();
  });

  it('should fallback to 30,000 budget and calculate daily allowed consumption when no budget is configured', () => {
    const groups = [
      { id: '1', name: '日常開銷', emoji: '💳', color: '#6366f1', targetRatio: 30, categories: [] },
      { id: '2', name: '投資理財', emoji: '📈', color: '#3b82f6', targetRatio: 30, categories: [] },
      { id: '3', name: '長期儲蓄', emoji: '🐷', color: '#10b981', targetRatio: 40, categories: [] }
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const now = new Date();
    const todayDay = now.getDate();
    
    localStorage.setItem('keep_accounts_transactions', JSON.stringify([]));
    
    const { getByText, getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    
    const todayToggle = getByText('今日');
    fireEvent.click(todayToggle);
    
    const expectedAllowed = todayDay * 1000;
    
    expect(getByText('當日可消費 (累計昨天)')).toBeTruthy();
    expect(getAllByText(`$${expectedAllowed.toLocaleString('zh-TW')}`).length).toBe(2);
  });

  it('should not render delete button for core Daily Expense account in edit mode', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '3', name: '儲蓄資金', emoji: 'piggy-bank', color: '#10b981', targetRatio: 40, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 30, categories: [] },
      { id: '2', name: '投資理財', emoji: 'trending-up', color: '#3b82f6', targetRatio: 30, categories: [] }
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const { getByText, queryAllByTitle } = render(<BrowserRouter><App /></BrowserRouter>);
    
    const editBtn = getByText(/編輯帳戶/);
    fireEvent.click(editBtn);
    
    // There are 4 default groups; 當月薪資 (source) is not deletable, so 3 delete buttons should render
    const deleteBtns = queryAllByTitle('刪除帳戶');
    expect(deleteBtns.length).toBe(3);
  });

  it('should open TransactionModal in creation mode when clicking the dashboard add button', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));
    localStorage.setItem('keep_accounts_onboarding_baseline_asset', '50000');

    const { getByText } = render(<BrowserRouter><App /></BrowserRouter>);

    fireEvent.click(getByText('新增記帳明細'));

    expect(getByText('新增收支記帳')).toBeTruthy();
  });

  it('opens the transaction modal when choosing the general option from the history create menu', () => {
    const { getByText, getByTitle } = render(<BrowserRouter><App /></BrowserRouter>);

    fireEvent.click(getByText('明細'));
    fireEvent.click(getByTitle('新增記帳'));

    fireEvent.click(getByText('一般記帳'));

    expect(getByText('新增收支記帳')).toBeTruthy();
  });

  it('opens installment mode when choosing the installment option from the history create menu', () => {
    const { getByText, getByTitle } = render(<BrowserRouter><App /></BrowserRouter>);

    fireEvent.click(getByText('明細'));
    fireEvent.click(getByTitle('新增記帳'));

    fireEvent.click(getByText('分期記帳'));

    expect(getByText('分期總額 ($)')).toBeTruthy();
  });

  it('should open TransactionModal populated with transaction data when clicking edit on a row in HistoryTab', () => {
    const mockTxs: Transaction[] = [
      { id: 'tx-test-id', description: 'test-history-item', amount: 500, type: 'expense', category: '餐飲食品', date: '2026-07-08T12:00:00.000Z', accountGroupId: '1' }
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));
    
    const { getByText, getByTitle, container } = render(<BrowserRouter><App /></BrowserRouter>);
    
    // Switch to History tab
    const historyTabBtn = getByText('明細');
    fireEvent.click(historyTabBtn);
    
    // We should see the mock transaction description in the list
    expect(getByText('test-history-item')).toBeTruthy();
    
    // Click the edit button
    const editBtn = getByTitle('編輯');
    fireEvent.click(editBtn);
    
    // Modal header "修改收支記帳" should be visible
    expect(getByText('修改收支記帳')).toBeTruthy();
    // Modal inputs should be populated with the transaction data
    const descInput = container.querySelector('ion-input[placeholder*="例如"]') as any;
    expect(descInput).toBeTruthy();
    expect(descInput.value).toBe('test-history-item');
    
    const amountInput = container.querySelector('ion-input[placeholder*="金額"]') as any;
    expect(amountInput).toBeTruthy();
    expect(amountInput.value.toString()).toBe('500');
  });
});

describe('Salary source group', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const currentMonthDate = (day: string) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const setupGroups = () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '3', name: '儲蓄資金', emoji: 'piggy-bank', color: '#10b981', targetRatio: 40, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 30, categories: [] },
      { id: '2', name: '投資理財', emoji: 'trending-up', color: '#3b82f6', targetRatio: 30, categories: [] }
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));
  };

  it('should show the source-group income pool on the highlighted source card and exclude non-source income', () => {
    setupGroups();
    const mockTxs: Transaction[] = [
      { id: 's1', description: '發放月薪', amount: 45000, type: 'income', category: '薪資收入', date: currentMonthDate('05'), accountGroupId: '0' },
      { id: 'n1', description: '投資收益', amount: 3000, type: 'income', category: '投資收益', date: currentMonthDate('05'), accountGroupId: '2' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    // Source pool is only the source-group income ($45,000); the $3,000 投資收益 is excluded
    expect(getAllByText('+$45,000').length).toBeGreaterThanOrEqual(1);
  });

  it('should distribute the pool by target ratio without creating transactions', () => {
    setupGroups();
    const mockTxs: Transaction[] = [
      { id: 's1', description: '發放月薪', amount: 45000, type: 'income', category: '薪資收入', date: currentMonthDate('05'), accountGroupId: '0' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    // 40% of $45,000 = $18,000 (儲蓄資金); 30% = $13,500 (日常開銷, 投資理財)
    expect(getAllByText('分配額 40% ($18,000)').length).toBe(1);
    expect(getAllByText('分配額 30% ($13,500)').length).toBe(2);

    // Pure virtual overlay: no transaction created
    const stored = JSON.parse(localStorage.getItem('keep_accounts_transactions') || '[]');
    expect(stored.length).toBe(1);
  });

  it('computes target amounts from stored ratios when total is under 100%', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '3', name: '儲蓄資金', emoji: 'piggy-bank', color: '#10b981', targetRatio: 40, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 30, categories: [] },
      { id: '2', name: '投資理財', emoji: 'trending-up', color: '#3b82f6', targetRatio: 20, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));
    localStorage.setItem('keep_accounts_onboarding_baseline_asset', '50000');

    const mockTxs: Transaction[] = [
      { id: 's1', description: '發放月薪', amount: 50000, type: 'income', category: '薪資收入', date: currentMonthDate('05'), accountGroupId: '0' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    expect(getAllByText('分配額 40% ($20,000)').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('分配額 30% ($15,000)').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('分配額 20% ($10,000)').length).toBeGreaterThanOrEqual(1);
  });

  it('computes target amounts from stored ratios when total is over 100%', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '3', name: '儲蓄資金', emoji: 'piggy-bank', color: '#10b981', targetRatio: 50, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 35, categories: [] },
      { id: '2', name: '投資理財', emoji: 'trending-up', color: '#3b82f6', targetRatio: 25, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));
    localStorage.setItem('keep_accounts_onboarding_baseline_asset', '50000');

    const mockTxs: Transaction[] = [
      { id: 's1', description: '發放月薪', amount: 50000, type: 'income', category: '薪資收入', date: currentMonthDate('05'), accountGroupId: '0' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    expect(getAllByText('分配額 50% ($25,000)').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('分配額 35% ($17,500)').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('分配額 25% ($12,500)').length).toBeGreaterThanOrEqual(1);
  });

  it('should show allocated versus spent on a non-source card', () => {
    setupGroups();
    const mockTxs: Transaction[] = [
      { id: 's1', description: '發放月薪', amount: 45000, type: 'income', category: '薪資收入', date: currentMonthDate('05'), accountGroupId: '0' },
      { id: 'e1', description: '午餐', amount: 5000, type: 'expense', category: '餐飲食品', date: currentMonthDate('06'), accountGroupId: '1' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getByText, getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    // 日常開銷: allocated 30% of $45,000 = $13,500, spent $5,000, remaining $8,500
    // (投資理財 also shows 分配額 30% ($13,500), so match both)
    expect(getAllByText('分配額 30% ($13,500)').length).toBe(2);
    expect(getByText('已用 $5,000／餘 $8,500')).toBeTruthy();
  });

  it('should migrate legacy data: inject source group, rename 長期儲蓄, drop allocation key, preserve transactions', () => {
    const legacy = [
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 30, categories: [{ name: '薪資收入', emoji: 'briefcase', color: '#22c55e', type: 'income' }] },
      { id: '2', name: '投資理財', emoji: 'trending-up', color: '#3b82f6', targetRatio: 30, categories: [] },
      { id: '3', name: '長期儲蓄', emoji: 'piggy-bank', color: '#10b981', targetRatio: 40, categories: [] }
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(legacy));
    localStorage.setItem('keep_accounts_allocation_categories', JSON.stringify(['薪資收入']));
    const mockTxs: Transaction[] = [
      { id: 't1', description: '午餐', amount: 100, type: 'expense', category: '餐飲食品', date: currentMonthDate('05'), accountGroupId: '1' },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    render(<BrowserRouter><App /></BrowserRouter>);

    // Deprecated bound-category key is removed
    expect(localStorage.getItem('keep_accounts_allocation_categories')).toBeNull();
    const groups = JSON.parse(localStorage.getItem('keep_accounts_groups') || '[]');
    expect(groups.some((g: any) => g.isSource)).toBe(true);
    expect(groups.some((g: any) => g.name === '儲蓄資金')).toBe(true);
    // User transactions are preserved
    const storedTxs = JSON.parse(localStorage.getItem('keep_accounts_transactions') || '[]');
    expect(storedTxs.length).toBe(1);
  });
});

describe('Credit-card installments', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('repairs legacy installment system-category transactions saved under source group', async () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'legacy-inst';
    const txs: Transaction[] = [
      {
        id: `${installmentId}-1`,
        description: '手機分期',
        amount: 1300,
        type: 'expense',
        category: '分期',
        date: '2026-07-10T12:36:00+08:00',
        accountGroupId: '0',
        installmentId,
        installmentPeriod: 1,
        installmentCount: 3,
      },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(txs));

    const { result } = renderHook(() => useKeepAccounts());

    await waitFor(() => {
      expect(result.current.transactions[0].accountGroupId).toBe('1');
    });
  });

  it('creates N dated transactions sharing one installment id with the last period carrying the remainder', () => {
    const { result } = renderHook(() => useKeepAccounts());

    act(() => {
      result.current.saveTransaction(
        '手機分期',
        '10007',
        'expense',
        '購物消費',
        '2026-01-15T10:00:00+08:00',
        '1',
        null,
        10
      );
    });

    const installmentTxs = result.current.transactions.filter(
      (t) => t.installmentId
    );
    expect(installmentTxs.length).toBe(10);
    // All periods share one installment id and the same group/category
    expect(new Set(installmentTxs.map((t) => t.installmentId)).size).toBe(1);
    expect(
      installmentTxs.every(
        (t) => t.accountGroupId === '1' && t.category === '購物消費'
      )
    ).toBe(true);

    const sorted = [...installmentTxs].sort(
      (a, b) => (a.installmentPeriod ?? 0) - (b.installmentPeriod ?? 0)
    );
    // Periods 1..9 are the base amount; the last period absorbs the remainder
    expect(sorted.slice(0, 9).every((t) => t.amount === 1000)).toBe(true);
    expect(sorted[9].amount).toBe(1007);
    // Dated one month apart
    expect(sorted[0].date.substring(0, 7)).toBe('2026-01');
    expect(sorted[1].date.substring(0, 7)).toBe('2026-02');
    expect(sorted[9].date.substring(0, 7)).toBe('2026-10');
  });

  it('creates exactly one transaction when installment is off', () => {
    const { result } = renderHook(() => useKeepAccounts());

    act(() => {
      result.current.saveTransaction(
        '咖啡',
        '100',
        'expense',
        '購物消費',
        '2026-07-10T10:00:00+08:00',
        '1',
        null
      );
    });

    expect(result.current.transactions.length).toBe(1);
    expect(result.current.transactions[0].installmentId).toBeUndefined();
  });

  it('excludes future-dated periods from realized balance but still shows them in history', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'inst-1';
    const mockTxs: Transaction[] = [
      { id: 'inc', description: '薪水', amount: 50000, type: 'income', category: '薪資收入', date: '2020-01-01T10:00:00+08:00', accountGroupId: '0' },
      { id: `${installmentId}-1`, description: '分期消費', amount: 1000, type: 'expense', category: '購物消費', date: '2020-02-01T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 1, installmentCount: 3 },
      { id: `${installmentId}-2`, description: '分期消費', amount: 1000, type: 'expense', category: '購物消費', date: '2099-01-01T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 2, installmentCount: 3 },
      { id: `${installmentId}-3`, description: '分期消費', amount: 1000, type: 'expense', category: '購物消費', date: '2099-02-01T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 3, installmentCount: 3 },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getByText, getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    // Realized balance = 50000 income - 1000 realized period = 49000.
    // The two future periods (2099) must NOT be subtracted.
    expect(getByText('$49,000')).toBeTruthy();

    // History still lists all three periods, including the future-dated ones.
    fireEvent.click(getByText('明細'));
    expect(getAllByText('分期消費').length).toBe(3);
  });

  it('shows the 啟用通知 switch on the 分期 tab with a web-only delivery note', () => {
    const { getByText, getByTitle, getByTestId, queryByText } = render(<BrowserRouter><App /></BrowserRouter>);

    // Open the history create menu and enter installment mode directly
    fireEvent.click(getByText('明細'));
    fireEvent.click(getByTitle('新增記帳'));
    fireEvent.click(getByText('分期記帳'));

    expect(getByText('分期總額 ($)')).toBeTruthy();

    // The notification switch is available on all platforms.
    expect(getByText('啟用通知')).toBeTruthy();

    // On web (jsdom) delivery is unsupported, but the message config is not
    // yet shown until the notification switch is turned on.
    expect(queryByText('通知標題')).toBeNull();
  });

  it('groups installment transactions in the 分期 view', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'inst-group';
    const mockTxs: Transaction[] = [
      { id: `${installmentId}-1`, description: '手機分期', amount: 1000, type: 'expense', category: '購物消費', date: '2026-01-15T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 1, installmentCount: 3 },
      { id: `${installmentId}-2`, description: '手機分期', amount: 1000, type: 'expense', category: '購物消費', date: '2026-02-15T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 2, installmentCount: 3 },
      { id: `${installmentId}-3`, description: '手機分期', amount: 1007, type: 'expense', category: '購物消費', date: '2026-03-15T10:00:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 3, installmentCount: 3 },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getByText, getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);

    fireEvent.click(getByText('明細'));
    fireEvent.click(getAllByText('分期')[0]);

    expect(getByText('手機分期')).toBeTruthy();
    expect(getByText('已繳 3 / 3 期 · 總額 $3007 · 剩餘 $0')).toBeTruthy();
    expect(getByText('刪除整組')).toBeTruthy();
    expect(getByText('第 1 期')).toBeTruthy();
    expect(getAllByText(/\/3/).length).toBeGreaterThan(0);
  });

  it('edits one installment period without mutating sibling periods', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'inst-isolated';
    const txs: Transaction[] = [
      { id: `${installmentId}-1`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2026-08-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 1, installmentCount: 5 },
      { id: `${installmentId}-2`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2026-09-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 2, installmentCount: 5 },
      { id: `${installmentId}-3`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2026-10-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 3, installmentCount: 5 },
      { id: `${installmentId}-4`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2026-11-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 4, installmentCount: 5 },
      { id: `${installmentId}-5`, description: '家電分期', amount: 2003, type: 'expense', category: '分期', date: '2026-12-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 5, installmentCount: 5 },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(txs));

    const { result } = renderHook(() => useKeepAccounts());

    act(() => {
      result.current.saveTransaction(
        '家電分期',
        '1999',
        'expense',
        '分期',
        '2026-12-25T12:47:00+08:00',
        '1',
        `${installmentId}-5`
      );
    });

    const sorted = [...result.current.transactions]
      .filter((t) => t.installmentId === installmentId)
      .sort((a, b) => (a.installmentPeriod ?? 0) - (b.installmentPeriod ?? 0));

    expect(sorted[4].amount).toBe(1999);
    expect(sorted[4].date.startsWith('2026-12-25')).toBe(true);

    expect(sorted.slice(0, 4).every((t) => t.amount === 1999)).toBe(true);
    expect(sorted[0].date.startsWith('2026-08-10')).toBe(true);
    expect(sorted[1].date.startsWith('2026-09-10')).toBe(true);
    expect(sorted[2].date.startsWith('2026-10-10')).toBe(true);
    expect(sorted[3].date.startsWith('2026-11-10')).toBe(true);

    expect(sorted.every((t) => t.installmentId === installmentId)).toBe(true);
    expect(sorted.every((t, idx) => (t.installmentPeriod ?? 0) === idx + 1)).toBe(true);
    expect(sorted.every((t) => t.installmentCount === 5)).toBe(true);
  });

  it('rejects invalid installment period edits and keeps sibling rows unchanged', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'inst-invalid';
    const txs: Transaction[] = [
      { id: `${installmentId}-1`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2026-08-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 1, installmentCount: 2 },
      { id: `${installmentId}-2`, description: '家電分期', amount: 2003, type: 'expense', category: '分期', date: '2026-09-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 2, installmentCount: 2 },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(txs));

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const { result } = renderHook(() => useKeepAccounts());

    let success = true;
    act(() => {
      success = result.current.saveTransaction(
        '家電分期',
        '0',
        'expense',
        '分期',
        '2026-09-25T12:47:00+08:00',
        '1',
        `${installmentId}-2`
      );
    });

    expect(success).toBe(false);
    expect(alertSpy).toHaveBeenCalled();

    const sorted = [...result.current.transactions]
      .filter((t) => t.installmentId === installmentId)
      .sort((a, b) => (a.installmentPeriod ?? 0) - (b.installmentPeriod ?? 0));

    expect(sorted[0].amount).toBe(1999);
    expect(sorted[1].amount).toBe(2003);
    expect(sorted[1].date.startsWith('2026-09-10')).toBe(true);

    alertSpy.mockRestore();
  });

  it('opens edit modal for the targeted installment period from installment view', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'inst-edit';
    const mockTxs: Transaction[] = [
      { id: `${installmentId}-1`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2026-08-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 1, installmentCount: 5 },
      { id: `${installmentId}-2`, description: '家電分期', amount: 2003, type: 'expense', category: '分期', date: '2026-09-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 2, installmentCount: 5 },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(mockTxs));

    const { getByText, getAllByText, getAllByTitle, container } = render(<BrowserRouter><App /></BrowserRouter>);

    fireEvent.click(getByText('明細'));
    fireEvent.click(getAllByText('分期')[0]);

    fireEvent.click(getAllByTitle('編輯單期')[1]);

    expect(getByText('修改收支記帳')).toBeTruthy();
    expect(getByText(/第 2 \/ 5 期/)).toBeTruthy();

    const amountInput = container.querySelector('ion-input[placeholder*="輸入金額"]') as any;
    expect(amountInput).toBeTruthy();
    expect(amountInput.value.toString()).toBe('2003');
  });

  it('recomputes installment summary totals from edited period rows', () => {
    const groups = [
      { id: '0', name: '當月薪資', emoji: 'briefcase', color: '#22c55e', isSource: true, categories: [] },
      { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', targetRatio: 100, categories: [] },
    ];
    localStorage.setItem('keep_accounts_groups', JSON.stringify(groups));

    const installmentId = 'inst-summary';
    const txs: Transaction[] = [
      { id: `${installmentId}-1`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2099-08-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 1, installmentCount: 5 },
      { id: `${installmentId}-2`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2099-09-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 2, installmentCount: 5 },
      { id: `${installmentId}-3`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2099-10-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 3, installmentCount: 5 },
      { id: `${installmentId}-4`, description: '家電分期', amount: 1999, type: 'expense', category: '分期', date: '2099-11-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 4, installmentCount: 5 },
      { id: `${installmentId}-5`, description: '家電分期', amount: 2003, type: 'expense', category: '分期', date: '2099-12-10T12:47:00+08:00', accountGroupId: '1', installmentId, installmentPeriod: 5, installmentCount: 5 },
    ];
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(txs));

    const { result } = renderHook(() => useKeepAccounts());
    act(() => {
      result.current.saveTransaction(
        '家電分期',
        '1999',
        'expense',
        '分期',
        '2099-12-10T12:47:00+08:00',
        '1',
        `${installmentId}-5`
      );
    });

    const { getByText, getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    fireEvent.click(getByText('明細'));
    fireEvent.click(getAllByText('分期')[0]);

    expect(getByText('已繳 0 / 5 期 · 總額 $9995 · 剩餘 $9995')).toBeTruthy();
  });
});

describe('getCurrentMonthExpenseForGroup', () => {
  it('should sum expenses for the correct group and month', () => {
    const mockTxs: Transaction[] = [
      { id: '1', description: 'lunch', amount: 150, type: 'expense', category: 'food', date: '2026-07-06', accountGroupId: '1' },
      { id: '2', description: 'dinner', amount: 250, type: 'expense', category: 'food', date: '2026-07-10', accountGroupId: '1' },
      { id: '3', description: 'salary', amount: 45000, type: 'income', category: 'salary', date: '2026-07-05', accountGroupId: '1' },
      { id: '4', description: 'other group', amount: 500, type: 'expense', category: 'other', date: '2026-07-06', accountGroupId: '2' },
      { id: '5', description: 'next month', amount: 300, type: 'expense', category: 'food', date: '2026-08-01', accountGroupId: '1' },
    ];
    const refDate = new Date('2026-07-15');
    const total = getCurrentMonthExpenseForGroup('1', mockTxs, refDate);
    expect(total).toBe(400); // 150 + 250
  });

  it('should return 0 when there are no matching transactions', () => {
    const total = getCurrentMonthExpenseForGroup('1', [], new Date('2026-07-15'));
    expect(total).toBe(0);
  });
});

describe('useKeepAccounts defensive checks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should throw an error when saving a transaction with a negative amount', () => {
    const { result } = renderHook(() => useKeepAccounts());
    expect(() => {
      act(() => {
        result.current.saveTransaction(
          'Test negative',
          '-100',
          'expense',
          '日常雜項',
          '2026-07-07T20:00:00+08:00',
          '1',
          null
        );
      });
    }).toThrow('Transaction amount cannot be negative');
  });

  it('should allow saving account groups when ratios do not sum to 100%', () => {
    const { result } = renderHook(() => useKeepAccounts());
    const invalidGroups = [
      { id: '1', name: '日常開銷', emoji: '💳', color: '#6366f1', targetRatio: 50, categories: [] },
      { id: '2', name: '投資理財', emoji: '📈', color: '#3b82f6', targetRatio: 40, categories: [] }
    ];

    let success = false;
    act(() => {
      success = result.current.saveAccountGroups(invalidGroups);
    });

    expect(success).toBe(true);
    expect(result.current.accountGroups).toEqual(invalidGroups);
  });

  it('should fall back to empty state silently when localStorage has corrupted JSON', () => {
    localStorage.setItem('keep_accounts_groups', '{invalid json');
    localStorage.setItem('keep_accounts_transactions', '{invalid json');
    const { result } = renderHook(() => useKeepAccounts());
    expect(result.current.accountGroups).toEqual([]);
    expect(result.current.transactions).toEqual([]);
  });
});
