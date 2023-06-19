import { getIndexByActionTime, IChartData, IChartKLine } from '@/models/models/InstrumentModel';
import * as ECharts from 'echarts';
import { isArray } from 'lodash';
import styles from './MarketList.less';

export const createChart = (instrument: string | undefined, interval: number, chartData: IChartData | undefined) => {
    const element = document.getElementById('eChart');
    const oldChart =  ECharts.getInstanceByDom(element as HTMLDivElement);
    if (oldChart) {
        oldChart.dispose();
    }
    const chart = ECharts.init(element as HTMLDivElement);

    // 提示栏
    const tooltip = {
        show: true,
        trigger: 'axis',
        triggerOn: 'mousemove | click',
        confine: true,
        className: styles.toolTip,
        transitionDuration: 0,
        axisPointer: {
            axis: 'y',
            snap: true,
        },
        // 自定义tool tip
        formatter: (params: any) => {
            if (!isArray(params) || params.length == 0) {
                return [];
            }

            let obj = undefined;
            for (let i = 0; i < params.length; i++) {
                const item = params[i];
                if (item.axisType == 'xAxis.category') {
                    obj = item;
                    break;
                }
            }

            if (obj === undefined) {
                return [];
            }

            if (!instrument) {
                return;
            }

            const dataIndex = getIndexByActionTime(
                instrument,
                '1980-01-01 ' + obj.axisValue,
                interval,
            );
            if (dataIndex === undefined) {
                return;
            }

            // time html
            const time = obj.axisValue;
            const timeHtmls = [
                '<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%">',
                '<div style="display:flex;flex-direction:row;justify-content:space-between"><div>Time: </div> ' +
                    time +
                    '</div>',
            ];

            if (!chartData) {
                return;
            }

            const price = chartData.prices[dataIndex];
            const tickVolume = chartData.tickVolumes[dataIndex];
            const volume = chartData.volumes[dataIndex];
            const openInterest = chartData.openInterests[dataIndex];
            const fund = chartData.funds[dataIndex];
            const orderBook = chartData.orderBooks[dataIndex];
            if (!orderBook) {
                return;
            }

            // 
            const quoteCell = (value1:number | undefined, value2: number | undefined) => {
                return '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask5: ' +
                value1 +
                '</div><div style="text-align:right;width:120px">' +
                value2 +
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
                quoteCell(orderBook.askPrice5, orderBook.askVolume5),
                quoteCell(orderBook.askPrice4, orderBook.askVolume4),
                quoteCell(orderBook.askPrice3, orderBook.askVolume3),
                quoteCell(orderBook.askPrice2, orderBook.askVolume2),
                quoteCell(orderBook.askPrice1, orderBook.askVolume1),
                '<div style="height: 8px"></div>',
                quoteCell(orderBook.bidPrice1, orderBook.bidVolume1),
                quoteCell(orderBook.bidPrice2, orderBook.bidVolume2),
                quoteCell(orderBook.bidPrice3, orderBook.bidVolume3),
                quoteCell(orderBook.bidPrice4, orderBook.bidVolume4),
                quoteCell(orderBook.bidPrice5, orderBook.bidVolume5),
                '<div style="height: 8px"></div>',
                infoCell('Last Price', price),
                infoCell('Tick Vol', tickVolume),
                infoCell('Volume', volume),
                infoCell('Open Interest', openInterest),
                infoCell('沉淀资金', (fund / 10000).toFixed(2) + '万'),
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
                axisPointer: {
                    show: true,
                    label: {
                        show: true,
                    },
                },
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
                axisPointer: {
                    show: false,
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
                axisPointer: {
                    show: true,
                },
            },
            {
                // 持仓量
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                axisLabel: {
                    formatter: (value: number) => {
                        return value;
                    },
                },
                axisPointer: {
                    show: false,
                },
            },
            {
                // 沉淀资金
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                axisLabel: {
                    formatter: (value: number) => {
                        return (value / 10000).toFixed(2) + '万';   
                    },
                },
                axisPointer: {
                    show: false,
                },
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
        tooltip: tooltip,
        series: [
            {
                // 价格
                index: 0,
                name: 'price',
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
                name: 'volume',
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
                name: 'openInterest',
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

enum SeriesName {
    kLine = 'kLine',
    tickVolume = 'tickVolume',
}

/**
 * k线图
 * @param instrument 
 * @param interval 
 * @param chartData 
 * @returns 
 */
export const createKLine = (instrument: string | undefined, interval: number, chartData: IChartKLine | undefined) => {
    const element = document.getElementById('eChart');
    const oldChart =  ECharts.getInstanceByDom(element as HTMLDivElement);
    if (oldChart) {
        oldChart.dispose();
    }
    const chart = ECharts.init(element as HTMLDivElement);

    const tooltip = {
        show: true,
        trigger: 'axis',
        triggerOn: 'mousemove | click',
        confine: true,
        className: styles.toolTip,
        transitionDuration: 0,
        axisPointer: {
            axis: 'y',
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
                if (item.seriesName ===  SeriesName.kLine) {
                    kLine = item;
                    break;
                }
            }

            if (kLine === undefined) {
                return [];
            }

        
            // time html
            const {axisValue, value} = kLine;
            const timeHtmls = [
                '<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%">',
                '<div style="display:flex;flex-direction:row;justify-content:space-between"><div>Time: </div> ' +
                axisValue +
                    '</div>',
            ];

            if (!chartData || !value) {
                return;
            }
            
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
                axisPointer: {
                    show: true,
                    label: {
                        show: true,
                    },
                },
                data: chartData?.times,
            },
        ],
        yAxis: [
            {
                // k线
                scale: true,
                splitArea: {
                    show: true
                }
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
                axisPointer: {
                    show: true,
                },
            },
            {
                // 持仓量
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                axisLabel: {
                    formatter: (value: number) => {
                        return value;
                    },
                },
                axisPointer: {
                    show: false,
                },
            },
        ],
        tooltip: tooltip,
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
        series: [
            {
                // K线图
                index: 0,
                name: SeriesName.kLine,
                type: 'candlestick',
                xAxisIndex: 0,
                yAxisIndex: 0,
            },
            {
                // 成交量
                index: 1,
                name: SeriesName.tickVolume,
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
                name: 'openInterest',
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