const Setting = () => {
    if (process.env.NODE_ENV === 'development') {
        return {
            server: "http://124.221.2.131:8200",
            ctp: "/ctpdev",
            stomp: {
                url: "ws://192.168.1.201:15674/ws",
                host: "ctpdev",
                userName: "dev",
                password: "dev@ctp.com",
            },
            defaultPageSize: 50,
        }
    }

    return {
        server: new URL(window.location.href),
        ctp: "/ctpslave",
        stomp: {
            url: "ws://192.168.1.201:15674/ws",
            host: "ctpdev",
            userName: "dev",
            password: "dev@ctp.com",
        },
        defaultPageSize: 50,
    }
}

export default Setting;