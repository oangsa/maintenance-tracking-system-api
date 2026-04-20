# Task 03: Part Stock Intent Endpoints

Owner
- Phi

Main dependency
- This task depends on Chompu's Inventory Move service work because these endpoints normalize requests into inventory transactions.

Endpoints in scope
- `POST /api/v1/part/{id}/receive-stock`
- `POST /api/v1/part/{id}/consume-stock`
- `POST /api/v1/part/{id}/adjust-stock`

Why
- The generic inventory move endpoint is powerful but too low-level for most business actions.
- These endpoints make the API easier to use and harder to misuse.

What to implement
- Add business-intent endpoints for stock actions:
    - `POST /api/v1/part/{id}/receive-stock`
    - `POST /api/v1/part/{id}/consume-stock`
    - `POST /api/v1/part/{id}/adjust-stock`
- Define request schemas for receive, consume, adjust, and reverse.
- Normalize each business request into one internal inventory movement command.
- Reuse `InventoryMoveService` as the write engine so these endpoints stay thin.
- Return updated stock information clearly in response.

Merge-safe ownership
- Phi should not edit `InventoryMoveService`, `InventoryMoveRepository`, `InventoryMoveSchemaValidation`, inventory DTO files, or `InventoryMoveController` in this task.
- Chompu owns the inventory write engine and the reverse endpoint.
- To reduce conflicts with Task 01, prefer creating a new `PartStockController` instead of expanding `PartController` if you want a clean branch merge.

Exact touchpoints
- Preferred: create `src/Presentations/Controllers/Features/PartStockController.ts`
    - add route handlers inside `RegisterRoutes(app)` for:
        - `POST /part/:id/receive-stock`
        - `POST /part/:id/consume-stock`
        - `POST /part/:id/adjust-stock`
- Edit `src/Presentations/Controllers/Core/ControllerManager.ts`
    - register `PartStockController` in constructor
    - register `PartStockController` in `RegisterV1Routes(app)`
- Create `src/Presentations/Validators/PartStockSchema.ts`
    - create `ReceiveStockSchema`
    - create `ConsumeStockSchema`
    - create `AdjustStockSchema`
    - do not create reverse schema here
- Edit `src/Presentations/Controllers/Master/PartController.ts` only if you intentionally choose not to create `PartStockController`
    - if edited, add `POST /:id/receive-stock`, `POST /:id/consume-stock`, `POST /:id/adjust-stock`
- Reuse `inventoryMoveService.CreateInventoryMove(...)` from the new controller by building the request payload in the controller layer
- Update `docs/openapi.yaml`
    - add the 3 new part stock paths
    - add request and response examples for each endpoint

Easy flow

```text
Client says what business action happened
          |
          v
Part stock endpoint
          |
          +--> receive-stock
          +--> consume-stock
          +--> adjust-stock
          |
          v
normalize request into inventory movement data
          |
          v
InventoryMoveService
          |
          v
InventoryMoveRepository transaction
          |
          v
inventory_move + inventory_move_item inserted
          |
          v
Part read returns new totalStock
```

Simple endpoint meaning
- `receive-stock`: stock increases
- `consume-stock`: stock decreases
- `adjust-stock`: stock increases or decreases based on `direction`

Example request mapping

```text
POST /part/5/receive-stock
quantity = 10

becomes

POST /inventory-move
reason = buy
item.partId = 5
item.quantityIn = 10
```

```text
POST /part/5/consume-stock
quantity = 2

becomes

POST /inventory-move
reason = use
item.partId = 5
item.quantityOut = 2
```

Files to change
- `src/Presentations/Controllers/Features/PartStockController.ts` or `src/Presentations/Controllers/Master/PartController.ts`
- `src/Presentations/Controllers/Core/ControllerManager.ts`
- `src/Presentations/Validators/PartStockSchema.ts`
- `docs/openapi.yaml`

Acceptance criteria
- Each endpoint has a clear business meaning.
- Controllers are thin and reuse shared inventory logic.
- OpenAPI examples are easy for frontend devs to follow.
- Successful calls cause the next Part read to show the new `totalStock`.

Example stock shift story

```text
Before
Part 5 totalStock = 8

POST /api/v1/part/5/receive-stock
quantity = 4

After transaction
Part 5 totalStock = 12
```

```text
Before
Part 5 totalStock = 12

POST /api/v1/part/5/adjust-stock
direction = out
quantity = 1

After transaction
Part 5 totalStock = 11
```

What is not in scope
- Aggregating totalStock on Part reads.
- Reverse endpoint implementation.
- Deep work-order linking rules beyond passing `workOrderPartId` through.
