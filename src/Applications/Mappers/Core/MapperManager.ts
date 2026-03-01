import { UserMapper, IUserMapper } from "../UserMapper";

export interface IMapperManager
{
    userMapper: IUserMapper;
}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
    }

    get userMapper(): IUserMapper
    {
        return this._userMapper;
    }
}
