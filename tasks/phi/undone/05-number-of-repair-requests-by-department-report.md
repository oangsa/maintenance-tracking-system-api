# Task 05: Number of Repair Requests by Department Report

Owner
- Phi

Endpoint in scope
- Proposed: `POST /api/v1/repair-requests/reports/by-department/search`

Why
- The frontend needs an analysis endpoint to summarize repair request volume by department.
- This should return compact grouped data for dashboard/report use.

Report objective
- Summarize number of repair requests by department.

Expected response shape

```json
[
  {
    "departmentName": "IT Support",
    "value": 15
  },
  {
    "departmentName": "Facilities",
    "value": 9
  }
]
```

What to implement
- Create a search-style report endpoint that accepts request body filters.
- Return grouped rows:
  - `departmentName` from `department.name`
  - `value` as number of repair requests
- Count rule: use `COUNT(DISTINCT repair_request.id)`.
- Exclude soft-deleted repair requests by default.

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
- Apply date filtering before department grouping.

Data-source note
- In current schema, `repair_request` does not contain `department_id` directly.
- Department is associated on `repair_request_item.department_id`.
- To satisfy this report correctly, aggregate from `repair_request` joined through `repair_request_item` to `department`.

Query and alias rules
- Follow repository alias rule: use full descriptive aliases only.
- If using a list-style repository method with joins and filter/order support, keep flat-column subquery pattern (`SELECT * FROM (...) base`) before where/order handling.

Merge-safe ownership
- This task is report-focused only.
- Do not change unrelated feature logic.
- Do not change drizzle schema.

Exact touchpoints
- Edit `src/Presentations/Controllers/Features/RepairRequestController.ts`
  - add route handler inside `RegisterRoutes(app)` for `POST /reports/by-department/search`
  - build `RepairRequestParameter` from the request body, same style as existing `POST /search`
  - call `repairRequestService.GetNumberOfRepairRequestsByDepartmentReport(params)`
  - set response status `200`
  - use the existing `Repair Requests` Swagger tag
- Edit `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
  - add a request schema for the report search body, or reuse `RepairRequestParameterSchema` if no report-only fields are needed
  - add `NumberOfRepairRequestsByDepartmentReportResponseSchema`
  - response row fields must be:
    - `departmentName: string`
    - `value: number`
- Create `src/Applications/DataTransferObjects/RepairRequest/NumberOfRepairRequestsByDepartmentReportDto.ts`
  - export the DTO type from `NumberOfRepairRequestsByDepartmentReportResponseSchema.static`
- Edit `src/Applications/Services/IRepairRequestService.ts`
  - add `GetNumberOfRepairRequestsByDepartmentReport(parameters: RepairRequestParameter): Promise<NumberOfRepairRequestsByDepartmentReportDto[]>`
- Edit `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
  - implement `GetNumberOfRepairRequestsByDepartmentReport(parameters)`
  - validate that `parameters.search` contains a lower and upper bound for `requested_at`
  - validate lower bound is not greater than upper bound
  - delegate the aggregate read to `repairRequestRepository.GetNumberOfRepairRequestsByDepartmentReport(parameters)`
- Edit `src/Domains/Repositories/IRepairRequestRepository.ts`
  - add `GetNumberOfRepairRequestsByDepartmentReport(parameters: RepairRequestParameter)`
  - return rows with `department` and `value`
- Edit `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
  - add a report row type such as `NumberOfRepairRequestsByDepartmentReportRow`
  - implement `GetNumberOfRepairRequestsByDepartmentReport(parameters)`
  - aggregate from `repair_request` joined through `repair_request_item` -> `department`
  - apply the `requested_at` range filter before aggregation
  - use `department.name` as `departmentName`
  - use `COUNT(DISTINCT repair_request.id)` for `value`
  - exclude soft-deleted repair requests by default
- Update `docs/openapi.yaml`
  - add path `POST /api/v1/repair-requests/reports/by-department/search`
  - add request and response schemas/examples
  - reuse existing `Repair Requests` tag

Suggested files to change
- `src/Presentations/Controllers/Features/RepairRequestController.ts`
- `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
- `src/Applications/DataTransferObjects/RepairRequest/NumberOfRepairRequestsByDepartmentReportDto.ts`
- `src/Applications/Services/IRepairRequestService.ts`
- `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
- `src/Domains/Repositories/IRepairRequestRepository.ts`
- `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
- `docs/openapi.yaml`

Acceptance criteria
- Endpoint returns `200` and grouped rows in the agreed shape.
- Date range is required and read from `search` on `requested_at`.
- `departmentName` is human-readable from `department.name`.
- `value` is correct distinct count of repair requests per department.
- Soft-deleted repair requests are not counted by default.
- OpenAPI includes request/response examples.

What is not in scope
- Monthly trend logic.
- Product-type grouping.
- Repair-status grouping.
- Schema migrations.
