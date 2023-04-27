import {
    getIndexByActionTime,
    IChartData,
    InstrumentModel,
    MarketData,
} from '@/models/models/InstrumentModel';
import request, { IResponse } from '@/utils/request';
export const requestFuture = {
    // MARK: - 获取交易日合约分页列表 
    /**
     * 获取合约列表
     * @param tradingDay 交易日
     * @param keyword 关键字
     * @param subscribes 订阅状态
     * @param page 页码
     * @param pageSize 页大小
     * @returns 合约分页列表
     */
    instrumentList: async (
        tradingDay?: string,
        keyword?: string,
        subscribes: boolean[] = [],
        page?: number,
        pageSize?: number,
    ) => {
        const response: IResponse<InstrumentModel[]> | undefined = await request(
            '/ctp/trade/instruments',
            {
                method: 'get',
                params: {
                    tradingDay: tradingDay,
                    keyword: keyword ?? '',
                    subscribes: subscribes?.toString(),
                    page: page,
                    pageSize: pageSize,
                },
            },
        );

        response?.data?.sort((a, b) => a.instrumentID.localeCompare(b.instrumentID));
        return response;
    },

     // MARK: - 获取交易日合约列表 
    /**
     * 获取交易日的合约列表
     * @param tradingDay 交易日
     */
    instrumentsByTradingDay: async (tradingDay?: string) => {
        const response: IResponse<string[]> | undefined = await request(
            '/ctp/trade/instrument/all',
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
        const response: IResponse<string[]> | undefined = await request('/ctp/trade/subscribe', {
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
            '/ctp/instrument/unsubscribe',
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
     * @param abortControllr
     * @param chartData
     * @param instrumentId
     * @param tradingDay
     * @param index
     * @returns
     */
    marketList: async (
        abortControllr: AbortController,
        chartData: IChartData,
        interval: number,
        instrumentId: string,
        tradingDay?: string,
        index?: number,
    ) => {
        const response: IResponse<any> | undefined = await request('/ctp/market/query', {
            method: 'get',
            params: {
                instrument: instrumentId,
                tradingDay: tradingDay,
                index: index,
            },
            signal: abortControllr.signal,
        });

        if (!response?.data) {
            return undefined;
        }

        const datas: string[] = response?.data;
        const result: MarketData = datas.map((item) => item.split(','));
        let lastVolume = 0;
        let lastIndex = 0;
        // 格式化数据填充到chartData
        result.map((item) => {
            const actionTime = item[43];
            let _index = getIndexByActionTime(instrumentId, actionTime, interval);
            if (_index === undefined) {
                return;
            }

            // 使用上一成交价格填充空白数据
            if (_index - lastIndex > 1) {
                const lastPrice = chartData.prices[lastIndex];
                chartData.prices.fill(lastPrice, lastIndex, _index);
                chartData.volumes.fill(lastVolume, lastIndex, _index);
                const lastTickVolume = chartData.tickVolumes[lastIndex];
                chartData.tickVolumes.fill(lastTickVolume, lastIndex, _index);
                const lastOrderBook = chartData.orderBooks[lastIndex];
                chartData.orderBooks.fill(lastOrderBook, lastIndex, _index);
            }

            // 返回数据没有区分0 250 500 750 毫秒，
            // 在tick 的interval是 250 或 500, index有数据时就放到下个index
            if (chartData.prices[_index] !== undefined) {
                if (interval === 500 || interval === 250) {
                    _index++;
                }
            }

            const price = Number(item[6]);
            const volume = Number(item[13]);
            const tickVolume = Number(volume) - lastVolume;
            lastIndex = _index;
            lastVolume = volume;
            // 成交价
            chartData.prices[_index] = price;
            // 成交量
            chartData.tickVolumes[_index] = tickVolume;
            chartData.volumes[_index] = volume;
            // 5档盘口
            chartData.orderBooks[_index] = {
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
        });
        return chartData;
    },

    // MARKS: - 获取合约交易日市场信息
    /**
     * 获取合约详细信息
     */
    instrumentInfo: async (instrumentId: string, tradingDay: string) => {
        const response: IResponse<InstrumentModel> | undefined = await request('/ctp/market/instrument/info',
            {
                method: 'get',
                params: {
                    instrument: instrumentId,
                    tradingDay: tradingDay,
                },
            },
        );

        return response?.data;
    }
        
};
