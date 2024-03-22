import { SysRoleModel } from "@/models/models/SysRoleModel";
import { requestSysRole } from "@/services/requests/requestSysRole";
import { Button, Divider } from "antd"
import { useEffect, useState } from "react";
import styles from './RolePermission.less';
import { CheckedType, SysPermissionModel } from "@/models/models/SysPermissionModel";
import MenuCheckbox from "./components/MenuCheckbox";
import { StateEnum } from "@/models/models/BaseModel";

/**
 * 角色权限配置
 */
interface IRolePermission {
    /**
     * 角色
     */
    role: SysRoleModel;

    /**
     * 关闭窗口
     * @returns 
     */
    onClose: () => void;
}

/**
 * 角色权限配置
 * @param props 
 * @returns 
 */
const RolePermission: React.FC<IRolePermission> = (props) => {
    // props
    const { role, onClose } = props;

    // state
    const [rolePermissions, setRolePermissions] = useState<SysPermissionModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // methods
    /**
     * 获取角色权限配置
     * @param role 
     * @returns 角色权限配置
     */
    const loadData = async (role: SysRoleModel) => {
        const rolePermissions = await requestSysRole.listPermissions(role);
        // 按接口返回的权限state初始化权限的勾选状态
        // 然后按勾选更新勾选的半选、全选、未选
        initCheck(rolePermissions ?? []);
        updateChecked(rolePermissions ?? []);
        setRolePermissions(rolePermissions ?? [])
    }

    /**
     * 初始化权限的勾选状态
     * 把从接口获取的权限state，转成checked
     * @param permissions 
     */
    const initCheck = (permissions: SysPermissionModel[]) => {
        console.log(permissions);
        permissions.forEach(item => {
            item.checked = item.state === StateEnum.enable ? 'all' : 'none';

            // 有子权限并且权限不是菜单，插入查看权限
            const children = item.children ?? [];
            if (children.length > 0 && !children[0].path) {
                const listPermissions: SysPermissionModel = {
                    title: item.title,
                    state: item.state,
                    detail: '查看',
                    checked: item.checked,
                    isList: true
                }
                item.children = [listPermissions, ...children];
            }

            initCheck(children);
        });
        console.log('permissions:', permissions);
    }

    /**
     * 菜单勾选改变
     * 更新菜单勾选状态，没有勾选'查看'，同级权限全部不勾选 
     *
     * @param value 变更的权限
     * @param parent 父权限
     */
    const changeMenu = (value: SysPermissionModel, parent?: SysPermissionModel) => {
        if (parent && value.isList === true && value.checked === 'none') {
            // 没有勾选'查看'，同级权限全部不勾选 
            parent.checked = 'none',
                permissionCheck(parent);
        } else {
            permissionCheck(value);
        }

        updateChecked(rolePermissions);
        setRolePermissions([...rolePermissions]);
    }

    /**
     * 更新菜单勾选状态
     * 
     * 子菜单中有一个是 '部分选择' => 父菜单 '部分选择'
     * 子菜单中有选择状态不一致的 => 父菜单 '部分选择'
     * 子菜单都是 '全选' => 父菜单 '全选'
     * 子菜单都是 '未选' => 父菜单 '未选'
     * 
     * @param datas 
     * @returns 
     */
    const updateChecked = (datas: SysPermissionModel[]): CheckedType => {
        // 菜单组的勾选状态，默认 未选
        let currentChecked: CheckedType | undefined;

        datas.forEach(item => {
            // 菜单项的选择状态 全选 未选 部选
            // 必须首先执行保证checked会有状态
            let checked: CheckedType | undefined = undefined;
            if (item.children && item.children.length > 0) {
                checked = updateChecked(item.children);
                item.checked = checked;
            } else {
                checked = item.checked;
            }

            // 菜单组状态是部分选择的，不在检查其他的菜单项，直接返回 部分选择 状态
            if (currentChecked === 'indeterminate') {
                return;
            }

            // 菜单项是 部选，整个菜单组是 部选
            if (checked === 'indeterminate') {
                currentChecked = 'indeterminate';
                return;
            }

            // 菜单项和当前菜单组状态不一致，菜单组状态是 部选
            if (currentChecked !== undefined && checked != currentChecked) {
                currentChecked = 'indeterminate';
                return;
            }

            // 菜单组的状态和菜单项状态保持一致 全选或全未选
            currentChecked = checked;
        });

        return currentChecked ?? 'none';
    }

    /**
     * 权限勾选/取消
     * 当权限被勾选，权限的所有子权限会被勾选
     * 权限被取消，权限的所有子权限会被取消
     * 
     * @param permission 权限组
     * @returns 
     */
    const permissionCheck = (permission?: SysPermissionModel) => {
        if (!permission) {
            return;
        }

        if (!permission.children || permission.children.length === 0) {
            return;
        }

        permission.children.forEach(item => {
            item.checked = permission.checked;
            permissionCheck(item);
        });
    }

    /**
     * 按权限绘制菜单项
     * 
     * @param permissions 权限组
     * @param level 菜单层级，第一级菜单绘制分割线
     * @param parent 复权限
     * @returns Element[] | undefined
     */
    const renderMenus = (permissions: SysPermissionModel[], level: number = 0, parent?: SysPermissionModel) => {
        if (permissions.length === 0) return;

        const subLevel = level + 1;
        return permissions.map(permission => {
            // 是否包含子功能
            let hasSubItem = false;
            if (permission.children && permission.children.length > 0) {
                const subPermission = permission.children[0];
                hasSubItem = subPermission.path ? false : true;
            }

            // 菜单项竖排，功能项横排
            const style = hasSubItem ? styles.cellItem : styles.cellMenu;
            return (
                <div key={level + '_' + permission.title}>
                    <div className={styles.cellMenu}>
                        <MenuCheckbox title={permission.detail ?? '-'} checked={permission.checked}
                            size={permission.path ? 'normal' : 'small'}
                            onChange={value => {
                                permission.checked = value;
                                changeMenu(permission, parent);
                            }}
                        />
                        <div className={style} style={{ marginLeft: '20px' }}>
                            {permission.children && renderMenus(permission.children ?? [], subLevel, permission)}
                        </div>
                    </div>
                    {level === 0 && <Divider style={{ margin: '8px 20px' }} />}
                </div>
            )
        })
    }

    /**
     * 提交 
     */
    const clickSubmit = async () => {
        setLoading(true);
        const response = await requestSysRole.updatePermissions(role, rolePermissions);
        setLoading(false);
        if (!response) {
            return;
        }

        onClose();
    }

    useEffect(() => {
        loadData(role);
    }, [role])

    return (
        <div>
            <div className={styles.container}>
                {rolePermissions && renderMenus(rolePermissions)}
            </div>
            <div className={styles.page_footer}>
                <Button type='primary' loading={loading} onClick={clickSubmit}>
                    保存
                </Button>
            </div>
        </div>
    )
}

export default RolePermission;