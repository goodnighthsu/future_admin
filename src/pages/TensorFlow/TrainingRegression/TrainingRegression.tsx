import React, { useEffect, useState } from 'react';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';
import { Dense } from '@tensorflow/tfjs-layers/dist/layers/core';
import { Button } from 'antd';
import tensorRequest from '../requests/tensorRequest';

const TrainingRegression: React.FC = (props) => {
    const [data, setData] = useState([]);
    const [tensorData, setTensorData] = useState<any>();
    const [model, setModel] = useState();
    
    // methods
    const load = async () => {
        const response = await tensorRequest('https://storage.googleapis.com/tfjs-tutorials/carsData.json', {
            method: 'GET',
        });
        const cleaned = response.map((car: any) => {
            return {
                mpg: car.Miles_per_Gallon,
                horsepower: car.Horsepower,
            };
        }).filter((car: any) => (car.mpg != null && car.horsepower != null));

        return cleaned;
    }

    const loadData = async () => {
        const _data = await load();
        setData(_data);
        const _tensorData = convertToTensor(_data);
        console.log('data', _data);
        console.log('tensorData', _tensorData);
        setTensorData(_tensorData);

        const values= _data.map( (item: any) => {
            return {x: item.horsepower, y: item.mpg}
        });

        // render
        await tfvis.render.scatterplot(
            {name: 'Horsepower v MPG'},
            {values},
            {xLabel: 'Horsepower', yLabel: 'MPG', height: 300}
        );
        tfvis.visor().open();
    }

    const run = async() => {
        
        testModel(model, data, tensorData);
    }

    const createModel = async () => {
        const _model = tf.sequential();

        // 密集（全连接）层的构造函数
        // inputShape: [1]: 这指定了输入数据的形状。在这个例子中，输入数据是一维的，每个样本具有一个特征。因此，输入形状是 [1]，表示单个数值作为输入特征 
        // units 用于设置权重矩阵在层中的大小。将其设置为 1 即表示数据的每个输入特征的权重为 1        
        const inputLayer: Dense = tf.layers.dense({name: 'input layer', inputShape: [1], units: 1, useBias: true});
        _model.add(inputLayer);
        _model.add(tf.layers.dense({units: 500, activation: 'sigmoid'}));

        // 输出层
        _model.add(tf.layers.dense({units: 1, useBias: true}));
        setModel(_model);
        tfvis.show.modelSummary({name: 'Model Summary'}, _model);

        const {inputs, labels} = tensorData;
        await trainModel(_model, inputs, labels);
        console.log('Done Training');
    }

    const convertToTensor = (data: any) => {
        return tf.tidy(() => {
            tf.util.shuffle(data);
            const inputs = data.map((d: any) => d.horsepower);
            const labels = data.map((d: any) => d.mpg);
            const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
            const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();
            const labelMax = labelTensor.max();
            const labelMin = labelTensor.min();
            console.log(inputs);
            console.log(inputMax.dataSync(), inputMin.dataSync(), labelMax, labelMin);

            // 150 - 46 / 230 - 46
            // 104 / 184
            const normailizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
            const normailizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
            console.log(inputTensor.dataSync(), normailizedInputs.dataSync());
            return {
                inputs: normailizedInputs,
                labels: normailizedLabels,
                inputMax,
                inputMin,
                labelMax,
                labelMin,
            }
        });
    }

    const trainModel = async (model: any, inputs: any, labels: any) => {
        model.compile({
            optimizer: tf.train.adam(),
            loss: tf.losses.meanSquaredError,
            metrics: ['mse']
        });

        const batchSize = 32;
        const epochs = 50;

        return await model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true,
            callbacks: tfvis.show.fitCallbacks(
                {name: 'Training Performance'},
                ['loss', 'mse'],
                {height: 200, callbacks: ['onEpochEnd']}
            )
        });
    }

    const testModel = (model: any, inputData: any, normalizationData: any) => {
        const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

        const [xs, preds] = tf.tidy(() => {
            const xs = tf.linspace(0, 1, 100);
            const preds = model.predict(xs.reshape([100, 1]));
            const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin);
            const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin);

            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });

        const predicatedPoints = Array.from(xs).map((val, i) => {
            return {x: val, y: preds[i]}
        });

        const originalPoints = inputData.map((d: any) => ({
            x: d.horsepower, y: d.mpg,
        }));

        tfvis.render.scatterplot(
            {name: 'Model Predictions vs Original Data'},
            {values: [originalPoints, predicatedPoints], series: ['original', 'predicated']},
            {xLabel: 'Horsepower', yLabel: 'MPG', height: 300}
        );
    }

    useEffect(() => {
        // load();
    }, [])
    
    return (
    <div>
        <h1>Training Regression</h1>
        <button onClick={loadData}>Load data</button>
        <button onClick={createModel}>Train Model</button>
        <Button onClick={() => {testModel(model, data, tensorData)}}>Test Model</Button>
    </div>
    )
}

export default TrainingRegression;