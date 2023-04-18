import { getTimeByInstrument, IChartData, IOrderBook } from '@/models/models/InstrumentModel';
import { requestFuture } from '@/services/requests/requestFuture';
import { PageContainer } from '@ant-design/pro-components';
import { DatePicker, Select } from 'antd';
import * as ECharts from 'echarts';
import { isArray } from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import styles from './MarketList.less';

const MarketList: React.FC = (props) => {
    // MARK: - ----------------- state-----------------

    const [tradingDay, setTradingDay] = useState<moment.Moment | null>(moment());
    // 所有合约id
    const [instrumentIds, setInstrumentsIds] = useState<string[]>([]);
    //
    const [instrumentSelected, setInstrumentSelected] = useState<string | undefined>();
    // 合约数据
    // const [data, setData] = useState<IChartData>({ prices: [], times: [], volumes: [] });
    const orderBooksRef = useRef<IOrderBook[]>([]);

    // MARK: - --- methods ---
    /**
     * 获取chart
     */
    const getChart = () => {
        const element = document.getElementById('eChart');
        if (element === null) {
            return null;
        }
        return ECharts.getInstanceByDom(element);
    };

    // MARK: -  load 加载行情数据 method
    /**
     * 加载行情数据
     * @param abort
     * @param instrumentId
     * @param tradingDay
     * @param index
     * @returns
     */
    const load = async (
        abort: AbortController,
        _data: IChartData,
        interval: number,
        instrumentId: string,
        _tradingDay?: string,
        index?: number,
    ) => {
        const response:IChartData | undefined = await requestFuture.marketList(
            abort,
            _data,
            interval,
            instrumentId,
            _tradingDay,
            index,
        );
        if (!response) {
            return;
        }
        const chart = getChart();
        chart?.setOption({
            series: [
                {
                    data: _data.prices,
                },
                {
                    data: _data.volumes,
                },
            ],
        });

        // 盘口数据
        orderBooksRef.current = response.orderBooks;
    };

    // MARK: - 获取交易日合约列表 method
    /**
     * 获取交易日合约列表
     * @param tradingDay 交易日
     * @returns
     */
    const loadInstrumentIds = async (_tradingDay: moment.Moment | null) => {
        if (!_tradingDay) {
            setInstrumentsIds([]);
            return;
        }
        const response = await requestFuture.instrumentsByTradingDay(
            _tradingDay?.format('YYYYMMDD'),
        );
        if (!response) {
            return;
        }

        setInstrumentsIds(response);
    };

    /**
     * 创建echart
     */
    const createChart = () => {
        const element = document.getElementById('eChart');
        const chart = ECharts.init(element as HTMLDivElement);

        // 提示栏
        const tooltip = {
            show: true,
            trigger: 'axis',
            triggerOn: 'mousemove | click',
            confine: true,
            className: styles.toolTip,
            transitionDuration: 0,
            // 自定义tool tip
            formatter: (params: any) => {
                if (!isArray(params) || params.length == 0) {
                    return [];
                }

                let obj = undefined;
                for (let i = params.length - 1; i >= 0; i--) {
                    const item = params[i];
                    if (item.axisType == 'xAxis.category') {
                        obj = item;
                        break;
                    }
                }

                if (obj === undefined) {
                    return [];
                }

                // time html
                const time = obj.axisValue;
                const timeHtmls = [
                    '<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%">',
                    '<div style="display:flex;flex-direction:row;justify-content:space-between"><div>Time: </div> ' +
                    time +
                    '</div>',
                ];

                const dataIndex = obj.dataIndex;

                console.log('orderbook: ', orderBooksRef.current[dataIndex]);
                const option = chart?.getOption() as any;
                // console.log(chart.getOption().series[0].data[dataIndex]);
                const series = option.series;
                // position html
                const payload = series[0].data[dataIndex] ?? [];
                let positionHtmls: string[] = [];
                if (payload.length > 0 && payload[1]) {
                    const price = payload[1];
                    const tickVolume = payload[2];
                    const volume = payload[23];
                    positionHtmls = [
                        '<div style="height: 8px"></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask5: ' +
                        payload[21] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[22] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask4: ' +
                        payload[19] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[20] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask3: ' +
                        payload[17] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[18] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask2: ' +
                        payload[15] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[16] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask1: ' +
                        payload[13] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[14] +
                        '</div></div>',
                        '<div style="height: 8px"></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid1: ' +
                        payload[3] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[4] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid2: ' +
                        payload[5] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[6] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid3: ' +
                        payload[7] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[8] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid4: ' +
                        payload[9] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[10] +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid5: ' +
                        payload[11] +
                        '</div><div style="text-align:right;width:80px">' +
                        payload[12] +
                        '</div></div>',
                        '<div style="height: 8px"></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between">Last Price: <div style="text-align:right">' +
                        price +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between">Tick Vol: <div style="text-align:right">' +
                        tickVolume +
                        '</div></div>',
                        '<div style="display:flex; flex-direction:row;justify-content:space-between">Volume: <div style="text-align:right">' +
                        volume +
                        '</div></div>',
                    ];
                }

                // param html
                const getParamHtml = (serie: any) => {
                    if (serie.name == undefined) {
                        return undefined;
                    }
                    if (serie.data == undefined) {
                        return undefined;
                    }
                    const item = serie.data[dataIndex] ?? [];
                    const value = item[1];
                    if (value == undefined) {
                        return undefined;
                    }
                    const paramName = serie.name;

                    const html =
                        '<div style="display:flex; flex-direction:row;justify-content:space-between">' +
                        paramName +
                        ': <div style="text-align:right">' +
                        value +
                        '</div></div>';

                    return html;
                };


                // tool tip
                const toolTipHtmls = [
                    ...timeHtmls,
                    ...positionHtmls,
                    '</div>',
                ];

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
        }
        const option = {
            title: { text: '合约' },
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
                    axisLabel: {
                        formatter: (value: number) => {
                            return value;
                        },
                    },
                    axisPointer: {
                        show: true,
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
                    symbol: 'none',
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
                    sampling: 'lttb',
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
            ],
        };
        chart.setOption(option);
        return chart;
    };

    // MARK: - --- effect ---
    // MARK: - effect init
    useEffect(() => {
        createChart();

        // window resize event
        const resize = (window.onresize = () => {
            const chart = getChart();
            chart?.resize();
        });
        window.addEventListener('resize', resize);

        return () => {
            window.onresize = null;
        };
    }, []);

    // MARK: - effect tradingDay
    useEffect(() => {
        // 加载合约
        loadInstrumentIds(tradingDay);
    }, [tradingDay]);

    // MARK: - effect 构建chart数据
    /**
     * 合约变更后更新chart 时间轴
     */
    useEffect(() => {
        if (!instrumentSelected) {
            return;
        }
    }, [instrumentSelected]);

    /**
     * 选择合约加载市场行情
     */
    useEffect(() => {
        if (!instrumentSelected || !tradingDay) {
            return;
        }

        // 构建chart数据
        const _times = getTimeByInstrument(instrumentSelected, 500);
        if (!_times) {
            return;
        }

        const _chartData: IChartData = {
            times: _times,
            prices: new Array(_times.length),
            volumes: new Array(_times.length),
            orderBooks: new Array(_times.length),
        };
        // setData(_chartData);

        // 更新chart
        const chart = getChart();
        chart?.setOption(
            // 时间轴
            { xAxis: { data: _chartData.times } },
        );

        const abort = new AbortController();
        load(abort, _chartData, 500, instrumentSelected, tradingDay?.format('YYYYMMDD'));
        return () => {
            abort.abort();
        };
    }, [instrumentSelected, tradingDay]);

    // MARK: - --- render ---
    return (
        <PageContainer>
            <div className={styles.page}>
                <div className={styles.toolbar}>
                    <div className={styles.toolbar_left}></div>
                    <div className={styles.toolbar_right}>
                        <DatePicker value={tradingDay} onChange={(value) => setTradingDay(value)} />
                        <Select
                            className={styles.instrumentSelect}
                            placeholder="合约"
                            showSearch
                            options={instrumentIds.map((item) => {
                                return { label: item, value: item };
                            })}
                            onChange={(value) => setInstrumentSelected(value as string)}
                        />
                    </div>
                </div>
                <div id="eChart" className={styles.chart}></div>
            </div>
        </PageContainer>
    );
};

export default MarketList;
