import { requestSysUser } from "@/services/requests/requestSysUser";
import { useModel } from "@umijs/max";
import { useCallback, useRef, useState } from "react";
import { SysUserModel } from "./models/SysUserModel";
import Setting from "../../config/Setting";
import { Client } from "@stomp/stompjs";

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
     * 
     * 从localStorage中获取保存的用户token, 没有token返回undefined
     * 有token 请求并返回用户详情，并保存到App.instance().currentUser
     * 成功后自动连接stomp
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
export enum PageStateEnum {
    /**
     * 合约列表
     */
    instrument = 'InstrumentListState',

    /**
     * 主力合约列表
     */
    forceInstrumentList = 'ForceInstrumentList',

    /**
     * 合约行情
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

    /**
     * 系统角色列表
     */
    sysRoleList = 'SysRoleListState',
}

/**
 * App state
 * 包含用户登录、登出、stomp连接等
 */
export default () => {

    // state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    /**
     * stomp client
     */
    const stompClientRef = useRef<Client | undefined>();
    
    /**
     * stomp连接状态
     */
    const [stompConnected, setStompConnected] = useState<boolean>(false);
    const updateStompConnected = useCallback((data: boolean) => {
        setStompConnected(data);
    }, [stompConnected]);


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
        stompDisconnect();
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

    /**
     * 初始化stomp client
     * @returns 
     */
    const stompInit = () => {
        if (stompClientRef.current) {
            return;
        }

        const stompConfig = Setting().stomp;
    
        const client = new Client({
            brokerURL: stompConfig.url,
            // heartbeatIncoming: 3000,
            // heartbeatOutgoing: 3000,
            connectionTimeout: 3000,
            connectHeaders: {
                host: stompConfig.host,
                login: stompConfig.userName,
                passcode: stompConfig.password,
            },
            onConnect: () => {
                console.log(`stomp ${stompConfig.url} connected`);
                updateStompConnected(true);
                client.subscribe(
                    '/exchange/testExchange/simu.*.*', 
                    message => console.log(`Received: ${message.body}`)
                );
            },
            onDisconnect: () => {
                updateStompConnected(false);
                console.log("disconnected");
            },
            onStompError: (frame) => {
                updateStompConnected(false)
                console.log(`stomp error: ${frame.headers.message}`);
                console.log(`stomp error details: ${frame.body}`);
            },
            onWebSocketError: (event) => {
                updateStompConnected(false)
                console.log(`websocket error: ${event.message}`);
            }
        });
        
        stompClientRef.current = client;
        client.activate();
    }

    /**
     * 断开stomp连接
     */
    const stompDisconnect = () => {
        if (!stompClientRef.current) {
            return;
        }
        stompClientRef.current.deactivate();
        updateStompConnected(false);
        stompClientRef.current = undefined;
    }

    return {
        login,
        logout,
        isLoading,
        stompInit,
        stompConnected,
        updateStompConnected,
    }
}