import { useCallback, useState } from 'react';
import { BaseModel, StateEnum } from "./BaseModel";
import { SysPermissionModel, SysRoleModel } from './SysRoleListState';
import Setting from '../../config/Setting';
import { requestSysUser } from '@/services/requests/requestSysUser';

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
export default () => {
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(Setting.defaultPageSize);
    const [datas, setDatas] = useState<SysUserModel[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const updatePaging = useCallback((page: number, pageSize: number) => {
        setPage(page);
        setPageSize(pageSize);
    }, [])

    const load = useCallback( async (page?: number, pageSize?: number) => {
        setIsLoading(true);
        const data = await requestSysUser.list(page, pageSize);
        setIsLoading(false);
        if (!data) {
            return;
        }
        const {datas, total} = data;

        setDatas(datas);
        setTotal(total);
    }, []);

    return {
        page, 
        pageSize,
        updatePaging,
        datas,
        total,
        isLoading,
        load,
    }
};