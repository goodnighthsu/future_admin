import { useCallback, useState } from 'react';
import Setting from '../../config/Setting';

enum ExchangeType {
    czce = 'CZCE', // 郑商所
    cffex = 'CFFEX', // 中金
    dce = 'DCE', // 大商所
    gfex = 'GFEX', // 广期所
    ine = 'INE', // 能源
    shfe = 'SHFE', // 上期
}

/**
 *  合约
 */
export interface InstrumentModel {
    ///交易所代码
    exchangeID: string;
    ///合约名称
    instrumentName: string;
    ///产品类型
    productClass: string;
    ///交割年份
    deliveryYear: number;
    ///交割月
    deliveryMonth: number;
    ///市价单最大下单量
    maxMarketOrderVolume: number;
    ///市价单最小下单量
    minMarketOrderVolume: number;
    ///限价单最大下单量
    maxLimitOrderVolume: number;
    ///限价单最小下单量
    minLimitOrderVolume: number;
    ///合约数量乘数
    volumeMultiple: number;
    ///最小变动价位
    priceTick: number;
    ///创建日
    createDate: string;
    ///上市日
    openDate: string;
    ///到期日
    expireDate: string;
    ///开始交割日
    startDelivDate: string;
    ///结束交割日
    endDelivDate: string;
    ///合约生命周期状态
    instLifePhase: string;
    ///当前是否交易
    isTrading: number;
    ///持仓类型
    positionType: string;
    ///持仓日期类型
    positionDateType: string;
    ///多头保证金率
    longMarginRatio: number;
    ///空头保证金率
    shortMarginRatio: number;
    ///是否使用大额单边保证金算法
    maxMarginSideAlgorithm: string;
    ///执行价
    strikePrice: number;
    ///期权类型
    optionsType: string;
    ///合约基础商品乘数
    underlyingMultiple: number;
    ///组合类型
    combinationType: string;
    ///合约代码
    instrumentID: string;
    ///合约在交易所的代码
    exchangeInstID: string;
    ///产品代码
    productID: string;
    ///基础商品代码
    underlyingInstrID: string;

    isSubscribe: boolean;
}

/**
 * SysUserList 账号列表页state
 */
export default () => {
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(Setting.defaultPageSize);
    const [total, setTotal] = useState<number>(0);

    const updatePaging = useCallback((_page: number, _pageSize: number) => {
        setPage(_page);
        setPageSize(_pageSize);
    }, []);

    return {
        page,
        pageSize,
        updatePaging,
        total,
    };
};
