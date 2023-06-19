import { InstrumentModel } from '@/models/InstrumentListState';
import {
    getTimeByInstrument,
    IChartData,
    IChartKLine,
} from '@/models/models/InstrumentModel';
import { requestFuture } from '@/services/requests/requestFuture';
import { PageContainer } from '@ant-design/pro-components';
import { Button, DatePicker, Select } from 'antd';
import * as ECharts from 'echarts';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, createKLine } from './EChart';
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
    const loadInfo = async (_instrumentId: string, abort?: AbortController) => {
        const response = await requestFuture.instrumentInfo(_instrumentId, abort);
        if (!response) {
            return;
        }
        
        setInfo(response);
        return response;
    }

    const loadData = (instrument: string, interval: number, tradingDay: moment.Moment) => {
        const abort = new AbortController();
        // 合约详情
        loadInfo(instrument, abort).then( info => {
            if (!info) {
                return;
            }

            load(info, interval, tradingDay, undefined, abort);
        });

        return abort;
    }

    const loadPeriod = async(instrument: string, interval: number, tradingDay: moment.Moment) => {
        const _tradingDay = tradingDay.format('YYYYMMDD');
        const response = await requestFuture.period(instrument, interval, _tradingDay);
        if (!response) {
            return;
        }

        const kLine: IChartKLine = {
            times: [],
            values: [],
            tickVolumes: [],
            openInterests: [],
        };
        response?.forEach(item  => {
            kLine.times.push(item.tradingActionTime);
            kLine.values.push([item.openPrice, item.closePrice, item.lowestPrice, item.highestPrice, item.tickVolume, item.openInterest]);
            kLine.tickVolumes.push(item.tickVolume);
            kLine.openInterests.push(item.openInterest);
        });

        // createKLine(instrument, 60 , kLine);
        return kLine;        
    }

    // MARK: - 加载合约行情数据 method
    /**
     * 加载行情数据
     * @param instrument
     * @param interval
     * @param tradingDay
     * @param index
     * @param abort
     * @returns
     */
    const load = async (
        instrument: InstrumentModel,
        interval: number,
        tradingDay?: moment.Moment,
        index?: number,
        abort?: AbortController,
    ) => {
        const _tradingDay = tradingDay?.format('YYYYMMDD');

        // 构建chart数据
        const _times = getTimeByInstrument(instrument.instrumentID, interval);
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

        // 更新chart
        // const chart = getChart();
        // chart?.setOption(
        //     // 时间轴
        //     { xAxis: { data: _chartData.times } },
        // );
        // chart?.showLoading();
        requestFuture.marketList(
            _chartData,
            interval,
            instrument,
            _tradingDay,
            index,
            abort,
        ).then( response => {
            // chart?.hideLoading();
            if (!response) {
                return;
            }
            
            const chart = createChart(instrument.instrumentID, interval, response);
            chart?.setOption({
                xAxis: { data: _chartData.times },
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
        });
        

        return abort;
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

    // MARK: --- echart init ---
    /**
     * 创建echart
     */
    

    const clickPeriod = (period: string) => {
        // if (!instrumentRef.current || !tradingDay) {
        //     return;
        // }
        setPeriodSelected(period);
    };

    // MARK: - --- effect ---
    // MARK: - effect init
    useEffect(() => {
        // createChart(instrumentRef.current, intervalRef.current, chartDataRef.current);

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
       
        const abort = loadData(instrumentSelected, intervalRef.current, tradingDay);
        return () => {
            abort.abort();
        };
    }, [instrumentSelected, tradingDay]);

    useEffect(() => {
        if (!instrumentSelected || !tradingDay) {
            return;
        }
        if (periodSelected === 'TK') {
            createChart(instrumentSelected, 60, chartDataRef.current)
            loadData(instrumentSelected, 500, tradingDay);
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

        console.log('periodSelected: ', periodSelected);
        const chart = createKLine(instrumentSelected, period, chartDataRef.current);
        (async () => {
            const chartData = await loadPeriod(instrumentSelected, period, tradingDay);
            console.log('chartData: ', chartData);
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
            })
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
