import { UserMapper, IUserMapper } from "../UserMapper";
import { DepartmentMapper, IDepartmentMapper } from "../DepartmentMapper";
import { IRepairRequestItemStatusMapper, RepairRequestItemStatusMapper } from "../RepairRequestItemStatusMapper";

export interface IMapperManager
{
    userMapper: IUserMapper;
    departmentMapper: IDepartmentMapper;
    repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;

}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;
    private readonly _departmentMapper: IDepartmentMapper;
    private readonly _repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
        this._departmentMapper = new DepartmentMapper();
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

    get repairRequestItemStatusMapper(): IRepairRequestItemStatusMapper
    {
        return this._repairRequestItemStatusMapper;
    }
}
