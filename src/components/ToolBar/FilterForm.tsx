import { HolderOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, InputNumber, Radio, Space, Table, TimePicker } from "antd";
import React, { useEffect, useState } from "react";
import styles from './FilterForm.less';
import { DndContext, UniqueIdentifier, DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import moment from "moment";
import { RangeValue } from "rc-picker/lib/interface";

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
}

/**
 * 可拖动行
 * @param param0 
 * @returns 
 */
const Row = ({ children, ...props }: RowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key']
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes}>
            {
                React.Children.map(children, (child) => {
                    if ((child as React.ReactElement).key === 'sort') {
                        return React.cloneElement(child as React.ReactElement, {
                            children: (
                                <HolderOutlined
                                    ref={setActivatorNodeRef}
                                    style={{ touchAction: 'none', cursor: 'move' }}
                                    {...listeners}
                                />
                            ),
                        });
                    }
                    return child;
                })
            }
        </tr>
    );
}

/**
 * 筛选项
 */
export interface IFilterItem {
    /**
     * 标题
     */
    title: string;

    /**
     * dataIndex;
     */
    dataIndex?: string;

    /**
     * 筛选类型
     */
    type: FilterTypeEnum;

    /**
     * 筛选条件
     */
    condition?: FilterConditionEnum;

    /**
     * 筛选选定的值
     */
    values?: IOption[];

    /**
     * 筛选数据
     */
    datas?: IOption[];

    /**
     * 是否出现在筛选行内
     */
    isFilter?: boolean;
}

/**
 * 下拉选项
 */
export interface IOption {
    value?: string | number;
    label?: string;
}

/**
 * 筛选类型
 */
export enum FilterTypeEnum {
    /**
     * 选项型
     * 筛选的值要和项完全一至
     */
    general = 'general',

    /**
     * 选项型
     * 筛选的值只要包含项就可以
     */
    include = 'include',

    /**
     * 日期，时间类型
     * 两种类型
     * 1、condition=FilterConditionEnum.less 在过去的values[0]分钟内
     * 2、condition=FilterConditionEnum.between 在values[0], values[1]时间段内
     */
    date = 'date',

    /**
     * 时间类型
     * 时 分 秒
     */
    time = 'time',

    /**
     * 日期类型
     * 没有时分秒
     */
    day = 'day',

    /**
     * 数字类型
     * 按最小值和最大值过滤
     */
    number = 'number',

    /**
     * 文本类型
     */
    text = 'text',
}

/**
 * 筛选条件枚举
 */
export enum FilterConditionEnum {
    between = 'between',
    gt = 'gt',
    less = 'less',
}

/**
 * 工具栏筛选弹出框
 */
export interface IFilterForm {
    /**
     * 筛选项
     */
    filterItem: IFilterItem;

    /**
     * 下拉选项是否可以拖动
     * filterItem.type 是general（选项类型）时生效
     */
    isDragable?: boolean;

    /**
     * 筛选内容变更
     * @param filterItem 选择的筛选
     * @param datas 所有筛选项
     * @returns 
     */
    onChange: (filterItem: IFilterItem, datas: IOption[]) => void;
}

/**
 * 点击ToolBarFilter后显示的弹出框
 * @param props 
 * @returns 
 */
