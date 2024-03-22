import { IFilterItem } from "@/components/ToolBar/FilterForm";
import { IColumnOptional } from "@/components/ToolBar/ToolBarFilter";
import { Key, SortOrder } from "antd/lib/table/interface";
import { useCallback, useRef, useState } from "react";

/**
 * 页面筛选状态
 */
export interface IToolBarState {
    /**
     * 选择的列组
     * 通过按钮 "列" 选择的列选项数组
     */
    columnSelecteds: IColumnOptional<any>[];
    columnsRef: React.MutableRefObject<IColumnOptional<any>[] | undefined>;

    /**
     * 更新选择的列
     * @param datas  
     * @returns 
     */
    updateColumnSelecteds: (datas: IColumnOptional<any>[]) => void;
    
    /**
     * 筛选项组
     */
    filters: IFilterItem[] | undefined;

    /**
     * 更新筛选项
     * @param datas 
     * @returns 
     */
    updateFilters: (datas: IFilterItem[]) => void;

    /**
     * 排序字段
     */
    sort: Key | undefined;
    updateSort: (data?: Key) => void;

    /**
     * 排序
     */
    order: SortOrder | undefined;
    updateOrder: (data?: SortOrder) => void;
}

/**
 * 工具栏状态
 * @returns 
 */
const ToolBarState = (defautSorter?: Key, defaultOrder?: SortOrder,
        defaultSelecteds?: IColumnOptional<any>[]
    ): IToolBarState => {
    const [columnSelecteds, setColumnSelecteds] = useState<IColumnOptional<any>[]>(defaultSelecteds ?? []);
    const updateColumnSelecteds = useCallback((datas: IColumnOptional<any>[]) => {
        setColumnSelecteds(datas);
        columnsRef.current = datas;
    }, [columnSelecteds]);

    const columnsRef = useRef<IColumnOptional<any>[]>(defaultSelecteds ?? []);

    const [filters, setFilters] = useState<IFilterItem[]>();
    const updateFilters = useCallback((datas: IFilterItem[]) => {
        setFilters(datas);
    }, [filters]);

    const [sort, setSort] = useState<Key | undefined>(defautSorter);
    const updateSort = useCallback((data: Key | undefined) => {
        setSort(data);
    }, [sort]);

    const [order, setOrder] = useState<SortOrder | undefined>(defaultOrder);
    const updateOrder = useCallback((data: SortOrder | undefined) => {
        setOrder(data);
    }, [order]);
    
    return {
        columnSelecteds,
        updateColumnSelecteds,
        columnsRef,
        filters,
        updateFilters,
        sort,
        updateSort,
        order,
        updateOrder,
    } 
}

export default ToolBarState;