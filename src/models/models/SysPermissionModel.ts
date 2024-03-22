import { App } from "../AppState";
import { StateEnum } from "./BaseModel";

/**
 * 系统权限
 */
export class SysPermissionModel {
    /**
     * 权限名
     */
    title?: string;

    /**
     * 权限显示名
     */
    detail?: string;

    /**
     * 权限菜单路径
     */
    path?: string;

    /**
     * 权限允许访问的api
     */
    api?: string[];

    /**
     * 权限状态
     */
    state?: StateEnum;

    /**
     * 子权限
     */
    children?: SysPermissionModel[];

    /**
     * 权限在权限配置里的选定状态
     */
    checked?: CheckedType;

    /**
     * 查看权限
     * @description 权限是菜单项并且有子权限的，initCheck方法会默认插入"查看"权限
     * 不勾选"查看"，所有同级权限会被取消
     */
    isList?: boolean;
}

/**
 * 鉴权
 * 
 * @param title 权限名
 * @returns 
 */
export const auth = (title: SysPermissionEnum): boolean => {
    const currentUser = App.instance().currentUser;
    if (!currentUser) {
        return false;
    }
    return checkPermissions(title, currentUser.permissions);
}

/**
 * 校验权限
 * 
 * @param title 权限名 
 * @param permissions 权限组
 * @returns 
 */
const checkPermissions = (title: SysPermissionEnum, permissions?: SysPermissionModel[]): boolean => {
    if (!permissions) return false;
    
    return permissions.some(permission => {
        if (checkPermissions(title, permission.children)) return true;

        return (title.toLocaleLowerCase() === permission.title?.toLocaleLowerCase() ?? '') &&
        permission.state === StateEnum.enable;
    });
}

/**
 * 权限枚举
 */
export enum SysPermissionEnum {
    // 交易日历
    tradingCalendarUpdate = 'tradingCalendar_update',

    // 账号管理
    // 账号
    accountManageAccountAdd = 'accountManage_account_add',
    accountManageAccountUpdate = 'accountManage_account_update',
    accountManageAccountDelete = 'accountManage_account_delete',
    
    // 角色
    accountManageRoleAdd = 'accountManage_role_add',
    accountManageRoleUpdate = 'accountManage_role_update',
    accountManageRoleDelete = 'accountManage_role_delete',
}

/**
 * 选定状态
 * none: 未选定 
 * all: 全部
 * indeterminate: 部分
 */
export type CheckedType = 'none' | 'all' | 'indeterminate';