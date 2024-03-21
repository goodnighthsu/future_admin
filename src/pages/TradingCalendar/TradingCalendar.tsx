
import React, { useEffect, useState } from 'react';
import { useModel } from '@umijs/max';
import { PageStateEnum } from '@/models/AppState';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Calendar, Select, Switch } from 'antd';
import moment from 'moment';
import styles from './TradingCalendar.less';
import { requestConfig } from '@/services/requests/requestConfig';
import { HistoryModel } from '@/models/models/HistoryModel';
import { SysPermissionEnum, auth } from '@/models/models/SysPermissionModel';

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

    const {selectedYear, updateSelectedYear} = useModel(PageStateEnum.tradingCalendar);

    const [year] = useState<number>(new Date().getFullYear());
    const [months, setMonths] = useState<string[]>(monthStrings);
    const [tradingDays, setTradingDays] = useState<string[]>([]);
    const [histories, setHistories] = useState<HistoryModel[]>([]);
    const [holidays, setHolidays] = useState<string[]>([]);
    /**
     * 编辑模式
     */
    const [isEdit, setIsEdit] = useState<boolean>(false);

    // methods
    const load = async (year: number) => {
        const tradingDays = await requestConfig.tradingDays(year);
        if (tradingDays) {
            setTradingDays(tradingDays);
        }

        const histories = await requestConfig.history();
        if (histories) {
            setHistories(histories);
        }
    }

    /**
     * 修改交易日
     */
    const changeHoliday = (value: moment.Moment, month: moment.Moment, holidays: string[]) => {
        const day = value.format('YYYYMMDD');
        let _holidays = holidays;
        if (holidays.includes(day)) {
            _holidays = holidays.filter(v => v !== day);
        }else{
            _holidays.push(day);
        }
        setHolidays(_holidays);
    }

    /**
     * 点击提交，保存交易日
     * @param year 
     * @param holiday 
     * @returns 
     */
    const clickSubmit = async( year: number, holidays: string[]) => {
        const response = await requestConfig.tradingDaysUpdate(year, holidays.join(','));
        if (!response) {
            return;
        }
        load(year);
        setIsEdit(false);
    }

    const dateFullCellRender = (value: moment.Moment, isEdit: boolean, holidays: string[]) => {
        let styles = {backgroundColor: 'white'};
        const day = value.format('YYYYMMDD');
        if (isEdit) {
            // 编辑模式
            if (holidays.includes(day)){
                styles.backgroundColor = 'red';
            }
            return <div style={styles}>{value.format('DD')}</div>
        }

        // 非编辑

        const now = moment().format('YYYYMMDD');
        if (histories.find(h => h.tradingDay ===day)) {
            // 有历史数据
            styles.backgroundColor = 'green';
        }else {
            // 没有历史数据, 是交易日
            if (tradingDays.includes(day) && day <= now) {
                styles.backgroundColor = 'red';
            }
        }
        if (day === now) 
        {
            styles.backgroundColor = '#1677ff';
        } 
        return <div style={styles}>{value.format('DD')}</div>
    }

    // effect
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
                    <div>
                        {
                            isEdit &&
                            <Button onClick={() => {clickSubmit(year, holidays)}}>保存</Button>
                        }
                        编辑:
                        <Switch value={isEdit} onChange={ value => setIsEdit(value)}
                            disabled={!auth(SysPermissionEnum.tradingCalendarUpdate)}
                        />
                    </div>
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
                                        return dateFullCellRender(value, isEdit, holidays);
                                    }}
                                    disabledDate={value => {
                                        if (isEdit) {
                                            return false;
                                        }
                                        return !tradingDays.includes(value.format('YYYYMMDD'));
                                    }}
                                    onSelect={(value) => {
                                        changeHoliday(value, _month, holidays);
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