import request, { CreateByResponse, IResponse } from '@/utils/request';

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
    }
}