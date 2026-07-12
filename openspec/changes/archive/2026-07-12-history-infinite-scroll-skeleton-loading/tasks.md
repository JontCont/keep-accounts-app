## 1. Pagination behavior in History list

- [x] 1.1 Implement **History list paginates in fixed 50-record pages** by introducing page-size=50, loaded-count, and has-more state in `apps/web/src/app/components/HistoryTab.tsx`, so initial render shows at most 50 newest records and subsequent slices append contiguously; verify by updating/adding History tab unit tests that assert 120 records render as 50 then 100 after one load trigger.
- [x] 1.2 Wire **Decision: Use fixed page-size pagination with 50-item slices** into list derivation flow so sorting and append order remain descending by date after each load; verify with a deterministic test case that checks order integrity after multiple appends.

## 2. Infinite-scroll trigger and in-flight safety

- [x] 2.1 Implement **Decision: Use Ionic infinite-scroll primitives for load triggering** using Ionic infinite-scroll components in `apps/web/src/app/components/HistoryTab.tsx`, so reaching list end requests the next page exactly once per in-flight cycle; verify via component test that repeated rapid triggers during loading produce a single append.
- [x] 2.2 Implement **Decision: Keep grouping/filter semantics unchanged for loaded subset** so existing filter/group controls continue to function against the currently loaded window without forcing full-data materialization; verify by extending History tests to assert filter/group outputs remain correct before and after a page append.

## 3. Animated loading and completion states

- [x] 3.1 Implement **History loading state uses animated IonSkeletonText placeholders** and **Decision: Use `IonSkeletonText` transaction-card placeholders during loading** so skeleton cards appear only during next-page fetch and are replaced when records append; verify with component tests that loading=true renders skeletons and loading=false removes them.
- [x] 3.2 Add explicit end-of-list completion behavior so no further fetch occurs and loading placeholders do not reappear after exhaustion; verify with a test where total records are not a multiple of 50 and with a manual assertion in web UI that final-scroll shows stable "no more data" state.
