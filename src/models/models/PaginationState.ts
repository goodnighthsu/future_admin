import Setting from "../../../config/Setting";
import { useCallback, useState } from "react";

export interface IPaginationState {
    /**
     * 当前页
     */
    page: number;
    
    /**
     * 分页大小
     */
    pageSize: number;
    
    /**
     * 全部页
     */
    total: number;
    
    /**
     * 更新当前页和分页大小
     * @param page 当前页 
     * @param pageSize 分页大小
     * @returns void
     */
    updatePagination: (page: number, pageSize: number) => void;
}

/**
 * 分页状态
 * @returns 
 */
const PaginationState = (): IPaginationState => {    
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(Setting.defaultPageSize);
    const [total] = useState<number>(0);

    const updatePagination = useCallback((_page: number, _pageSize: number) => {
        setPage(_page);
        setPageSize(_pageSize);
    }, []);

    return {
        page,
        pageSize,
        updatePagination,
        total,
    };
}

export default PaginationState;