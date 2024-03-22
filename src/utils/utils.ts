import { App, PageStateEnum } from "@/models/AppState";

export const isDev = process.env.NODE_ENV === 'development';

// Todo: 按账号保存 
export const localUserState = {
    get: (page: PageStateEnum) => {
        // if (!App.instance().currentUser?.account) {
        //     return;
        // }
        const name = 'global' + '@platform.leonx.site';
        const stateString = localStorage.getItem(name) ?? '';
        let pageState;
        try {
            const userState = JSON.parse(stateString);
            pageState = userState[page].columnSelecteds;
        } catch (e) {
            console.warn('error: ', e);
        }
        return pageState;
    },

    saveAll: (state: any) => {
        // if (!App.instance().currentUser?.account) {
        //     return;
        // }
        const name = 'global' + '@platform.leonx.site'

        try {
            localStorage.setItem(name, JSON.stringify(state));
        } catch (e) {
            console.warn('error: ', e);
        }
    }
} 
