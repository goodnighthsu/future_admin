import ToolBarState from './models/ToolBarState';
import PaginationState from './models/PaginationState';

/**
 * Instrument list state 合约列表页state
 */
export default () => {
    return {
        ...ToolBarState(),
        ...PaginationState(),
    };
};
