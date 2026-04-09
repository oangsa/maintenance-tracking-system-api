import { UserMapper, IUserMapper } from "../UserMapper";
import { DepartmentMapper, IDepartmentMapper } from "../DepartmentMapper";
import { PartMapper, IPartMapper } from "../PartMapper";
import { IRepairRequestItemStatusMapper, RepairRequestItemStatusMapper } from "../RepairRequestItemStatusMapper";

export interface IMapperManager
{
    partMapper: IPartMapper;
    userMapper: IUserMapper;
    departmentMapper: IDepartmentMapper;
    repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;

}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;
    private readonly _departmentMapper: IDepartmentMapper;
    private readonly _partMapper: IPartMapper;
    private readonly _repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
        this._departmentMapper = new DepartmentMapper();
        this._partMapper = new PartMapper();
        this._repairRequestItemStatusMapper = new RepairRequestItemStatusMapper();
    }

    get userMapper(): IUserMapper
    {
        return this._userMapper;
    }

    get departmentMapper(): IDepartmentMapper
    {
        return this._departmentMapper;
    }

    get partMapper(): IPartMapper
    {
        return this._partMapper;
    }
  
    get repairRequestItemStatusMapper(): IRepairRequestItemStatusMapper
    {
        return this._repairRequestItemStatusMapper;
    }
}
