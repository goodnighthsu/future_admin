import React, {useEffect, useState} from 'react';
import ToolBarFilter, {IColumnOptional} from './ToolBarFilter';
import styles from './ToolBar.less';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Popover } from 'antd';
import SelectForm, { ESelectOption } from './SelectForm';


/**
 * 筛选工具栏
 * @param param0 
 */
const ToolBar: React.FC<IToolBar> = (props) => {
    const {columns} = props;

    // MARK: - state
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    return (
        <div className={styles.toolBar}>
            {
                columns.filter(item => item.isFilter ?? true)
                .slice(0, Math.min(3, columns.length))
                .map((item) => {
                    return (
                        <ToolBarFilter title={item.title} options={item.selectOptions} />
                    )
                })
            }        
            <Input className={styles.toolBar_search} allowClear prefix={<SearchOutlined />} maxLength={40} value={searchValue}  
                onChange={event => setSearchValue(event.currentTarget.value)}
            />
            {
                // 更多筛选     
                <Popover placement='bottom' trigger='click' open={isMoreOpen}
                    onOpenChange={value => setIsMoreOpen(value)}
                    content={
                        // 筛选弹出框
                        <SelectForm type={ESelectOption.general} 
                            options={columns.map(item => {return {value: item.title, label: item.title}}
                            )}
                        />
                    }
                >
                <div className={styles.toolBar_item}>
                    <div className={styles.moreButton}>
                        <div className={styles.moreButton_title}>更多</div>
                        <DownOutlined />
                    </div>
                </div>

                </Popover>
            }
        </div>
    )
}

export default ToolBar;

export interface IToolBar {
    columns: IColumnOptional<IToolBarSelect>[],
    // fixeds: IColumnOptional<IToolBarSelect>[],
    // options: IColumnOptional<IToolBarSelect>[],
}