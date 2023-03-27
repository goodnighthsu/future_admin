import React, { useEffect, useState } from 'react';
import { SysRoleModel } from "@/models/SysRoleListState"
import { Select } from "antd";

interface ISysRoleSelect {
    allRoles: SysRoleModel[];
    role?: SysRoleModel;
    disabled?: boolean;
    bordered?: boolean;
    onChange: (roleId: string) => void,  // 用户角色更新
}

/**
 * 角色选择
 * @param props 
 * @returns 
 */
const SysRoleSelect: React.FC<ISysRoleSelect> = (props) => {
    const { allRoles, role, disabled, bordered=false, onChange} = props;
    // state
    const [selected, setSelected] = useState<string | undefined>(role?.id ? String(role.id) : undefined);

    // effects 
    useEffect(() => {
        setSelected(role?.title);
    }, [role]);

    // render
    return (
        <Select style={{width: '100%'}} value={selected} placeholder='Select role' bordered={bordered} disabled={disabled}
            options={
                allRoles.map((item) => {
                    return  {value: item.id, label: item.title}

            })}
            onChange={(roleId) => {onChange(roleId)}}
        />
    )   
}

export default SysRoleSelect;