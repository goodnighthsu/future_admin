import React, { useEffect, useState } from 'react';
import { Button, Popover } from 'antd';
import { CloseCircleFilled, DownOutlined } from '@ant-design/icons';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { ColumnType } from 'antd/lib/table';
import styles from './ToolBarFilter.less';
import FilterForm, { FilterConditionEnum, FilterTypeEnum, IFilterItem, IOption } from './FilterForm';

/**
 * ToolBar筛选按钮
 */
export interface IToolBarFilter {
    /**
     * className
     */
    className?: string;

    buttonStyle?: string;

    placement?: TooltipPlacement;

    /**
     * 下拉选项是否可以拖动
     * filterItem.type 是general（选项类型）时生效
     */
    isDragable?: boolean;

    /**
     * 筛选
     */
    filterItem: IFilterItem;

    /**
     * 筛选改变
     * @param filterItem 筛选项
     * @returns 
     */
    onChange: (changeItem: IFilterItem) => void;

    /**
     * 删除
     * 可选，没有不显示删除按钮
     * @returns 
     */
    onDelete?: () => void;


    /**
     * 固定表头
     * 表头的文字不随者输入或勾选变更，也没有前面的tip
     */
    fixTitle?: boolean;
}

/**
 * 工具栏筛选按钮
 * @param props 下拉
 * @returns 
 */
const ToolBarFilter: React.FC<IToolBarFilter> = (props) => {
    // props
    const { className, placement = 'bottom', isDragable, filterItem, fixTitle = false,
        buttonStyle,
        onChange, onDelete } = props;

    // state
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filterTitle, setFilterTitle] = useState<string | undefined>();

    /**
     * 按钮显示的文字
     * 没有筛选内容显示默认(eg: 全部)
     * 否则，按筛选类型显示筛选内容
     * @param filter 
     * @returns 
     */
    const getFilterButtonTitle = (filter: IFilterItem) => {
        if (fixTitle) {
            return filter.title;
        }
        const { type, condition, values = [] } = filter;
        let title: string | undefined = undefined;
        switch (type) {
            case FilterTypeEnum.general:
                // 选择的项的值
                title = values.map(option => option.label).join(',');
                break;
            case FilterTypeEnum.text:
                // 输入的文字
                if (values.length > 0) {
                    title = values[0].value as string | undefined;
                }
                break;
            case FilterTypeEnum.number:
                if (values.length > 0 && values[0].value) {
                    title = '大于' + values[0].value;
                }
                if (values.length > 1 && values[1].value) {
                    if (title === undefined) {
                        title = '小于' + values[1].value;
                    } else {
                        title += ' 小于' + values[1].value;
                    }
                }
                break;
            case FilterTypeEnum.date:
                if (values.length > 0) {
                    if (condition === FilterConditionEnum.less && values[0].value) {
                        title = '在过去的' + values[0].value + '分钟';
                    }
                }
                if (values.length > 1
                    && values[0].value != undefined
                    && values[1].value != undefined

                ) {
                    title = values[0].value + '至' + values[1].value;
                }
                break;
            case FilterTypeEnum.time:
                if (values.length > 1
                    && values[0].value != undefined
                    && values[1].value != undefined
                ) {
                    title = values[0].value + '至' + values[1].value;
                }
                break;
            case FilterTypeEnum.day:
                if (values.length > 0) {
                    title = values[0].value as string | undefined;
                }
                break;
            default:
                break;
        }

        return (title === undefined || title === '') ? '全部' : title;
    }

    useEffect(() => {
        setFilterTitle(getFilterButtonTitle(filterItem));
    }, []);

    return (
        <div className={`${styles.page} ${className}`}>
            <Popover placement={placement} trigger='click' open={isOpen}
                onOpenChange={value => setIsOpen(value)}
                content={
                    // 筛选弹出框
                    <FilterForm filterItem={filterItem}
                        isDragable={isDragable}
                        onChange={item => {
                            onChange(item);
                            setFilterTitle(getFilterButtonTitle(item));
                            setIsOpen(false);
                        }}
                    />
                }
            >
                {/* 筛选栏按钮 */}
                <div className={styles.container}>
                    {
                        fixTitle &&
                        <div className={`${styles.filterButtonFix} ${buttonStyle}`}>
                            <div className={styles.filterButtonFixe_title}>{filterTitle}</div>
                            <DownOutlined style={{ fontSize: '10px' }} />
                        </div>
                    }
                    {
                        !fixTitle &&
                        <>
                            <span className={styles.tip}>{filterItem.title}:</span>
                            <div className={styles.filterButton}>
                                <div className={styles.filterButton_title}>{filterTitle}</div>
                                <DownOutlined style={{ fontSize: '10px' }} />
                            </div>
                        </>
                    }
                    {/* 删除按钮 */}
                    {
                        onDelete &&
                        <Button type='link' icon={<CloseCircleFilled style={{ color: '#c3c3c3' }} />}
                            onClick={onDelete} />
                    }
                </div>
            </Popover>
        </div>
    );
}

export default ToolBarFilter;

/**
 * 筛选条件枚举
 */
export enum ETSelectOptionCondition {
    between = 'between',
    gt = 'gt',
    less = 'less',
}

/**
 * 列选项扩展属性
 */
export interface IColumnOptional<RecordType> extends ColumnType<RecordType> {
    // /**
    //  * 标题
    //  */
    // title?: string;

    /**
     * 筛选类型
     */
    filterType?: FilterTypeEnum;

    /**
     * 是否显示在列表中
     */
    isShow?: boolean;

    /**
     * 是否允许筛选
     */
    isFilter?: boolean;

    /**
     * 筛选的数据
     */
    datas?: IOption[];
}