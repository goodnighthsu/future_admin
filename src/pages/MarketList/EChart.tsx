import { getIndexByActionTime, IChartData } from '@/models/models/InstrumentModel';
import * as ECharts from 'echarts';
import { isArray } from 'lodash';
import styles from './MarketList.less';

enum SeriesName {
    price = 'price',
    volume = 'volume',
    tickVolume = 'tickVolume',
    openInterest = 'openInterest',
    fund = 'fund',
    orderBook = 'orderBook',
    kLine = 'kLine',
}

export const createChart = () => {
    const element = document.getElementById('eChart');
    const oldChart =  ECharts.getInstanceByDom(element as HTMLDivElement);
    if (oldChart) {
        oldChart.dispose();
    }
    const chart = ECharts.init(element as HTMLDivElement);
    const option = {
        title: { text: '合约' },
        legend: {
            show: true,
        },
        xAxis: [
            {
                // 行情时间
                type: 'category',
                boundaryGap: false,
            },
        ],
        yAxis: [
            {
                // 成交价
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                minInterval: 1,
                axisLabel: {
                    formatter: (value: number) => {
                        return value;
                    },
                },
                splitArea: {
                    show: true
                },
            },
            {
                // 成交量
                type: 'value',
                min: 0,
                max: 'dataMax',
                axisLabel: { show: true },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
            },
            {
                // 持仓量
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
            },
            {
                // 沉淀资金
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
            },
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0],
                start: 0,
                end: 100,
                filterMode: 'weakFilter',
                zoomOnMouseWheel: true,
            },
            {
                type: 'slider',
                xAxisIndex: [0],
                start: 0,
                end: 100,
                filterMode: 'weakFilter',
                zoomOnMouseWheel: true,
            },
        ],
        series: [
            {
                // 价格
                index: 0,
                name: '报价',
                id: SeriesName.price,
                type: 'line',
                symbol: 'arrow',
                lineStyle: {
                    color: '#4159ba',
                    width: 1,
                },
                emphasis: {
                    lineStyle: {
                        width: 1,
                    },
                },
                showSymbol: false,
                connectNulls: true,
                // sampling: 'lttb',    // 影响tooltip连续
            },
            {
                // 成交量
                index: 1,
                name: '成交量',
                id: SeriesName.tickVolume,
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 1,
                itemStyle: {
                    color: 'black',
                },
                sampling: 'lttb',
            },
            {
                // 持仓量
                index: 2,
                name: '持仓量',
                id: SeriesName.openInterest,
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 2,
                symbol: 'arrow',
                lineStyle: {
                    width: 1,
                },
                emphasis: {
                    lineStyle: {
                        width: 1,
                    },
                },
                showSymbol: false,
                connectNulls: true,
            },
            {
                // 沉淀资金
                index: 3,
                id: SeriesName.fund,
                name: '沉淀资金',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 3,
                symbol: 'arrow',
                lineStyle: {
                    width: 1,
                },
                emphasis: {
                    lineStyle: {
                        width: 1,
                    },
                },
                showSymbol: false,
                connectNulls: true,
            },
        ],
    };
    chart.setOption(option);
    return chart;
};

export const createChartTooltip = (instrument: string, interval: number, chartData: IChartData) => {
    // 提示栏
    const tooltip = {
        show: true,
        trigger: 'axis',
        triggerOn: 'mousemove | click',
        axisPointer: {
            type: 'cross',
        },
        confine: true,
        className: styles.toolTip,
        transitionDuration: 0,
        // 自定义tool tip
        formatter: (params: any) => {
            if (!isArray(params) || params.length == 0) {
                return [];
            }

            const obj = params[0];
            const {axisValue} = obj;
            const time = axisValue;
            const dataIndex = getIndexByActionTime(instrument, '1980-01-01'+ axisValue, interval);
            if (!dataIndex) {
                return;
            }
            const price = (chartData.prices ?? [])[dataIndex];
            const tickVolume = (chartData.tickVolumes ?? [])[dataIndex];
            const openInterest = (chartData.prices ?? [])[dataIndex];
            const fund = (chartData.funds ?? [])[dataIndex];
            const orderBook = (chartData.orderBooks ?? [])[dataIndex];
            if (!orderBook) {
                return;
            }
            const timeHtmls = [
                '<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%">',
                '<div style="display:flex;flex-direction:row;justify-content:space-between">' +
                    time +
                '</div>',
            ];

            // 
            const quoteCell = (tip: string , value1:number | undefined, value2: number | undefined) => {
                return '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>' + tip + ': ' +
                (value1 === 0 ? '-' : value1) +
                '</div><div style="text-align:right;width:120px">' +
                (value2 === 0 ? '-' : value2) +
                '</div></div>';
            }

            const infoCell = (tip: string, value: string | number | undefined) => {
                return '<div style="display:flex; flex-direction:row;justify-content:space-between">' +
                tip + 
                ': <div style="text-align:right">' +
                value +
                '</div></div>';
            }
            const positionHtmls = [
                '<div style="height: 8px"></div>',
                quoteCell('卖五', orderBook.askPrice5, orderBook.askVolume5),
                quoteCell('卖四', orderBook.askPrice4, orderBook.askVolume4),
                quoteCell('卖三', orderBook.askPrice3, orderBook.askVolume3),
                quoteCell('卖二', orderBook.askPrice2, orderBook.askVolume2),
                quoteCell('卖一', orderBook.askPrice1, orderBook.askVolume1),
                '<div style="height: 8px"></div>',
                quoteCell('买一', orderBook.bidPrice1, orderBook.bidVolume1),
                quoteCell('买二', orderBook.bidPrice2, orderBook.bidVolume2),
                quoteCell('买三', orderBook.bidPrice3, orderBook.bidVolume3),
                quoteCell('买四', orderBook.bidPrice4, orderBook.bidVolume4),
                quoteCell('买五', orderBook.bidPrice5, orderBook.bidVolume5),
                '<div style="height: 8px"></div>',
                infoCell('报价', price),
                infoCell('成交', tickVolume ?? 0),
                infoCell('持仓', openInterest),
                infoCell('沉淀资金', ((fund ?? 0) / 10000).toFixed(2) + '万'),
            ];

            // tool tip
            const toolTipHtmls = [...timeHtmls, ...positionHtmls, '</div>'];

            return toolTipHtmls.join('');
        },
        position: (pos: any, param: any, el: any, elRect: any, size: any) => {
            const obj = { top: 8 };
            try {
                if (pos[0] < size.viewSize[0] / 2) {
                    obj['right'] = 200;
                } else {
                    obj['left'] = 30;
                }
            } catch (error) {
                //
            }

            return obj;
        },
    };

    return tooltip;
}

