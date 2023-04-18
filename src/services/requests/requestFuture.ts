import {
    getIndexByActionTime,
    IChartData,
    InstrumentModel,
    MarketData,
} from '@/models/models/InstrumentModel';
import request, { IResponse } from '@/utils/request';
export const requestFuture = {
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
            const price = item[6];
            const volume = item[13];
            const actionTime = item[43];
            let _index = getIndexByActionTime(instrumentId, actionTime, interval);
            if (_index === undefined) {
                return;
            }

            // 使用上一成交价格填充空白数据
            if (_index - lastIndex > 1) {
                const lastPrice = chartData.prices[lastIndex];
                chartData.prices.fill(lastPrice, lastIndex, _index);
            }

            // 返回数据没有区分0 250 500 750 毫秒，
            // 在tick 的interval是 250 或 500, index有数据时就放到下个index
            if (chartData.prices[_index] !== undefined) {
                if (interval === 500 || interval === 250) {
                    _index++;
                }
            }
            lastIndex = _index;

            // 成交价
            chartData.prices[_index] = Number(price);

            // 成交量
            chartData.volumes[_index] = Number(volume) - lastVolume;
            lastVolume = Number(volume);

            // 5档盘口
            chartData.orderBooks[_index] = {
                bidPrice1: Number(item[23]),
                bidVolume1: Number(item[24]),
                bidPrice2: Number(item[25]),
                bidVolume2: Number(item[26]),
                bidPrice3: Number(item[27]),
                bidVolume3: Number(item[28]),
                bidPrice4: Number(item[29]),
                bidVolume4: Number(item[30]),
                bidPrice5: Number(item[31]),
                bidVolume5: Number(item[32]),
                askPrice1: Number(item[33]),
                askVolume1: Number(item[34]),
                askPrice2: Number(item[35]),
                askVolume2: Number(item[36]),
                askPrice3: Number(item[37]),
                askVolume3: Number(item[38]),
                askPrice4: Number(item[39]),
                askVolume4: Number(item[40]),
                askPrice5: Number(item[41]),
                askVolume5: Number(item[42]),
            }
        });
        return chartData;
    },
};
