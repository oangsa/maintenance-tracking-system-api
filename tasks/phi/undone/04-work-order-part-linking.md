# Task 04: Work Order Part Consumption Linking

Owner
- Phi

Main flow in scope
- Work order plans a part usage.
- Stock is actually consumed later.
- That actual movement must be linked back to the work-order line.

Fixed policy
- Use Option 1 only.
- One `work_order_part` line maps to one `inventory_move_item`.
- Partial consumption is not supported on one line. Split the work-order-part line first, then consume one line at a time.

Related endpoints
- Existing: `POST /api/v1/work-order`
- Existing: `PUT /api/v1/work-order/{id}`
- Proposed caller: `POST /api/v1/part/{id}/consume-stock` with `workOrderPartId`
- Possible low-level caller: `POST /api/v1/inventory-move`

Why
- `work_order_part` should describe intent.
- `inventory_move_item` should describe actual stock movement.
- The system needs a safe bridge between the two.

What to implement
- Enforce Option 1 only: one `work_order_part` line can link to only one actual `inventory_move_item`.
- Validate that a consume request quantity matches the planned `work_order_part` quantity.
- Reject partial consumption on a single line.
- If partial consumption is needed, split the planned part usage into multiple `work_order_part` rows before stock is consumed.
- Use Chompu's inventory create flow by passing `workOrderPartId` through the consume request payload instead of editing the inventory write engine here.
- Update the link from `work_order_part` to the created movement item through the repository methods owned in this task only if that linkage is not already completed by Chompu's inventory flow.
- Return data that clearly shows the connection between planned usage and actual movement.
- Update OpenAPI only. No migration is needed for Option 1.

Merge-safe ownership
- Phi should not edit `InventoryMoveService`, `InventoryMoveRepository`, `InventoryMoveSchemaValidation`, or inventory DTO/entity files in this task.
- Chompu owns the inventory write-engine integration point.
- Phi owns `work_order_part` read/update repository work and any split-line helper in `WorkOrderService`.

Exact touchpoints
- Edit `src/Applications/UseCases/Master/WorkOrderService.ts`
    - create a helper or public method for splitting a `work_order_part` line before consumption if the UI/service needs backend support
- Edit `src/Domains/Repositories/IWorkOrderRepository.ts`
    - add repository contract(s) for reading and updating `work_order_part` linkage
- Edit `src/Infrastructures/Repositories/Master/WorkOrderRepository.ts`
    - create method to read a `work_order_part` row by id
    - create method to update `work_order_part.inventory_move_item_id`
    - create method to split a `work_order_part` line only if backend-side split support is needed
- Edit `src/Infrastructures/Database/Drizzle/schema.ts`
    - reference only for the current field name `workOrderPart.inventoryMoveItemId`; do not change schema in this task
- Update `docs/openapi.yaml`
    - document consume payload/response behavior for strict one-to-one linking

Easy flow

```text
Work order says: we plan to use Part A
          |
          v
work_order_part row exists
          |
          v
later user consumes stock
          |
          v
consume-stock or inventory-move endpoint
          |
          v
inventory_move_item created
          |
          v
link inventory_move_item back to work_order_part
          |
          v
system can explain both:
- what we planned to use
- what we actually moved
```

Files to change
- `src/Applications/UseCases/Master/WorkOrderService.ts`
- `src/Domains/Repositories/IWorkOrderRepository.ts`
- `src/Infrastructures/Repositories/Master/WorkOrderRepository.ts`
- `docs/openapi.yaml`

Acceptance criteria
- The system can trace actual consumption back to work-order intent.
- No direct stock value is stored on `work_order_part`.
- The next Part read reflects the consumed quantity through derived stock.
- A single `work_order_part` line cannot be partially consumed.
- If partial consumption is needed, the line must be split before the consume action is executed.

Example stock shift story

```text
Before
Work order plans 2 units of Part 9
Part 9 totalStock = 6

User consumes 2 units for that work order

Write result
- inventory_move created
- inventory_move_item created with quantity_out = 2
- movement item linked to work_order_part

After
Part 9 totalStock = 4
Audit trail explains why stock changed
```

What is not in scope
- Part read aggregation itself.
- Generic stock receive/adjust endpoint design.
