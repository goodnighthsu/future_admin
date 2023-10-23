import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Button, Input } from 'antd';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';
import { Dense } from '@tensorflow/tfjs-layers/dist/layers/core';
import styles from './TicTacToe.less';

type Chessboard = string[];

class Board {
    state: Chessboard;
    result: Player | 'D' | null;

    static winPatterns: number[][] =
        [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]

    constructor() {
        this.state = new Array(9).fill('');
        this.result = null;
        return this;
    }

    reset() {
        this.state = new Array(9).fill('');
        this.result = null;
    }

    /**
     * 检查胜负
     * @returns 'X' | 'O'， 'D': 平局， null: 棋局尚未结束 
     */
    check = () => {
        for (const pattern of Board.winPatterns) {
            const [a, b, c] = pattern;
            if (this.state[a] && this.state[a] === this.state[b] && this.state[a] === this.state[c]) {
                return this.state[a] as Player;
            }
        }

        if (!this.state.includes("")) {
            return 'D';
        }

        return null;
    }

    move = (player: Player, index: number) => {
        if (this.result !== null) {
            return false;
        }
        if (this.state[index] !== '') {
            return false;
        }
        this.state[index] = player;
        this.result = this.check();
        return true;
    }
}

class PlayerModel {
    name: 'X' | 'O';
    /**
     * 环境历史记录（棋盘的历史记录）
     */
    board: Board;
    logs: Chessboard[];
    actionLogs: number[];
    targetLogs: Float32Array[];
    /**
     * 非贪婪策略中随机移动的可能性
     */
    randomMove: number;
    /**
     * 随机移动衰减
     */
    randomMoveDecrease: number;


    maxValueLogs: number[];
    rewardDiscount: number;
    neuralNetwork: tf.Sequential;
    qValue: {
        [key: string]: number[];
    };

    private _opponent?: PlayerModel;
    get opponent() {
        if (this._opponent) {
            return this._opponent;
        }
        let opponentName: 'O' | 'X' = 'O';
        if (this.name === 'O') {
            opponentName = 'X'
        }

        return new PlayerModel(opponentName);
    }
    set opponent(value) {
        this.opponent = value
    }

    constructor(name: 'X' | 'O') {
        this.name = name;
        this.board = new Board();
        this.logs = [];
        this.actionLogs = [];
        this.targetLogs = [];
        this.maxValueLogs = [];

        this.rewardDiscount = 0.9;
        this.randomMove = 0.95;
        this.randomMoveDecrease = 0.95

        this.neuralNetwork = this.createQNetwork();

        this.qValue = {};

        return this;
    }

    // TODO: reset
    reset = () => {
        this.board = new Board();
        this.logs = [];
        this.actionLogs = [];
        this.targetLogs = [];
        // this.randomMove = 0.95;
        // this.randomMoveDecrease = 0.95;
    }

    getQValues = (board: number[]) => {
        let result: number[] = this.qValue[board.join('-')];
        if (result === undefined) {
            result = new Array(9).fill(0);
        }

        return result;
    }

    move = (board: string[], index: number) => {
        if (board[index] !== '') {
            return board;
        }
        this.logs.push([...board]);
        this.actionLogs.push(index);
        board[index] = this.name;
        return board;
    }

    next = (board: string[]) => {
        let score = -1;
        let nextIndex: number | null = null;

        // 遍历所有棋盘
        for (let index = 0; index < board.length; index++) {
            // 跳过不可走
            if (board[index] !== '') {
                continue;
            }

            // 走一步
            const nextBoard = [...board];
            nextBoard[index] = this.name;

            // 如果胜利，直接作为最优解
            let winner = this.checkWinner(nextBoard);
            if (winner === 1) {
                score = 1;
                nextIndex = index;
                break;
            }

            // 没有走完，交换选手继续
            if (winner === null) {
                winner = -this.opponent.next(nextBoard).score;
            }

            // 这一步的结果优于之前的，就保存为优解
            // nextIndex === null, 是第一步默认优解
            if (winner > score || nextIndex === null) {
                score = winner;
                nextIndex = index;
            }
        }
        // console.log({ score: score, index: nextIndex! });
        return { score: score, index: nextIndex! };
    }

    best = (board: string[]) => {
        const _next = this.next(board);
        return this.move(board, _next.index);
    }

    random = (board: Chessboard) => {
        const availables: number[] = [];
        board.forEach((item, index) => {
            if (item === '') {
                availables.push(index);
            }
        });
        const index = Math.floor((Math.random() * availables.length));
        return availables[index];
    }

    qStrategy = (chessBoard: string[]) => {
        const qValue = [...this.getQValues(chessBoard)];
        const _qValue = qValue.map((item, index) => {
            if (chessBoard[index] != '') {
                return -1;
            }
            return item;
        })

        const action = tf.argMax(_qValue).dataSync()[0];
        this.logs.push([...chessBoard]);
        this.actionLogs.push(action);
        return action;
    }

