## REMOVED Requirements

### Requirement: Allocation Source Category Binding

**Reason**: The 配比基準分類設定 checklist and the global `allocationCategories` list are removed. The allocation pool is now defined by the income categories that belong to the 當月薪資 source group.
**Migration**: Users add or remove income categories under the 當月薪資 group instead of ticking a checklist. The persisted `keep_accounts_allocation_categories` key is deleted on load. See capability `salary-source-group`.

### Requirement: Category-Bound Target Ratio Calculations

**Reason**: Target ratio calculations no longer sum bound-category income per group; they distribute the 當月薪資 source pool virtually by target ratio.
**Migration**: Superseded by the `Virtual Pool Distribution` requirement in capability `salary-source-group`.
