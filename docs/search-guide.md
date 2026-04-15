# Search & Filter Guide

All list/search endpoints (`POST /*/search`) accept a shared set of query parameters for filtering, searching, sorting, and pagination. This document explains how to use them correctly.

---

## Request Body Structure

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "orderBy": "name asc",
  "deleted": false,
  "search": [...],
  "searchTerm": { "name": "...", "value": "..." }
}
```

---

## `search` — Precise Field Filter

`search` is an **array** of condition objects. All conditions are combined with `AND`.

Each condition object:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes | The database column name to filter on (see [Field Name Reference](#field-name-reference)) |
| `condition` | `string` | yes | The comparison operator (see [Conditions](#conditions)) |
| `value` | `string` | yes | The value to compare against. Pass `""` for `ISNULL` / `ISNOTNULL` (value is ignored by the engine but the field is required by the validator) |

### Conditions

| Condition | SQL equivalent | Notes |
|---|---|---|
| `CONTAINS` | `ILIKE '%value%'` | Case-insensitive substring |
| `STARTWITH` | `ILIKE 'value%'` | Case-insensitive prefix |
| `ENDWITH` | `ILIKE '%value'` | Case-insensitive suffix |
| `EQUAL` | `= value` | Exact match |
| `NOTEQUAL` | `!= value` | |
| `GREATER` | `> value` | Auto-casts to number / date |
| `LESSER` | `< value` | Auto-casts to number / date |
| `GREATEROREQUAL` | `>= value` | Auto-casts to number / date |
| `LESSEROREQUAL` | `<= value` | Auto-casts to number / date |
| `ISNULL` | `IS NULL` | `value` is ignored by the engine, but must still be sent as `""` |
| `ISNOTNULL` | `IS NOT NULL` | `value` is ignored by the engine, but must still be sent as `""` |

### Example

Find all users with role `admin` whose name contains "John":

```json
{
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "admin" },
    { "name": "name", "condition": "CONTAINS", "value": "John" }
  ]
}
```

---

## `searchTerm` — Quick Multi-Field Text Search

`searchTerm` is a single object for a simple `ILIKE '%value%'` across one or more fields joined with `OR`.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Comma-separated list of field names to search across |
| `value` | `string` | The text to search for |

### Example

Search for "Pro" in both `name` and `department_name`:

```json
{
  "searchTerm": {
    "name": "name,department_name",
    "value": "Pro"
  }
}
```

### Difference from `search`

| | `search` | `searchTerm` |
|---|---|---|
| Multiple conditions? | Yes (AND) | Yes (OR) |
| Condition type | Any (see above) | Always `ILIKE '%value%'` |
| Multiple fields? | One field per object | Comma-separated in `name` |
| Use case | Precise filtering | Quick keyword search |

---

## `orderBy`

A space-separated field and direction, optionally comma-separated for multiple sorts.

```
"orderBy": "name asc"
"orderBy": "created_at desc"
"orderBy": "order_sequence asc, id desc"
```

Default direction is `ASC` when not specified.

---

## Field Name Reference

> **Important:** The API **response** uses `camelCase` keys (e.g. `departmentName`).
> The `search` / `searchTerm` / `orderBy` inputs use the **flat SQL column name** as it appears in the query result (generally `snake_case`).

### Users (`POST /api/v1/users/search`)

| Input field name | Response key (camelCase) | Notes |
|---|---|---|
| `id` | `id` | |
| `name` | `name` | |
| `email` | `email` | |
| `role` | `role` | `admin`, `manager`, `employee` |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |
| `deleted` | _(not returned)_ | Use `deleted: true` param instead |
| `department_id` | `departmentId` | |
| `department_name` | `departmentName` | Joined from `department` table |
| `department_code` | `departmentCode` | Joined from `department` table |

### Departments (`POST /api/v1/department/search`)

| Input field name | Response key (camelCase) | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Parts (`POST /api/v1/part/search`)

| Input field name | Response key (camelCase) | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `product_type_id` | `productTypeId` | |
| `product_type_code` | `productTypeCode` | Joined from `product_type` table |
| `product_type_name` | `productTypeName` | Joined from `product_type` table |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Statuses (`POST /api/v1/repair-status/search`)

| Input field name | Response key (camelCase) | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `order_sequence` | `orderSequence` | |
| `is_final` | `isFinal` | `true` / `false` |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Request Item Statuses (`POST /api/v1/repair-request-item-status/search`)

| Input field name | Response key (camelCase) | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `order_sequence` | `orderSequence` | |
| `is_final` | `isFinal` | `true` / `false` |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Requests (`POST /api/v1/repair-request/search`)

| Input field name | Response key (camelCase) | Notes |
|---|---|---|
| `id` | `id` | |
| `request_no` | `requestNo` | |
| `requester_id` | `requesterId` | |
| `priority` | `priority` | `low`, `medium`, `high`, `urgent` |
| `requested_at` | `requestedAt` | |
| `current_status_id` | `currentStatusId` | |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |
| `current_status_code` | `currentStatusCode` | Joined repair_status |
| `current_status_name` | `currentStatusName` | Joined repair_status |
| `current_status_order_sequence` | _(no direct field)_ | Joined repair_status |
| `current_status_is_final` | _(no direct field)_ | Joined repair_status |
| `requester_email` | `requesterEmail` | Joined users |
| `requester_name` | `requesterName` | Joined users |
| `requester_role` | _(no direct field)_ | Joined users |

---

## Complete Examples

### Find non-final repair statuses ordered by sequence

```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "orderBy": "order_sequence asc",
  "search": [
    { "name": "is_final", "condition": "EQUAL", "value": "false" }
  ]
}
```

### Search parts by name or product type name

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "searchTerm": {
    "name": "name,product_type_name",
    "value": "motor"
  }
}
```

### Find urgent repair requests from a specific requester

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "orderBy": "requested_at desc",
  "search": [
    { "name": "priority", "condition": "EQUAL", "value": "urgent" },
    { "name": "requester_email", "condition": "EQUAL", "value": "john@example.com" }
  ]
}
```

### Combine `search` and `searchTerm`

Both can be used together. They are combined with `AND`.

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "employee" }
  ],
  "searchTerm": {
    "name": "name,email",
    "value": "john"
  }
}
```

This finds employees whose name **or** email contains "john".
