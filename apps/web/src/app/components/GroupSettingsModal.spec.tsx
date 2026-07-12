import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import { GroupSettingsModal } from './GroupSettingsModal';

describe('GroupSettingsModal', () => {
  it('shows system preset category items for the selected type', () => {
    const groups = [
      {
        id: '1',
        name: '日常開銷',
        emoji: 'credit-card',
        color: '#6366f1',
        targetRatio: 100,
        categories: [],
      },
    ];

    const onAddCategory = vi.fn();

    const { getAllByText, getByText } = render(
      <GroupSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        accountGroups={groups as any}
        referenceMonthlyAmount={0}
        onSaveGroups={vi.fn(() => true)}
        onDeleteGroup={vi.fn()}
        onAddGroup={vi.fn()}
        onAddCategory={onAddCategory}
        onDeleteCategory={vi.fn()}
      />
    );

    fireEvent.click(getAllByText('日常開銷')[0]);

    expect(getByText('系統預設分類')).toBeTruthy();
    expect(getByText('分期')).toBeTruthy();

    fireEvent.click(getByText('餐飲食品'));

    expect(onAddCategory).toHaveBeenCalledWith('1', '餐飲食品', 'coffee', '#f59e0b', 'expense');
  });

  it('clears target ratio on focus and restores the previous value when blurred without input', () => {
    const groups = [
      {
        id: '0',
        name: '當月薪資',
        emoji: 'briefcase',
        color: '#22c55e',
        isSource: true,
        categories: [],
      },
      {
        id: '1',
        name: '日常開銷',
        emoji: 'credit-card',
        color: '#6366f1',
        targetRatio: 40,
        categories: [],
      },
      {
        id: '2',
        name: '投資理財',
        emoji: 'trending-up',
        color: '#3b82f6',
        targetRatio: 30,
        categories: [],
      },
      {
        id: '3',
        name: '儲蓄資金',
        emoji: 'piggy-bank',
        color: '#10b981',
        targetRatio: 30,
        categories: [],
      },
    ];

    const { getByText, getAllByPlaceholderText } = render(
      <GroupSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        accountGroups={groups as any}
        referenceMonthlyAmount={0}
        onSaveGroups={vi.fn(() => true)}
        onDeleteGroup={vi.fn()}
        onAddGroup={vi.fn()}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />
    );

    const ratioInputs = getAllByPlaceholderText('%') as HTMLInputElement[];
    const firstRatioInput = ratioInputs[0];

    expect(firstRatioInput.value).toBe('40');

    fireEvent.focus(firstRatioInput);
    expect(firstRatioInput.value).toBe('');

    fireEvent.blur(firstRatioInput);
    expect(firstRatioInput.value).toBe('40');

    fireEvent.focus(firstRatioInput);
    fireEvent.change(firstRatioInput, { target: { value: '45' } });
    expect(firstRatioInput.value).toBe('45');

    fireEvent.blur(firstRatioInput);
    expect(firstRatioInput.value).toBe('45');
  });

  it('applies named ratio rules (333/631) in target-ratio settings', () => {
    const groups = [
      {
        id: '0',
        name: '當月薪資',
        emoji: 'briefcase',
        color: '#22c55e',
        isSource: true,
        categories: [],
      },
      {
        id: '1',
        name: '日常開銷',
        emoji: 'credit-card',
        color: '#6366f1',
        targetRatio: 20,
        categories: [],
      },
      {
        id: '2',
        name: '投資理財',
        emoji: 'trending-up',
        color: '#3b82f6',
        targetRatio: 20,
        categories: [],
      },
      {
        id: '3',
        name: '儲蓄資金',
        emoji: 'piggy-bank',
        color: '#10b981',
        targetRatio: 60,
        categories: [],
      },
    ];

    const { getByText, getAllByPlaceholderText } = render(
      <GroupSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        accountGroups={groups as any}
        referenceMonthlyAmount={0}
        onSaveGroups={vi.fn(() => true)}
        onDeleteGroup={vi.fn()}
        onAddGroup={vi.fn()}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />
    );

    fireEvent.click(getByText('333 法則'));

    const ratioInputs = getAllByPlaceholderText('%') as HTMLInputElement[];
    expect(ratioInputs.map((input) => input.value)).toEqual(['33', '33', '33']);

    fireEvent.click(getByText('631 法則'));
    expect(ratioInputs.map((input) => input.value)).toEqual(['30', '10', '60']);
  });

  it('converts amount to percentage and percentage to amount using monthly reference total', () => {
    const groups = [
      {
        id: '0',
        name: '當月薪資',
        emoji: 'briefcase',
        color: '#22c55e',
        isSource: true,
        categories: [],
      },
      {
        id: '1',
        name: '日常開銷',
        emoji: 'credit-card',
        color: '#6366f1',
        targetRatio: 30,
        categories: [],
      },
      {
        id: '2',
        name: '投資理財',
        emoji: 'trending-up',
        color: '#3b82f6',
        targetRatio: 30,
        categories: [],
      },
      {
        id: '3',
        name: '儲蓄資金',
        emoji: 'piggy-bank',
        color: '#10b981',
        targetRatio: 40,
        categories: [],
      },
    ];

    const { getAllByPlaceholderText } = render(
      <GroupSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        accountGroups={groups as any}
        referenceMonthlyAmount={10000}
        onSaveGroups={vi.fn(() => true)}
        onDeleteGroup={vi.fn()}
        onAddGroup={vi.fn()}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />
    );

    const ratioInputs = getAllByPlaceholderText('%') as HTMLInputElement[];
    const amountInputs = getAllByPlaceholderText('金額') as HTMLInputElement[];

    expect(amountInputs.map((input) => input.value)).toEqual(['3000', '3000', '4000']);

    fireEvent.change(amountInputs[0], { target: { value: '3500' } });
    expect(ratioInputs[0].value).toBe('35');

    fireEvent.change(ratioInputs[1], { target: { value: '20' } });
    expect(amountInputs[1].value).toBe('2000');
  });

  it('shows reference markers when there is no monthly reference amount', () => {
    const groups = [
      {
        id: '0',
        name: '當月薪資',
        emoji: 'briefcase',
        color: '#22c55e',
        isSource: true,
        categories: [],
      },
      {
        id: '1',
        name: '日常開銷',
        emoji: 'credit-card',
        color: '#6366f1',
        targetRatio: 30,
        categories: [],
      },
      {
        id: '2',
        name: '投資理財',
        emoji: 'trending-up',
        color: '#3b82f6',
        targetRatio: 30,
        categories: [],
      },
      {
        id: '3',
        name: '儲蓄資金',
        emoji: 'piggy-bank',
        color: '#10b981',
        targetRatio: 40,
        categories: [],
      },
    ];

    const { getByText, getAllByPlaceholderText } = render(
      <GroupSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        accountGroups={groups as any}
        referenceMonthlyAmount={0}
        onSaveGroups={vi.fn(() => true)}
        onDeleteGroup={vi.fn()}
        onAddGroup={vi.fn()}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
      />
    );

    const amountInputs = getAllByPlaceholderText('金額（參考）') as HTMLInputElement[];
    expect(amountInputs.map((input) => input.value)).toEqual(['', '', '']);
  });
});