import { StateEnum } from "@/models/BaseModel";
import { SysPermissionModel, SysRoleModel } from "@/models/SysRoleListState";
import { requestSysRole } from "@/services/requests/requestSysRole";
import { Button, Tree } from "antd"
import { DataNode } from "antd/lib/tree";
import { isArray } from "lodash";
import { Key, useEffect, useState } from "react";
import styles from './RolePermission.less';

interface IRolePermission {
    role: SysRoleModel;
    onClose: () => void;
}

/**
 * 系统用户角色权限
 * @param props 
 * @returns 
 */
const RolePermission:React.FC<IRolePermission> = (props) => {
    // props
    const { role, onClose } = props;

    // state
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [checkedKeys, setCheckedkeys] = useState<Key[]>([]);
    const [rolePermissions, setRolePermissions] = useState<SysPermissionModel[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false); 

    // methods
    /**
     * permissions 转 dataNode
     * @param permissions 
     * @returns 
     */
    const permission2DatNode = ( permissions: SysPermissionModel[] | undefined):  DataNode[] | undefined => {
        const dataNodes = permissions?.map( permission => {
            const dataNode: DataNode = {
                key: permission.title ?? "-",
                title: <div>{permission.detail}</div>
            }

            dataNode.children = permission2DatNode(permission.children);
    
            // 子菜单中只要有一个没有选定，就不加到checkedKeys中
            if (isAllChecked(permission)) {
                checkedKeys.push(permission.title)
                setCheckedkeys(checkedKeys);
            }
            return dataNode;
        });

        return dataNodes;
    }

    const isAllChecked =  (permission: SysPermissionModel): boolean => {
        if (permission.state != StateEnum.enable) {
            return false;
        }

        const children =  permission.children ?? [];
        if (permission.state === StateEnum.enable && children.length === 0) {
            return true;
        }

        return children.every( sub => {
            return isAllChecked(sub);
        })
    }

    /**
     * load role permissions
     * @param role 
     */
    const loadData = async (role: SysRoleModel) => {
        const permissions = await requestSysRole.listPermissions(role);
        setRolePermissions(permissions ?? []);
        setTreeData(permission2DatNode(permissions) ?? [], );
    }

    /**
     * checkedKeys 转成 permissions 包括父级 
     * @param checkeds checkedKeys
     * @param allPermissions all permissions
     * @returns 
     */
    const getAllCheckedKeys = (checkeds: Key[], allPermissions: SysPermissionModel[]): string[] => {
        let all: string[] = [];
        checkeds?.forEach( item => {
            const keys: string[] = [item as string];
            addKey(item as string,  allPermissions,  keys);
            all = all.concat(keys);
        });

        return Array.from(new Set(all));
    }

    /**
     * 添加权限包括父级
     * @param key 
     * @param permissions 
     * @param keys 
     * @returns 
     */
    const addKey = (key: string, permissions: SysPermissionModel[] , keys: string[]): boolean => {
        return permissions.some(item => {
            const children  = item.children ?? [];
            if (children.length > 0 ) {
                if (addKey(key, children, keys)) {
                    keys.push(item.title);
                    return true;
                };
                return false;
            }

            if (item.title === key) {
                return true;
            }
            
            return false;
        })
    }

    // event
    const onCheck = (value: Key[] | {checked: Key[]; halfChecked: Key[]}) => {
        if (isArray(value)) {
            setCheckedkeys(value);
        }
    }

    // click submit
    const clickSubmit = async () => {
        setIsSaving(true);
        const all = getAllCheckedKeys(checkedKeys, rolePermissions);
        const updated = await requestSysRole.updatePermissions(role, all);
        setIsSaving(false);
        if (!updated) {
            return;
        }

        onClose();
    }

    useEffect(() => {
        setCheckedkeys([]);
        loadData(role);
    }, [role])

    return (
        <div>
            {/* permission tree */}
            <div>
                <Tree checkable selectable={false} treeData={treeData} onCheck={onCheck} checkedKeys={checkedKeys}/>
            </div>
            {/* foot */}
            <div className={styles.model_footer}>
                <Button type='primary' loading={isSaving} onClick={clickSubmit}>
                    保存
                </Button>
            </div>
        </div>
    )
}

export default RolePermission;