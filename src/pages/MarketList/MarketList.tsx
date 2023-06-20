import { InstrumentModel } from '@/models/InstrumentListState';
import {
    getTimeByInstrument,
    IChartData
} from '@/models/models/InstrumentModel';
import { requestFuture } from '@/services/requests/requestFuture';
import { PageContainer } from '@ant-design/pro-components';
import { Button, DatePicker, Select } from 'antd';
import * as ECharts from 'echarts';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, createChartTooltip, createKLine } from './EChart';
import styles from './MarketList.less';

const MarketList: React.FC = (props) => {
    // MARK: - ----------------- state-----------------
    const [periodSelected, setPeriodSelected] = useState<string>('TK');
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
    const chartDataRef = useRef<IChartData>({});

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
    const loadInfo = async (_instrumentId: string, abort?: AbortController) => {
        const response = await requestFuture.instrumentInfo(_instrumentId, abort);
        if (!response) {
            return;
        }
        
        setInfo(response);
        return response;
    }

    const loadData = async (instrument: string, interval: number, tradingDay: moment.Moment) => {
        // 合约详情
        const info = await loadInfo(instrument);
        if (!info) {
            return;
        }
        return load(info, interval, tradingDay, undefined);
    }

    const loadPeriod = async(instrument: string, interval: number, tradingDay: moment.Moment) => {
        const _tradingDay = tradingDay.format('YYYYMMDD');
        const response = await requestFuture.period(instrument, interval, _tradingDay);
        if (!response) {
            return;
        }

        const kLine: IChartData = {
            times: [],
            values: [],
            tickVolumes: [],
            openInterests: [],
        };
        response?.forEach(item  => {
            kLine.times.push(item.tradingActionTime);
            (kLine.values ?? []).push([item.openPrice, item.closePrice, item.lowestPrice, item.highestPrice, item.tickVolume, item.openInterest]);
            kLine.tickVolumes.push(item.tickVolume);
            kLine.openInterests.push(item.openInterest);
        });

        return kLine;        
    }

    // MARK: - 加载合约行情数据 method
    /**
     * 加载行情数据
     * @param instrument
     * @param interval
     * @param tradingDay
     * @param index
     * @returns
     */
    const load = async (
        instrument: InstrumentModel,
        interval: number,
        tradingDay?: moment.Moment,
        index?: number,
    ) => {
        const _tradingDay = tradingDay?.format('YYYYMMDD');

        const response = await requestFuture.marketList(
            instrument,
            interval,
            _tradingDay,
            index,
        );

        return response;
    };

    // MARK: - 获取交易日合约列表 method
    /**
     * 获取交易日合约列表
     * @param tradingDay 交易日
     * @returns
     */
    const loadInstrumentIds = async (_tradingDay: moment.Moment | null) => {
        const response = await requestFuture.instruments();
        if (!response) {
            return;
        }

        setInstrumentsIds(response);
    };

    const clickPeriod = (period: string) => {
        setPeriodSelected(period);
    };

    // MARK: - --- effect ---
    // MARK: - effect init
    useEffect(() => {
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
    useEffect(() => {
        if (!instrumentSelected || !tradingDay) {
            return;
        }
        if (periodSelected === 'TK') {
            const chart = createChart(instrumentSelected, 60);
            chart.showLoading();
            (async () => {
               
                const chartData = await loadData(instrumentSelected, 500, tradingDay);
                if (!chartData) {
                    return;
                }
                const toolTip = createChartTooltip(instrumentSelected, 500, chartData);
                chart.setOption({
                    xAxis: {data:  chartData?.times},
                    tooltip: toolTip,
                    series: [
                        {
                            data: chartData?.prices
                        },
                        {
                            data: chartData?.tickVolumes
                        },
                        {
                            data: chartData?.openInterests
                        },
                        {
                            data: chartData?.funds
                        },
                    ]
                });
                chart.hideLoading();
            })();
            return;
        }

        let period = 5;
        if (periodSelected === '5s') {
            period = 5;
        } else if (periodSelected === '30s') {
            period = 30;
        }
        else if (periodSelected === '1m') {
            period = 60;
        }
        else if (periodSelected === '5m') {
            period = 300;
        }
        const chart = createKLine(instrumentSelected, period, chartDataRef);
        chart.showLoading();
        (async () => {
            const chartData = await loadPeriod(instrumentSelected, period, tradingDay);
            chartDataRef.current = chartData;
            chart.setOption({
                xAxis: { data: chartData?.times },
                series: [
                    {
                        // K线图
                        data: chartData?.values,
                    },
                    {
                        // 成交量
                        data: chartData?.tickVolumes,
                    },
                    {
                        // 持仓量
                        data: chartData?.openInterests,
                    }
                ],
            });
            chart.hideLoading();
        })();
    }, [periodSelected, instrumentSelected, tradingDay]);


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
                <div className={styles.instrumentInfo}>
                    <span>合约名称：</span>{info?.instrumentName}
                    <span>合约乘数：</span>{info?.volumeMultiple}
                    <span>创建日期：</span>{info?.createDate}
                    <span>到期日期：</span>{info?.expireDate}
                </div>
                <div className={styles.period}>
                    {
                        ['TK', '5s', '30s', '1m', '5m'].map((item) => {
                            return <Button key={item} type='link'
                                onClick={() => clickPeriod(item)}
                            >{item}</Button>
                        })
                    }
                </div>
                <div id="eChart" className={styles.chart}></div>
            </div>
        </PageContainer>
    );
};

export default MarketList;
