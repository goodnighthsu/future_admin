import { Checkbox } from 'antd';
import { CheckedType } from "@/models/models/SysPermissionModel";

/**
 * 选框菜单
 */
interface IMenuCheckbox {
    /**
     * 菜单标题
     */
    title: string;

    /**
     * 菜单选定状态
     */
    checked?: CheckedType;

    /**
     * 标题大小
     */
    size: 'small' | 'normal';

    /**
     * 菜单勾选改变
     * @param checked 勾选状态 
     * @returns void
     */
    onChange: (checked: CheckedType) => void;
}

/**
 * 菜单选择
 * @param props
 * @returns
 */
const MenuCheckbox: React.FC<IMenuCheckbox> = (props) => {
    const { title, checked, size = 'normal', onChange } = props;

    return (
        <Checkbox style={{margin: '4px 0 4px 20px'}}
            checked={checked === 'all'} indeterminate={checked === 'indeterminate'}
            onChange={ event => onChange(event.target.checked ? 'all' : 'none')}
        >
            <span style={size === 'small' ? {fontSize: '12px', fontWeight: 'normal'} : {fontSize: '14px', fontWeight: 'bold'}}>
                {title}
            </span>
        </Checkbox>
    )
}

export default MenuCheckbox;