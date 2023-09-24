const server = () => {
    if (process.env.NODE_ENV === 'development') {
        // return 'http://leonx.site:8200'
        return 'http://192.168.1.201:8200';
    } else {
        // return new URL(window.location.href);
        return 'https://xleon.site/gateway'
    }
}

const Setting = {
    server: server(),
    defaultPageSize: 50
}

export default Setting