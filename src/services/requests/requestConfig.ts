import { HistoryModel } from '@/models/models/HistoryModel';
import request, { IResponse } from '@/utils/request';

export const requestConfig = {
    /**
     * 返回指定年份交易日列表
     * @param year 年份
     * @returns 交易日
     */
    tradingDays: async (year: number) => {
        const response: IResponse<string[]> | undefined = await request('/ctpslave/market/tradingDays', {
            method: 'get',
            params: {
                year: year
            }
        });

        return response?.data;
    },

    /**
     * 返回行情历史记录状态
     */
    history: async () => {
        const response: IResponse<HistoryModel[]> | undefined = await request('/ctpslave/config/history');
        return response?.data;
    }
}