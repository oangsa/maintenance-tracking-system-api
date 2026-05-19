export const InventoryMoveReason = {
    buy: "buy",
    use: "use",
    lost: "lost",
    found: "found",
    adjustment: "adjustment"
} as const;
export type InventoryMoveReason = typeof InventoryMoveReason[keyof typeof InventoryMoveReason];