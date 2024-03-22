import { SysUserModel } from "@/models/models/SysUserModel";
import { SysRoleModel } from "@/models/models/SysRoleModel";
import request, { IPagingResponse, IPagingResult, IRequestParam, IResponse } from "@/utils/request";
import { SysPermissionModel } from "@/models/models/SysPermissionModel";
import { requestCommon } from "./requestCommon";

/**
 * 角色接口
 */
export const requestSysRole = {

    all: async() => {
        const params: IRequestParam ={
            module: 'sysRole',
            pageSize: -1
        } 
        const response: IPagingResponse<SysRoleModel> | undefined  = await requestCommon.list(params);

        return response?.data?.records ?? [];
    }, 

    /**
     * 角色列表
     * 
     * @param page 
     * @param pageSize 
     * @returns 
     */
    list: async (page?: number, pageSize?: number): Promise<IPagingResult<SysRoleModel> | undefined> => {
        const response: IPagingResponse<SysRoleModel> | undefined  = await request('/platform/api/sysRole', {
            method: 'get',
            params: {
                page: page,
                pageSize: pageSize
            }
        });

        return {
            total: response?.data?.total ?? 0,
            datas: response?.data?.records ?? [],
        }
    },

    /**
     * 添加角色
     * 
     * @param sysRole 
     * @returns 
     */
    add: async (sysRole: SysRoleModel): Promise<SysRoleModel | undefined> => {
        const response: IResponse<SysRoleModel> | undefined = await request('/platform/api/sysRole', {
            method: 'post',
            data: {
                title: sysRole.title, 
                detail: sysRole.detail,
                state: sysRole.state
            }
        });

        return response?.data;
    }, 

    /**
     * 修改角色
     * @param sysRole 
     * @returns 
     */
    put: async (sysRole: SysRoleModel): Promise<SysRoleModel | undefined> => {
        const response: IResponse<SysRoleModel> | undefined = await request('/platform/api/sysRole', {
            method: 'put',
            data: sysRole
        });

        return response?.data;
    }, 

    /**
     * 删除角色
     * @param datas 
     * @returns 
     */
    delete: async(datas: SysRoleModel[]): Promise<SysRoleModel | undefined> => {
        const ids: number[] | undefined = datas.map(item => item.id!);
        if (!ids || ids.length === 0) {
            return;
        }
        const response: IResponse<SysUserModel> | undefined = await request('/platform/api/sysRole', {
            method: 'delete',
            data: {ids: ids},
        });

        return response?.data;
    },

    /**
     * 角色配置的权限
     * 
     * @param sysRole 色
     * @returns 角色配置的权限
     */
    listPermissions: async (sysRole: SysRoleModel): Promise<SysPermissionModel[] | undefined> => {
        const response: IResponse<SysPermissionModel[]> | undefined = await request(`/platform/api/sysRole/${sysRole.id}/permission`, {
            method: 'get'
        });

        return response?.data;
    },

    /**
     * 更新角色权限
     * @param sysRole 角色
     * @param permissions 角色配置的权限
     * @returns 
     */
    updatePermissions: async (sysRole: SysRoleModel, permissions: SysPermissionModel[]): Promise<string[] | undefined> => {
        const enables = requestSysRole.getEnablePermissionByCheck(permissions) ?? [];
        console.log('enables p: ', permissions);
        console.log('enables: ', enables);
        const permissionStrings = enables.map(item => item.title);
        const response: IResponse<string[]> | undefined = await request(`/platform/api/sysRole/${sysRole?.id}/permission`, {
            method: 'put',
            data: permissionStrings
        });

        return response?.data;
    },

    /**
     * 获取权限中勾选或半勾选的权限
     * 
     * @param permissions 权限组
     * @returns 有效勾选的权限
     */
    getEnablePermissionByCheck: (permissions: SysPermissionModel[]) => {
        let result: SysPermissionModel[] = [];
        permissions.forEach(item => {
            if (item.checked !== 'none' && !item.isList) {
                result.push(item);
            }
            const subPermissions = requestSysRole.getEnablePermissionByCheck(item.children ?? []);
            result = [...result, ...subPermissions];
        });

        return result;
    }
}