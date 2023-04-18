import { getTimeByInstrument, IChartData } from '@/models/models/InstrumentModel';
import { requestFuture } from '@/services/requests/requestFuture';
import { PageContainer } from '@ant-design/pro-components';
import { DatePicker, Select } from 'antd';
import * as ECharts from 'echarts';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styles from './MarketList.less';

const MarketList: React.FC = (props) => {
    // MARK: - ----------------- state-----------------

    const [tradingDay, setTradingDay] = useState<moment.Moment | null>(moment());
    // 所有合约id
    const [instrumentIds, setInstrumentsIds] = useState<string[]>([]);
    //
    const [instrumentSelected, setInstrumentSelected] = useState<string | undefined>();
    // 合约数据
    const [data, setData] = useState<IChartData>({ prices: [], times: [], volumes: [] });

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
        const response = await requestFuture.marketList(
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
        };
        setData(_chartData);

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
