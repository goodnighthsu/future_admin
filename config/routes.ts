﻿/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,title 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
    {
        path: '/user',
        layout: false,
        routes: [
            {
                name: 'login',
                path: '/user/login',
                component: './User/Login',
            },
        ],
    },
    {
        path: '/admin',
        name: 'admin',
        icon: 'crown',
        access: 'canAdmin',
        routes: [
            {
                path: '/admin',
                redirect: '/admin/sub-page',
            },
            {
                path: '/admin/sub-page',
                name: 'sub-page',
                component: './Admin',
            },
        ],
    },
    {
        path: '/',
        redirect: '/welcome',
        access: 'routeFilter',
    },
    {
        name: 'welcome',
        path: '/welcome',
        access: 'routeFilter',
        component: './Welcome/Welcome'
    },
    {
        name: 'Quote List',
        path: '/instrument/quote',
        access: 'routeFilter',
        component: './QuoteList/QuoteList',
    },
    {
        name: '合约',
        path: '/instrument/instrument',
        access: 'routeFilter',
        component: './InstrumentList/InstrumentList',
    },
    {
        name: 'Market',
        path: '/instrument/market',
        access: 'routeFilter',
        component: './MarketList/MarketList',
    },
    {
        name: 'Trading Calendar',   // 交易日历
        path: '/instrument/calendar',
        access: 'routeFilter',
        component: './TradingCalendar/TradingCalendar',
    },
    {
        name: 'Tensor Flow',
        path: '/tensorflow',
        access: 'routeFilter',
        routes: [
            {
                name: 'Training Regression',
                path: '/tensorflow/regression',
                component: './TensorFlow/TrainingRegression/TrainingRegression',
            },
            {
                name: 'CNN',
                path: '/tensorflow/cnn',
                component: './TensorFlow/CNN/CNN',
            },
            {
              name: 'Tic Tac Toe',
              path: '/tensorflow/ticTacToe',
              component: './TensorFlow/TicTacToe/TicTacToe',
            }
        ]
    },
    {
        name: 'Account Manage',
        path: '/account',
        access: 'routeFilter',
        routes: [
            {
                name: 'Account List',
                path: '/account/account',
                component: './SysUserList/SysUserList',
                access: 'routeFilter',
            },
            {
                name: 'Role List',
                path: '/account/role',
                component: './SysRoleList/SysRoleList',
                access: 'routeFilter',
            },
        ],
    },
    {
        path: '*',
        layout: false,
        component: './404',
    },
];
