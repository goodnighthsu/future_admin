import Setting from '../../config/Setting';
import { useCallback, useState } from 'react';

/**
 * SysUserList 账号列表页state
 */
export default () => {
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(Setting.defaultPageSize);

    const updatePaging = useCallback((page: number, pageSize: number) => {
        setPage(page);
        setPageSize(pageSize);
    }, [])

    return {
        page, 
        pageSize,
        updatePaging,
    }
};