    /**
     * 根据胜负结果获取分数
     * @param winner  
     * @returns 
     */
    getReward = (winner: Player | 'D') => {
        if (winner === 'D') {
            return 5;
        }

        if (winner === this.name) {
            return 10;
        }

        return 0;
    }

    final = (reward: number) => {
        const rate = 0.9;
        const gammer = 0.9;
        let lastValue = 0;
        this.actionLogs.reverse();
        this.logs.reverse()
            .forEach((item, index) => {
                const key = item.join("-");
                const action = this.actionLogs[index];
                const qValues = this.getQValues(item);
                // 最后一步
                if (index === 0) {
                    qValues[action] = reward;
                    lastValue = reward;
                    this.qValue[key] = qValues;
                    // console.log('final update: ', key, qValues, this.actionLogs, this.logs);
                    return;
                }

                qValues[action] = qValues[action] * (1 - rate) + rate * gammer * lastValue;
                this.qValue[key] = qValues;
                lastValue = qValues[action];
                // console.log('update q values:', key, qValues, this.actionLogs, this.logs);
            });

        // console.log('all q values:', this.qValue);
    }

    chessBoardToTensor = (chessBoard: Chessboard) => {
        return chessBoard.map(item => {
            if (item === '') {
                return 1;
            }
            if (item === 'X') {
                return 2;
            }
            return 3;
        });
    }

    /**
     * 神经网络的策略
     */
    nnStrategy = (chessBoard: Chessboard, isShowLog: boolean, isTrain: boolean) => {
        const inputs = this.chessBoardToTensor(chessBoard);
        return tf.tidy(() => {
            // const pred = this.neuralNetwork.predict(tf.tensor([inputs]).reshape([1, 3, 3,1])) as tf.Tensor<tf.Rank>;

            //
            const pred = this.neuralNetwork.predict(tf.tensor([inputs])) as tf.Tensor<tf.Rank>;
            let target = pred.dataSync() as Float32Array;

            let randomRate = Math.random();
            // 短期记忆
            const key = inputs.join('-');
            if (this.qValue[key]) {
                console.log('短期记忆命中: ', this.qValue[key]);
                target = new Float32Array(this.qValue[key]);
                randomRate = 100;
            }

            const datas = target.map((item, index) => {
                if (chessBoard[index] !== '') {
                    item = -1;
                }

                return item;
            });   

            let action:number;
            if (randomRate < this.randomMove && isTrain) {
                action = this.random(chessBoard);
            }else {
                // 贪婪
                action = tf.tensor(datas).argMax().dataSync()[0];
            }
            
            if (isShowLog) {
                console.log('inputs tensor:');
                // tf.tensor([inputs]).reshape([1, 3, 3, 1]).print();
                tf.tensor([inputs]).reshape([3, 3]).print();
                console.log('target tensor:')
                pred.reshape([3, 3]).print();
                console.log('isRandom', randomRate < this.randomMove && isTrain , this.randomMove);
                console.log('action:', action);
            }

            pred.dispose();
            this.logs.push([...chessBoard]);
            this.actionLogs.push(action);
            this.targetLogs.push(datas);
            return action;
        });
    }

    /**
     * 最终结果
     */
    nnFinal = async (reward: number, isShowLog: boolean) => {
        // console.log('游戏结束，计算奖励');
        // console.log('奖励', reward);
        // 最终奖励
        const rate = 0.9;
        const gammer = 0.9;
        let lastValue = reward;
        this.actionLogs.reverse();
        let inputs = this.logs.reverse()
            .map(item => {
                return this.chessBoardToTensor(item);
            });
        // const xs = tf.tensor(inputs).reshape([inputs.length, 3, 3, 1]);
        const xs = tf.tensor(inputs);

        let targets = this.targetLogs.reverse()
            .map((item, index) => {
                const action = this.actionLogs[index];
                const _item = [...item]; 
                _item[action] = _item[action] * (1 - rate) + rate * gammer * lastValue;
                if (index === 0) {
                    // 保存最后一步到qValue作为短期记忆
                    // 局面key
                    const board = inputs[index];
                    const key = board.join('-');
                    const qValues = this.getQValues(board);
                    qValues[action] = reward;
                    this.qValue[key] = qValues;
                    _item[action] = reward;
                    // console.log('短期记忆保存: ', key, this.qValue[key]);
                }
                lastValue = _item[action];
                return _item;
            });
        const ys = tf.tensor(targets);

        // 随机移动衰减
        this.randomMove *= this.randomMoveDecrease;
        const mse = await this.neuralNetwork.trainOnBatch(xs, ys);
        if (isShowLog) {
            console.log('训练的局面：');
            // xs.reshape([inputs.length, 3,3, 1]).print();
            xs.reshape([3, 3]).print();
            console.log('训练的目标:');
            ys.reshape([targets.length, 3,3]).print();
            // console.log('训练方差: ', mse);
            console.log('原来的目标:');
            const _targetLogs = tf.tensor([...this.targetLogs]);
            _targetLogs.reshape([this.targetLogs.length, 3, 3]).print();
            _targetLogs.dispose();
            console.log('actions: ',  this.actionLogs.reverse());
        }
        xs.dispose();
        ys.dispose();
    }


