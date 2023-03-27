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

export const tableHeight = 68 + 16;

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
    const login = useCallback(async (account, password): Promise<SysUserModel | undefined> => {
        setIsLoading(true);    
        const user: SysUserModel | undefined = await requestSysUser.login(account, password);
        // save global token
        if (!user?.token) {
            return;
        }
        saveUser(user);
        const detail = await App.initLocalUser();
        setInitialState((preInitialState) => ({
            ...preInitialState,
            currentUser: detail,
          }));
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