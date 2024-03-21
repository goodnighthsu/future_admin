import ToolBarState from './models/ToolBarState';
import PaginationState from './models/PaginationState';

enum ExchangeType {
    czce = 'CZCE', // 郑商所
    cffex = 'CFFEX', // 中金
    dce = 'DCE', // 大商所
    gfex = 'GFEX', // 广期所
    ine = 'INE', // 能源
    shfe = 'SHFE', // 上期
}

/**
 * Instrument list state 合约列表页state
 */
export default () => {
    return {
        ...ToolBarState(),
        ...PaginationState(),
    };
};
