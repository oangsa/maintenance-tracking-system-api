import { PartDto, PartDto } from "../DataTransferObjects/Part/PartDto";
import { Part } from "@/Infrastructures/Entities/Master/Part";

export interface IPartMapper
{
    PartToDto(part: Part): PartDto;
}

export class PartMapper implements IPartMapper
{
    PartToDto(part: Part): PartDto
    {
        return {
            id: part.id,
            code: part.code,
            name: part.name,
            createdAt: part.createdAt,
            updatedAt: part.updatedAt,
            createdBy: part.createdBy,
            updatedBy: part.updatedBy,
        };
    }
}