    /**
     * Q神经网络
     */
    createQNetwork = () => {
        const model = tf.sequential();
        // create q network
        const inputLayer: Dense = tf.layers.dense({
            inputShape: [9],
            units: 9,
            kernelInitializer: 'varianceScaling'
        });
        model.add(inputLayer);
        

        // conv2d 二维卷积层
        // kernelSize 卷积核大小
        // model.add(tf.layers.conv2d({
        //     inputShape: [3, 3, 1],
        //     kernelSize: 1,
        //     filters: 8,
        //     strides: 1,
        //     activation: 'relu',
        //     kernelInitializer: 'varianceScaling'
        // }));
  
        // // The MaxPooling layer acts as a sort of downsampling using max values
        // // in a region instead of averaging.
        // model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));
        // model.add(tf.layers.flatten());

        const hiddenLayer: Dense = tf.layers.dense({ units: 217, activation: 'relu' });
        model.add(hiddenLayer);
        // model.add(tf.layers.dense({ units: 217*10, activation: 'relu' }));

        
        const outputLayer: Dense = tf.layers.dense({ units: 9 })
        model.add(outputLayer);

        tfvis.show.modelSummary({ name: 'Model Summary' }, model);

        model.compile({
            optimizer: tf.train.adam(),
            loss: tf.losses.meanSquaredError,
            metrics: ['mse']
        });

        return model;
    }


    /**
     * 计算targets
     * @param actionLogs 
     * @param valuesLogs 
     * @param maxValueLogs 
     * @param rewardDiscount 
     * @returns 
     */
    calculateTargets = (
        actionLogs: number[],
        valuesLogs: number[][],
        maxValueLogs: number[],
        rewardDiscount: number,
    ) => {
        const targets: number[][] = [];
        for (let i = 0; i < actionLogs.length; i++) {
            const action = actionLogs[i];
            // 所有动作对应的价值
            const target: number[] = valuesLogs[i];
            // 更新此动作的价值
            target[action] = rewardDiscount * maxValueLogs[i];
            targets.push(target);
        }

        return targets;
    }
}

/**
 * 玩家
 */
type Player = 'X' | 'O';

const playerX = new PlayerModel('X');
const playerO = new PlayerModel('O');

