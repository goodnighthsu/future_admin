import request, { IPagingResponse, IRequestParam } from "@/utils/request";
import Setting from "../../../config/Setting";

export const requestCommon = {
    list: async<T> (param: IRequestParam): Promise<IPagingResponse<T> | undefined> => {
        const response: IPagingResponse<T> = await request("/platform/api/common", {
            method: 'get',
            params: {
                query: JSON.stringify(param)
            }
        });

        return response;
    },

    ctpList: async<T> (param: IRequestParam): Promise<IPagingResponse<T> | undefined> => {
        const response: IPagingResponse<T> = await request(`${Setting().ctp}/common`, {
            method: 'get',
            params: {
                query: JSON.stringify(param)
            }
        });

        return response;
    },
}