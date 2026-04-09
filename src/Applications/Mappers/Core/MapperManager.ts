import { UserMapper, IUserMapper } from "../UserMapper";
import { DepartmentMapper, IDepartmentMapper } from "../DepartmentMapper";
import { IRepairStatusMapper, RepairStatusMapper } from "../RepairStatusMapper";

export interface IMapperManager
{
    userMapper: IUserMapper;
    departmentMapper: IDepartmentMapper;
    repairStatusMapper: IRepairStatusMapper;

}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;
    private readonly _departmentMapper: IDepartmentMapper;
    private readonly _repairStatusMapper: IRepairStatusMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
        this._departmentMapper = new DepartmentMapper();
        this._repairStatusMapper = new RepairStatusMapper();
    }

    get userMapper(): IUserMapper
    {
        return this._userMapper;
    }

    get departmentMapper(): IDepartmentMapper
    {
        return this._departmentMapper;
    }

    get repairStatusMapper(): IRepairStatusMapper
    {
        return this._repairStatusMapper;
    }
}
