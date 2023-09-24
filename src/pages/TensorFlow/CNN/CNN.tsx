import React, { useEffect, useState } from 'react';
import { requestCNN } from '../requests/requestCNN';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';
import { MnistData } from './data.js';
import { Button, Spin } from 'antd';

const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const IMAGE_CHANNELS = 1;

const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

const CNN: React.FC = (props) => {
  const [data, setData] = useState<any>();
  const [model, setModel] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  // methods
  const loadData = async () => {
    setLoading(true);
    // const response =  await requestCNN.imgLabelList();
    const _data = new MnistData();
    await _data.load();
    setLoading(false);
    setData(_data);
  }

  const showExamples = async (data: any) => {
    tfvis.visor().open();
    // Create a container in the visor
    const surface = tfvis.visor().surface({ name: 'Input Data Examples', tab: 'Input Data' });

    // Get the examples
    const examples = data.nextTestBatch(10);

    const numExamples = examples.xs.shape[0];

    // Create a canvas element to render each example
    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tf.tidy(() => {
        // Reshape the image to 28x28 px
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });

      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;
      canvas.style = 'margin: 4px;';
      await tf.browser.toPixels(imageTensor, canvas);
      surface.drawArea.appendChild(canvas);

      imageTensor.dispose();
    }
  }

  const getModel = () => {
    const model = tf.sequential();
    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    // conv2d 二维卷积层
    // kernelSize 卷积核大小
    model.add(tf.layers.conv2d({
      inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    // Repeat another conv2d + maxPooling stack.
    // Note that we have more filters in the convolution.
    model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    // flatten 展平
    model.add(tf.layers.flatten());

    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    const NUM_OUTPUT_CLASSES = 10;
    model.add(tf.layers.dense({
      units: NUM_OUTPUT_CLASSES,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax'
    }));

    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    // 指定跟踪的优化程序、损失函数和指标
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  const train = async (model: any, data: any) => {
    // 监控指标 训练损失、验证损失、训练准确率、验证准确率
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
    };
    const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

    const BATCH_SIZE = 512;
    const TRAIN_DATA_SIZE = 55000;
    const TEST_DATA_SIZE = 10000;

    // 训练数据
    const [trainXs, trainYs] = tf.tidy(() => {
      const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
      return [
        d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
        d.labels
      ];
    });
    
    // 验证数据
    const [testXs, testYs] = tf.tidy(() => {
      const d = data.nextTestBatch(TEST_DATA_SIZE);
      return [
        d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
        d.labels
      ];
    });

    // 训练
    return model.fit(trainXs, trainYs, {
      batchSize: BATCH_SIZE,
      validationData: [testXs, testYs],
      epochs: 10,
      shuffle: true,
      callbacks: fitCallbacks
    });
  }

  const clickEvalute = async () => {
    showAccuracy(model, data);
    showConfusion(model, data);

  }

  const predict = (model: any, data: any, testDataSize: number = 500) => {
    const testData = data.nextTestBatch(testDataSize);
    const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
    const labels = testData.labels.argMax(-1);
    const all = model.predict(testxs);
    const preds = all.argMax(-1);
    // console.log("preds: ", preds.dataSync());
    all.print();
    labels.print();
    // console.log("labels: ", labels.arraySync());
    testxs.dispose();
    return [preds, labels];
  }

  const showAccuracy = async (model: any, data: any) => {
    console.log('showAccuracy');
    const [preds, labels] = predict(model, data);
    console.log(preds, labels);
    const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    const container = { name: 'Accuracy', tab: 'Evaluation' };
    tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

    labels.dispose();
  }

  const showConfusion = async (model: any, data: any) => {
    const [preds, labels] = predict(model, data);
    const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
    const container = { name: 'Confusion Matrix', tab: 'Evaluation' };
    tfvis.render.confusionMatrix(container, { values: confusionMatrix, tickLabels: classNames });

    labels.dispose();
  }

  const clickTrainButton = async () => {
    const _model = getModel();
    setModel(_model);
    tfvis.show.modelSummary({ name: 'Model Architecture', tab: 'Model' }, _model);
    await train(_model, data);
  }

  // useEffect(() => {
  //   loadData();
  // }, []);

  return (
    <div>
      <Spin spinning={loading}>
        <h1>CNN</h1>
        <p>卷积神经网络</p>
        <Button onClick={loadData}>Load data</Button>
        <Button onClick={() => { showExamples(data) }}>Show Examples</Button>
        <Button onClick={() => { clickTrainButton() }}>Train</Button>
        <Button onClick={() => { predict(model, data) }}>Predict</Button>
        <Button onClick={() => { clickEvalute() }}>Evaluate</Button>
      </Spin>
    </div>
  );
}

export default CNN;