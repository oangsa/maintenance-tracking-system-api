# Task 01: Part Full Response Endpoints

Owner
- Phi

Endpoints in scope
- `POST /api/v1/part/search`
- `GET /api/v1/part/{id}`
- `POST /api/v1/part`
- `PUT /api/v1/part/{id}`

Why
- In this repo, all full Part endpoints share one response schema.
- Once `totalStock` is added, all full Part endpoints should return it consistently.
- `totalStock` is derived from inventory history, not stored on `part`.

Important repo fact
- `PartResponseSchema` is shared by all full Part endpoints.
- That means `totalStock` is not optional by endpoint. It belongs to the full Part contract.

What to implement
- Add a repository method that returns part master data joined with movement aggregates (`totalIn`, `totalOut`, `totalStock`). Edit: `src/Infrastructures/Repositories/Master/PartRepository.ts`.
- Implement the query using a single aggregated subquery and keep the joined query wrapped in a flat subquery so filtering/search/order stays unambiguous.
- Extend both `GetPartById` and `GetListPart` so the full Part response contract is consistent for detail and search.
- Update mapping to DTO so controllers return `totalStock` in responses.
- Add `totalIn` and `totalOut` only if they are intentionally exposed as first-class API fields. Otherwise compute only `totalStock` now.
- Re-read the saved Part after create and update so joined fields and `totalStock` are returned from the same hydrated read path.

Exact touchpoints
- Edit `src/Infrastructures/Repositories/Master/PartRepository.ts`
    - update `type PartRow`
    - update `mapRowToPart(row: PartRow)`
    - update `GetPartById(id: number)`
    - update `GetListPart(parameters: PartParameter)`
- Edit `src/Infrastructures/Entities/Master/Part.ts`
    - add `totalStock: number`
- Edit `src/Applications/Mappers/PartMapper.ts`
    - update `PartToDto(part: Part): PartDto`
- Edit `src/Presentations/Validators/PartSchemaValidation.ts`
    - update `PartResponseSchema`
- Edit `src/Applications/UseCases/Master/PartService.ts`
    - update `CreatePart(partForCreateDto)`
    - update the restore branch inside `CreatePart(...)`
    - update `UpdatePart(id, partForUpdateDto)`
- No controller logic change is required in `src/Presentations/Controllers/Master/PartController.ts` because it already returns the shared DTO from the service.
- Update `docs/openapi.yaml`
    - update `components.schemas.Part`
    - verify `/api/v1/part/search`, `/api/v1/part`, and `/api/v1/part/{id}` examples

Easy flow

```text
Client calls /part/search or /part/{id}
          |
          v
PartController
          |
          v
PartService
          |
          v
PartRepository
          |
          +--> read part master data
          |
          +--> aggregate inventory_move_item by part_id
          |
          v
mapped Part entity with totalStock
          |
          v
PartMapper -> PartResponseSchema
          |
          v
Client receives part + totalStock
```

Write endpoint special flow

```text
POST /part or PUT /part/{id}
          |
          v
write part master data
          |
          v
RE-READ the saved part through GetPartById
          |
          +--> join product_type
          |
          +--> aggregate totalStock
          |
          v
return hydrated full Part response
```

Reason for re-read
- Current create/update repository returns raw write rows.
- Raw write rows do not fully hydrate joined fields like `productTypeCode` and `productTypeName`.
- The same issue will apply to `totalStock`.
- So create/update must re-fetch the saved part before returning.

Files to change
- `src/Infrastructures/Repositories/Master/PartRepository.ts`
- `src/Infrastructures/Entities/Master/Part.ts`
- `src/Applications/DataTransferObjects/Part/PartDto.ts`
- `src/Applications/Mappers/PartMapper.ts`
- `src/Presentations/Validators/PartSchemaValidation.ts`
- `src/Applications/UseCases/Master/PartService.ts`
- `docs/openapi.yaml`

Acceptance criteria
- `POST /api/v1/part/search` returns `totalStock` for each row.
- `GET /api/v1/part/{id}` returns `totalStock`.
- `POST /api/v1/part` returns `totalStock`.
- `PUT /api/v1/part/{id}` returns `totalStock`.
- The value comes from transaction history, not a stored part column.

Example stock shift story

```text
Initial data
- Part 5 exists
- Inventory history says in = 12, out = 4

Derived result
- totalStock = 8

Any Part full response should show 8.
```

What is not in scope
- Creating stock movements.
- Business-intent stock endpoints.
- Work-order linking rules.
