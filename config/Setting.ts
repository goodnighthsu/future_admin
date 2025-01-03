const server = () => {
    if (process.env.NODE_ENV === 'development') {
        // return 'http://124.221.2.131:8200'
        return 'http://124.221.2.131:8200'
    } else {
        // return new URL(window.location.href);
        return 'http://124.221.2.131:8200'
    }
}

/**
 * ctp微服务
 * @returns 
 */
const ctp = () => {
    if (process.env.NODE_ENV === 'development') {
        return "/ctpdev";
    } 

    return "/ctpslave";
}

const Setting = {
    server: server(),
    ctp: ctp(),
    defaultPageSize: 50
}



export default Setting