import {extend} from 'umi-request';

const tensorRequest = extend({
    timeout: 3000,
});

export default tensorRequest;