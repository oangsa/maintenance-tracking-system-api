# Database Schema (public)

This document is based on the SQL schema you provided.

Notes:
- Enum type names were resolved from your provided enum list.
- `Nullable` is derived from whether `NOT NULL` is present.
- `-` in `Default` means no explicit default in the provided SQL.

---

## Stock / Inventory Logic Rules

> **`inventory_move_item` is the SINGLE SOURCE OF TRUTH for stock.**

### Rules enforced in the backend

| Rule | Description |
|---|---|
| Never update `part.stock` directly | Stock is never stored as a column on `part`. |
| Part response stock is calculated, not stored | Any part read model that exposes stock should return total stock from `SUM(quantity_in) - SUM(quantity_out)` grouped by part. |
| Every stock increase MUST create an `inventory_move` | When stock is added, it must be recorded as a transaction and not patched directly onto part data. |
| Every stock decrease MUST create an `inventory_move` | When stock is removed or consumed, it must be recorded as a transaction and not patched directly onto part data. |
| Every consumption MUST create an `inventory_move` | No shortcut allowed. Use `reason = WORK_ORDER_CONSUME` when parts are consumed for a work order. |
| One `work_order_part` → one `inventory_move_item` | Prevents double counting. Link via `work_order_part.inventory_move_item_id`. |

### Stock calculation

Stock for a part is always calculated as:

```sql
SELECT part_id, SUM(quantity_in - quantity_out) AS stock
FROM inventory_move_item
GROUP BY part_id;
```

For part API responses, this means `total_stock` should be treated as a derived value from movement history, not as a persisted column on `part`.

### Workflow

```
repair_request
  └── repair_request_item
        └── work_order
              ├── work_order_part  (intent — what parts are needed/used)
              │     └── inventory_move_item  (linked via inventory_move_item_id — actual stock movement)
              └── work_task  (execution detail)

inventory_move
  └── inventory_move_item  (SINGLE SOURCE OF TRUTH for stock)
```

| Step | Action | Stock effect |
|---|---|---|
| 1 | Create `repair_request` + `repair_request_item` | None |
| 2 | Create `work_order` (one per `repair_request_item`) | None |
| 3 | Create `work_order_part` (plan parts needed) | **None** |
| 4 | Technician uses parts → create `inventory_move` (`reason = WORK_ORDER_CONSUME`) + `inventory_move_item` | **Stock decreases** |
| 5 | Set `work_order_part.inventory_move_item_id` to link plan → actual movement | None |

### Design notes

- `part` should remain master data only, while stock lives in transaction history.
- All stock-changing actions should be modeled as inventory transactions so audit and reconciliation stay possible.
- Any endpoint that returns part stock should derive it consistently from the same movement source to avoid mismatch between list, detail, and report screens.
- Reversal or correction flows should also create compensating inventory transactions instead of editing historical movement rows.

---

## Task Assignment Logic Rules

> **`work_task_assignment` is the SINGLE SOURCE OF TRUTH for task assignee history.**

### Rules enforced in the backend

| Rule | Description |
|---|---|
| One active assignee per `work_task` | The database guarantees only one row can stay active at a time, where active means `unassigned_at IS NULL`. |
| Reassign by append, not replace | A new assignment automatically closes the previous active assignment before the new one becomes active. |
| Do not mutate assignment history | Assignment records are preserved as history; only `unassigned_at` is used to end an active assignment. |
| Cannot assign deleted users | The database rejects assignment rows that target a deleted user. |
| Cannot assign final tasks | The database rejects new assignments when the related task is already in a final state. |
| Assignment time must stay valid | End time must be empty for active rows or greater than or equal to the start time. |
| Assignment ownership is required | `assigned_by` must always be present on each assignment record. |

### Workflow

| Step | Action | Effect |
|---|---|---|
| 1 | Backend validates request payload | Prevent obvious bad input before reaching persistence |
| 2 | Insert new `work_task_assignment` row | New active assignee is recorded |
| 3 | Database closes previous active assignment automatically | History is preserved and only one active row remains |
| 4 | Database rejects invalid cases | Deleted assignees, final tasks, and invalid time ranges cannot be persisted |
| 5 | Query by `unassigned_at IS NULL` | Read current assignee |