const FilterForm: React.FC<IFilterForm> = (props) => {
    const { filterItem, isDragable = true, onChange } = props;
    const { type, datas, values, condition } = filterItem;

    /**
     * 选项类型，筛选值
     */
    const [result, setResult] = useState<IOption[]>(datas ?? []);

    /**
     * 选项类型选择的value
     */
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>();

    /**
     * 筛选条件
     */
    const [filterCondition, setFilterCondition] = useState<FilterConditionEnum>();

    const [value1, setValue1] = useState<string | number>();
    const [value2, setValue2] = useState<string | number>();
    const [gtValue, setGtValue] = useState<string | number>();

    /**
     * 选项类型的colomns
     */
    const columns = [
        {
            title: '全选',
            key: 'key',
            render: (item: IOption) => {
                return <div>
                    {item.label}
                </div>
            }
        }
    ]

    /**
     * 选项类型允许拖动的columns
     */
    const dragabelColumns = [
        {
            title: '全选',
            key: 'key',
            render: (item: IOption) => {
                return <div>
                    {item.label}
                </div>
            }
        },
        {
            key: 'sort', width: '30px'
        }
    ]

    /**
     * 选项类型，搜索栏筛选
     * @param value 
     */
    const filter = (value: string) => {
        if (!value) {
            setResult(datas ?? []);
            return;
        }
        const _result = datas?.filter(item => {
            const itemValue = item.value as string;
            return itemValue.toLowerCase().includes(value.toLowerCase());
        }) ?? [];
        setResult(_result);
    }

    /**
     * 日期时间筛选范围变更
     */
    const rangePickerChange = (value: RangeValue<moment.Moment>) => {
        setFilterCondition(FilterConditionEnum.between);
        if (!value) {
            setValue1(undefined);
            setValue2(undefined);
            return;
        }

        if (value[0]) {
            setValue1(value[0].format('YYYY-MM-DD HH:mm:ss'));
        }
        if (value[1]) {
            setValue2(value[1].format('YYYY-MM-DD HH:mm:ss'));
        }
    }

    /**
     * 时间筛选范围变更
     */
    const timeRangePickerChange = (value: RangeValue<moment.Moment>) => {
        if (!value) {
            setValue1(undefined);
            setValue2(undefined);
            return;
        }

        if (value[0]) {
            setValue1(value[0].format('HH:mm:ss'));
        }
        if (value[1]) {
            setValue2(value[1].format('HH:mm:ss'));
        }
    }

    /**
     * 日期筛选变更
     */
    const dayPickerChange = (value: moment.Moment | null) => {
        if (value) {
            setValue1(value.format('YYYY-MM-DD'));
        } else {
            setValue1(undefined);
        }
    }

    /**
     * 点击更新按钮
     * 返回筛选的数据
     */
    const clickUpdate = () => {
        const item: IFilterItem = {
            title: filterItem.title,
            dataIndex: filterItem.dataIndex,
            type: type,
        }
        let _values: IOption[] | undefined = undefined;
        switch (type) {
            case FilterTypeEnum.general:
                // 返回选择的值
                _values = result.filter(option => selectedKeys?.includes(option.value ?? ''));
                break;
            case FilterTypeEnum.text:
                // 返回搜索的文字
                _values = [{ value: value1 }];
                break;
            case FilterTypeEnum.number:
                // 返回最小、最大值
                _values = [{ value: value1 }, { value: value2 }];
                break;
            case FilterTypeEnum.date:
                // FilterConditionEnum.between 返回时间段[value1, value2]
                // 其他返回 [gtValue]
                if (filterCondition == FilterConditionEnum.between) {
                    _values = [{ value: value1 }, { value: value2 }];
                } else {
                    _values = [{ value: gtValue }];
                }
                break;
            case FilterTypeEnum.time:
                // 返回HH:mm:ss时间段
                _values = [{ value: value1 }, { value: value2 }];
                break;
            case FilterTypeEnum.day:
                // 返回YYYY-MM-DD 
                _values = [{ value: value1 }];
                break;
            default:
                break;
        }
        item.values = _values;
        item.condition = filterCondition;
        onChange(item, result);
    }

    /**
     * 选项拖动结束 
     */
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setResult(prev => {
                const activeIndex = prev.findIndex(i => i.value === active.id);
                const overIndex = prev.findIndex(i => i.value === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    }

    /**
     * 筛选页面样式
     * @param type 
     * @returns 
     */
    const getStyle = (type: FilterTypeEnum) => {
        if (type === FilterTypeEnum.date) {
            return styles.pageDate;
        }

        if (type === FilterTypeEnum.time) {
            return styles.pageTime;
        }

        if (type === FilterTypeEnum.day) {
            return styles.pageDay;
        }

        return styles.page;
    }

    /**
     * 选项类型，选定变更后更新选择的key
     */
    useEffect(() => {
        if (type === FilterTypeEnum.general || type === FilterTypeEnum.include) {
            const keys = values?.map(item => item.value as React.Key)
            setSelectedKeys(keys ?? []);
            return;
        }

        if (type === FilterTypeEnum.date) {
            if (condition === FilterConditionEnum.less &&
                values &&
                values.length > 0) {
                setGtValue(values[0].value);
                setValue1(undefined);
                setValue2(undefined);
                return;
            }
        }

        if (values) {
            if (values.length > 0) {
                setValue1(values[0].value as string | number | undefined);
            }
            if (values.length > 1) {
                setValue2(values[1].value as string | number | undefined);
            }
        }

    }, [values]);

    useEffect(() => {
        setFilterCondition(condition);
    }, [condition])

    return (
        <div className={getStyle(type)}>
            {
                // 选择器
                (type === FilterTypeEnum.general || type === FilterTypeEnum.include) &&
                <>
                    {/* 搜索框 */}
                    <Input placeholder='搜索' suffix={<SearchOutlined />} allowClear
                        onChange={event => filter(event.currentTarget.value)}
                    />
                    {/* 选项列表 */}
                    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                        <SortableContext items={result.map(item => item.value as UniqueIdentifier)}
                            strategy={verticalListSortingStrategy}
                        >
                            <Table className={styles.table} dataSource={result} size='small' pagination={false} rowKey={'value'} scroll={{ y: 300 }}
                                components={{ body: { row: Row } }}
                                columns={isDragable ? dragabelColumns : columns}
                                rowSelection={{
                                    type: 'checkbox',
                                    selectedRowKeys: selectedKeys,
                                    onChange: (selectedRowKeys) => {
                                        setSelectedKeys(selectedRowKeys);
                                    }
                                }}
                            />
                        </SortableContext>
                    </DndContext>
                </>
            }
            {
                // 文本
                type === FilterTypeEnum.text &&
                <Input placeholder='搜索' suffix={<SearchOutlined style={{ color: '$9e9e99e' }} />} allowClear
                    value={value1}
                    onChange={event => setValue1(event.target.value)}
                />
            }
            {
                // 日期时间筛选
                type == FilterTypeEnum.date &&
                <Radio.Group value={filterCondition}
                    onChange={e => setFilterCondition(e.target.value)}
                >
                    <Space direction='vertical'>
                        <Radio value={FilterConditionEnum.less}>
                            <div className={styles.dateRange}>
                                <span>在过去的</span>
                                <InputNumber className={styles.input}
                                    min={1}
                                    value={gtValue}
                                    onChange={value => { setGtValue(value as string | number | undefined); }}
                                />
                                <span>分, 之内</span>
                            </div>
                        </Radio>
                        <Radio value={FilterConditionEnum.between}>
                            <span className={styles.dateRange}>
                                在
                                <DatePicker.RangePicker className={styles.inputRange}
                                    showTime
                                    format='YYYY-MM-DD HH:mm:ss'
                                    value={[
                                        (value1 ? moment(value1) : null),
                                        (value2 ? moment(value2) : null)
                                    ]}
                                    onChange={rangePickerChange}
                                />
                                之间
                            </span>
                        </Radio>
                    </Space>
                </Radio.Group>
            }
            {
                // 时分秒
                type === FilterTypeEnum.time &&
                <div className={styles.timeRange}>
                    <span className={styles.dateRange}>在</span>
                    <TimePicker.RangePicker className={styles.input}
                        format='HH:mm:ss'
                        value={[
                            (value1 ? moment(value1, 'HH:mm:ss') : null),
                            (value2 ? moment(value2, 'HH:mm:ss') : null)
                        ]}
                        onChange={timeRangePickerChange}
                    />
                    <span className={styles.dateRange}>之间</span>
                </div>
            }
            {
                // 日期
                type === FilterTypeEnum.day &&
                <div className={styles.timeRange}>
                    <span className={styles.dateRange}>日期:</span>
                    <DatePicker className={styles.input}
                        format='YYYY-MM-DD'
                        value={value1 ? moment(value1) : null}
                        onChange={dayPickerChange}
                    />
                </div>
            }
            {
                // 数字
                type === FilterTypeEnum.number &&
                <>
                    <div className={styles.numberInput}>
                        最小值
                        <InputNumber style={{ width: '100%' }}
                            value={value1}
                            onChange={value => setValue1(value ?? undefined)}
                        />
                    </div>
                    <div className={styles.numberInput}>
                        最大值
                        <InputNumber style={{ width: '100%' }}
                            value={value2}
                            onChange={value => setValue2(value ?? undefined)}
                        />
                    </div>
                </>
            }
            {/* 更新按钮 */}
            <div className={styles.update}>
                <Button type='primary'
                    onClick={clickUpdate}
                >
                    更新
                </Button>
            </div>
        </div>
    );
}

export default FilterForm;