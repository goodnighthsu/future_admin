import React, { useEffect, useState } from 'react';
import { useModel } from "@umijs/max";
import { PageContainer } from "@ant-design/pro-components";
import { Button, Pagination, Switch, Table, message, Modal } from "antd";
import styles from './SysUserList.less';
import { StateEnum } from '@/models/BaseModel';
import { SysUserModel } from '@/models/SysUserListState';
import SysRoleSelect from '../SysRoleList/components/SysRoleSelect';
import Tooltip from 'antd/es/tooltip';
import { DeleteOutlined, EditTwoTone, RedoOutlined } from '@ant-design/icons';
import Popconfirm from 'antd/es/popconfirm';
import SysUserAdd from './SysUserAdd';
import { SysRoleModel } from '@/models/SysRoleListState';
import { requestSysUser } from '@/services/requests/requestSysUser';
import { requestSysRole } from '@/services/requests/requestSysRole';
import SysUserReset from './SysUserReset';

/**
 * 
 * @param props 账号列表
 * @returns 
 */
const SysUserList: React.FC = (props) => {
    // useModel
    const { page, updatePaging, pageSize  } = useModel('SysUserListState');

    // state
    const [datas, setDatas] = useState<SysUserModel[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [openAdd, setOpenAdd] = useState<boolean>(false);
    const [openReset, setOpenReset] = useState<boolean>(false);
    const [selected, setSelected] = useState<SysUserModel | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const [allRoles, setAllRoles] = useState<SysRoleModel[]>([]);

    // methods
    const load = async (page?: number, pageSize?: number) => {
        setLoading(true);
        const response = await requestSysUser.list(page, pageSize);
        setLoading(false);
        if (!response) {
            return;
        }
        const {datas, total} = response;
        setDatas(datas);
        setTotal(total);

    }

    const changePage = (page: number, pageSize: number) => {
        updatePaging(page, pageSize); 
    }

    const clickDelete = async (item: SysUserModel) => {
        const response = await requestSysUser.delete([item]);
        if (!response) {
            return;
        }

        message.success(`账号 ${item.account} 删除成功`);
        load();
    }

    const changeRole = async (user: SysUserModel, roleId: string) => {
        user.roleId = Number.parseInt(roleId);
        const response = await requestSysUser.put(user);
        if (!response) {
            return;
        }
        load(page, pageSize);
    }

    const changeState = async (user: SysUserModel, state: boolean) => {
        user.state = state ? StateEnum.enable : StateEnum.disable;
        const response = await requestSysUser.put(user);
        if (!response) {
            return;
        }
        load(page, pageSize);
    }
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80}, 
        { title: '账号', dataIndex: 'account', key: 'account', width: 160},
        { title: '手机', dataIndex: 'mobile', key: 'mobile', width: 160},
        { 
            title: '角色', width: 120,
            render: ((item: SysUserModel) => {
                return <SysRoleSelect allRoles={allRoles} role={item.role} disabled={item?.id === 1}
                    onChange={(roleId) => changeRole(item, roleId)}/>
            })
        },
        { 
            title: '状态', dataIndex: 'state', width: 100,
            render: ((state: StateEnum, item: SysUserModel) => {
                const isChecked = state === StateEnum.enable ?  true : false;
                return (
                    <Switch checkedChildren='启用' unCheckedChildren='禁用' checked={isChecked} disabled={item.id===1}
                        onClick={(value) => changeState(item, value)}
                    />
                )
            })
        },
        { title: '备注', dataIndex: 'detail', key: 'detail'}, 
        { title: '更新时间', dataIndex: 'updateTime', width: 160 },
        { title: '创建时间', dataIndex: 'createTime', width: 160 },
        {
            title: '操作',
            width: 140,
            render: (item: SysUserModel) => {
                return (
                    <div className={styles.cell_action}>
                        <Tooltip title='编辑'>
                            <Button type='link' icon={<EditTwoTone/> } onClick={() => {setSelected(item); setOpenAdd(true);}}/>
                        </Tooltip>
                        <Tooltip title='密码重置'>
                            <Button type='link' icon={<RedoOutlined/> } onClick={() => {setSelected(item); setOpenReset(true);}}/>
                        </Tooltip>
                        <Popconfirm title='确认删除?' placement="topRight" disabled={item.id===1}
                            onConfirm={() => {clickDelete(item)}}>
                            <Tooltip title='删除'>
                                <Button type='link' icon={<DeleteOutlined/> } disabled={item.id===1}/>
                            </Tooltip>
                        </Popconfirm>
                    </div>
                )
            }
        }
    ]

    // effect
    useEffect(() => {
        // load system role
        requestSysRole.list(1, 1000)
        .then(result => {
            setAllRoles(result?.datas ?? []); 
        })
    }, []);

    useEffect(() => {
        load(page, pageSize);
    }, [page, pageSize]);
    
    return (
        <PageContainer>
            <div className={styles.toolbar}>
                <Button type='primary' onClick={() => {setSelected(undefined); setOpenAdd(true);} }>创建</Button>
                <Pagination current={page} pageSize={pageSize} total={total} onChange={changePage}/>
            </div>
            <div className={styles.tableWrapper}>
                <Table className={styles.table} size="small" dataSource={datas} columns={columns} pagination={false} bordered rowKey={'id'} 
                    loading={{delay: 300, spinning: loading}}/>
            </div>
            {/* modal */}
            <Modal title={selected ?  '编辑' : '创建'} centered destroyOnClose footer={null} open={openAdd}  width='700px'
                onCancel={() => setOpenAdd(false)}>
                <SysUserAdd user={selected} onClose={()=> {setOpenAdd(false); load()}} />
            </Modal>
            {/* modal */}
            <Modal title='重置密码' centered destroyOnClose footer={null} open={openReset}  width='700px'
                onCancel={() => setOpenReset(false)}>
                <SysUserReset user={selected!} onClose={()=> {setOpenReset(false); load()}} />
            </Modal>
        </PageContainer>
    )
}

export default SysUserList;