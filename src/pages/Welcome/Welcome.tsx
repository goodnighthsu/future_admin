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
                            <li>
                                <a href='http://124.221.2.131:9090/ui' target='_blank'>
                                    <div style={{ display: 'inline-block' }}>
                                        <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
                                            <g fill="none" fillRule="evenodd">
                                                <path d="M71.689 53.055c9.23-1.487 25.684 27.263 41.411 56.663 18.572-8.017 71.708-7.717 93.775 0 4.714-15.612 31.96-57.405 41.626-56.663 3.992.088 13.07 31.705 23.309 94.96 2.743 16.949 7.537 47.492 14.38 91.63-42.339 17.834-84.37 26.751-126.095 26.751-41.724 0-83.756-8.917-126.095-26.751C52.973 116.244 65.536 54.047 71.689 53.055z" stroke="var(--stroke)" strokeWidth="4" strokeLinecap="round" fill="currentColor"></path><circle fill="#eee" cx="216.5" cy="181.5" r="14.5"></circle><circle fill="#eee" cx="104.5" cy="181.5" r="14.5"></circle><g stroke="#eee" strokeLinecap="round" strokeWidth="4"><path d="M175.568 218.694c-2.494 1.582-5.534 2.207-8.563 1.508-3.029-.7-5.487-2.594-7.035-5.11M143.981 218.694c2.494 1.582 5.534 2.207 8.563 1.508 3.03-.7 5.488-2.594 7.036-5.11"></path></g></g></svg></div>
                                    clash
                                </a>
                                <span> 9090:9090</span>
                            </li>
                            <li>
                                <a href='http://124.221.2.131:7500' target="_blank">Frp</a>
                                <span>bind_port: 7000</span>
                            </li>
                            <li>
                                <a href='http://124.221.2.131:8848/nacos' target="_blank">Nacos</a>
                                port: 9848
                            </li>
                            <li>
                                <a href='http://124.221.2.131:39090' target="_blank">Prometheus 39090:9090</a>
                            </li>
                            <li>
                                <a href='http://124.221.2.131:33000' target="_blank">
                                    <img src='http://124.221.2.131:33000/public/img/grafana_icon.svg' />
                                    <span>Grafana
                                        <ul>
                                            <li>
                                                {/* <a href='http://124.221.2.131:33000/d/rYdddlPWk/node-exporter-full?orgId=1&refresh=5s'  target="_blank">
                                                    Node exporter
                                                </a> */}
                                            </li>
                                            <li>
                                                {/* <a href='http://124.221.2.131:33000/d/sadlil-loki-apps-dashboard/logs-app?orgId=1&var-app=future_ctp&var-search=&from=now-24h&to=now'  target="_blank">
                                                    Logs                                                
                                                </a> */}
                                            </li>
                                        </ul>
                                    </span>
                                </a>
                            </li>

                            <a href='http://124.221.2.131:8200' target="_blank">gateway</a>
                            <li>future
                                <a href='http://124.221.2.131:33061' target="_blank">

                                    plateform</a>
                                port: 33061
                                <a href='http://124.221.2.131:33071' target="_blank">ctp</a>

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

                    {/* <Button onClick={stompConnnect}>connect</Button> */}
                    {/* <Button onClick={send}>send</Button> */}
                </div>
            </div>
        </PageContainer>
    )
}

export default Welcome;