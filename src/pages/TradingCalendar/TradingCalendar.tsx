
import React, { useEffect, useState } from 'react';
import { useModel } from '@umijs/max';
import { PageState } from '@/models/AppState';
import { PageContainer, useDeepCompareEffect } from '@ant-design/pro-components';
import { Calendar, Select } from 'antd';
import moment from 'moment';
import styles from './TradingCalendar.less';
import { requestConfig } from '@/services/requests/requestConfig';

const monthStrings = [
    '一', '二', '三', '四', 
    '五', '六', '七', '八', 
    '九', '十', '十一', '十二'
];

/**
 * 交易日历
 * @param props 
 * @returns 
 */
const TradingCalendar:React.FC = (props) => {

    const {selectedYear, updateSelectedYear} = useModel(PageState.tradingCalendar);

    const [year] = useState<number>(new Date().getFullYear());
    const [months, setMonths] = useState<string[]>(monthStrings);
    const [tradingDays, setTradingDays] = useState<string[]>([]);

    // methods
    const load = async (year: number) => {
        const tradingDays = await requestConfig.tradingDays(year);
        if (tradingDays) {
            setTradingDays(tradingDays);
        }
    }

    useEffect(() => {
        load(year);
    }, []);

    return (
        <PageContainer>
            <div className={styles.page}>
                <div className={styles.toolbar}>
                    <Select className={styles.toolbar_select}
                        value={selectedYear} 
                        onChange={updateSelectedYear} />
                </div>
                <div className={styles.page_container}>
                {
                    months.map((month, index) => {
                        const _month =  moment().year(year).month(index);
                        return (
                            <div  className={styles.page_container_month} key={index}>
                                <Calendar fullscreen={false} value={_month} mode='month'
                                    headerRender={() => {
                                        return <div className={styles.page_container_monthHeader}>{month}月</div>
                                    }}
                                    dateFullCellRender={value => {
                                        return <div>{value.format('DD')}</div>
                                    }}
                                    disabledDate={value => {
                                        return !tradingDays.includes(value.format('YYYYMMDD'));
                                    }}
                                />
                            </div>
                        );
                    })
                }
                </div>
            </div>
        </PageContainer>
    )
}

export default TradingCalendar;