const TikTacToe: React.FC = (props) => {

    /**
     * 棋盘
     */
    const [board, setBoard] = useState<Board>(new Board());
    const [currentPlayer, setCurrentPlayer] = useState<PlayerModel>(playerX);

    const [trainCount, setTrainCount] = useState<number>(10000);

    const [loading, setLoading] = useState<boolean>(false);

    const randomVsQValue = () => {
        let board = new Board();
        playerO.reset();
        playerX.reset()
        while (board.result === null) {
            // 随机
            const index = playerX.random(board.state);
            board.move(playerX.name, index);
            if (board.result !== null) {
                break;
            }

            // q value
            const indexO = playerO.qStrategy(board.state);
            board.move(playerO.name, indexO);
            if (board.result !== null) {
                break;
            }
        }
        const winner = board.result;
        const reward = playerO.getReward(winner!);
        playerO.final(reward);
        playerO.board = board;
        return playerO;
    }

    const randomVsNeural = async (isShowLog: boolean = false, isTrain: boolean) => {
        let board = new Board();
        playerO.reset();
        playerX.reset();
        while (board.result === null) {
            // 随机
            const index = playerX.random(board.state);
            board.move(playerX.name, index);
            if (board.result !== null) {
                break;
            }

            // q value
            const indexO = playerO.nnStrategy(board.state, isShowLog, isTrain);
            board.move(playerO.name, indexO);
            if (board.result !== null) {
                break;
            }
        }
        const winner = board.result;
        const reward = playerO.getReward(winner!);
        if (isTrain) {
            await playerO.nnFinal(reward, isShowLog);
        }
        playerO.board = board;
        return playerO;
    }

    const radomVsBest = () => {
        // let board = initBoards();
        // let result: number | null = null;
        // playerX.reset();
        // playerO.reset();
        // let win = 'draw';
        // let index = 0;
        // while (result === null) {
        //     if (index === 0 ) {
        //         board = playerX.random(board);
        //     }else {
        //         board = playerX.best(board);
        //     }
        //     index ++;

        //     result = checkWinner(playerX.name, board);
        //     if (result !== null) {
        //         playerO.final(-result);
        //         if (result === 1) {
        //             win = playerX.name;
        //         }else if (result === -1) {
        //             win = playerO.name;
        //         }
        //         break;
        //     }
        //     board = playerO.qStrategy(board);
        //     result = checkWinner(playerO.name, board);
        //     if (result !== null) {
        //         playerO.final(result);
        //         if (result === 1) {
        //             win = playerO.name;
        //         }else if (result === -1) {
        //             win = playerX.name;
        //         }
        //         result = -result;
        //         break;
        //     }
        // }
        // setBoards(board);
        // return win;
    }

    const training = () => {
        let player;
        let i = 0;
        let win = 0;
        let draw = 0;
        while (i < trainCount) {
            player = randomVsQValue();
            if (player.board.result === playerO.name) {
                win++;
            } else if (player.board.result === 'D') {
                draw++;
            }
            i++;
            console.log(i);
        }

        console.log(`win: ${win}, draw:${draw}, ${win + draw}`);
        console.log('values', playerO.qValue);
    }

    const neuralTrain = async (isTrain: boolean = false) => {
        let player;
        let i = 0;
        let batch = 1;
        let win = 0;
        let draw = 0;
        while (i < trainCount) {
            while (i < 1000 * batch && i < trainCount) {
                player = await randomVsNeural(false, isTrain);
                if (player.board.result === playerO.name) {
                    win++;
                } else if (player.board.result === 'D') {
                    draw++;
                }
                i++;
                // const tip = isTrain ? '训练' : '测试';
                // console.log(tip, i);
            }
   
            // console.log(`tf memory:`, tf.memory());
            console.log(`训练（${batch}） win: ${win}, draw:${draw}, ${win + draw}`);
            win = 0; draw = 0;

            // let n = 0;
            // while (n < 100) {
            //     player = await randomVsNeural(false, false);
            //     if (player.board.result === playerO.name) {
            //         win++;
            //     } else if (player.board.result === 'D') {
            //         draw++;
            //     }
            //     n++;
            // }
            // console.log(`测试 win: ${win}, draw:${draw}, ${win + draw}`);
            // win = 0; draw = 0;
            
            batch ++;
        }
    }

    const reset = () => {
        setBoard(new Board());
    }

    // useEffect( ()=> {
    //     console.log(tf.getBackend());
    // }, [])

    return (
        <div>
            <Button onClick={() => { reset() }}>Reset</Button>
            {/*
            <Button onClick={() => {
                const _boards = currentPlayer.best(boards);
                checkWinner(currentPlayer.name, _boards);
                setCurrentPlayer(currentPlayer.opponent);
            }}>
                Next
            </Button>
            <Button onClick={() => {
                const _boards = currentPlayer.random(boards);
                checkWinner(currentPlayer.name, _boards);
                setCurrentPlayer(currentPlayer.opponent);
            }}>
                Random
            </Button> */}
            <Button onClick={() => {
                const _boards = currentPlayer.qStrategy(board.state);
                setCurrentPlayer(currentPlayer.opponent);
            }}>
                Q Value
            </Button>

            <div>
                Training Count <Input style={{ width: '100px' }} value={trainCount} onChange={e => setTrainCount(e.currentTarget.value)} />
            </div>

            <Button
                onClick={() => { training(); }}>
                Q Value Train
            </Button>
            <Button onClick={() => {
                const player = randomVsQValue();
                console.log(player.board.state, player.actionLogs, player.qValue);
                setBoard(player.board);
            }}>
                Random vs Q
            </Button>

            <Button loading={loading}
                onClick={ async() => {
                    setLoading(true);
                    await neuralTrain(true);
                    setLoading(false);
                }}>
                Neural Train
            </Button>
            <Button loading={loading}
                onClick={async () => {
                setLoading(true);
                const player = await neuralTrain(false);
                // console.log(player.board.state, player.actionLogs, player.qValue);
                setLoading(false);
            }}>
                Neural Test
            </Button>
            <Button onClick={async () => {
                const player = await randomVsNeural(true, false);
                // console.log(player.board.state, player.actionLogs, player.qValue);
                setBoard(player.board);
            }}>
                Random vs Neural
            </Button>


            <p>Current Player: {currentPlayer.name} Result: {board.result}</p>
            <div className={styles.grid}>
                {
                    board.state.map((item, index) => {
                        return (
                            <button className={styles.cell}
                                onClick={() => {
                                    const moved = board.move(currentPlayer.name, index);
                                    if (moved) {
                                        setCurrentPlayer(currentPlayer.opponent);
                                    }
                                }}>
                                {item}
                            </button>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default TikTacToe;