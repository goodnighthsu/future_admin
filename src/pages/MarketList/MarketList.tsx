import React, {useEffect} from 'react';
import { PageContainer } from "@ant-design/pro-components";
import styles from './MarketList.less';
import { requestFuture } from '@/services/requests/requestFuture';

const MarketList:React.FC = (props) => {

    const load = async (instrumentId: string, tradingDay?: string, index?: number) => {
        const response = await requestFuture.marketList(instrumentId, tradingDay, index);
        console.log(response);
    }

    useEffect(() => {
        load('fu2305');
    }, []);

    return (
        <PageContainer>
            <div className={styles.page}>
            </div>
        </PageContainer>
    )
}

export default MarketList;