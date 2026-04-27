import { UserMapper, IUserMapper } from "../UserMapper";
import { DepartmentMapper, IDepartmentMapper } from "../DepartmentMapper";
import { IRepairStatusMapper, RepairStatusMapper } from "../RepairStatusMapper";
import { PartMapper, IPartMapper } from "../PartMapper";
import { IRepairRequestItemStatusMapper, RepairRequestItemStatusMapper } from "../RepairRequestItemStatusMapper";
import { IInventoryMoveMapper, InventoryMoveMapper } from "../InventoryMoveMapper";
import { IRepairRequestMapper, RepairRequestMapper } from "../RepairRequestMapper";
import { ProductTypeMapper, IProductTypeMapper } from "../ProductTypeMapper";
import { ProductMapper, IProductMapper } from "../ProductMapper";
import { IRepairRequestStatusLogMapper, RepairRequestStatusLogMapper } from "../RepairRequestStatusLogMapper";
import { WorkOrderMapper, IWorkOrderMapper } from "../WorkOrderMapper";
import { WorkOrderPartMapper, IWorkOrderPartMapper } from "../WorkOrderPartMapper";
import { WorkTaskMapper, IWorkTaskMapper } from "../WorkTaskMapper";

export interface IMapperManager
{
    partMapper: IPartMapper;
    userMapper: IUserMapper;
    departmentMapper: IDepartmentMapper;
    repairStatusMapper: IRepairStatusMapper;
    repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;
    inventoryMoveMapper: IInventoryMoveMapper;
    repairRequestMapper: IRepairRequestMapper;
    productTypeMapper: IProductTypeMapper;
    productMapper: IProductMapper;
    repairRequestStatusLogMapper: IRepairRequestStatusLogMapper;
    workOrderMapper: IWorkOrderMapper;
    workOrderPartMapper: IWorkOrderPartMapper;
    workTaskMapper: IWorkTaskMapper;
}

export class MapperManager implements IMapperManager
{
    private readonly _userMapper: IUserMapper;
    private readonly _departmentMapper: IDepartmentMapper;
    private readonly _repairStatusMapper: IRepairStatusMapper;
    private readonly _partMapper: IPartMapper;
    private readonly _repairRequestItemStatusMapper: IRepairRequestItemStatusMapper;
    private readonly _inventoryMoveMapper: IInventoryMoveMapper;
    private readonly _repairRequestMapper: IRepairRequestMapper;
    private readonly _productTypeMapper: IProductTypeMapper;
    private readonly _productMapper: IProductMapper;
    private readonly _repairRequestStatusLogMapper: IRepairRequestStatusLogMapper;
    private readonly _workOrderMapper: IWorkOrderMapper;
    private readonly _workOrderPartMapper: IWorkOrderPartMapper;
    private readonly _workTaskMapper: IWorkTaskMapper;

    constructor()
    {
        this._userMapper = new UserMapper();
        this._departmentMapper = new DepartmentMapper();
        this._repairStatusMapper = new RepairStatusMapper();
        this._partMapper = new PartMapper();
        this._repairRequestItemStatusMapper = new RepairRequestItemStatusMapper();
        this._inventoryMoveMapper = new InventoryMoveMapper();
        this._repairRequestMapper = new RepairRequestMapper();
        this._productTypeMapper = new ProductTypeMapper();
        this._productMapper = new ProductMapper();
        this._repairRequestStatusLogMapper = new RepairRequestStatusLogMapper();
        this._workOrderMapper = new WorkOrderMapper();
        this._workOrderPartMapper = new WorkOrderPartMapper();
        this._workTaskMapper = new WorkTaskMapper();
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

    get inventoryMoveMapper(): IInventoryMoveMapper
    {
        return this._inventoryMoveMapper;
    }

    get repairRequestMapper(): IRepairRequestMapper
    {
        return this._repairRequestMapper;
    }

    get productTypeMapper(): IProductTypeMapper
    {
        return this._productTypeMapper;
    }

    get productMapper(): IProductMapper
    {
        return this._productMapper;
    }

    get repairRequestStatusLogMapper(): IRepairRequestStatusLogMapper
    {
        return this._repairRequestStatusLogMapper;
    }

    get workOrderMapper(): IWorkOrderMapper
    {
        return this._workOrderMapper;
    }

    get workOrderPartMapper(): IWorkOrderPartMapper
    {
        return this._workOrderPartMapper;
    }

    get workTaskMapper(): IWorkTaskMapper
    {
        return this._workTaskMapper;
    }
}
