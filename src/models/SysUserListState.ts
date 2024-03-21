import { BaseModel, StateEnum } from "./BaseModel";
import { SysRoleModel } from './SysRoleListState';
import ToolBarState from './models/ToolBarState';
import PaginationState from './models/PaginationState';
import { SysPermissionModel } from "./models/SysPermissionModel";

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

/**
 * SysUserList 账号列表页state
 */
// let init = true;
export default () => {
    return {
        ...ToolBarState('id', 'descend'),
        ...PaginationState(),
    };
};