import tensorRequest from "./tensorRequest";

export const requestCNN = {
    imgLabelList: async () => {
        const response = await tensorRequest('https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8');
        console.log('imgLabelList', response);
        return response;
    },
}