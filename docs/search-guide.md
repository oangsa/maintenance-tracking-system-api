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

## How The Server Applies `search` And `searchTerm`

The API evaluates these fields in a predictable order:

1. Every object in `search` is combined with `AND`.
2. Every field listed in `searchTerm.name` is combined with `OR`.
3. If both `search` and `searchTerm` are sent, the final query becomes:

```text
(`search` result) AND (`searchTerm` result)
```

### Practical meaning

- Use `search` when you need exact or structured filtering.
- Use `searchTerm` when you need one keyword matched across several fields.
- Use both together when you want a strict filter plus a flexible keyword search.

### Behavior notes

- Field names are normalized to lowercase before SQL is built.
- `searchTerm` only performs case-insensitive partial matching with `ILIKE '%value%'`.
- `searchTerm.name` accepts comma-separated field names and trims spaces around each one.
- Invalid `condition` values in `search` raise a bad request error.
- `GREATER`, `LESSER`, `GREATEROREQUAL`, and `LESSEROREQUAL` try to parse number/date/boolean values before building SQL.
- Joined fields can be used as long as the endpoint exposes them as flat result columns in the field reference table below.

### Execution examples

This request means:

- `role` must equal `employee`
- and either `name` or `email` must contain `john`

```json
{
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "employee" }
  ],
  "searchTerm": {
    "name": "name,email",
    "value": "john"
  }
}
```

---

## Special Case: Repair Request Item Search

`POST /api/v1/repair-request/search` supports searching not only repair request header fields, but also joined requested-item fields.

To target requested-item fields, prefix the field name with `repair_request_items_`.

Supported item-search fields:

| Input field name | Meaning |
|---|---|
| `repair_request_items_product_code` | Requested item product code |
| `repair_request_items_product_name` | Requested item product name |
| `repair_request_items_repair_status_code` | Requested item status code |
| `repair_request_items_repair_status_name` | Requested item status name |
| `repair_request_items_description` | Requested item description |
| `repair_request_items_quantity` | Requested item quantity |

This prefix works in both `search` and `searchTerm`.

### How repair request item matching works

- Header-level repair request filters still work normally.
- Item-level prefixed filters are evaluated in an `EXISTS` subquery.
- That means a repair request is returned when at least one requested item matches the item-side conditions.
- If both header fields and item fields are sent, both sides must match.
- This also applies to `searchTerm`: header fields are grouped together, item fields are grouped together, and the two groups are combined with `AND`.

### Example: filter by header field and item field

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "search": [
    { "name": "priority", "condition": "EQUAL", "value": "urgent" },
    { "name": "repair_request_items_product_name", "condition": "CONTAINS", "value": "motor" }
  ]
}
```

This means:

- the repair request priority must be `urgent`
- and at least one requested item must have a product name containing `motor`

### Example: combine header and item keyword search

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "searchTerm": {
    "name": "request_no,requester_name,repair_request_items_product_name",
    "value": "john"
  }
}
```

This means:

- one of the header fields `request_no` or `requester_name` must match
- and at least one requested item `product_name` must also match

---
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
| `repair_request_items_product_code` | _(item search only)_ | Requested item product code |
| `repair_request_items_product_name` | _(item search only)_ | Requested item product name |
| `repair_request_items_repair_status_code` | _(item search only)_ | Requested item status code |
| `repair_request_items_repair_status_name` | _(item search only)_ | Requested item status name |
| `repair_request_items_description` | _(item search only)_ | Requested item description |
| `repair_request_items_quantity` | _(item search only)_ | Requested item quantity |

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
