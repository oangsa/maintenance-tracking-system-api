import { UserMapper, IUserMapper } from "../UserMapper";
import { DepartmentMapper, IDepartmentMapper } from "../DepartmentMapper";
import { IRepairStatusMapper, RepairStatusMapper } from "../RepairStatusMapper";
import { PartMapper, IPartMapper } from "../PartMapper";
import { IRepairRequestItemStatusMapper, RepairRequestItemStatusMapper } from "../RepairRequestItemStatusMapper";
import { IRepairRequestMapper, RepairRequestMapper } from "../RepairRequestMapper";
import { ProductTypeMapper, IProductTypeMapper } from "../ProductTypeMapper";

export interface IMapperManager
{
    partMapper: IPartMapper;
    userMapper: IUserMapper;
    departmentMapper: IDepartmentMapper;
    repairStatusMapper: IRepairStatusMapper;
    repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;
    repairRequestMapper: IRepairRequestMapper;
    productTypeMapper: IProductTypeMapper;
}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;
    private readonly _departmentMapper: IDepartmentMapper;
    private readonly _repairStatusMapper: IRepairStatusMapper;
    private readonly _partMapper: IPartMapper;
    private readonly _repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;
    private readonly _repairRequestMapper: IRepairRequestMapper;
    private readonly _productTypeMapper: IProductTypeMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
        this._departmentMapper = new DepartmentMapper();
        this._repairStatusMapper = new RepairStatusMapper();
        this._partMapper = new PartMapper();
        this._repairRequestItemStatusMapper = new RepairRequestItemStatusMapper();
        this._repairRequestMapper = new RepairRequestMapper();
        this._productTypeMapper = new ProductTypeMapper();
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
      
    get partMapper(): IPartMapper
    {
        return this._partMapper;
    }
  
    get repairRequestItemStatusMapper(): IRepairRequestItemStatusMapper
    {
        return this._repairRequestItemStatusMapper;
    }

    get repairRequestMapper(): IRepairRequestMapper
    {
        return this._repairRequestMapper;
    }

    get productTypeMapper(): IProductTypeMapper
    {
        return this._productTypeMapper;
    }
}
