export enum StateEnum {
    none = 0,
    disable = -1,
    enable = 1, 
}
export 
enum ExchangeType {
    czce = 'CZCE', // 郑商所
    cffex = 'CFFEX', // 中金
    dce = 'DCE', // 大商所
    gfex = 'GFEX', // 广期所
    ine = 'INE', // 能源
    shfe = 'SHFE', // 上期
}

export interface BaseModel {
    key?: number;
    updateTime?: Date;
    createTime?: Date;
}