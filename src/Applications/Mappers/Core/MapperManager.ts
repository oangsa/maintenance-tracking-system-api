import { UserMapper, IUserMapper } from "../UserMapper";
import { DepartmentMapper, IDepartmentMapper } from "../DepartmentMapper";
import { PartMapper, IPartMapper } from "../PartMapper";

export interface IMapperManager
{
    partMapper: IPartMapper;
    userMapper: IUserMapper;
    departmentMapper: IDepartmentMapper;

}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;
    private readonly _departmentMapper: IDepartmentMapper;
    private readonly _partMapper: IPartMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
        this._departmentMapper = new DepartmentMapper();
        this._partMapper = new PartMapper();
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
}
