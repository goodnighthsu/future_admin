import React, {useEffect, useState} from 'react';
import { Popover } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import styles from './ToolBarFilter.less';
import SelectForm from './SelectForm';

/**
 * 工具栏筛选按钮
 * @param props 下拉
 * @returns 
 */
const ToolBarFilter: React.FC<IToolBarFilter> = (props) => {
    const { title, options} = props;
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div className={styles.page}>
            <Popover placement='bottom' trigger='click' open={isOpen}
                onOpenChange={value => setIsOpen(value)}
                content={
                    // 筛选弹出框
                    <SelectForm type={ESelectOptionType.general} values={options} />
                }
            >
                <div className={styles.container}>
                    <span className={styles.tip}>{title}:</span>
                    <div className={styles.filterButton}>
                        <div className={styles.filterButton_title}>全部</div>
                        <DownOutlined />
                    </div>
                </div>
            </Popover>
        </div>
    );
}

export default ToolBarFilter;

/**
 * ToolBar筛选按钮
 */
export interface IToolBarFilter {
    title?: string,
    key: any;
    type: ESelectOptionType;
    condition?: ETSelectOptionCondition;
    options?: ISelectOption[],
}

/**
 * ToolBar下拉选项
 */
export interface ISelectOption {
    
    /**
     * 
     */
    title: string;

    key: any;

    type: ESelectOptionType;

    condition?: ETSelectOptionCondition;

    values?: string[] | number[];
}

/**
 * 下拉选项类型枚举
 */
export enum ESelectOptionType {
    /**
     * 筛选的值要和项完全一至
     */
    general = 'general',
    
    /**
     * 筛选的值只要包含项就可以
     */
    include = 'include',
    
    date = 'date',
    
    /**
     * 时 分 秒
     */
    time = 'time',
    
    /**
     * 没有时分秒
     */
    day = 'day',
    
    number = 'number',
    
    long = 'long',
    
    text = 'text',
}

/**
 * 筛选条件枚举
 */
export enum ETSelectOptionCondition {
    between  = 'between',
    gt = 'gt',
    less = 'less',
}

/**
 * 列选项扩展属性
 */
export interface IColumnOptional<RecordType> extends ColumnType<RecordType> {
    title?: string;
    /**
     * 下拉选项
     */
    selectOptions?: ISelectOption[];
    
    /**
     * 是否显示在列表中
     */
    isShow?: boolean;

    /**
     * 是否允许筛选
     */
    isFilter?: boolean;
}