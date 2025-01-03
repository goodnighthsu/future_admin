import {
    getIndexByActionTime,
    getTimeByInstrument,
    IChartData,
    InstrumentModel,
    IOrderBook,
    MarketData,
} from '@/models/models/InstrumentModel';
import { TradingModel } from '@/models/models/TradingModel';
import request, { CreateByResponse, IPagingResponse, IRequestParam, IResponse } from '@/utils/request';
import Setting from '../../../config/Setting';

export const requestFuture = {
    // MARK: - 获取交易日合约分页列表 
    /**
     * 获取合约列表
     * @param param 请求参数
     * @returns 合约分页列表
     */
    instrumentList: async (
        param: IRequestParam
    ): Promise<IPagingResponse<InstrumentModel> | undefined> => {
        const response: IResponse<InstrumentModel[]> | undefined = await request(
            `${Setting.ctp}/market/instruments`,
            {
                method: 'get',
                params: param,
            },
        );

        if (!response) {
            return response;
        }

        return {
            code: response.code,
            message: response.message,
            data: {
                records: response.data,
                total: response.total ?? 0
            }
        };
    },

    // MARK: - 获取交易日合约列表 
    /**
     * 获取交易日的合约列表
     * @param tradingDay 交易日
     */
    instruments: async (tradingDay?: string) => {
        const response: IResponse<string[]> | undefined = await request(
            `${Setting.ctp}/market/instruments/all`,
            {
                method: 'get',
                params: {
                    tradingDay: tradingDay,
                },
            },
        );

        return response?.data?.sort();
    },

    // MARK: - 订阅期货合约
    /**
     * 订阅期货合约
     *
     * @returns
     */
    subscribe: async (insturments: string[]) => {
        const response: IResponse<string[]> | undefined = await request(`${Setting.ctp}/trade/subscribe`, {
            method: 'put',
            data: insturments,
        });

        return response?.data;
    },

    // MARK: - 取消订阅
    /**
     * 取消订阅
     */
    unsubscribe: async (insturments: string[]) => {
        const response: IResponse<string[]> | undefined = await request(
            `${Setting.ctp}/instrument/unsubscribe`,
            {
                method: 'put',
                data: insturments,
            },
        );

        return response?.data;
    },

    // MARK: - 获取合约交易日市场信息
    /**
     * 获取合约交易日市场信息
     * @param instrument 合约
     * @param interval tick 间隔
     * @param tradingDay 交易日
     * @param all 全部chart数据
     * @param abort AbortController
     * @returns 
     */
    marketList: async (
        instrument: InstrumentModel,
        interval: number,
        tradingDay?: string,
        all?: IChartData,
        abort?: AbortController,
    ) => {
        // 构建chart数据
        const _times = getTimeByInstrument(instrument.instrumentID, interval);
        if (!_times) {
            return;
        }
        //
        const response: IResponse<any> | undefined = await request(`${Setting.ctp}/market/query`, {
            method: 'get',
            params: {
                instrument: instrument.instrumentID,
                tradingDay: tradingDay,
                index: all?.index ?? 0,
            },
            signal: abort?.signal,
        });

        if (!response?.data) {
            return undefined;
        }

        const chartData: IChartData = all ??  {
            times: _times,
            prices: new Array(_times.length),
            tickVolumes: new Array(_times.length),
            volumes: new Array(_times.length),
            openInterests: new Array(_times.length),
            funds: new Array(_times.length),
            orderBooks: new Array(_times.length),
        };
        chartData.index = (all?.index ?? 0) + (response?.data?.length ?? 0);
        const datas: string[] = response?.data;
        const result: MarketData = datas.map((item) => item.split(','));
        let lastIndex = chartData.lastIndex ?? 0;
        let lastPrice = chartData.prices ? chartData.prices[lastIndex] : 0;
        let lastVolume = chartData.volumes ? chartData.volumes[lastIndex] : 0;
        let lastOpenInterest = chartData.openInterests ? chartData.openInterests[lastIndex] : 0;
        let lastFund = chartData.funds ? chartData.funds[lastIndex] : 0;
   
        let lastOrderBook = chartData.orderBooks ? chartData.orderBooks[lastIndex] : {};
        // 格式化数据填充到chartData
        result.map((item) => {
            const actionTime = item[43];
            let _index = getIndexByActionTime(instrument.instrumentID, actionTime, interval);
            if (_index === undefined) {
                return;
            }
            
            // 返回数据没有区分0 250 500 750 毫秒，
            // 在tick 的interval是 250 或 500, index有数据时就放到下个index
            if ((chartData.prices ?? [])[_index] !== undefined) {
                if (interval === 500 || interval === 250) {
                    _index++;
                }
            }

            const price = Number(item[6]);
            const volume = Number(item[13]);
            const tickVolume = Number(volume) - lastVolume;
            // 持仓量
            const openInterest = Number(item[15]);
            // 沉淀资金 持仓量*最新价*合约手数*保证金比例
            // instrumentDetail?.volumeMultiple * instrumentDetail?.longMarginRatio
            const fund = openInterest * price * instrument.volumeMultiple * instrument.longMarginRatio;
            const orderBooks: IOrderBook = {
                bidPrice1: Number(item[23]),
                bidVolume1: Number(item[24]),
                bidPrice2: Number(item[27]),
                bidVolume2: Number(item[28]),
                bidPrice3: Number(item[31]),
                bidVolume3: Number(item[32]),
                bidPrice4: Number(item[35]),
                bidVolume4: Number(item[36]),
                bidPrice5: Number(item[39]),
                bidVolume5: Number(item[40]),
                askPrice1: Number(item[25]),
                askVolume1: Number(item[26]),
                askPrice2: Number(item[29]),
                askVolume2: Number(item[30]),
                askPrice3: Number(item[33]),
                askVolume3: Number(item[34]),
                askPrice4: Number(item[37]),
                askVolume4: Number(item[38]),
                askPrice5: Number(item[41]),
                askVolume5: Number(item[42]),
            };
            // 成交价
            (chartData.prices ?? [])[_index] = price;
            // 成交量
            (chartData.tickVolumes ?? [])[_index] = tickVolume;
            (chartData.volumes ?? [])[_index] = volume;
            // 持仓量
            (chartData.openInterests ?? [])[_index] = openInterest;
            // 沉淀资金
            (chartData.funds ?? [])[_index] = fund;
            // 5档盘口 
            (chartData.orderBooks ?? [])[_index] = orderBooks;

            // 使用上一成交价格填充空白数据
            if (_index - lastIndex > 1) {
                if (lastIndex === 0) {
                    chartData.prices?.fill(price, lastIndex, _index);
                    chartData.volumes?.fill(volume, lastIndex, _index);
                    chartData.tickVolumes?.fill(0, lastIndex, _index);
                    chartData.openInterests?.fill(openInterest, lastIndex, _index);
                    chartData.funds?.fill(fund, lastIndex, _index);
                    chartData.orderBooks?.fill(orderBooks, lastIndex, _index);
                }else {
                    chartData.prices?.fill(lastPrice, lastIndex+1, _index);
                    chartData.volumes?.fill(lastVolume, lastIndex+1, _index);
                    chartData.tickVolumes?.fill(0, lastIndex+1, _index);
                    chartData.openInterests?.fill(lastOpenInterest, lastIndex+1, _index);
                    chartData.funds?.fill(lastFund, lastIndex+1, _index);
                    chartData.orderBooks?.fill(lastOrderBook, lastIndex+1, _index);
                }
            }

            lastIndex = _index;
            lastVolume = volume;
            lastPrice = price;
            lastOpenInterest = openInterest;
            lastFund = fund;
            lastOrderBook = orderBooks;
        });
        chartData.lastIndex = lastIndex;
        return chartData;
    },

    // MARKS: - 获取合约交易日市场信息
    /**
     * 获取合约详细信息
     */
    instrumentInfo: async (instrumentId: string, abort?: AbortController) => {
        const response: IResponse<InstrumentModel> | undefined = await request(`${Setting.ctp}/market/instrument/info`,
            {
                method: 'get',
                params: {
                    instrument: instrumentId
                },
                abortController: abort
            },
        );

        return response?.data;
    },

    /**
     * k线数据
     * @param instrument 合约
     * @param interval 时间间隔
     * @param tradingDay 交易日
     * @returns 
     */
    period: async (instrument: string, interval: number, tradingDay: string) => {
        const response: IResponse<TradingModel[]> | undefined = await request(`${Setting.ctp}/market/instrument/period`,
            {
                method: 'get',
                params: {
                    instrument: instrument,
                    tradingDay: tradingDay,
                    interval: interval,
                },
                timeout: 60000,
            }
        );

        return response?.data;
    },
    
    /**
     * 实时行情
     */
    quote: async (errorHandler?: (error: any) => void) => {
        const response: IResponse<TradingModel[]> | undefined = await request(
            `/ctpslave/market/instrument/quotes`,
            {
                method: 'get',
                errorHandler: errorHandler,
            }
        );

        return CreateByResponse(TradingModel, response);
    }
};
