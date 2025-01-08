import { App, cleanLocalUser } from '@/models/AppState';
import { history } from '@umijs/max';
import { message, notification } from 'antd';
import { extend } from 'umi-request';
import Setting from '../../config/Setting';
import { Key, SortOrder } from 'antd/lib/table/interface';
import { FilterTypeEnum, IFilterItem, IOption } from '@/components/ToolBar/FilterForm';

/**
 * 请求返回的响应
 */
export interface IResponse<T> {
    code: ResponseCode; //
    message: string;
    data?: T;
    total?: number;
}

export const CreateByResponse = <T, R>(type: (new () => T), response?: IResponse<R>) => {
    if (!response) {
        return null;
    }
    const { data } = response;
    if (Array.isArray(data)) {
        return data.map(item => {
            const obj = new type() as Object;
            return Object.assign(obj, item);
        });
    }

    return Object.assign(new type() as Object, data);
}

export interface IPagingResponse<T> {
    code: ResponseCode; //
    message: string;
    data?: {
        records?: T[];
        total: number;
    };
}

export interface IPagingResult<T> {
    datas: T[];
    total: number;
}

/**
 * 请求返回code
 */
export enum ResponseCode {
    success = 1,
    error = -1,
    tokenExpiry = -999,
}

/**
 * 请求异常处理
 *
 * error 有 errorMessage 提示 errorMessage 后返回 undefined
 * error 没有 response 提示网络错误 后返回 undefined
 * error.status !== 200 提示错误信息 后返回 response
 */
const errorHandler = (error: {
    response: Response;
    errorMessage?: string;
}): Response | undefined => {
    const { response, errorMessage } = error;
    if (errorMessage) {
        message.error(errorMessage);
        return undefined;
    }

    const errorTip = '网络错误';
    if (!response) {
        notification.error({
            description: '网络或服务异常，请稍后再试',
            message: errorTip,
        });
        return undefined;
    }

    const { status, statusText, url } = response;
    if (status !== 200) {
        const tip = statusText || status;
        notification.error({
            description: `${tip}:  ${url}`,
            message: errorTip,
        });
    }

    return response;
};

/**
 * 请求默认参数
 */
const request = extend({
    errorHandler,
    credentials: 'include',
    timeout: 6000,
});

request.interceptors.request.use((url, options) => {
    const token = App.instance().currentUser?.token;

    const config = {
        url: `${Setting().server}${url}`,
        options: { ...options, interceptor: true },
    };

    if (token) {
        config.options.headers = {
            ...config.options.headers,
            Authorization: `Bearer ${token}`,
        };
    }
    console.log(config);
    return config;
}, { global: false });

const myErrorHandler = async (response: Response, options: any) => {
    if (response.status >= 400) {
        throw { response, errorMessage: `Request(${response.status}): ${response.statusText}` };
    }

    if (options.responseType === 'blob') {
        return response;
    }

    let data;
    try {
        data = await response.clone().json();
    } catch (error) {
        return { response, errorMessage: `response json parse error: ${error}` };
    }

    const { code = ResponseCode.error, message: _message = '服务异常' } = data as IResponse<any>;
    if (code === ResponseCode.success) {
        return data;
    }

    if (code === ResponseCode.tokenExpiry) {
        // token expiry
        cleanLocalUser();
        history.push('/user/login');
        return data;
    }

    throw { response: response, errorMessage: _message };
};

/**
 * 处理自定义错误
 *
 * responseType !== json 返回 response
 * response json 解析失败 抛出错误
 * response.code != success 抛出错误
 *
 * 返回 response json
 */
request.interceptors.response.use(async (response, options) => {
    return myErrorHandler(response, options);
}, { global: false });


export interface IRequestParamFilter {
    key: string;
    value?: Key;
    range?: [Key | undefined, Key | undefined];
    values?: Key[];
}

/**
 * 通用请求参数
 */
export interface IRequestParam {
    module?: string;
    /**
     * 请求的筛选
     * key： 要筛选的字段
     * value：单值
     * range: 范围
     * values: 多值
     */
    filters?: IRequestParamFilter[];

    /**
     * 请求分页
     */
    page?: number;

    /**
     * 请求分页大小
     */
    pageSize?: number;

    /**
     * 按指定字段排序
     */
    sorter?: Key,

    /**
     * 排序规则
     */
    order?: string,
}

/**
 * 构建请求参数
 * @param filters 
 * @param page 
 * @param pageSize 
 * @param sorter 
 * @param order 
 * @returns 
 */
export const createRequestParam = (
    model: string,
    filters?: IFilterItem[],
    page?: number,
    pageSize?: number,
    sorter?: Key,
    order?: SortOrder
): IRequestParam => {

    const _filters = filters?.filter(item => item.dataIndex)
        .map(item => {
            let option0: IOption = {};
            let option1: IOption = {};
            if (item.values && item.values.length > 0) {
                option0 = item.values[0];
            }
            if (item.values && item.values.length > 1) {
                option1 = item.values[1];
            }

            let _value: Key | undefined = undefined;
            let _range: [Key | undefined, Key | undefined] | undefined = undefined;
            let _values: Key[] | undefined = undefined;
            switch (item.type) {
                case FilterTypeEnum.text:
                    _value = option0.value;
                    break;
                case FilterTypeEnum.number:
                case FilterTypeEnum.date:
                case FilterTypeEnum.day:
                case FilterTypeEnum.time:
                    if (option0.value === undefined && option1.value === undefined) {
                        break;
                    }
                    _range = [option0.value, option1.value];
                    break;
                case FilterTypeEnum.general:
                case FilterTypeEnum.include:
                    _values = item.values?.map(value => value.value as Key);
                    break;
            }

            const paramFilter: IRequestParamFilter = {
                key: item.dataIndex!,
                value: _value,
                range: _range,
                values: _values
            };

            return paramFilter;
        }).filter(item => item.value || item.range || (item.values ?? []).length > 0) ?? [];

    return {
        module: model,
        filters: _filters.length > 0 ? _filters : undefined,
        page: page,
        pageSize: pageSize,
        sorter: sorter,
        order: order?.toUpperCase() as string
    }
}

export default request;