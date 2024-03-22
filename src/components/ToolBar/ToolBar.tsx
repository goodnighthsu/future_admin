import React, { useEffect, useState } from 'react';
import ToolBarFilter, { IColumnOptional } from './ToolBarFilter';
import styles from './ToolBar.less';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { FilterTypeEnum, IFilterItem, IOption } from './FilterForm';
import { PageStateEnum } from '@/models/AppState';
import { useModel } from '@umijs/max';
import { IToolBarState } from '@/models/models/ToolBarState';
import { ColumnType } from 'antd/lib/table';
import _ from 'lodash';

export interface IToolBar<RecordType> {
    /**
     * 列配置
     */
    columns: IColumnOptional<RecordType>[],

    /**
     * 页面
     */
    pageState: PageStateEnum,

    /**
     * 筛选更新
     * @param filters 
     * @returns 
     */
    onFilterChange?: (filters: IFilterItem[]) => void,
}

/**
 * 工具栏
 */
const ToolBar: React.FC<IToolBar<any>> = (props) => {
    const { columns, pageState, onFilterChange } = props;

    // MARK: - state
    const { columnSelecteds, updateColumnSelecteds, columnsRef, filters = [], updateFilters, } = useModel(pageState) as IToolBarState;
    const [moreFilters, setMoreFilters] = useState<IFilterItem[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');

    /**
     *  初始筛选和列选择
     */
    useEffect(() => {
        if (!columns || columns.length === 0) {
            return;
        }
        // 列默认添加鼠标移入显示排序按钮，移除隐藏
        // Todo 这个函数内动updateColumnSelecteds 会造成多次render
        columns.forEach((item) => {
            item.onHeaderCell = (column) => {
                return {
                    onMouseEnter: () => {
                        const _columns = column as ColumnType<any>;
                        const selected = columnsRef.current?.find(item => item.dataIndex === _columns.dataIndex);
                        if (!selected) {
                            return;
                        }

                        selected.sorter = true;
                        updateColumnSelecteds([...columnsRef.current ?? []]);
                    },
                    onMouseLeave: () => {
                        const _columns = column as ColumnType<any>;
                        const selected = columnsRef.current?.find(item => item.dataIndex === _columns.dataIndex);
                        if (!selected) {
                            return;
                        }
                        selected.sorter = false;
                        updateColumnSelecteds([...columnsRef.current ?? []]);
                    },
                }
            }
        });
        
        if (!columnSelecteds || columnSelecteds.length === 0) {
            // 列选没有初始，并且有更新列选择（updateColumnSelecteds）
            // 默认显示每一列
            columns.forEach((item) => {
                item.isShow = true;
            });
            // setInnerColumns([...columns]);
            updateColumnSelecteds([...columns]);
        } else {
             // 列有初始，且是从本地localStorage中反序列化获取的
             // 会丢失columnSelecteds[0] onHeaderCell方法
             // 重新从columns中获取
            if (!columnSelecteds[0].onHeaderCell) {
                columnSelecteds.forEach((item) => {
                    const innerColumn = columns.find( a => a.title === item.title)!;
                    item.onHeaderCell = innerColumn.onHeaderCell;
                    item.render = innerColumn.render
                });
                // 排序过的
                updateColumnSelecteds([...columnSelecteds]);
            }
        }
        
        // 初始化筛选
        if (filters.length === 0 && updateFilters) {
            const _options: IFilterItem[] = columns.filter(item => item.isFilter ?? true)
                .map((item, index) => {
                    return {
                        title: `${item.title ?? '-'}`,
                        dataIndex: item.dataIndex as string,
                        type: item.filterType ?? FilterTypeEnum.general,
                        datas: item.datas,
                        isFilter: index < 3,
                    }
                });
            updateFilters(_options);
        }
    }, [columns]);

    /**
     * 筛选条件变化
     */
    useEffect(() => {
        // 更多选项
        const _more = filters.slice(Math.min(3, filters.length), filters.length);
        setMoreFilters(_more);
    }, [filters]);

    return (
        <div className={styles.toolBar}>
            <div>
                {
                    // 固定筛选按钮， 最多三个
                    filters.slice(0, Math.min(3, filters.length))
                        .map(item => {
                            return (
                                <ToolBarFilter className={styles.toolBar_filterFix}
                                    key={item.title}
                                    filterItem={item}
                                    onChange={item => {
                                        const filterItem = filters.find(option => option.title === item.title);
                                        if (filterItem) {
                                            filterItem.condition = item.condition;
                                            filterItem.values = item.values;
                                            updateFilters(filters)
                                        }
                                        if (onFilterChange) {
                                            onFilterChange(filters);
                                        }
                                    }}
                                />
                            )
                        })
                }
                <Input className={styles.toolBar_search} allowClear prefix={<SearchOutlined />} maxLength={40} value={searchValue}
                    onChange={event => setSearchValue(event.currentTarget.value)}
                />
                {
                    // 更多筛选按钮  
                    moreFilters.length > 0 &&
                    <ToolBarFilter className={styles.toolBar_filterMore}
                        key={'更多'}
                        buttonStyle={styles.fixButton}
                        isDragable={false}
                        fixTitle
                        filterItem={
                            {
                                title: '更多',
                                type: FilterTypeEnum.general,
                                values: moreFilters.filter(item => item.isFilter).map(item => { return { value: item.title, label: item.title }; }),
                                datas: moreFilters.map(item => { return { value: item.title, label: item.title }; })
                            }
                        }
                        onChange={item => {
                            const selectedValues = item.values?.map(item => item.value) ?? [];
                            // 更新“更多”里被选择的筛选按钮
                            moreFilters.forEach(option => {
                                option.isFilter = selectedValues.includes(option.title);
                                if (option.isFilter === false) {
                                    option.condition = undefined;
                                    option.values = undefined;
                                }
                            });
                            updateFilters(filters);
                            if (onFilterChange) {
                                onFilterChange(filters);
                            }
                        }}
                    />
                }
            </div>
            <div className={styles.toolBar_bottom}>
                {/* 列 */}
                {
                    columnSelecteds && updateColumnSelecteds &&
                    <ToolBarFilter className={styles.toolBar_bottom_column}
                        key={'列'}
                        buttonStyle={styles.fixButton}
                        placement='bottomLeft'
                        fixTitle
                        filterItem={
                            {
                                title: '列',
                                type: FilterTypeEnum.general,
                                values: columnSelecteds.filter(item => item.isShow)
                                    .map(item => {
                                        return { value: `${item.title}`, label: `${item.title}` };
                                    }),
                                datas: columnSelecteds.map(item => {
                                    return { value: `${item.title}`, label: `${item.title}` };
                                })
                            }
                        }
                        onChange={(item: IFilterItem, options: IOption[] = []) => {
                            // item.values 选择的项IOption[]，selectedValues选择项的标题 
                            // options 所有可选择的项
                            const selectedValues = item.values?.map(item => item.value) ?? [];
                            // 按所有可选择的项options 返回对应次序的_columns
                            const _columns = options.map(option => {
                                return columns.find(c => c.title === option.value)!;
                            });
                            
                            if (selectedValues.length === 0) {
                                // 列不选显示全部
                                _columns.forEach(c => c.isShow = true);
                            }else {
                                _columns.forEach( (c: IColumnOptional<any>) => {
                                    c.isShow = selectedValues.includes(c.title as string);
                                });
                            }
                            updateColumnSelecteds([..._columns]);
                        }}
                    />
                }
                {/* 可选筛选 */}
                {
                    moreFilters
                        .map(item => {
                            if (!item.isFilter) {
                                return;
                            }
                            return <ToolBarFilter key={item.title} filterItem={item}
                                onChange={changeItem => {
                                    // options筛选中找到对应的对象
                                    const filterItem = filters.find(option => option.title === changeItem.title);
                                    if (filterItem) {
                                        filterItem.condition = changeItem.condition;
                                        filterItem.values = changeItem.values;
                                        updateFilters(filters)
                                    }

                                    if (onFilterChange) {
                                        onFilterChange(filters);
                                    }
                                }}
                                onDelete={() => {
                                    // moreFilters筛选中找到对应的对象
                                    const filterItem = moreFilters.find(option => option.title === item.title);
                                    if (filterItem) {
                                        filterItem.isFilter = false;
                                        // 移除筛选值
                                        filterItem.condition = undefined;
                                        filterItem.values = undefined;
                                        updateFilters(filters)
                                    }

                                    if (onFilterChange) {
                                        onFilterChange(filters);
                                    }
                                }}
                            />;
                        })
                }
            </div>
        </div>
    )
}

export default ToolBar;