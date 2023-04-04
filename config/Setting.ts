const server = () => {
    if (process.env.NODE_ENV === 'development') {
        // return 'http://xleon.site:8200'
        return 'http://localhost:8200'
    } else {
        // return new URL(window.location.href);
        return 'http://xleon.site:8200'
    }
}

const Setting = {
    server: server(),
    defaultPageSize: 50
}

export default Setting