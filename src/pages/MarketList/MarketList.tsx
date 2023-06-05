import { InstrumentModel } from '@/models/InstrumentListState';
import {
    getIndexByActionTime,
    getTimeByInstrument,
    IChartData,
} from '@/models/models/InstrumentModel';
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
    const instrumentRef = useRef<string | undefined>();
    const intervalRef = useRef<number>(500);
    // 合约详情
    const [info, setInfo] = useState<InstrumentModel>();
    // 合约市场数据
    const chartDataRef = useRef<IChartData | undefined>();

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

    // MARK: - 加载合约详情
    /**
     * 加载合约详情
     * @param instrumentId
     * @param tradingDay
     * @returns
     */
    const loadInfo = async (_instrumentId: string, _tradingDay: string) => {
        const response = await requestFuture.instrumentInfo(_instrumentId, _tradingDay);
        if (!response) {
            return;
        }
        
        setInfo(response);
    }

    // MARK: - 加载合约行情数据 method
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
        const chart = getChart();
        chart?.showLoading();
        const response: IChartData | undefined = await requestFuture.marketList(
            abort,
            _data,
            interval,
            instrumentId,
            _tradingDay,
            index,
        );
        chart?.hideLoading();
        if (!response) {
            return;
        }
        
        chart?.setOption({
            series: [
                {
                    data: response.prices,
                },
                {
                    data: response.tickVolumes,
                },
                {
                    data: response.openInterests,
                },
                {
                    data: response.funds
                }
            ],
        });
        //
        chartDataRef.current = response;
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

    // MARK: --- echart init ---
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

                if (!instrumentRef.current) {
                    return;
                }

                const dataIndex = getIndexByActionTime(
                    instrumentRef.current,
                    '1980-01-01 ' + obj.axisValue,
                    intervalRef.current,
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

                const chartData: IChartData | undefined = chartDataRef.current;
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
                const positionHtmls = [
                    '<div style="height: 8px"></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask5: ' +
                        orderBook.askPrice5 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.askVolume5 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask4: ' +
                        orderBook.askPrice4 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.askVolume4 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask3: ' +
                        orderBook.askPrice3 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.askVolume3 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask2: ' +
                        orderBook.askPrice2 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.askVolume2 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Ask1: ' +
                        orderBook.askPrice1 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.askVolume1 +
                        '</div></div>',
                    '<div style="height: 8px"></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid1: ' +
                        orderBook.bidPrice1 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.bidVolume1 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid2: ' +
                        orderBook.bidPrice2 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.bidVolume2 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid3: ' +
                        orderBook.bidPrice3 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.bidVolume3 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid4: ' +
                        orderBook.bidPrice4 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.bidVolume4 +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between"><div>Bid5: ' +
                        orderBook.bidPrice5 +
                        '</div><div style="text-align:right;width:80px">' +
                        orderBook.bidVolume5 +
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
                    '<div style="display:flex; flex-direction:row;justify-content:space-between">Open Interest: <div style="text-align:right">' +
                        openInterest +
                        '</div></div>',
                    '<div style="display:flex; flex-direction:row;justify-content:space-between">沉淀资金: <div style="text-align:right">' +
                        fund +
                        '</div></div>',
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
                ,
                {
                    // 沉淀资金
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
     * 选择合约加载市场行情
     */
    useEffect(() => {
        instrumentRef.current = instrumentSelected;
        if (!instrumentSelected || !tradingDay) {
            return;
        }

        // 构建chart数据
        const _times = getTimeByInstrument(instrumentSelected, intervalRef.current);
        if (!_times) {
            return;
        }

        const _chartData: IChartData = {
            times: _times,
            prices: new Array(_times.length),
            tickVolumes: new Array(_times.length),
            volumes: new Array(_times.length),
            openInterests: new Array(_times.length),
            funds: new Array(_times.length),
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

        // 合约详情
        loadInfo(instrumentSelected, tradingDay?.format('YYYYMMDD'));

        // 合约市场行情
        load(
            abort,
            _chartData,
            intervalRef.current,
            instrumentSelected,
            tradingDay?.format('YYYYMMDD'),
        );
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
                <div>
                    合约名称：{info?.instrumentName} 合约乘数：{info?.volumeMultiple} 创建日期：{info?.createDate} 到期日期：{info?.expireDate}
                </div>
                <div id="eChart" className={styles.chart}></div>
            </div>
        </PageContainer>
    );
};

export default MarketList;
