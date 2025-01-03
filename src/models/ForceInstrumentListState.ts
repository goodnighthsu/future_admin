import ToolBarState from './models/ToolBarState';
import PaginationState from './models/PaginationState';
import { PageStateEnum } from "./AppState";
import { localUserState } from "@/utils/utils";

/**
 * ForceInstrumentListState 主力合约列表页state
 */
export default () => {
    return {
        ...ToolBarState(undefined, undefined, localUserState.get(PageStateEnum.forceInstrumentList)),
        ...PaginationState(),
    };
};