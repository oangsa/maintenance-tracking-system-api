# Task 02: Generic Inventory Move Create Endpoint

Owner
- Chompu

Endpoint in scope
- `POST /api/v1/inventory-move`
- `POST /api/v1/inventory-move/{id}/reverse`

Why
- This is the current generic stock-write endpoint.
- Right now it is directionally correct, but still too loose.
- It must become the safe low-level engine for stock movement.

Main business rule
- Each item row must be exactly one direction.

What to implement
- Implement create-side validation in `InventoryMoveService` so each item row has exactly one direction: `quantityIn > 0` XOR `quantityOut > 0`.
- Reject invalid rows where both values are zero or both are positive.
- Keep header insert and detail inserts inside one database transaction.
- Optionally check available stock for outbound movement if negative stock is not allowed.
- Add optional support for `workOrderPartId` on inventory move item create payloads so work-order consumption can be linked without another team editing the same inventory files.
- Return the created inventory move with its inserted detail rows populated.
- Add `reverse` support under inventory ownership, since it belongs to the inventory-move endpoint family.
- Keep this endpoint as the trusted low-level stock transaction API used by higher-level stock endpoints.

Merge-safe ownership
- Chompu is the only owner allowed to edit inventory write-engine files in this scope.
- Phi should not edit `InventoryMoveService`, `InventoryMoveRepository`, `InventoryMoveSchemaValidation`, inventory DTOs, or inventory entities for Task 03/04.
- This task should land before Phi’s Task 03 and Task 04 branches are merged.

Exact touchpoints
- Edit `src/Applications/UseCases/Master/InventoryMoveService.ts`
    - update `CreateInventoryMove(inventoryMoveForCreateDto)`
    - create a private validation helper such as `ValidateCreateInventoryMoveItems(...)`
    - create a private stock-check helper if negative stock is not allowed
    - create a service method for reverse flow, such as `ReverseInventoryMove(id, dto)`
    - handle optional `workOrderPartId` validation/linking during create
- Edit `src/Infrastructures/Repositories/Master/InventoryMoveRepository.ts`
    - update `CreateInventoryMove(inventoryMove)` so the returned entity includes inserted items
    - if needed, create a helper query or reuse `GetInventoryMoveById(id)` after insert to hydrate items
    - add persistence for optional `workOrderPartId` linkage only if the service passes it through indirectly
- Edit `src/Presentations/Validators/InventoryMoveSchemaValidation.ts`
    - update `InventoryMoveForCreateSchema`
    - add optional `workOrderPartId` on item create shape if that is the chosen integration payload
    - keep `InventoryMoveItemResponseSchema` aligned with the final returned payload
- Edit `src/Applications/DataTransferObjects/InventoryMove/InventoryMoveForCreateDto.ts`
    - type updates automatically from schema, but this file is part of the owned touchpoint set
- Edit `src/Applications/DataTransferObjects/InventoryMove/InventoryMoveDto.ts`
    - type updates automatically from schema, but this file is part of the owned touchpoint set
- Edit `src/Infrastructures/Entities/Features/InventoryMove/InventoryMoveItem.ts`
    - add optional `workOrderPartId` only if the entity needs to carry that field through service/repository layers
- Edit `src/Presentations/Controllers/Master/InventoryMoveController.ts`
    - add route handler inside `RegisterRoutes(app)` for `POST /:id/reverse`
- Update `docs/openapi.yaml`
    - update `components.schemas.InventoryMoveForCreate`
    - update `components.schemas.InventoryMove`
    - update `POST /api/v1/inventory-move` examples
    - add `POST /api/v1/inventory-move/{id}/reverse`

Good examples
- `quantityIn > 0` and `quantityOut = 0`
- `quantityIn = 0` and `quantityOut > 0`

Bad examples
- both zero
- both positive

Easy flow

```text
Client calls POST /inventory-move
          |
          v
InventoryMoveController
          |
          v
InventoryMoveService
          |
          +--> validate move header
          |
          +--> validate each item direction
          |
          +--> optionally check available stock
          |
          v
InventoryMoveRepository transaction
          |
          +--> insert inventory_move header
          |
          +--> insert inventory_move_item rows
          |
          v
commit transaction
          |
          v
read created move with items
          |
          v
return response
```

What changes in stock after success

```text
If quantity_in = 10
stock goes up by 10

If quantity_out = 3
stock goes down by 3

No part row is updated directly.
Only movement rows are inserted.
```

Files to change
- `src/Applications/UseCases/Master/InventoryMoveService.ts`
- `src/Infrastructures/Repositories/Master/InventoryMoveRepository.ts`
- `src/Presentations/Validators/InventoryMoveSchemaValidation.ts`
- `src/Applications/DataTransferObjects/InventoryMove/InventoryMoveForCreateDto.ts`
- `src/Applications/DataTransferObjects/InventoryMove/InventoryMoveDto.ts`
- `src/Infrastructures/Entities/Features/InventoryMove/InventoryMoveItem.ts`
- `src/Presentations/Controllers/Master/InventoryMoveController.ts`
- `docs/openapi.yaml`

Acceptance criteria
- Invalid mixed direction rows are rejected.
- A failed item insert rolls back the header insert.
- Response contains the created detail items.
- `POST /api/v1/inventory-move/{id}/reverse` exists and creates a compensating movement.
- If `workOrderPartId` is supplied for a movement item, the inventory flow can use it safely without another branch editing the same inventory files.
- The endpoint becomes the trusted low-level stock transaction API.

Example stock shift story

```text
Before
Part 7 totalStock = 20

POST /api/v1/inventory-move
reason = use
item: partId = 7, quantityOut = 5

Write result
- inventory_move header inserted
- inventory_move_item inserted with quantity_out = 5

After
Part 7 totalStock = 15
```

What is not in scope
- Cleaner business-intent endpoints like receive/consume/adjust.
- Work-order partial-consumption policy beyond the optional `workOrderPartId` integration point.
