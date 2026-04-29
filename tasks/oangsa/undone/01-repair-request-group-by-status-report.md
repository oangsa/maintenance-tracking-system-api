# Task 01: Repair Request Group By Status Report

Owner
- Oangsa

Endpoint in scope
- Proposed: `POST /api/v1/repair-requests/reports/group-by-status/search`

Why
- The frontend needs a quick analysis endpoint that summarizes repair requests by status.
- This report is for dashboard/stat-card style usage, not full repair-request listing.

Report objective
- Summarize number of repair requests grouped by repair status.

Expected response shape

```json
[
  {
    "statusName": "Open",
    "value": 12
  },
  {
    "statusName": "In Progress",
    "value": 7
  },
  {
    "statusName": "Done",
    "value": 20
  }
]
```

What to implement
- Create a search-style report endpoint that accepts request body filters.
- Use repair request header status (`repair_request.current_status_id`) joined with `repair_status`.
- Return grouped rows:
  - `statusName` from `repair_status.name`
  - `value` as number of requests in that status
- Count rule: use `COUNT(DISTINCT repair_request.id)`.
- Exclude soft-deleted repair requests by default.
- Keep support for standard request-body filter style where applicable.

Date range behavior
- Date range must be specified via `search` on `requested_at`.
- Required conditions:
  - one lower-bound condition: `GREATER` or `GREATEROREQUAL`
  - one upper-bound condition: `LESSER` or `LESSEROREQUAL`
- Recommended inclusive format:

```json
{
  "search": [
    { "name": "requested_at", "condition": "GREATEROREQUAL", "value": "2026-04-01T00:00:00+07:00" },
    { "name": "requested_at", "condition": "LESSEROREQUAL", "value": "2026-04-30T23:59:59+07:00" }
  ]
}
```

- Validate lower bound is not greater than upper bound.
- Apply date filtering before status grouping.

Query and alias rules
- Follow repository alias rule: use full descriptive aliases (no short prefixes).
- If query uses joins in a list-style repository method, keep flat-column subquery pattern (`SELECT * FROM (...) base`) before where/order handling.

Merge-safe ownership
- This task is report-focused only.
- Do not change unrelated feature behavior.
- Do not change drizzle schema.

Exact touchpoints
- Edit `src/Presentations/Controllers/Features/RepairRequestController.ts`
  - add route handler inside `RegisterRoutes(app)` for `POST /reports/group-by-status/search`
  - build `RepairRequestParameter` from the request body, same style as existing `POST /search`
  - call `repairRequestService.GetRepairRequestGroupByStatusReport(params)`
  - set response status `200`
  - use the existing `Repair Requests` Swagger tag
- Edit `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
  - add a request schema for the report search body, or reuse `RepairRequestParameterSchema` if no report-only fields are needed
  - add `RepairRequestGroupByStatusReportResponseSchema`
  - response row fields must be:
    - `statusName: string`
    - `value: number`
- Create `src/Applications/DataTransferObjects/RepairRequest/RepairRequestGroupByStatusReportDto.ts`
  - export the DTO type from `RepairRequestGroupByStatusReportResponseSchema.static`
- Edit `src/Applications/Services/IRepairRequestService.ts`
  - add `GetRepairRequestGroupByStatusReport(parameters: RepairRequestParameter): Promise<RepairRequestGroupByStatusReportDto[]>`
- Edit `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
  - implement `GetRepairRequestGroupByStatusReport(parameters)`
  - validate that `parameters.search` contains a lower and upper bound for `requested_at`
  - validate lower bound is not greater than upper bound
  - delegate the aggregate read to `repairRequestRepository.GetRepairRequestGroupByStatusReport(parameters)`
- Edit `src/Domains/Repositories/IRepairRequestRepository.ts`
  - add `GetRepairRequestGroupByStatusReport(parameters: RepairRequestParameter)`
  - return rows with `statusName` and `value`
- Edit `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
  - add a report row type such as `RepairRequestGroupByStatusReportRow`
  - implement `GetRepairRequestGroupByStatusReport(parameters)`
  - aggregate from `repair_request.current_status_id` joined to `repair_status`
  - apply the `requested_at` range filter before aggregation
  - use `repair_status.name` as `statusName`
  - use `COUNT(DISTINCT repair_request.id)` for `value`
  - exclude soft-deleted repair requests by default
- Update `docs/openapi.yaml`
  - add path `POST /api/v1/repair-requests/reports/group-by-status/search`
  - add request and response schemas/examples
  - reuse existing `Repair Requests` tag

Suggested files to change
- `src/Presentations/Controllers/Features/RepairRequestController.ts`
- `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
- `src/Applications/DataTransferObjects/RepairRequest/RepairRequestGroupByStatusReportDto.ts`
- `src/Applications/Services/IRepairRequestService.ts`
- `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
- `src/Domains/Repositories/IRepairRequestRepository.ts`
- `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
- `docs/openapi.yaml`

Acceptance criteria
- Endpoint returns `200` and grouped rows in the agreed shape.
- Date range is required and read from `search` on `requested_at`.
- `statusName` label is human-readable from `repair_status.name`.
- `value` is correct count of distinct repair requests per status.
- Soft-deleted repair requests are not counted by default.
- OpenAPI includes request/response examples.

What is not in scope
- Monthly trend logic.
- Product-type grouping.
- Changes to repair-request CRUD behavior.
- Schema migrations.