For the longer version of the rules and backend flow, see `docs/taskAssignmentRules.md`.

---

## public enum types

| Type Name | Values |
|---|---|
| repair_priority | low, medium, high, urgent |
| roles_enum | admin, manager, employee |
| inventory_move_reason | buy, use, lost, found, adjust |

## public.department

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('department_id_seq'::regclass) | PRIMARY KEY |
| code | character varying | No | - | UNIQUE |
| name | character varying | No | - | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| department_pkey | PRIMARY KEY | (id) |
| (inline) | UNIQUE | (code) |

## public.inventory_move

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('inventory_move_id_seq'::regclass) | PRIMARY KEY |
| move_no | character varying | No | - | UNIQUE |
| reason | inventory_move_reason | No | - | - |
| move_date | timestamp with time zone | Yes | now() | - |
| remark | text | Yes | - | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| inventory_move_pkey | PRIMARY KEY | (id) |
| (inline) | UNIQUE | (move_no) |

## public.inventory_move_item

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('inventory_move_item_id_seq'::regclass) | PRIMARY KEY |
| inventory_move_id | integer | No | - | FOREIGN KEY |
| part_id | integer | No | - | FOREIGN KEY |
| quantity_in | integer | Yes | 0 | - |
| quantity_out | integer | Yes | 0 | - |
| note | text | Yes | - | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| inventory_move_item_pkey | PRIMARY KEY | (id) |
| inventory_move_item_inventory_move_id_fkey | FOREIGN KEY | (inventory_move_id) REFERENCES public.inventory_move(id) |
| inventory_move_item_part_id_fkey | FOREIGN KEY | (part_id) REFERENCES public.part(id) |

## public.part

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('part_id_seq'::regclass) | PRIMARY KEY |
| code | character varying | No | - | UNIQUE |
| name | character varying | No | - | - |
| product_type_id | integer | No | - | FOREIGN KEY |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| part_pkey | PRIMARY KEY | (id) |
| part_product_type_id_fkey | FOREIGN KEY | (product_type_id) REFERENCES public.product_type(id) |
| (inline) | UNIQUE | (code) |

## public.product

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('product_id_seq'::regclass) | PRIMARY KEY |
| code | character varying | No | - | UNIQUE |
| name | character varying | No | - | - |
| product_type_id | integer | No | - | FOREIGN KEY |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| product_pkey | PRIMARY KEY | (id) |
| product_product_type_id_fkey | FOREIGN KEY | (product_type_id) REFERENCES public.product_type(id) |
| (inline) | UNIQUE | (code) |

## public.product_type

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('product_type_id_seq'::regclass) | PRIMARY KEY |
| code | character varying | No | - | UNIQUE |
| name | character varying | No | - | - |
| department_id | integer | No | - | FOREIGN KEY |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| product_type_pkey | PRIMARY KEY | (id) |
| product_type_department_id_fkey | FOREIGN KEY | (department_id) REFERENCES public.department(id) |
| (inline) | UNIQUE | (code) |

## public.refresh_token

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('refresh_token_id_seq'::regclass) | PRIMARY KEY |
| user_id | integer | No | - | FOREIGN KEY |
| token_hash | text | No | - | - |
| expires_at | timestamp with time zone | No | - | - |
| revoked | boolean | No | false | - |
| user_agent | text | Yes | - | - |
| ip_address | character varying | Yes | - | - |
| created_at | timestamp with time zone | No | now() | - |

| Constraint Name | Type | Definition |
|---|---|---|
| refresh_token_pkey | PRIMARY KEY | (id) |
| refresh_token_user_id_fkey | FOREIGN KEY | (user_id) REFERENCES public.users(id) |

## public.repair_request

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('repair_request_id_seq'::regclass) | PRIMARY KEY |
| request_no | character varying | No | - | UNIQUE |
| requester_id | integer | No | - | FOREIGN KEY |
| priority | repair_priority | No | - | - |
| requested_at | timestamp with time zone | Yes | now() | - |
| current_status_id | integer | No | - | FOREIGN KEY |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| repair_request_pkey | PRIMARY KEY | (id) |
| repair_request_requester_id_fkey | FOREIGN KEY | (requester_id) REFERENCES public.users(id) |
| repair_request_current_status_id_fkey | FOREIGN KEY | (current_status_id) REFERENCES public.repair_status(id) |
| (inline) | UNIQUE | (request_no) |

