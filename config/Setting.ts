const server = () => {
    if (process.env.NODE_ENV === 'development') {
        return 'http://xleon.site:8200'
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