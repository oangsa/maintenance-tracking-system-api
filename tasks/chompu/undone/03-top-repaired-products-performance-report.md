# Task 03: Top Repaired Products Performance Report

Owner
- Chompu

Endpoint in scope
- Proposed: `POST /api/v1/repair-requests/reports/top-repaired-products/search`

Why
- The frontend needs an analysis endpoint that shows which products are repaired most often.
- This should return compact grouped data for dashboard/report usage.

Report objective
- Summarize top repaired products by total repair requests within a specified date range.

Expected response shape

```json
[
  {
    "productName": "Laptop A",
    "value": 25
  },
  {
    "productName": "Printer B",
    "value": 14
  }
]
```

What to implement
- Create a search-style report endpoint that accepts request body filters.
- Use `repair_request.requested_at` as report date source.
- Aggregate by product from `repair_request_item.product_id` joined to `product.name`.
- Return grouped rows:
  - `productName` from `product.name`
  - `value` as number of repair requests
- Count rule: use `COUNT(DISTINCT repair_request.id)` so metric means repair-request count, not item-row count.
- Exclude soft-deleted repair requests by default.
- Order result by `value DESC`, then `product_name ASC`.

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
- Apply date filtering before product grouping.

Query and alias rules
- Follow repository alias rule: use full descriptive aliases only.
- If using join-heavy filter/order flow, keep flat-column subquery pattern (`SELECT * FROM (...) base`) before where/order handling.

Merge-safe ownership
- This task is report-focused only.
- Do not change unrelated feature logic.
- Do not change drizzle schema.

Exact touchpoints
- Edit `src/Presentations/Controllers/Features/RepairRequestController.ts`
  - add route handler inside `RegisterRoutes(app)` for `POST /reports/top-repaired-products/search`
  - build `RepairRequestParameter` from the request body, same style as existing `POST /search`
  - call `repairRequestService.GetTopRepairedProductsPerformanceReport(params)`
  - set response status `200`
  - use the existing `Repair Requests` Swagger tag
- Edit `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
  - add a request schema for the report search body, or reuse `RepairRequestParameterSchema` if no report-only fields are needed
  - add `TopRepairedProductsPerformanceReportResponseSchema`
  - response row fields must be:
    - `product: string`
    - `value: number`
- Create `src/Applications/DataTransferObjects/RepairRequest/TopRepairedProductsPerformanceReportDto.ts`
  - export the DTO type from `TopRepairedProductsPerformanceReportResponseSchema.static`
- Edit `src/Applications/Services/IRepairRequestService.ts`
  - add `GetTopRepairedProductsPerformanceReport(parameters: RepairRequestParameter): Promise<TopRepairedProductsPerformanceReportDto[]>`
- Edit `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
  - implement `GetTopRepairedProductsPerformanceReport(parameters)`
  - validate that `parameters.search` contains a lower and upper bound for `requested_at`
  - validate lower bound is not greater than upper bound
  - delegate the aggregate read to `repairRequestRepository.GetTopRepairedProductsPerformanceReport(parameters)`
- Edit `src/Domains/Repositories/IRepairRequestRepository.ts`
  - add `GetTopRepairedProductsPerformanceReport(parameters: RepairRequestParameter)`
  - return rows with `productName` and `value`
- Edit `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
  - add a report row type such as `TopRepairedProductsPerformanceReportRow`
  - implement `GetTopRepairedProductsPerformanceReport(parameters)`
  - aggregate from `repair_request` joined through `repair_request_item` -> `product`
  - apply the `requested_at` range filter before aggregation
  - use `product.name` as `productName`
  - use `COUNT(DISTINCT repair_request.id)` for `value`
  - exclude soft-deleted repair requests by default
  - order by `value DESC`, then `product_name ASC`
- Update `docs/openapi.yaml`
  - add path `POST /api/v1/repair-requests/reports/top-repaired-products/search`
  - add request and response schemas/examples
  - reuse existing `Repair Requests` tag

Suggested files to change
- `src/Presentations/Controllers/Features/RepairRequestController.ts`
- `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
- `src/Applications/DataTransferObjects/RepairRequest/TopRepairedProductsPerformanceReportDto.ts`
- `src/Applications/Services/IRepairRequestService.ts`
- `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
- `src/Domains/Repositories/IRepairRequestRepository.ts`
- `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
- `docs/openapi.yaml`

Acceptance criteria
- Endpoint returns `200` and grouped rows in the agreed shape.
- Date range is required and read from `search` on `requested_at`.
- `productName` is human-readable from `product.name`.
- `value` is correct distinct count of repair requests per product.
- Soft-deleted repair requests are not counted by default.
- Result is sorted by `value DESC`, then `product ASC`.
- OpenAPI includes request/response examples.

What is not in scope
- Product-type monthly trend logic.
- Department grouping.
- Repair-status grouping.
- Schema migrations.
