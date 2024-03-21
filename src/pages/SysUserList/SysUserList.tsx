import React, { useEffect, useState, useRef } from 'react';
import { PageContainer } from "@ant-design/pro-components";
import { Button, Switch, Modal } from "antd";
import styles from './SysUserList.less';
import { SysUserModel } from '@/models/SysUserListState';
import SysRoleSelect from '../SysRoleList/components/SysRoleSelect';
import Tooltip from 'antd/es/tooltip';
import { DeleteOutlined, EditOutlined, RedoOutlined } from '@ant-design/icons';
import Popconfirm from 'antd/es/popconfirm';
import SysUserAdd from './SysUserAdd';
import { SysRoleModel } from '@/models/SysRoleListState';
import { requestSysUser } from '@/services/requests/requestSysUser';
import { requestSysRole } from '@/services/requests/requestSysRole';
import SysUserReset from './SysUserReset';
import { SysPermissionEnum, auth } from '@/models/models/SysPermissionModel';
import FilterList, { IFilterListCallback } from '@/components/FilterList/FilterList';
import { PageStateEnum } from '@/models/AppState';
import { IColumnOptional } from '@/components/ToolBar/ToolBarFilter';
import { FilterTypeEnum } from '@/components/ToolBar/FilterForm';
import { requestCommon } from '@/services/requests/requestCommon';
import { StateEnum } from '@/models/BaseModel';

/**
 * 账号列表
 * @param props 
 * @returns 
 */
const SysUserList: React.FC = (props) => {

    const [columns, setColumns] = useState<IColumnOptional<SysUserModel>[]>([]);
    const [openAdd, setOpenAdd] = useState<boolean>(false);
    const [openReset, setOpenReset] = useState<boolean>(false);
    const [selected, setSelected] = useState<SysUserModel | undefined>(undefined);
    const filterListRef = useRef<IFilterListCallback>(null);

    const clickDelete = async (item: SysUserModel) => {
        const response = await requestSysUser.delete([item]);
        if (!response) {
            return;
        }
        filterListRef.current?.load();
    }

    const changeRole = async (user: SysUserModel, roleId: string) => {
        user.roleId = Number.parseInt(roleId);
        const response = await requestSysUser.put(user);
        if (!response) {
            return;
        }

        filterListRef.current?.load();
    }

    const changeState = async (user: SysUserModel, state: boolean) => {
        user.state = state ? StateEnum.enable : StateEnum.disable;
        const response = await requestSysUser.put(user);
        if (!response) {
            return;
        }
        filterListRef.current?.load();
    }

    const loadConfig = async () => {
        const response = await requestSysRole.all();
        setColumns(createColumns(response));
    }

    const createColumns = (roles: SysRoleModel[]): IColumnOptional<SysUserModel>[] => {
        return [
            { title: 'ID', dataIndex: 'id', key: 'id', width: 80, filterType: FilterTypeEnum.number },
            { title: '账号', dataIndex: 'account', key: 'account', width: 160, filterType: FilterTypeEnum.text },
            { title: '手机', dataIndex: 'mobile', key: 'mobile', width: 160, filterType: FilterTypeEnum.text },
            {
                title: '角色', dataIndex: 'roleId', width: 120, filterType: FilterTypeEnum.general,
                datas: roles.map(role => {
                    return { value: role.id, label: role.title }
                }),
                render: ((_, item: SysUserModel) => {
                    return <SysRoleSelect allRoles={roles} role={item.role} disabled={item?.id === 1}
                        onChange={(roleId) => changeRole(item, roleId)} />
                })
            },
            {
                title: '状态', dataIndex: 'state', width: 100,
                datas: [{ value: StateEnum.enable, label: '启用' }, { value: StateEnum.disable, label: '禁用' }],
                render: ((state: StateEnum, item: SysUserModel) => {
                    const isChecked = state === StateEnum.enable ? true : false;
                    return (
                        <Switch checkedChildren='启用' unCheckedChildren='禁用' checked={isChecked} disabled={item.id === 1}
                            onClick={(value) => changeState(item, value)}
                        />
                    )
                })
            },
            { title: '备注', dataIndex: 'detail', key: 'detail', width: 120, filterType: FilterTypeEnum.text },
            { title: '更新时间', dataIndex: 'updateTime', width: 160, filterType: FilterTypeEnum.date },
            { title: '创建时间', dataIndex: 'createTime', width: 160, filterType: FilterTypeEnum.date },
            {
                title: '操作',
                width: 140,
                render: (item: SysUserModel) => {
                    return (
                        <div className={styles.cell_action}>
                            <Tooltip title='编辑'>
                                <Button type='link' icon={<EditOutlined />}
                                    disabled={!auth(SysPermissionEnum.accountManageAccountUpdate)}
                                    onClick={() => { setSelected(item); setOpenAdd(true); }} />
                            </Tooltip>
                            <Tooltip title='密码重置'>
                                <Button type='link' icon={<RedoOutlined />}
                                    disabled={!auth(SysPermissionEnum.accountManageAccountUpdate)}
                                    onClick={() => { setSelected(item); setOpenReset(true); }} />
                            </Tooltip>
                            <Popconfirm title='确认删除?' placement="topRight" disabled={item.id === 1 || !auth(SysPermissionEnum.accountManageAccountDelete)}
                                onConfirm={() => { clickDelete(item) }}>
                                <Tooltip title='删除'>
                                    <Button type='link' icon={<DeleteOutlined />}
                                        disabled={item.id === 1 || !auth(SysPermissionEnum.accountManageAccountDelete)} />
                                </Tooltip>
                            </Popconfirm>
                        </div>
                    )
                }
            }
        ]
    }

    // effects
    useEffect(() => {
        loadConfig();
    }, []);

    return (
        <PageContainer>
            {/* <div className={styles.toolbar}>
                <Button type='primary' onClick={() => { setSelected(undefined); setOpenAdd(true); }}
                    disabled={!auth(SysPermissionEnum.accountManageAccountAdd)}
                >
                    创建
                </Button>
            </div> */}
            <div className={styles.page}>
                <FilterList ref={filterListRef}
                    columns={columns}
                    pageState={PageStateEnum.sysUserList}
                    // defaultParam={{sorter: 'id', order: 'descend'}}
                    request={requestCommon.list}
                />
            </div>

            {/* modal */}
            <Modal title={selected ? '编辑' : '创建'} centered destroyOnClose footer={null} open={openAdd} width='700px'
                onCancel={() => setOpenAdd(false)}>
                <SysUserAdd user={selected} onClose={() => { setOpenAdd(false); filterListRef.current?.load(); }} />
            </Modal>
            {/* modal */}
            <Modal title='重置密码' centered destroyOnClose footer={null} open={openReset} width='700px'
                onCancel={() => setOpenReset(false)}>
                <SysUserReset user={selected!} onClose={() => { setOpenReset(false); filterListRef.current?.load(); }} />
            </Modal>
        </PageContainer>
    )
}

export default SysUserList;