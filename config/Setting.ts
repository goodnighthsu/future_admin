const server = () => {
    if (process.env.NODE_ENV === 'development') {
        // return 'http://124.221.2.131:8200'
        return 'http://124.221.2.131:8200'
    } else {
        // return new URL(window.location.href);
        return 'http://124.221.2.131:8200'
    }
}

const Setting = {
    server: server(),
    defaultPageSize: 50
}

export default Setting