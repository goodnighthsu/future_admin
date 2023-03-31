import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useModel } from "@umijs/max";
import { PageContainer } from "@ant-design/pro-components";
import { Checkbox, Input, message, Table } from "antd";
import styles from './InstrumentList.less';
import { requestFuture } from '@/services/requests/requestFuture';
import { InstrumentModel } from '@/models/InstrumentListState';
import Pagination from 'antd/es/pagination';
import { tableHeight } from '@/models/AppState';
import Button from 'antd/es/button';
import { debounce } from 'lodash';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import Select from 'antd/es/select';

/**
 * 合约
 * @param props 
 * @returns 
 */
const InstrumentList:React.FC = (props) => {
    // useModel
    const { page, updatePaging, pageSize  } = useModel('InstrumentListState');

    // state
    const [datas, setDatas] = useState<InstrumentModel[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string | undefined>(undefined);
    const [subscribeFilter, setSubscribeFilter] = useState<boolean | undefined>(undefined);
    // 当前选择的合约
    const [selecteds, setSelecteds] = useState<string[]>([]);

    const tableWrapRef = useRef<HTMLDivElement | null>(null);

    // methods
    const load = async (keyword?: string, subscribeFilter?: boolean, page?: number, pageSize?: number) => {
        setLoading(true);
        const response = await requestFuture.instrumentList(
            keyword, 
            subscribeFilter === undefined ? undefined : subscribeFilter ? [true] : [false], 
            page, 
            pageSize);
        setLoading(false);
        if (!response) {
            return;
        }
        setDatas(response.data ?? []);
        setTotal(response.total ?? 0);
    }

    const loadData = useCallback(
        debounce((keyword, subscribeFilter, page, pageSize) => {
                updatePaging(page, pageSize); 
                load(keyword, subscribeFilter, page, pageSize);
            }, 500),
        []
    ) 
    
    /**
     * page chage
     * 
     * @param page 
     * @param pageSize 
     */
    const changePage = (page: number, pageSize: number) => {
        updatePaging(page, pageSize); 
        load(keyword, subscribeFilter, page, pageSize);
    }

    /**
     * 订阅
     * 
     * @param instruments
     * @returns
     */
    const clickSubscribe = async (instruments: string[]) => {
        const result = await requestFuture.subscribe(selecteds);
        if (!result) {
            return;
        }
        message.success('订阅成功');
        setSelecteds([]);
        load(keyword, subscribeFilter, 1, pageSize);
    }

    /**
     * 取消订阅
     * 
     * @param instruments
     * @returns
     */
    const clickUnsubscribe = async (instruments: string[]) => {
        const result = await requestFuture.unsubscribe(instruments);
        if (!result) {
            return;
        }
        message.success('取消订阅成功');
        setSelecteds([]);
        load(keyword, subscribeFilter, 1, pageSize);
    }

    const columns: ColumnType<InstrumentModel>[] = [
        { title: '选择', key: 'selected', width: 70,
            render: (item: InstrumentModel) => {
                return <Checkbox checked={selecteds.includes(item.instrumentID)} 
                    onChange={event => {
                    if (event.target.checked) {
                        setSelecteds([...selecteds, item.instrumentID]);
                    } else {
                        setSelecteds(selecteds.filter(id => id !== item.instrumentID));
                    }
                }} />
            }
        },
        { title: '订阅', key: 'isSubscribe', width: 70,
            render: (item: InstrumentModel) => {
                return item.isSubscribe ? '是' : '否';
            }
        },
        { title: '合约名称', dataIndex: 'instrumentName', width: 160},
        { title: '合约代码', dataIndex: 'instrumentID', width: 160},
        { title: '基础商品代码', dataIndex: 'underlyingInstrID', width: 120},
        { title: '产品类型', dataIndex: 'productClass', width: 80},
        { title: '交割年份', dataIndex: 'deliveryYear', width: 80},
        { title: '交割月', dataIndex: 'deliveryMonth', width: 80},
        { title: '市价单最大下单量', dataIndex: 'maxMarketOrderVolume', width: 140},
        { title: '市价单最小下单量', dataIndex: 'minMarketOrderVolume', width: 140},
        { title: '限价单最大下单量', dataIndex: 'maxLimitOrderVolume', width: 140},
        { title: '限价单最小下单量', dataIndex: 'minLimitOrderVolume', width: 140},
        { title: '合约数量乘数', dataIndex: 'volumeMultiple', width: 120},
        { title: '最小变动价位', dataIndex: 'priceTick', width: 120},
        { title: '创建日', dataIndex: 'createDate', width: 80},
        { title: '上市日', dataIndex: 'openDate', width: 80},
        { title: '到期日', dataIndex: 'expireDate', width: 80},
        { title: '开始交割日', dataIndex: 'startDelivDate', width: 120},
        { title: '结束交割日', dataIndex: 'endDelivDate', width: 120},
        { title: '合约生命周期状态', dataIndex: 'instLifePhase', width: 160}, 
        { title: '当前是否交易', dataIndex: 'isTrading', width: 120},
        { title: '持仓类型', dataIndex: 'positionType', width: 80},
        { title: '持仓日期类型', dataIndex: 'positionDateType', width: 120},
        { title: '多头保证金率', dataIndex: 'longMarginRatio', width: 120},
        { title: '空头保证金率', dataIndex: 'shortMarginRatio', width: 120},
        { title: '是否使用大额单边保证金算法', dataIndex: 'maxMarginSideAlgorithm', width: 200},
        { title: '执行价', dataIndex: 'strikePrice', width: 80},
        { title: '期权类型', dataIndex: 'optionsType', width: 80},
        { title: '合约基础商品乘数', dataIndex: 'underlyingMultiple', width: 140},
        { title: '组合类型', dataIndex: 'combinationType', width: 80},
        { title: '合约在交易所的代码', dataIndex: 'exchangeInstID', width: 160},
        { title: '产品代码', dataIndex: 'productID', width: 80},
        { title: '交易所代码', dataIndex: 'exchangeID', width: 100},
    ]

    // effect
    useEffect(() => {
        load(undefined, undefined, 1, pageSize);
    }, []);

    return (
        <PageContainer>
            <div className={styles.page}>
                <div className={styles.toolbar}>
                    <div className={styles.toolbar_left}>
                        <Select style={{width: '100px'}} options={[{label: '已订阅' , value: 1}, {label: '未订阅' , value: 0}]} 
                            value={subscribeFilter !== undefined ? (subscribeFilter ? 1 : 0) : undefined} 
                            allowClear={true}
                            placeholder="订阅状态"
                            onChange={(value: number | undefined) => {
                                let isSubscribe = undefined;
                                if (value !== undefined) {
                                    isSubscribe = value === 1 ? true : false;
                                }
                                setSubscribeFilter(isSubscribe);
                                // 过滤订阅状态
                                loadData(keyword, isSubscribe, 1, pageSize);
                            }}
                        />
                        <Input style={{flex: '0 0 200px'}} value={keyword}  prefix={<SearchOutlined />}
                            onChange={event => {setKeyword(event.currentTarget.value); loadData(event.currentTarget.value, subscribeFilter, 1, pageSize)}}
                        />
                    </div>
                    
                    <div className={styles.toolbar_right}>
                        <Button type='primary' disabled={selecteds.length === 0} 
                            onClick={ _ => clickSubscribe(selecteds)}>
                            添加订阅
                        </Button> 
                        <Button type='primary' disabled={selecteds.length === 0} 
                            onClick={ _ => clickUnsubscribe(selecteds)}>
                            取消订阅
                        </Button> 
                        <Pagination current={page} pageSize={pageSize} total={total} onChange={changePage}/>
                    </div>
                </div>
                <div className={styles.tableWrapper} ref={tableWrapRef}>
                    <Table className={styles.table} size="small" dataSource={datas} columns={columns} bordered rowKey={'instrumentID'} pagination={false}
                        scroll={{y: (tableWrapRef.current?.offsetHeight ?? tableHeight) - tableHeight,  x: 'max-content'}}
                        loading={{delay: 300, spinning: loading}}/>
                </div>
            </div>  
        </PageContainer>
    )
}

export default InstrumentList;