import { PartDto } from "../DataTransferObjects/Part/ParttDto";
import { PartForCreateDto } from "../DataTransferObjects/Part/PartForCreateDto";
import { PartForUpdateDto } from "../DataTransferObjects/Part/PartForUpdateDto";
import { PartParameter } from "../../Domains/RequestFeatures/PartmentParameter";
import { PagedResult } from "../../Domains/RequestFeatures/Core/PageResult";

export interface IPartService
{
    GetListPart(parameters: PartParameter): Promise<PagedResult<PartDto>>;
    GetPart(id: number): Promise<PartDto>;
    CreatePart(partForCreateDto: PartForCreateDto): Promise<PartDto>;
    UpdatePart(id: number, PartForUpdateDto: PartForUpdateDto): Promise<PartDto>;
    DeletePart(id: number): Promise<void>;
    DeletePartCollection(ids: number[]): Promise<void>;
}