export const createKLineToolTip = () => {
    const tooltip = {
        show: true,
        trigger: 'axis',
        triggerOn: 'mousemove | click',
        confine: true,
        className: styles.toolTip,
        transitionDuration: 0,
        axisPointer: {
            axis: 'x',
            snap: true,
        },
        // 自定义tool tip
        formatter: (params: any) => {
            if (!isArray(params) || params.length == 0) {
                return [];
            }

            // k线
            let kLine = undefined;
            for (let i = 0; i < params.length; i++) {
                const item = params[i];
                if (item.seriesName === 'K线') {
                    kLine = item;
                    break;
                }
            }

            if (kLine === undefined) {
                return [];
            }

            // time html
            const {axisValue, value = []} = kLine ?? {};
            const timeHtmls = [
                '<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%">',
                '<div style="display:flex;flex-direction:row;justify-content:space-between"><div>Time: </div> ' +
                axisValue +
                    '</div>',
            ];
            
            const openPrice = value[1];
            const closePrice = value[2];
            const lowestPrice = value[3];
            const highestPrice = value[4];
            const tickVolume = value[5];
            const openIntereset = value[6];

            const infoCell = (tip: string, value: string | number | undefined) => {
                return '<div style="display:flex; flex-direction:row;justify-content:space-between">' +
                tip + 
                ': <div style="text-align:right">' +
                value +
                '</div></div>';
            }
            const positionHtmls = [
                '<div style="height: 8px"></div>',
                '<div style="height: 8px"></div>',
                infoCell('开盘价', openPrice),
                infoCell('最高价', highestPrice),
                infoCell('最低价', lowestPrice),
                infoCell('收盘价', closePrice),
                infoCell('成交', tickVolume),
                infoCell('持仓',openIntereset),
            ];

            // tool tip
            const toolTipHtmls = [...timeHtmls, ...positionHtmls, '</div>'];

            return toolTipHtmls.join('');
        },
        position: (pos: any, param: any, el: any, elRect: any, size: any) => {
            const obj = { top: 8 };
            try {
                if (pos[0] < size.viewSize[0] / 2) {
                    obj['right'] = 200;
                } else {
                    obj['left'] = 30;
                }
            } catch (error) {
                //
            }

            return obj;
        },
    };

    return tooltip;
}

/**
 * k线图
 * @param instrument 
 * @param interval 
 * @returns 
 */
export const createKLine = () => {
    const element = document.getElementById('eChart');
    const oldChart =  ECharts.getInstanceByDom(element as HTMLDivElement);
    if (oldChart) {
        oldChart.dispose();
    }
    const chart = ECharts.init(element as HTMLDivElement);

   
    const option = {
        title: { text: '合约' },
        legend: {
            show: true,
        },
        xAxis: [
            {
                // 行情时间
                type: 'category',
                boundaryGap: false,
            },
        ],
        yAxis: [
            {
                // k线
                scale: true,
                splitArea: {
                    show: true
                },
            },
            {
                // 成交量
                type: 'value',
                min: 0,
                max: 'dataMax',
                axisLabel: { show: true },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
            },
            {
                // 持仓量
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                axisLabel: { show: false},
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
            },
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
                zoomOnMouseWheel: true,
            },
            {
                type: 'slider',
                xAxisIndex: [0],
                start: 0,
                end: 100,
                filterMode: 'weakFilter',
                zoomOnMouseWheel: true,
            },

        ],
        tooltip: createKLineToolTip(),
        series: [
            {
                // K线图
                index: 0,
                name:  'K线',
                type: 'candlestick',
                xAxisIndex: 0,
                yAxisIndex: 0,
            },
            {
                // 成交量
                index: 1,
                name: '成交量',
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 1,
                itemStyle: {
                    color: 'black',
                },
            },
            {
                // 持仓量
                index: 2,
                name: '持仓量',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 2,
                symbol: 'arrow',
                lineStyle: {
                    width: 1,
                },
                emphasis: {
                    lineStyle: {
                        width: 1,
                    },
                },
                showSymbol: false,
                connectNulls: true,
            }
        ],
    };
    chart.setOption(option);
    return chart;
};
