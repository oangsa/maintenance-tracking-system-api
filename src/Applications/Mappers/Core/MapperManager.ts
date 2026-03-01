import { UserMapper, IUserMapper } from "../UserMapper";
import { DepartmentMapper, IDepartmentMapper } from "../DepartmentMapper";

export interface IMapperManager
{
    userMapper: IUserMapper;
    departmentMapper: IDepartmentMapper;

}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;
    private readonly _departmentMapper: IDepartmentMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
        this._departmentMapper = new DepartmentMapper();
    }

    get userMapper(): IUserMapper
    {
        return this._userMapper;
    }

    get departmentMapper(): IDepartmentMapper
    {
        return this._departmentMapper;
    }
}
