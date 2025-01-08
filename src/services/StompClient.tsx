import { useModel } from 'umi';
import { useEffect } from 'react';


/**
 * stomp客户端函数组件
 * 方便使用函数hook
 * @returns 
 */
const StompClient = () => {
    const { stompInit } = useModel('AppState');
    useEffect(() => {
        stompInit();
    }, []);
    return (<></>)
};

export default StompClient;
