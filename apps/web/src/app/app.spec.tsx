import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App, { getCurrentMonthExpenseForGroup, Transaction } from './app';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(baseElement).toBeTruthy();
  });

  it('should have Keep Accounts as the title', () => {
    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(getAllByText(new RegExp('Keep Accounts', 'gi')).length > 0).toBeTruthy();
  });

  it('should block saving and show validation message when target ratios sum is not 100%', () => {
    const { getByText, getAllByPlaceholderText, queryByText } = render(<BrowserRouter><App /></BrowserRouter>);
    
    // Enter edit mode
    const editBtn = getByText(/編輯帳戶/);
    fireEvent.click(editBtn);
    
    expect(getByText('完成編輯')).toBeTruthy();
    
    // Find all number inputs by placeholder "0"
    const inputs = getAllByPlaceholderText('0');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    
    // By default, they sum to 100% (30 + 30 + 40). Let's change the first input to 50
    fireEvent.change(inputs[0], { target: { value: '50' } });
    
    // Warning message should be present
    expect(getByText(/目標比例加總必須為 100%/)).toBeTruthy();
    
    // Save button (完成編輯) should be disabled
    const saveBtn = getByText('完成編輯').closest('button');
    expect(saveBtn?.hasAttribute('disabled')).toBe(true);
    
    // Restore valid sum (30 + 30 + 40 = 100)
    fireEvent.change(inputs[0], { target: { value: '30' } });
    
    // Warning should disappear
    expect(queryByText(/目標比例加總必須為 100%/)).toBeNull();
    expect(saveBtn?.hasAttribute('disabled')).toBe(false);
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
    expect(inputs[0].value).toBe('30');
    expect(inputs[1].value).toBe('30');
    expect(inputs[2].value).toBe('40');
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
    
    expect(queryByText(/今日允許消費/)).toBeNull();
    
    const todayToggle = getByText('今日');
    fireEvent.click(todayToggle);
    
    const expectedAllowed = todayDay * 1000 - cumulativeYesterday;
    const expectedRemaining = expectedAllowed - 300;
    
    expect(getByText('今日允許消費 (日常開銷)')).toBeTruthy();
    expect(getByText(`$${expectedAllowed.toLocaleString('zh-TW')}`)).toBeTruthy();
    expect(getByText('今日剩餘額度')).toBeTruthy();
    expect(getByText(`$${expectedRemaining.toLocaleString('zh-TW')}`)).toBeTruthy();
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
