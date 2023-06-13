import React, { useEffect, useState } from 'react';
import { PageContainer } from "@ant-design/pro-components";
import styles from './Welcome.less';

/**
 * 首页
 * @param props 账号列表
 * @returns 
 */
const Welcome: React.FC = (props) => {
    return (
        <PageContainer>
            <div className={styles.page}>
                <div className={styles.container}>
                    <h1>股票期货数据分析</h1>
                    <h2>Todo</h2>

                    <p>* 主力合约列表</p>
                    <p>* 实时合约</p>
                    <p>* 合约k线 5s 30s 1m 5m 15 1h 1d 1w 4w</p>
                </div>

            </div>
        </PageContainer>
    )
}

export default Welcome;