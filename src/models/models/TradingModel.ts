/**
 * 行情
 */
export class TradingModel {
    /**
     * 接受时间
     */
    recvTime?: string;

    /**
     * 交易发生时间
     * tradingDay + updateTime + update-Millisec
     */
    tradingActionTime?: string;

    /**
     * 发生时间
     * updateTime + update-Millisec
     */
    actionTime?: string

    /**
     * 合约代码
     */
    instrumentId?: string;

    /**
     * 交易日期
     */
    tradingDay?: string;

    /**
     * 业务日期
     * https://blog.csdn.net/pjjing/article/details/100532276
     * TradingDay用来表示交易日，ActionDay表示当前实际日期。期货交易分为日夜盘，这两个日期在日盘的时候是一致的，但在夜盘就有了区别，是因为当天夜盘是属于第二天这个交易日。例如20190830（周五）晚上21点开始交易，交易日TradingDay是20190902（周一），但实际日期ActionDay是20190830。
     * 这是设计的初衷，但事实上夜盘各交易所这两个日期很混乱
     * 大商所夜盘两个日期都是tradingday，郑商所日夜盘都是当天日期
     */
    actionDay?: string;

    /**
     * 最后修改时间
     */
    updateTime?: string;

    /**
     * 最后修改毫秒
     */
    updateMilliSec?: number;

    /**
     * 交易所代码
     */
    exchangeId?: string;

    /**
     * 合约在交易所的代码
     */
    exchangeInstId?: string;

    private _lastPrice?: number;
    /**
     * 最新价
     * @description 保留两位小数
     */
    get lastPrice(): number {
        return Number(this._lastPrice?.toFixed(2));
    }

    set lastPrice(value: number) {
        this._lastPrice = value;
    }

    /**
     * 昨结算价
     */
    preSettlementPrice?: number;

    /**
     * 昨收盘价
     */
    preClosePrice?: number;

    /**
     * 昨持仓量
     */
    preOpenInterest?: number;

    _openPrice?: number;
    /**
     * 今开盘价
     * @description 保留两位小数
     */
    get openPrice(): number {
        return Number(this._openPrice?.toFixed(2));
    }

    set openPrice(value: number) {
        this._openPrice = value;
    }


    _highestPrice?: number;
    /**
     * 最高价
     * @description 保留两位小数
     */
    get highestPrice(): number {
        return Number(this._highestPrice?.toFixed(2));
    }

    set highestPrice(value: number) {
        this._highestPrice = value;
    }

     _lowestPrice?: number;
    /**
     * 最低价
     * @description 保留两位小数
     */
    get lowestPrice(): number {
        return Number(this._lowestPrice?.toFixed(2));
    }

    set lowestPrice(value: number) {
        this._lowestPrice = value;
    }


    /**
     * 成交量
     */
    volume?: number;
    tickVolume?: number;

    /**
     * 成交额
     */
    turnover?: number;

    /**
     * 持仓量
     */
    openInterest?: number;

    /**
     * 今收盘价
     */
    closePrice?: number;

    /**
     * 本次结算价
     */
    settlementPrice?: number;

    /**
     * 涨停板价
     */
    upperLimitPrice?: number;

    /**
     * 跌停板价
     */
    lowerLimitPrice?: number;

    /**
     * 昨虚实度
     */
    preDelta?: number;

    /**
     * 今虚实度
     */
    currDelta?: number;

    /**
     * 当日均价
     */
    averagePrice?: number;

    /**
     * 前一tick power
     */
    preTickPower?: number;

    /**
     * 前一tick成交量
     */
    preTickVolume?: number;


    /**
     * 前一tick成交均价
     */
    preTickAvgPrice?: number;

    /**
     * 申买12345 申卖12345
     */
    _bidPrice1?: number;
    get bidPrice1(): number {
        return Number(this._bidPrice1?.toFixed(2));
    }

    set bidPrice1(value: number) {
        this._bidPrice1 = value;
    }
    bidVolume1?: number;
    askPrice1?: number;
    askVolume1?: number;

    bidPrice2?: number;
    bidVolume2?: number;
    askPrice2?: number;
    askVolume2?: number;

    bidPrice3?: number;
    bidVolume3?: number;
    askPrice3?: number;
    askVolume3?: number;

    bidPrice4?: number;
    bidVolume4?: number;
    askPrice4?: number;
    askVolume4?: number;

    bidPrice5?: number;
    bidVolume5?: number;
    askPrice5?: number;
    askVolume5?: number;
}