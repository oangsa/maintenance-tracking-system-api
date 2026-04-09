# Database Schema (public)

This document is based on the SQL schema you provided.

Notes:
- Enum type names were resolved from your provided enum list.
- `Nullable` is derived from whether `NOT NULL` is present.
- `-` in `Default` means no explicit default in the provided SQL.

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
| repair_request_id | integer | No | - | FOREIGN KEY |
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
| work_order_repair_request_id_fkey | FOREIGN KEY | (repair_request_id) REFERENCES public.repair_request(id) |
| work_order_status_id_fkey | FOREIGN KEY | (status_id) REFERENCES public.repair_status(id) |

## public.work_order_part

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

| Constraint Name | Type | Definition |
|---|---|---|
| work_order_part_pkey | PRIMARY KEY | (id) |
| work_order_part_work_order_id_fkey | FOREIGN KEY | (work_order_id) REFERENCES public.work_order(id) |
| work_order_part_part_id_fkey | FOREIGN KEY | (part_id) REFERENCES public.part(id) |

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
