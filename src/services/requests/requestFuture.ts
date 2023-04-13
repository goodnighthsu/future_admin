import { InstrumentModel } from "@/models/InstrumentListState";
import request, { IResponse } from "@/utils/request";

export const requestFuture = {
    instrumentList: async (keyword?: string, subscribes: boolean[] = [], page?: number, pageSize?: number) => {
        console.log(subscribes, subscribes.toString());
        const response: IResponse<InstrumentModel[]> | undefined = await request('/ctp/all', {
            method: 'get',
            params: {
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
     * 订阅期货合约
     * 
     * @returns 
     */
    subscribe: async (insturments: string[]) => {
        const response: IResponse<string[]> | undefined = await request('/ctp/instrument/subscribe', {
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
     */
    marketList: async(instrumentId: string, tradingDay?: string, index?: number) => {
        const response: IResponse<any> | undefined = await request('/ctp/instrument/market', {
            method: 'get',
            params: {
                id: instrumentId,
                tradingDay: tradingDay,
                index: index,
            }
        });

        return response?.data;
    }
}