## public.repair_request_item

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('repair_request_item_id_seq'::regclass) | PRIMARY KEY |
| repair_request_id | integer | No | - | FOREIGN KEY |
| product_id | integer | No | - | FOREIGN KEY |
| description | text | No | - | - |
| quantity | integer | No | 1 | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| repair_status_id | integer | Yes | 1 | FOREIGN KEY |
| department_id | integer | No | - | FOREIGN KEY |

| Constraint Name | Type | Definition |
|---|---|---|
| repair_request_item_pkey | PRIMARY KEY | (id) |
| repair_request_item_repair_request_id_fkey | FOREIGN KEY | (repair_request_id) REFERENCES public.repair_request(id) |
| repair_request_item_product_id_fkey | FOREIGN KEY | (product_id) REFERENCES public.product(id) |
| repair_request_item_department_id_fkey | FOREIGN KEY | (department_id) REFERENCES public.department(id) |
| fk_rri_status | FOREIGN KEY | (repair_status_id) REFERENCES public.repair_request_item_status(id) |

## public.repair_request_item_status

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('repair_request_item_status_id_seq'::regclass) | PRIMARY KEY |
| code | character varying | No | - | UNIQUE |
| name | character varying | No | - | - |
| order_sequence | integer | No | - | - |
| is_final | boolean | Yes | false | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| repair_request_item_status_pkey | PRIMARY KEY | (id) |
| (inline) | UNIQUE | (code) |

## public.repair_request_status_log

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('repair_request_status_log_id_seq'::regclass) | PRIMARY KEY |
| repair_request_id | integer | No | - | FOREIGN KEY |
| old_status_id | integer | Yes | - | FOREIGN KEY |
| new_status_id | integer | No | - | FOREIGN KEY |
| changed_by | integer | Yes | - | FOREIGN KEY |
| note | text | Yes | - | - |
| changed_at | timestamp with time zone | Yes | now() | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |

| Constraint Name | Type | Definition |
|---|---|---|
| repair_request_status_log_pkey | PRIMARY KEY | (id) |
| repair_request_status_log_repair_request_id_fkey | FOREIGN KEY | (repair_request_id) REFERENCES public.repair_request(id) |
| repair_request_status_log_old_status_id_fkey | FOREIGN KEY | (old_status_id) REFERENCES public.repair_status(id) |
| repair_request_status_log_new_status_id_fkey | FOREIGN KEY | (new_status_id) REFERENCES public.repair_status(id) |
| repair_request_status_log_changed_by_fkey | FOREIGN KEY | (changed_by) REFERENCES public.users(id) |

## public.repair_status

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('repair_status_id_seq'::regclass) | PRIMARY KEY |
| code | character varying | No | - | UNIQUE |
| name | character varying | No | - | - |
| order_sequence | integer | No | - | - |
| is_final | boolean | Yes | false | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |

| Constraint Name | Type | Definition |
|---|---|---|
| repair_status_pkey | PRIMARY KEY | (id) |
| (inline) | UNIQUE | (code) |

## public.user_department

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| user_id | integer | No | - | PRIMARY KEY, FOREIGN KEY |
| department_id | integer | No | - | PRIMARY KEY, FOREIGN KEY |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |

| Constraint Name | Type | Definition |
|---|---|---|
| user_department_pkey | PRIMARY KEY | (user_id, department_id) |
| user_department_user_id_fkey | FOREIGN KEY | (user_id) REFERENCES public.users(id) |
| user_department_department_id_fkey | FOREIGN KEY | (department_id) REFERENCES public.department(id) |

## public.users

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('users_id_seq'::regclass) | PRIMARY KEY |
| email | character varying | No | - | UNIQUE |
| password_hash | text | Yes | - | - |
| name | character varying | Yes | - | - |
| avatar_url | text | Yes | - | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| deleted | boolean | Yes | false | - |
| role | roles_enum | No | - | - |
| token_version | integer | No | 0 | - |

