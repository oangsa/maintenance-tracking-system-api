import { Part } from "@/Infrastructures/Entities/Master/Part";
import { PartParameter } from "../RequestFeatures/PartParameter";
import { PagedResult } from "../RequestFeatures/Core/PageResult";

export interface IPartRepository
{
    GetPartById(id: number): Promise<Part | null>;
    GetPartByCode(code: string, includeDeleted?: boolean): Promise<Part | null>;
    GetListPart(parameters: PartParameter): Promise<PagedResult<Part>>;
    CreatePart(part: Part): Promise<Part>;
    UpdatePart(part: Partial<Part>): Promise<Part>;
    DeletePart(id: number): Promise<void>;
}
