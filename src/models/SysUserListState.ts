import ToolBarState from './models/ToolBarState';
import PaginationState from './models/PaginationState';
import { PageStateEnum } from "./AppState";
import { localUserState } from "@/utils/utils";

/**
 * SysUserList 账号列表页state
 */
// let init = true;
export default () => {
    return {
        ...ToolBarState('id', 'descend', localUserState.get(PageStateEnum.sysUserList)),
        ...PaginationState(),
    };
};