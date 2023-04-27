import moment from 'moment';

/**
 *  合约
 */
export interface InstrumentModel {
    ///交易所代码
    exchangeID: string;
    ///合约名称
    instrumentName: string;
    ///产品类型
    productClass: string;
    ///交割年份
    deliveryYear: number;
    ///交割月
    deliveryMonth: number;
    ///市价单最大下单量
    maxMarketOrderVolume: number;
    ///市价单最小下单量
    minMarketOrderVolume: number;
    ///限价单最大下单量
    maxLimitOrderVolume: number;
    ///限价单最小下单量
    minLimitOrderVolume: number;
    ///合约数量乘数
    volumeMultiple: number;
    ///最小变动价位
    priceTick: number;
    ///创建日
    createDate: string;
    ///上市日
    openDate: string;
    ///到期日
    expireDate: string;
    ///开始交割日
    startDelivDate: string;
    ///结束交割日
    endDelivDate: string;
    ///合约生命周期状态
    instLifePhase: string;
    ///当前是否交易
    isTrading: number;
    ///持仓类型
    positionType: string;
    ///持仓日期类型
    positionDateType: string;
    ///多头保证金率
    longMarginRatio: number;
    ///空头保证金率
    shortMarginRatio: number;
    ///是否使用大额单边保证金算法
    maxMarginSideAlgorithm: string;
    ///执行价
    strikePrice: number;
    ///期权类型
    optionsType: string;
    ///合约基础商品乘数
    underlyingMultiple: number;
    ///组合类型
    combinationType: string;
    ///合约代码
    instrumentID: string;
    ///合约在交易所的代码
    exchangeInstID: string;
    ///产品代码
    productID: string;
    ///基础商品代码
    underlyingInstrID: string;

    isSubscribe: boolean;
}

/**
 * 合约echart显示数据
 */
export interface IChartData {
    // 时间轴
    times: string[];
    // 价格
    prices: number[];
    // 成交量
    volumes: number[];
    // tick volume:
    tickVolumes: number[];
    // 5档盘口
    orderBooks: IOrderBook[];
}

/**
 * 5档盘口
 */
export interface IOrderBook {
    bidPrice1?: number;
    bidVolume1?: number;
    bidPrice2?: number;
    bidVolume2?: number;
    bidPrice3?: number;
    bidVolume3?: number;
    bidPrice4?: number;
    bidVolume4?: number;
    bidPrice5?: number;
    bidVolume5?: number;
    askPrice1?: number;
    askVolume1?: number;
    askPrice2?: number;
    askVolume2?: number;
    askPrice3?: number;
    askVolume3?: number;
    askPrice4?: number;
    askVolume4?: number;
    askPrice5?: number;
    askVolume5?: number;
}

/**
 * 交易日市场返回数据格式
 */
export type MarketData = string[][];

/**
 * 交易时段
 */
const schedule1 = ['21:00', '23:00', '9:00', '10:15', '10:30', '11:30', '13:30', '15:00'];
const schedule2 = ['9:00', '10:15', '10:30', '11:30', '13:30', '15:00'];
const schedule3 = ['21:00', '01:00', '9:00', '10:15', '10:30', '11:30', '13:30', '15:00'];
const schedule4 = ['21:00', '02:30', '9:00', '10:15', '10:30', '11:30', '13:30', '15:00'];
const schedule5 = ['9:30', '11:30', '13:00', '15:00'];
const schedule6 = ['9:15', '11:30', '13:00', '15:15'];

/**
 *
 * @param timeString 交易时间字符串，格式为HH:mm
 * @returns
 */
const getDate = (timeString: string): Date => {
    const times = timeString.split(':');
    const date = new Date(0);
    date.setHours(Number(times[0]));
    date.setMinutes(Number(times[1]));
    return date;
};

/**
 * 按交易时间段创建创建交易时间轴
 * @param schedule
 * @param interval 时间间隔
 * @returns
 */
export const createTimes = (schedule: string[], interval: number): string[] => {
    const times = [];
    for (let index = 0; index < schedule.length; index = index + 2) {
        const openTimeString = schedule[index];
        const openTime = getDate(openTimeString).getTime();
        const closeTimeString = schedule[index + 1];
        let closeTime = getDate(closeTimeString).getTime();
        if (closeTime < openTime) {
            // 跨天调整
            closeTime += 60 * 60 * 24 * 1000;
        }
        let time = openTime;
        while (time != closeTime) {
            times.push(moment(time).format('HH:mm:ss.SSS'));
            time += interval;
        }
        times.push(moment(time).format('HH:mm:ss.SSS'));
    }

    return times;
};

/**
 * 交易时间配置
 * @param schedule 交易时间段
 * @param products 交易品种
 */
interface ITimeConfig {
    schedule: string[];
    products: string[];
}

