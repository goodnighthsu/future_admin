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
                    <div>
                        home 192.168.1.201: 192.168.255.201
                        <ul>
                            <li>clash</li>
                            <li>
                                <a href='http://124.221.2.131:7500' target="_blank">Frp</a>
                                <span>bind_port: 7000</span> 
                            </li>
                            <li>
                                <a href='http://124.221.2.131:8848/nacos' target="_blank">Nacos</a>
                                port: 9848
                            </li>
                            <li>
                                <a href='http://124.221.2.131:39090' target="_blank">Prometheus</a>
                            </li>
                            <li>
                                <a href='http://124.221.2.131:33000' target="_blank">
                                    <img src='http://124.221.2.131:33000/public/img/grafana_icon.svg'/> 
                                    <span>Grafana
                                        <ul>
                                            <li>
                                                <a href='http://124.221.2.131:33000/d/rYdddlPWk/node-exporter-full?orgId=1&refresh=5s'  target="_blank">
                                                    Node exporter
                                                </a>
                                            </li>
                                            <li>
                                                <a href='http://124.221.2.131:33000/d/sadlil-loki-apps-dashboard/logs-app?orgId=1&var-app=future_ctp&var-search=&from=now-24h&to=now'  target="_blank">
                                                    Logs                                                
                                                </a>
                                            </li>
                                        </ul>
                                    </span>
                                </a>
                            </li>

                            <a href='http://124.221.2.131:8200'  target="_blank">gateway</a>
                            <li>future
                                <a href='http://124.221.2.131:33061'  target="_blank">
                                    
                                    plateform</a>
                                port: 33061
                                <a href='http://124.221.2.131:33071'  target="_blank">ctp</a>
                                
                                port: 33071
                            </li>
                        </ul>
                        
                    </div>
                    
                    
                    <h1>股票期货数据分析</h1>
                    <h2>Todo</h2>

                    <p>* 服务列表</p>
                    <p>* 主力合约列表</p>
                    <p>* 实时合约</p>
                    <p>* 合约k线 5s 30s 1m 5m 15 1h 1d 1w 4w</p>
                </div>

            </div>
        </PageContainer>
    )
}

export default Welcome;