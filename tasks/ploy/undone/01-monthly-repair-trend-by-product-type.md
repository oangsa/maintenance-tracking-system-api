# Task 01: Monthly Repair Trend by Product Type Report

Owner
- Ploy

Endpoint in scope
- Proposed: `POST /api/v1/repair-requests/reports/monthly-product-type/search`

Why
- The frontend needs a monthly trend grouped by product type.
- The report must still return rows when there is no data in a month.
- The response format was finalized to:

```json
[
  {
    "productTypeName": "Laptop",
    "value": 12
  }
]
```

What to implement
- Create a search-style report endpoint that accepts a body with `search` filters.
- Use `repair_request.requested_at` as the report date source.
- The report period comes from the provided `search` range on `requested_at`
- Aggregate by product type within the provided search range.
- Return:
  - `productTypeName` from `product_type.name`
  - `value` as number of requests
- Count rule: use `COUNT(DISTINCT repair_request.id)` so the metric means number of repair requests.
- Zero-fill rule is required:
  - use all non-deleted product types as the full output dimension
  - left join real aggregated result
  - return `0` when no match exists
- Order result by `product_type_id ASC`.

Date range behavior
- Date range must be specified via `search` on `requested_at`.
- The same `search` range is the source period for this report; do not read `period` from schema.
- Required conditions:
  - one lower-bound condition: `GREATER` or `GREATEROREQUAL`
  - one upper-bound condition: `LESSER` or `LESSEROREQUAL`
- Recommended inclusive format:

```json
{
  "search": [
    { "name": "requested_at", "condition": "GREATEROREQUAL", "value": "2026-04-01T00:00:00+07:00" },
    { "name": "requested_at", "condition": "LESSEROREQUAL", "value": "2026-06-30T23:59:59+07:00" }
  ]
}
```

- Validate lower bound is not greater than upper bound.

Merge-safe ownership
- This task is report-focused only.
- Do not change unrelated feature logic.
- Do not change drizzle schema.

Exact touchpoints
- Edit `src/Presentations/Controllers/Features/RepairRequestController.ts`
  - add route handler inside `RegisterRoutes(app)` for `POST /reports/monthly-product-type/search`
  - build `RepairRequestParameter` from the request body, same style as existing `POST /search`
  - call `repairRequestService.GetMonthlyRepairTrendByProductTypeReport(params)`
  - set response status `200`
  - use the existing `Repair Requests` Swagger tag
- Edit `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
  - add a request schema for the report search body, or reuse `RepairRequestParameterSchema` if no report-only fields are needed
  - add `MonthlyRepairTrendByProductTypeReportResponseSchema`
  - response row fields must be:
    - `productTypeName: string`
    - `value: number`
- Create `src/Applications/DataTransferObjects/RepairRequest/MonthlyRepairTrendByProductTypeReportDto.ts`
  - export the DTO type from `MonthlyRepairTrendByProductTypeReportResponseSchema.static`
- Edit `src/Applications/Services/IRepairRequestService.ts`
  - add `GetMonthlyRepairTrendByProductTypeReport(parameters: RepairRequestParameter): Promise<MonthlyRepairTrendByProductTypeReportDto[]>`
- Edit `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
  - implement `GetMonthlyRepairTrendByProductTypeReport(parameters)`
  - validate that `parameters.search` contains a lower and upper bound for `requested_at`
  - validate lower bound is not greater than upper bound
  - delegate the aggregate read to `repairRequestRepository.GetMonthlyRepairTrendByProductTypeReport(parameters)`
- Edit `src/Domains/Repositories/IRepairRequestRepository.ts`
  - add `GetMonthlyRepairTrendByProductTypeReport(parameters: RepairRequestParameter)`
  - return rows with `productTypeName` and `value`
- Edit `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
  - import `productType` from `src/Infrastructures/Database/Drizzle/schema.ts`
  - add a report row type such as `MonthlyRepairTrendByProductTypeReportRow`
  - implement `GetMonthlyRepairTrendByProductTypeReport(parameters)`
  - aggregate from `repair_request` joined through `repair_request_item` -> `product` -> `product_type`
  - apply the `requested_at` range filter before aggregation
  - zero-fill from all non-deleted `product_type` rows
  - use `COUNT(DISTINCT repair_request.id)` for `value`
  - order by `product_type.id ASC`
- Update `docs/openapi.yaml`
  - add path `POST /api/v1/repair-requests/reports/monthly-product-type/search`
  - add request and response schemas/examples
  - reuse existing `Repair Requests` tag

Suggested files to change
- `src/Presentations/Controllers/Features/RepairRequestController.ts`
- `src/Presentations/Validators/RepairRequestSchemaValidation.ts`
- `src/Applications/DataTransferObjects/RepairRequest/MonthlyRepairTrendByProductTypeReportDto.ts`
- `src/Applications/Services/IRepairRequestService.ts`
- `src/Applications/UseCases/Features/RepairRequest/RepairRequestService.ts`
- `src/Domains/Repositories/IRepairRequestRepository.ts`
- `src/Infrastructures/Repositories/Features/RepairRequest/RepairRequestRepository.ts`
- `docs/openapi.yaml`

Acceptance criteria
- Endpoint returns `200` with array rows in the agreed format.
- Date range is required and read from `search` on `requested_at`.
- Rows include every active product type.
- Missing data rows return `value: 0`.
- Result is ordered by productType ascending.
- Count metric matches distinct repair request count.
- OpenAPI contains request/response examples for this endpoint.

Example expected response

```json
[
  {
    "productTypeName": "Laptop",
    "value": 12
  },
  {
    "productTypeName": "Printer",
    "value": 0
  },
  {
    "productTypeName": "Scanner",
    "value": 3
  }
]
```

What is not in scope
- Dashboard-specific formatting beyond `productTypeName`, `value`.
- Changing existing repair-request CRUD behavior.
- Schema migrations.
