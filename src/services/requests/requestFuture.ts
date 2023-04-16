import { getIndexByActionTime, IChartData, InstrumentModel, MarketData } from "@/models/models/InstrumentModel";
import request, { IResponse } from "@/utils/request";
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
    instrumentList: async (tradingDay?: string, keyword?: string, subscribes: boolean[] = [], page?: number, pageSize?: number) => {
        const response: IResponse<InstrumentModel[]> | undefined = await request('/ctp/trade/instruments', {
            method: 'get',
            params: {
                tradingDay: tradingDay,
                keyword: keyword ?? '',
                subscribes: subscribes?.toString(),
                page: page,
                pageSize: pageSize
            }
        });

        response?.data?.sort((a, b) => a.instrumentID.localeCompare(b.instrumentID));
        return response;
    },

    /**
     * 获取交易日的合约列表
     * @param tradingDay 交易日
     */
    instrumentsByTradingDay: async(tradingDay?: string) => {
        const response: IResponse<string[]> | undefined = await request('/ctp/trade/instrument/all', {
            method: 'get',
            params: {
                tradingDay: tradingDay
            }
        });

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
            data: insturments
        });

        return response?.data;
    },

    /**
     * 取消订阅
     */
     unsubscribe: async (insturments: string[]) => {
        const response: IResponse<string[]> | undefined = await request('/ctp/instrument/unsubscribe', {
            method: 'put',
            data: insturments
        });

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
    marketList: async(abortControllr: AbortController, chartData: IChartData, interval: number,  instrumentId: string, tradingDay?: string, index?: number) => {
        const response: IResponse<any> | undefined = await request('/ctp/market/query', {
            method: 'get',
            params: {
                instrument: instrumentId,
                tradingDay: tradingDay,
                index: index,
            },
            signal: abortControllr.signal
        });
        
        if (!response?.data) {
            return undefined;
        }   

        // chartData.prices.fill(0);
        const datas: string[] = response?.data;
        const result: MarketData = datas.map(item => item.split(','));
        let lastVolume = 0;
        result.map(item => {
            const price = item[6];
            const volume = item[13];
            const actionTime = item[43];
            let index = getIndexByActionTime(instrumentId, actionTime, interval);
            if (index !== undefined) {
                if (chartData.prices[index] !== undefined) {
                    index ++;
                }
                chartData.prices[index] = Number(price);
                chartData.volumes[index] = Number(volume) - lastVolume;
                lastVolume = Number(volume)
            }
        })
        console.log(chartData);
        return chartData;
    }
}
