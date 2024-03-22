import { BaseModel, StateEnum } from "./BaseModel";
import { SysRoleModel } from './SysRoleModel';
import { SysPermissionModel } from "./SysPermissionModel";

/**
 * 系统用户
 */
export interface SysUserModel extends BaseModel {
    id?: number;
    account: string;
    password?: string;
    mobile?: string;
    detail?: string;
    avatarUrl?: string;
    state?: StateEnum;
    roleId?: number;

    role?: SysRoleModel;
    permissions?: SysPermissionModel[];
    token?: string;
}