// 交易时间配置
// 9:00-10:15 10:30-11:30 13:30-15:00 21:00-23:00
const timeConfig1: ITimeConfig = {
    schedule: schedule1,
    products: [
        'FG',
        'SA',
        'MA',
        'SR',
        'TA',
        'RM',
        'OI',
        'CF',
        'CY',
        'PF',
        'ZC', // 郑商所
        'i',
        'j',
        'jm',
        'a',
        'b',
        'm',
        'p',
        'y',
        'c',
        'cs',
        'pp',
        'v',
        'eb',
        'eg',
        'pg',
        'rr',
        'l', // 大连交易所
        'fu',
        'ru',
        'bu',
        'sp',
        'rb',
        'hc', // 上期所
        'lu',
        'nr', // 能源
    ],
};

// 9:00-10:15 10:30-11:30 13:30-15:00
const timeConfig2: ITimeConfig = {
    schedule: schedule2,
    products: [
        'SM',
        'SF',
        'WH',
        'JR',
        'LR',
        'PM',
        'RI',
        'RS',
        'PK',
        'UR',
        'CJ',
        'AP', // 郑商所
        'bb',
        'fb',
        'lh',
        'jd', // 大连交易所
        'wr', // 上期所
    ],
};
// 9:00-10:15 10:30-11:30 13:30-15:00 21:00-01:00
const timeConfig3: ITimeConfig = {
    schedule: schedule3,
    products: [
        'cu',
        'pb',
        'al',
        'zn',
        'sn',
        'ni',
        'ss', // 上期所
        'bc', // 能源
    ],
};

// 9:00-10:15 10:30-11:30 13:30-15:00 21:00-02:30
const timeConfig4: ITimeConfig = {
    schedule: schedule4,
    products: [
        'au',
        'ag', // 上期所
        'sc', // 能源
    ],
};

// 9:30-11:30 13:00-15:00
const timeConfig5: ITimeConfig = {
    schedule: schedule5,
    products: [
        'IF',
        'IC',
        'IH', // 中金
    ],
};

// 9:15-11:30 13:00-15:15
const timeConfig6: ITimeConfig = {
    schedule: schedule6,
    products: [
        'T',
        'TF',
        'TS', // 中金
    ],
};

// 所有合约交易时间配置
const timeConfig = [timeConfig1, timeConfig2, timeConfig3, timeConfig4, timeConfig5, timeConfig6];

/**
 * 按合约获取交易时间段
 */
export const getScheduleByInstrument = (instrument: string): string[] | undefined => {
    if (!instrument) {
        return undefined;
    }
    const matchs = instrument.match(/^\w{1,2}/);
    if (matchs?.length != 1) {
        return undefined;
    }
    const code = matchs[0];

    // 匹配交易时间配置
    let schedule: string[] = [];
    timeConfig.forEach((config) => {
        if (config.products.includes(code)) {
            schedule = config.schedule;
        }
    });

    return schedule;
};

/**
 * 按合约获取交易时间轴
 * @param instrument 合约编号
 * @param interval 时间间隔，单位毫秒，默认500毫秒
 * @returns
 */
export const getTimeByInstrument = (
    instrument: string,
    interval: number = 500,
): string[] | undefined => {
    const schedule = getScheduleByInstrument(instrument);
    if (!schedule) {
        return undefined;
    }
    return createTimes(schedule, interval);
};

/**
 * 按时间获取交易时间轴index
 * @param instrument
 * @param actionTimeString
 * @param tradingDates
 * @returns
 */
export const getIndexByActionTime = (
    instrument: string,
    actionTimeString: string,
    interval: number,
) => {
    //
    const schedule = getScheduleByInstrument(instrument);
    if (!schedule) {
        return undefined;
    }

    const date = moment(actionTimeString, 'YYYY-MM-DD HH:mm:ss.SSS').toDate();
    let day = 1;
    // 交易时间小于9的作为夜盘，加一天
    if (date.getHours() < 9) {
        day = 2;
    }
    const actionDate = new Date(
        1970,
        0,
        day,
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    );

    // 交易时间轴对应的index
    let index = undefined;
    // 上一个交易时间段的index
    let lastIndex = 0;
    // 按交易时间段计算index
    for (let n = 0; n < schedule.length; n = n + 2) {
        // 开盘时间
        const openTimeString = schedule[n];
        const openTime = getDate(openTimeString).getTime();
        // 收盘时间
        const closeTimeString = schedule[n + 1];
        let closeTime = getDate(closeTimeString).getTime();
        if (closeTime < openTime) {
            // 跨天调整
            closeTime += 60 * 60 * 24 * 1000;
        }

        if (actionDate.getTime() >= openTime && actionDate.getTime() <= closeTime) {
            index = lastIndex + Math.floor((actionDate.getTime() - openTime) / interval);
            break;
        }

        lastIndex += (closeTime - openTime) / interval + 1;
    }

    return index;
};
