import { App, cleanLocalUser } from '@/models/AppState';
import { history } from '@umijs/max';
import { message, notification } from 'antd';
import { extend } from 'umi-request';
import Setting from '../../config/Setting';

/**
 * 请求返回的响应
 */
export interface IResponse<T> {
    code: ResposneCode; //
    message: string;
    data?: T;
    total?: number;
}

export interface IPagingResponse<T> {
    code: ResposneCode; //
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
export enum ResposneCode {
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
            description: `Request error ${tip}:  ${url}`,
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
    timeout: 30000,
});

request.interceptors.request.use((url, options) => {
    const token = App.instance().currentUser?.token;

    const config = {
        url: `${Setting.server}${url}`,
        options: { ...options, interceptor: true },
    };

    if (token) {
        config.options.headers = {
            ...config.options.headers,
            Authorization: `Bearer ${token}`,
        };
    }
    return config;
});

const myErrorHandler = async (response: Response, options: any) => {
    if (options.responseType === 'blob') {
        return response;
    }

    let data;
    try {
        data = await response.clone().json();
    } catch (error) {
        return { response, errorMessage: `response json parse error: ${error}` };
    }

    const { code = ResposneCode.error, message: _message = '服务异常' } = data as IResponse<any>;
    if (code === ResposneCode.success) {
        return data;
    }

    if (code === ResposneCode.tokenExpiry) {
        // token expiry
        cleanLocalUser();
        history.push('/user/login');
        return data;
    }

    return { response: response, errorMessage: _message };
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
});

export default request;
