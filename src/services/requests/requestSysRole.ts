import { SysUserModel } from "@/models/SysUserListState";
import { SysPermissionModel, SysRoleModel } from "@/models/SysRoleListState";
import request, { IPagingResponse, IPagingResult, IResponse } from "@/utils/request";

export const requestSysRole = {
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

    put: async (sysRole: SysRoleModel): Promise<SysRoleModel | undefined> => {
        const response: IResponse<SysRoleModel> | undefined = await request('/platform/api/sysRole', {
            method: 'put',
            data: sysRole
        });

        return response?.data;
    }, 

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
     * 角色权限
     * @param sysRole 
     * @returns 
     */
    listPermissions: async (sysRole: SysRoleModel): Promise<SysPermissionModel[] | undefined> => {
        const response: IResponse<SysPermissionModel[]> | undefined = await request(`/platform/api/sysRole/${sysRole?.id}/permission`, {
            method: 'get'
        });

        return response?.data;
    },

    /**
     * 角色权限更新
     * @param permissions 
     * @returns 
     */
    updatePermissions: async (sysRole: SysRoleModel, permissions: string[]): Promise<string[] | undefined> => {
        const response: IResponse<string[]> | undefined = await request(`/platform/api/sysRole/${sysRole?.id}/permission`, {
            method: 'put',
            data: {
                permissions: permissions,
            }
        });

        return response?.data;
    }
}