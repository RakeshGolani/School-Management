# AGENTS.md — School-Management (Frontend Client) Rules

## Architectural Guidelines
- Framework: Next.js App Router (React Client/Server Components).
- UI Components: Use pre-built UI components from `src/components/ui/` (`Card`, `Badge`, `Button`, `Input`, `Select`, `DataTable`, `Switch`) for UI consistency.
- Styling: TailwindCSS with custom design system tokens (Glassmorphism, vibrant HSL gradients, smooth transitions).
- Notifications: Use `notifySuccess()` and `notifyError()` from `@/lib/notify`.
- Server Actions: Call backend APIs via `src/actions/`. Pass `academic_year_id` for session-scoped data fetching.
- Context: Wrap page data listeners with `useAcademicYear()` to automatically sync UI with active header session.
- UI Pointer Rule: All clickable elements (`button`, `a`, `select`, `[role="button"]`, checkboxes, radios) MUST display `cursor: pointer` on hover.
- Tooltip Rule: All table action icons (`Eye`, `Edit3`, `Trash2`), status toggles, and key action buttons MUST be wrapped with the `@/components/ui/Tooltip` component for consistent user guidance.

## Token Efficiency Rules
1. Inspect target files with `view_file` specifying exact line ranges (`StartLine` / `EndLine`) instead of fetching entire files.
2. Use `replace_file_content` or `multi_replace_file_content` for surgical code edits instead of re-writing complete components.
3. Use ripgrep (`grep_search`) to locate symbol definitions before guessing file locations.
