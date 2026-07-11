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
        onSaveGroups={vi.fn(() => true)}
        onDeleteGroup={vi.fn()}
        onAddGroup={vi.fn()}
        onAddCategory={onAddCategory}
        onDeleteCategory={vi.fn()}
        onUpdateGroupBudget={vi.fn()}
      />
    );

    fireEvent.click(getAllByText('日常開銷')[0]);

    expect(getByText('系統預設分類')).toBeTruthy();
    expect(getByText('分期')).toBeTruthy();

    fireEvent.click(getByText('餐飲食品'));

    expect(onAddCategory).toHaveBeenCalledWith('1', '餐飲食品', 'coffee', '#f59e0b', 'expense');
  });
});