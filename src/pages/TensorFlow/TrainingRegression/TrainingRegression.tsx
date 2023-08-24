import tensorRequest from '@/utils/tensorRequest';
import React, { useEffect } from 'react';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';
const TrainingRegression: React.FC = (props) => {
    
    // methods
    const load = async () => {
        console.log('load');
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

    const run = async() => {
        const data = await load();
        const values= data.map( (item: any) => {
            return {x: item.horsepower, y: item.mpg}
        });

        tfvis.render.scatterplot(
            {name: 'Horsepower v MPG'},
            {values},
            {xLabel: 'Horsepower', yLabel: 'MPG', height: 300}
        );

        const model = createModel();
        tfvis.show.modelSummary({name: 'Model Summary'}, model);

        const tensorData = convertToTensor(data);
        const {inputs, labels} = tensorData;

        await trainModel(model, inputs, labels);
        console.log('Done Training');
        testModel(model, data, tensorData);
    }

    const createModel = () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
        model.add(tf.layers.dense({units: 1, useBias: true}));
        return model;
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

            const normailizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
            const normailizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

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
        load();
    }, []);
    
    return (
    <div>
        <h1>Training Regression</h1>
        <button onClick={run}>Run</button>
    </div>
    )
}

export default TrainingRegression;