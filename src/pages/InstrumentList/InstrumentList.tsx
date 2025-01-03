import React from 'react';
import { PageContainer } from "@ant-design/pro-components";
import styles from './InstrumentList.less';
import {InstrumentModel} from '@/models/models/InstrumentModel';
import { PageStateEnum } from '@/models/AppState';
import { FilterTypeEnum } from '@/components/ToolBar/FilterForm';
import { IColumnOptional } from '@/components/ToolBar/ToolBarFilter';
import FilterList from '@/components/FilterList/FilterList';
import { requestCommon } from '@/services/requests/requestCommon';

/**
 * 合约
 * @param props 
 * @returns 
 */
const InstrumentList:React.FC = (props) => {
    // MARK: - --- methods ---
    const columns: IColumnOptional<InstrumentModel>[] = [
        { title: 'ID', dataIndex: 'id', width: 40, filterType: FilterTypeEnum.number },
        { title: '合约名称', dataIndex: 'instrumentName', width: 160, filterType: FilterTypeEnum.text},
        { title: '合约代码', dataIndex: 'instrumentID', key: 'insturmentID', width: 160},
        { title: '基础商品代码', dataIndex: 'underlyingInstrID', width: 120, filterType: FilterTypeEnum.text},
        { title: '产品类型', dataIndex: 'productClass', width: 100, filterType: FilterTypeEnum.text},
        { title: '交割年份', dataIndex: 'deliveryYear', width: 100, filterType: FilterTypeEnum.text},
        { title: '交割月', dataIndex: 'deliveryMonth', width: 80, filterType: FilterTypeEnum.text},
        { title: '市价单最大下单量', dataIndex: 'maxMarketOrderVolume', width: 160, filterType: FilterTypeEnum.number},
        { title: '市价单最小下单量', dataIndex: 'minMarketOrderVolume', width: 160, filterType: FilterTypeEnum.number},
        { title: '限价单最大下单量', dataIndex: 'maxLimitOrderVolume', width: 160, filterType: FilterTypeEnum.number},
        { title: '限价单最小下单量', dataIndex: 'minLimitOrderVolume', width: 160, filterType: FilterTypeEnum.number},
        { title: '合约数量乘数', dataIndex: 'volumeMultiple', width: 120, filterType: FilterTypeEnum.number},
        { title: '最小变动价位', dataIndex: 'priceTick', width: 120, filterType: FilterTypeEnum.number},
        { title: '创建日', dataIndex: 'createDate', width: 80, filterType: FilterTypeEnum.text},
        { title: '上市日', dataIndex: 'openDate', width: 80, filterType: FilterTypeEnum.text},
        { title: '到期日', dataIndex: 'expireDate', width: 80, filterType: FilterTypeEnum.text},
        { title: '开始交割日', dataIndex: 'startDelivDate', width: 120, filterType: FilterTypeEnum.text},
        { title: '结束交割日', dataIndex: 'endDelivDate', width: 120, filterType: FilterTypeEnum.text},
        { title: '合约生命周期状态', dataIndex: 'instLifePhase', width: 160, filterType: FilterTypeEnum.text}, 
        { title: '当前是否交易',  dataIndex: 'isTrading', key: 'isTrading', width: 120, filterType: FilterTypeEnum.general,
            datas: [{value: 1, label: '是'}, {value: 0, label: '否'}],
            render: (item: InstrumentModel) => {
                return item.isTrading ? '是' : '否';
            }
        },
        { title: '持仓类型', dataIndex: 'positionType', width: 100, filterType: FilterTypeEnum.text},
        { title: '持仓日期类型', dataIndex: 'positionDateType', width: 120, filterType: FilterTypeEnum.text},
        { title: '多头保证金率', dataIndex: 'longMarginRatio', width: 120, filterType: FilterTypeEnum.number},
        { title: '空头保证金率', dataIndex: 'shortMarginRatio', width: 120, filterType: FilterTypeEnum.number},
        { title: '是否使用大额单边保证金算法', dataIndex: 'maxMarginSideAlgorithm', width: 220, filterType: FilterTypeEnum.text},
        { title: '执行价', dataIndex: 'strikePrice', width: 80, filterType: FilterTypeEnum.number},
        { title: '期权类型', dataIndex: 'optionsType', width: 100, filterType: FilterTypeEnum.text},
        { title: '合约基础商品乘数', dataIndex: 'underlyingMultiple', width: 160, filterType: FilterTypeEnum.number},
        { title: '组合类型', dataIndex: 'combinationType', width: 100, filterType: FilterTypeEnum.text},
        { title: '合约在交易所的代码', dataIndex: 'exchangeInstID', width: 160, filterType: FilterTypeEnum.text},
        { title: '产品代码', dataIndex: 'productID', width: 100, filterType: FilterTypeEnum.text},
        { title: '交易所代码', dataIndex: 'exchangeID', width: 100, filterType: FilterTypeEnum.text},
    ]


    // MARK: - render
    return (
        <PageContainer>
            <div className={styles.page}>
                <FilterList 
                    columns={columns} 
                    pageState={PageStateEnum.instrument}
                    request={requestCommon.ctpList} 
                />
            </div>  
        </PageContainer>
    )
}

export default InstrumentList;