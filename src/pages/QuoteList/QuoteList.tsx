import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useModel } from "@umijs/max";
import { PageContainer } from "@ant-design/pro-components";
import { Input, Table } from "antd";
import styles from './InstrumentList.less';
import { requestFuture } from '@/services/requests/requestFuture';
import {InstrumentModel} from '@/models/models/InstrumentModel';
import Pagination from 'antd/es/pagination';
import { tableHeight } from '@/models/AppState';
import { debounce } from 'lodash';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import { TradingModel } from '@/models/models/TradingModel';

/**
 * 行情
 * @param props 
 * @returns 
 */
const QuoteList:React.FC = (props) => {
    // useModel
    const { page, updatePaging, pageSize  } = useModel('InstrumentListState');

    // MARK: - ----------------- state-----------------
    // state
    const [datas, setDatas] = useState<TradingModel[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string | undefined>(undefined);

    const tableWrapRef = useRef<HTMLDivElement | null>(null);

    // MARK: - --- methods ---
    // MARK: -  load 加载行情数据
    const load = async (keyword?: string, page?: number, pageSize?: number) => {
        setLoading(true);
        const response = await requestFuture.instrumentList(
            keyword, 
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
        debounce((keyword, page, pageSize) => {
                updatePaging(page, pageSize); 
                load(keyword, page, pageSize);
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
        load(keyword, page, pageSize);
    }

    const columns: ColumnType<InstrumentModel>[] = [
        { title: 'ID', dataIndex: 'id', width: 40},
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
        { title: '当前是否交易', key: 'isTrading', width: 120,
            render: (item) => {
                return item.isTrading ? '是' : '否';
            }
        },
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

    // effects
    useEffect(() => {
        load();
    }, [])

    // MARK: - render
    return (
        <PageContainer>
            <div className={styles.page}>
            
            </div>  
        </PageContainer>
    )
}

export default QuoteList;