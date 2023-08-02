import React, { useEffect, useState } from 'react';
import { PageContainer } from "@ant-design/pro-components";
import { Table } from "antd";
import styles from './QuoteList.less';
import { requestFuture } from '@/services/requests/requestFuture';
import { tableHeight } from '@/models/AppState';
import { ColumnType } from 'antd/lib/table';
import { TradingModel } from '@/models/models/TradingModel';

/**
 * 行情
 * @param props 
 * @returns 
 */
const QuoteList:React.FC = (props) => {
    // MARK: - ----------------- state-----------------
    // state
    const [datas, setDatas] = useState<TradingModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [contentHeight, setContentHeight] = useState<number>(tableHeight);

    // MARK: - --- methods ---
    // MARK: -  load 加载行情数据
    const load = async (keyword?: string, page?: number, pageSize?: number) => {
        const response = await requestFuture.quote();
        if (!response) {
            return;
        }

        setDatas(response ?? []);
    }    

    const columns: ColumnType<TradingModel>[] = [
        { title: 'ID', dataIndex: 'id', width: 40},
        { title: '合约名称', dataIndex: 'instrumentName', width: 74},
        { title: '合约代码', dataIndex: 'instrumentId', width: 74},
        { title: '最新价', dataIndex: 'lastPrice', width: 68},
        { title: '买一价', dataIndex: 'bidPrice1', width: 68},
        { title: '买一量', dataIndex: 'bidVolume1', width: 68},
        { title: '卖一价', dataIndex: 'askPrice1', width: 68},
        { title: '卖一量', dataIndex: 'askVolume1', width: 68},
        { title: '涨停价', key: 'upperLimitPrice', width: 68,
            render: (item: TradingModel) => {
                return <div className={styles.red}>{item.upperLimitPrice}</div>
            }
        },
        { title: '跌停价', key: 'lowerLimitPrice', width: 68, 
            render: (item: TradingModel) => {
                return <div className={styles.green}>{item.lowerLimitPrice}</div>
            }
        },
        { title: '涨跌', key: 'changeRate', width: 68,
            render: (item: TradingModel) => {
                const {change, openPrice} = item;
                return <div className={item.getChangeStyle(openPrice)}>{change}</div>
            }
        },
        { title: '涨跌幅', key: 'changeRate', width: 68,
            render: (item: TradingModel) => {
                const {changeRate} = item;
                let style = styles.yellow;
                if (changeRate > 0 ) {
                    style = styles.red;
                }
                if (changeRate < 0) {
                    style = styles.green;
                }
                return <div className={style}>{changeRate}%</div>
            }
        },
        { title: '成交量', dataIndex: 'volume', width: 68},
        { title: '今开盘', key: 'openPrice', width: 68,
            render: (item: TradingModel) => {
                const {openPrice} = item;
                return <div className={item.getChangeStyle(openPrice)}>{openPrice}</div>
            }
        },
        { title: '最高价', key: 'highestPrice', width: 68,
            render: (item: TradingModel) => {
                const {highestPrice} = item;
                return <div className={item.getChangeStyle(highestPrice)}>{highestPrice}</div>
            }   
        },
        { title: '最低价', key: 'lowestPrice', width: 68,
            render: (item: TradingModel) => {
                const {lowestPrice} = item;
                return <div className={item.getChangeStyle(lowestPrice)}>{lowestPrice}</div>
            }
        },
        { title: '昨收盘', dataIndex: 'preClosePrice', width: 68},
        { title: '昨结算', dataIndex: 'preSettlementPrice', width: 68},
        { title: '行情更新时间', dataIndex: 'recvTime'},
        { title: '接收延时 (ms)', key: 'recvDelay', width: 120,
            render: (item: TradingModel) => {
                return new Date(item.recvTime ?? '').getTime() - new Date(item.tradingActionTime ?? '').getTime();
            },
        }
        // { title: '最小价位', dataIndex: 'instrumentID'},
        // { title: '沉淀资金', dataIndex: 'instrumentID'},
        // { title: '资金流向', dataIndex: 'instrumentID'},
    ]

    // effects
    useEffect(() => {
        const timer = setInterval(() => {
            load();
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, []);
    
    // MARK: - render
    return (
        <PageContainer>
            <div className={styles.page} 
                ref={ (ref: HTMLDivElement) => {
                    if (ref && ref.offsetHeight !== contentHeight) {
                        setContentHeight(ref.offsetHeight);
                    }
                }}
            >
                <div className={styles.tableWrapper}>
                    <Table className={styles.table} size="small" dataSource={datas} columns={columns} bordered rowKey={'instrumentId'} pagination={false}
                        scroll={{y: contentHeight ? contentHeight - tableHeight : tableHeight,  x: datas.length === 0 ? undefined : 'max-content'}}
                        loading={{delay: 300, spinning: loading}}/>
                </div>
            </div>  
        </PageContainer>
    )
}

export default QuoteList;