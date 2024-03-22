import { SysUserModel } from "@/models/models/SysUserModel";
import request, { IResponse } from "@/utils/request";

export const requestSysUser = {
    login: async(account: string, password: string): Promise<SysUserModel | undefined> => {
        const response: IResponse<SysUserModel> | undefined = await request("/platform/api/sysUser/login", {
            method: 'post',
            data: {
                account: account,
                password: password
            }
        });

        return response?.data;
    },

    current: async(): Promise<SysUserModel | undefined> => {
        const response: IResponse<SysUserModel> | undefined  = await request('/platform/api/sysUser/current');
        return response?.data;
    },

    add: async (user: SysUserModel): Promise<SysUserModel | undefined> => {
        const response: IResponse<SysUserModel> | undefined  = await request(`/platform/api/sysUser`, {
            method: 'post',
            data: user,
        });
        return response?.data;
    },

    detail: async (id: number): Promise<SysUserModel | undefined> => {
        const response: IResponse<SysUserModel> | undefined  = await request(`/platform/api/sysUser/${id}`);
        return response?.data;
    },

    put: async (user: SysUserModel): Promise<SysUserModel | undefined> => {
        const response: IResponse<SysUserModel> | undefined = await request('/platform/api/sysUser', {
            method: 'put',
            data: user
        });

        return response?.data;
    },

    delete: async(datas: SysUserModel[]): Promise<SysUserModel | undefined> => {
        const ids: number[] | undefined = datas.map(item => item.id!);
        if (!ids || ids.length === 0) {
            return;
        }
        const response: IResponse<SysUserModel> | undefined = await request('/platform/api/sysUser', {
            method: 'delete',
            data: {ids: ids},
        });

        return response?.data;
    },
}