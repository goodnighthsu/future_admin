import { BaseModel, StateEnum } from "./BaseModel";

/**
 * 系统角色
 */
export interface SysRoleModel extends BaseModel {
    id?: number;
    title?: string ;
    detail?: string;
    state?: StateEnum;
}