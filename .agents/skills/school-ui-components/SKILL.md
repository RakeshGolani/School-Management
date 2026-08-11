---
name: school-ui-components
description: Guidelines and best practices for building UI using project UI components in School-Management
---

# School-Management UI Skill

When implementing features or modals in `School-Management`, follow these guidelines:

## Component Map
- Dropdowns: Use `@/components/ui/Select`. Set `searchable={true}` for long lists.
- Tables: Use `@/components/ui/DataTable` with `columns`, `data`, `loading`, `skeletonRow={SkeletonTableRow}`.
- Form Inputs: Use `@/components/ui/Input` and `@/components/FormPhoneInput`.
- Buttons: Use `@/components/ui/Button` with `variant="primary"|"secondary"` and Lucide icons.
- Tooltips: Use `@/components/ui/Tooltip` for hovering information on action icons (`Eye`, `Edit3`, `Trash2`), status switches, and compact action controls.
- Interactive Cursors: Ensure all buttons, links, clickable badges, select triggers, and action icons have `cursor: pointer`.
- Academic Year Context: Always use `const { activeYear } = useAcademicYear()` to filter session-specific datasets.
