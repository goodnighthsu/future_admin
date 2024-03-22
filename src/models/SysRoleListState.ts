import ToolBarState from './models/ToolBarState';
import PaginationState from './models/PaginationState';
import { PageStateEnum } from "./AppState";
import { localUserState } from "@/utils/utils";

/**
 * SysRoleList 角色列表页state
 */
export default () => {
    return {
        ...ToolBarState('id', 'descend', localUserState.get(PageStateEnum.sysRoleList)),
        ...PaginationState(),
    };
};