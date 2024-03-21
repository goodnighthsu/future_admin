import { PageStateEnum } from "@/models/AppState"
import ToolBar from "../ToolBar/ToolBar"
import styles from "./FilterList.less"
import { useModel } from "@umijs/max";
import { IToolBarState } from "@/models/models/ToolBarState";
import { IPaginationState } from "@/models/models/PaginationState";
import { Key, SortOrder, SorterResult } from "antd/lib/table/interface";
import { IColumnOptional } from "../ToolBar/ToolBarFilter";
import { Pagination, Table } from "antd";
import { useEffect, useLayoutEffect, useRef, useState, useImperativeHandle, forwardRef, ForwardedRef } from "react";
import { IPagingResponse, IRequestParam, createRequestParam } from "@/utils/request";

export interface IFilterList<RecordType> {
    /**
     * 类配置
     */
    columns: IColumnOptional<any>[];

    /**
     * 页面
     */
    pageState: PageStateEnum;

    /**
     * 请求
     * @param filter 
     * @param page 
     * @param pageSize 
     * @param sorter 
     * @param order 
     * @returns 
     */
    request: (
        param: IRequestParam
    ) => Promise<IPagingResponse<RecordType> | undefined>;
}

export interface IFilterListCallback {
    load: () => Promise<void>;
}

const FilterList = forwardRef(<RecordType,>(props: IFilterList<RecordType>, ref: ForwardedRef<IFilterListCallback>) => {
    // props
    const { columns, pageState, request } = props;

    // useModel
    const {
        page,
        updatePagination,
        pageSize,
        columnSelecteds,
        filters,
        sort,
        updateSort,
        order,
        updateOrder,
    } = useModel(pageState) as IToolBarState & IPaginationState;

    const [datas, setDatas] = useState<RecordType[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [talbleContentHeight, setTableContentHeight] = useState<number>(0);
    const tableWrapRef = useRef<HTMLDivElement | null>(null);

    // methods
    const load = async () => {
        setLoading(true);

        let model;
        switch (pageState) {
            case PageStateEnum.sysUserList:
                model = 'sysUser';
                break;
            case PageStateEnum.instrument:
                model = 'instrument';
                break;
        }
        if (!model) {
            return;
        }

        const param = createRequestParam(model, filters, page, pageSize, sort, order);
        const response = await request(param);
        setLoading(false);
        if (!response) {
            return;
        }
        setDatas(response.data?.records ?? []);
        setTotal(response.data?.total ?? 0);
    }

    const filterChange = () => {
        load();
    }

    const tableChange = (_pagination: any, _filter: any, sorter: SorterResult<any> | SorterResult<SortOrder>[]) => {
        const _sorter = sorter as SorterResult<any>;
        updateSort(_sorter.field as Key);
        updateOrder(_sorter.order);
    }

    /**
     * page chage
     * 
     * @param page 
     * @param pageSize 
     */
    const changePage = (page: number, pageSize: number) => {
        updatePagination(page, pageSize);
    }

    const resize = () => {
        const viewHeight = document.body.getBoundingClientRect().height;
        const tableTop = tableWrapRef.current?.getBoundingClientRect().top ?? 0;
        // table的可滚动高度 = 视窗高度 - talbe上边 - 表格头部 - 表格padding - border - 底部分页
        setTableContentHeight(viewHeight - tableTop - 39 - 16 - 2 - 32);
    }

    //
    useImperativeHandle(ref, () => {
        return {
            load
        }
    });

    // effects
    useEffect(() => {
        // resize
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    useEffect(() => {
        load();
    }, [page, pageSize, sort, order]);

    useLayoutEffect(() => {
        resize();
    });

    // render
    return (
        <>
            <ToolBar columns={columns} pageState={pageState} onFilterChange={filterChange} />
            <div className={styles.tableWrapper} ref={tableWrapRef}>
                <Table className={styles.table} size="small"
                    dataSource={datas}
                    columns={columnSelecteds}
                    rowKey={'id'}
                    bordered
                    pagination={false}
                    scroll={{ y: talbleContentHeight, x: 'max-content' }}
                    loading={{ delay: 300, spinning: loading }}
                    onChange={tableChange}
                />
            </div>
            <div className={styles.page_footer}>
                <Pagination current={page} pageSize={pageSize} total={total} onChange={changePage} />
            </div>
        </>
    )
});

export default FilterList;