import Setting from '../../config/Setting';
import { useCallback, useState } from 'react';

enum ExchangeType {
    czce = 'CZCE',      // 郑商所 
    cffex = 'CFFEX',    // 中金
    dce = 'DCE',        // 大商所
    gfex = 'GFEX',      // 广期所
    ine = 'INE',        // 能源
    shfe = 'SHFE',      // 上期
}

/**
 * SysUserList 账号列表页state
 */
 export default () => {
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(Setting.defaultPageSize);
    const [total, setTotal] = useState<number>(0);

    const updatePaging = useCallback((page: number, pageSize: number) => {
        setPage(page);
        setPageSize(pageSize);
    }, [])

    return {
        page, 
        pageSize,
        updatePaging,
        total,
    }
};