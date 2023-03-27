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
    }
}