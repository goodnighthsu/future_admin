import { useEffect, useState } from "react";
import { useModel } from "@umijs/max";
import { PageContainer } from "@ant-design/pro-components";
import { Button, message, Modal, Pagination, Popconfirm, Table, Tooltip } from "antd";
import styles from './SysRoleList.less';
import SysRoleAdd from "./SysRoleAdd";
import { SysRoleModel } from "@/models/models/SysRoleModel";
import { DeleteOutlined, EditOutlined, SettingOutlined } from "@ant-design/icons";
import RolePermission from "./RolePermission";
import { requestSysRole } from "@/services/requests/requestSysRole";
import { SysPermissionEnum, auth } from "@/models/models/SysPermissionModel";

/**
 * 角色列表
 * 
 * @param props 
 * @returns 
 */
const SysRoleList: React.FC = (props) => {
    // useModel
    const { page, updatePaging, pageSize } = useModel('SysRoleListState');

    // state
    const [datas, setDatas] = useState<SysRoleModel[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
    const [isOpenPermission, setIsOpenPermission] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<SysRoleModel | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    // methods
    const load = async (page?: number, pageSize?: number) => {
        setLoading(true);
        const response = await requestSysRole.list(page, pageSize);
        setLoading(false);
        if (!response) {
            return;
        }
        const { datas, total } = response;
        setDatas(datas);
        setTotal(total);
    }

    const changePage = (page: number, pageSize: number) => {
        updatePaging(page, pageSize);
    }

    const clickDelete = async (role: SysRoleModel) => {
        const response = await requestSysRole.delete([role]);
        if (!response) {
            return;
        }

        message.success(`Delete role ${role.title} success`);
        load();
    }

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '角色名', dataIndex: 'title', width: 200 },
        { title: '备注', dataIndex: 'detail' },
        { title: '更新时间', dataIndex: 'updateTime', width: 200 },
        { title: '创建时间', dataIndex: 'createTime', width: 200 },
        {
            title: '操作',
            width: 140,
            render: (item: SysRoleModel) => {
                return (
                    <div className={styles.cell_action}>
                        <Tooltip title='编辑'>
                            <Button className={styles.cell_edit} type='link' icon={<EditOutlined />}
                                disabled={item.id === 1 || !auth(SysPermissionEnum.accountManageRoleUpdate)}
                                onClick={() => { setSelectedRole(item); setIsOpenAdd(true) }} />
                        </Tooltip>
                        <Tooltip title='设置'>
                            <Button className={styles.cell_edit} type='link' icon={<SettingOutlined />}
                                disabled={item.id === 1 || !auth(SysPermissionEnum.accountManageRoleUpdate)}
                                onClick={() => { setSelectedRole(item); setIsOpenPermission(true) }} />
                        </Tooltip>
                        <Popconfirm title='确认删除?' placement="topRight"
                            disabled={item.id === 1 || !auth(SysPermissionEnum.accountManageRoleDelete)}
                            onConfirm={() => { clickDelete(item) }}>
                            <Tooltip title='删除'>
                                <Button type='link' icon={<DeleteOutlined />}
                                    disabled={item.id === 1 || !auth(SysPermissionEnum.accountManageRoleDelete)}
                                />
                            </Tooltip>
                        </Popconfirm>
                    </div>
                )
            }
        }
    ]

    // effect
    useEffect(() => {
        load(page, pageSize);
    }, [page, pageSize]);

    return (
        <PageContainer>
            {/* paging */}
            <div className={styles.toolbar}>
                <Button
                    type='primary'
                    disabled={!auth(SysPermissionEnum.accountManageRoleAdd)}
                    onClick={() => { setSelectedRole(undefined); setIsOpenAdd(true) }}
                >
                    创建
                </Button>
                <Pagination current={page} pageSize={pageSize} total={total} onChange={changePage} />
            </div>
            {/* table */}
            <div className={styles.tableWrapper}>
                <Table className={styles.table} size="small" dataSource={datas} columns={columns} pagination={false} bordered rowKey={'id'} loading={{ delay: 300, spinning: loading }} />
            </div>
            {/* modal */}
            {/* sys role add */}
            <Modal
                title={selectedRole ? '编辑' : '创建'} centered destroyOnClose footer={null} open={isOpenAdd} width='400px'
                onCancel={() => setIsOpenAdd(false)}>
                <SysRoleAdd sysRole={selectedRole} onClose={() => { setIsOpenAdd(false); load() }} />
            </Modal>
            {/* role permission manage */}
            <Modal title='权限管理' centered open={isOpenPermission} destroyOnClose
                onCancel={() => setIsOpenPermission(false)} footer={null}>
                {selectedRole &&
                    <RolePermission role={selectedRole} onClose={() => setIsOpenPermission(false)} />}
            </Modal>
        </PageContainer>
    );
}

export default SysRoleList;