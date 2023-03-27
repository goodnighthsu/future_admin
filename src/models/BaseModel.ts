export enum StateEnum {
    none = 0,
    disable = -1,
    enable = 1, 
}

export interface BaseModel {
    key?: number;
    updateTime?: Date;
    createTime?: Date;
}