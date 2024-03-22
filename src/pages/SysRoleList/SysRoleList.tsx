import { useRef, useState } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Button, message, Modal, Popconfirm, Tooltip } from "antd";
import styles from './SysRoleList.less';
import SysRoleAdd from "./SysRoleAdd";
import { SysRoleModel } from "@/models/models/SysRoleModel";
import { DeleteOutlined, EditOutlined, SettingOutlined } from "@ant-design/icons";
import RolePermission from "./RolePermission";
import { requestSysRole } from "@/services/requests/requestSysRole";
import { SysPermissionEnum, auth } from "@/models/models/SysPermissionModel";
import FilterList, { IFilterListCallback } from "@/components/FilterList/FilterList";
import { PageStateEnum } from "@/models/AppState";
import { requestCommon } from "@/services/requests/requestCommon";
import { FilterTypeEnum } from "@/components/ToolBar/FilterForm";

/**
 * 角色列表
 * 
 * @param props 
 * @returns 
 */
const SysRoleList: React.FC = (props) => {

    // state
    const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
    const [isOpenPermission, setIsOpenPermission] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<SysRoleModel | undefined>(undefined);
    const filterListRef = useRef<IFilterListCallback>(null);

    // methods
    const clickDelete = async (role: SysRoleModel) => {
        const response = await requestSysRole.delete([role]);
        if (!response) {
            return;
        }

        message.success(`Delete role ${role.title} success`);
        filterListRef.current?.load();
    }

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80, filterType: FilterTypeEnum.number },
        { title: '角色名', dataIndex: 'title', width: 200, filterType: FilterTypeEnum.text },
        { title: '备注', dataIndex: 'detail', filterType: FilterTypeEnum.text  },
        { title: '更新时间', dataIndex: 'updateTime', width: 200, filterType: FilterTypeEnum.date },
        { title: '创建时间', dataIndex: 'createTime', width: 200, filterType: FilterTypeEnum.date },
        {
            title: '操作',
            width: 140,
            render: (item: SysRoleModel) => {
                return (
                    <div className={styles.cell_action}>
                        <Tooltip title='编辑'>
                            <Button className={styles.cell_edit} type='link' icon={<EditOutlined />}
                                disabled={item.id === 1 || !auth(SysPermissionEnum.accountManageRoleUpdate)}
                                onClick={() => {setSelectedRole(item); setIsOpenAdd(true) }} />
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

    return (
        <PageContainer>
            {/* paging */}
            <div className={styles.page}>
                <FilterList ref={filterListRef}
                    columns={columns}
                    pageState={PageStateEnum.sysRoleList}
                    request={requestCommon.list}
                >
                    <Button type='primary' disabled={!auth(SysPermissionEnum.accountManageAccountAdd)}
                        onClick={() => {{setSelectedRole(undefined); setIsOpenAdd(true) }}}
                    >
                        创建
                    </Button>
                </FilterList>
            </div>
            {/* modal */}
            {/* sys role add */}
            <Modal
                title={selectedRole ? '编辑' : '创建'} centered destroyOnClose footer={null} open={isOpenAdd} width='400px'
                onCancel={() => setIsOpenAdd(false)}>
                <SysRoleAdd sysRole={selectedRole} 
                    onClose={() => { 
                        setIsOpenAdd(false); filterListRef.current?.load(); 
                    }} 
                />
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