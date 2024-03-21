import { requestSysUser } from "@/services/requests/requestSysUser";
import { useModel } from "@umijs/max";
import { useCallback, useState } from "react"
import { SysUserModel } from "./SysUserListState"

const CURRENT_USER = 'currentUser';

/**
 * app singleton
 */
export class App {
    //
    currentUser: SysUserModel | undefined;

    private static _app: App;

    /**
     * singleton
     * 
     * get user token from local storge
     * @returns 
     */
    public static instance = () => {
        if (!this._app) {
            this._app = new App();
        }

        return this._app;
    }

    /**
     * 初始本地用户
     * 从localStorage中获取保存的用户token, 没有token返回undefined
     * 有token 请求并返回用户详情，并保存到App.instance().currentUser
     * @returns SysUserModel 用户详情 
     */
    public static initLocalUser = async (): Promise<SysUserModel | undefined> => {
        const jsonString = localStorage.getItem(CURRENT_USER);
        if (!jsonString) {
            return undefined;
        }
    
        try {
            const user = JSON.parse(jsonString);
            App.instance().currentUser = user;
            const detail = await requestSysUser.current();
            if (detail) {
                detail.token = user.token;
            }

            App.instance().currentUser = detail;
            return detail;
        }catch(e) {
            return undefined;
        }
    }
}

export const cleanLocalUser = () => {
    localStorage.removeItem(CURRENT_USER);
    App.instance().currentUser = undefined;
}

export const nutHeight = 60 + 2;

/**
 * 所有页面的状态
 */
export const enum PageStateEnum {
    /**
     * 合约列表
     */
    instrument = 'InstrumentListState',

    /**
     * 行情
     */
    market = 'MarketListState',
    
    /**
     * 交易日历
     */
    tradingCalendar = 'TradingCalendarState',

    /**
     * 系统用户列表
     */
    sysUserList = 'SysUserListState',
}

/**
 * App state
 */
export default () => {

    // state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { setInitialState } = useModel('@@initialState');

    /**
     * login
     */
    const login = useCallback(async (account :string, password: string): Promise<SysUserModel | undefined> => {
        setIsLoading(true);    
        const user: SysUserModel | undefined = await requestSysUser.login(account, password);
        // save global token
        if (!user?.token) {
            return;
        }
        saveUser(user);
        const detail = await App.initLocalUser();
        setInitialState((preInitialState) => {
            return {
            ...preInitialState,
            currentUser: detail,
          }
        });
        setIsLoading(false);
        
        return detail;
    }, []);

    /**
     * logout
     */
    const logout = () => {
        cleanLocalUser();
    }

    /**
     * save user info to local storage
     * @param user 
     */
    const saveUser = (user: SysUserModel | undefined) => {
        if (!user) {
            localStorage.removeItem(CURRENT_USER);
        }
        localStorage.setItem(CURRENT_USER, JSON.stringify(user));
    }

    return {
        login,
        logout,
        isLoading,
    }
}