| Constraint Name | Type | Definition |
|---|---|---|
| users_pkey | PRIMARY KEY | (id) |
| (inline) | UNIQUE | (email) |

## public.work_order

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('work_order_id_seq'::regclass) | PRIMARY KEY |
| repair_request_item_id | integer | No | - | FOREIGN KEY |
| scheduled_start | timestamp with time zone | Yes | - | - |
| scheduled_end | timestamp with time zone | Yes | - | - |
| order_sequence | integer | No | - | - |
| is_final | boolean | Yes | false | - |
| status_id | integer | No | - | FOREIGN KEY |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |

| Constraint Name | Type | Definition |
|---|---|---|
| work_order_pkey | PRIMARY KEY | (id) |
| work_order_repair_request_item_id_fkey | FOREIGN KEY | (repair_request_item_id) REFERENCES public.repair_request_item(id) |
| work_order_status_id_fkey | FOREIGN KEY | (status_id) REFERENCES public.repair_status(id) |

## public.work_order_part

> Role: **intent layer** — records what parts a work order needs/used. Does NOT directly affect stock.
> Link `inventory_move_item_id` after actual consumption to tie planned usage → actual stock movement.

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('work_order_part_id_seq'::regclass) | PRIMARY KEY |
| work_order_id | integer | No | - | FOREIGN KEY |
| part_id | integer | No | - | FOREIGN KEY |
| quantity | integer | No | - | - |
| note | text | Yes | - | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |
| inventory_move_item_id | integer | Yes | - | FOREIGN KEY |

| Constraint Name | Type | Definition |
|---|---|---|
| work_order_part_pkey | PRIMARY KEY | (id) |
| work_order_part_work_order_id_fkey | FOREIGN KEY | (work_order_id) REFERENCES public.work_order(id) |
| work_order_part_part_id_fkey | FOREIGN KEY | (part_id) REFERENCES public.part(id) |
| fk_work_order_part_inventory_move_item | FOREIGN KEY | (inventory_move_item_id) REFERENCES public.inventory_move_item(id) |

---

## Task Assignment (new table: work_task_assignment)

Note: a new append-only table `work_task_assignment` is used to record assignee history for `work_task`. The authoritative, longer specification and backend flow are documented in `docs/databaseSchema-details.md`.

Brief schema (summary):

| Column | Type | Notes |
|---|---:|---|
| id | integer | PK, serial |
| work_task_id | integer | FK -> `work_task(id)` |
| assignee_id | integer | FK -> `users(id)` (NOT NULL) |
| assigned_by | integer | FK -> `users(id)` (NOT NULL) |
| assigned_at | timestamp with time zone | default `now()` |
| unassigned_at | timestamp with time zone | NULL if active; set when assignment ends |
| note | text | optional context |

Design highlights:
- The table is append-only: history is preserved and `unassigned_at` is the only mutable field.
- Enforce single active assignee per `work_task` via DB constraint (partial unique index) or trigger.
- Backend should treat assign/reassign as an atomic operation: validate + insert in a transaction, rely on DB mechanisms to close prior active assignment.
- See `docs/databaseSchema-details.md` for full rules, sample SQL, and backend flow examples.

## public.work_task

| Column | Type | Nullable | Default | Column Constraints |
|---|---|---|---|---|
| id | integer | No | nextval('work_task_id_seq'::regclass) | PRIMARY KEY |
| work_order_id | integer | No | - | FOREIGN KEY |
| description | text | No | - | - |
| started_at | timestamp with time zone | Yes | - | - |
| ended_at | timestamp with time zone | Yes | - | - |
| note | text | Yes | - | - |
| created_at | timestamp with time zone | Yes | now() | - |
| updated_at | timestamp with time zone | Yes | now() | - |
| created_by | character varying | Yes | - | - |
| updated_by | character varying | Yes | - | - |

| Constraint Name | Type | Definition |
|---|---|---|
| work_task_pkey | PRIMARY KEY | (id) |
| work_task_work_order_id_fkey | FOREIGN KEY | (work_order_id) REFERENCES public.work_order(id) |
