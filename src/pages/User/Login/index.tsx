import Footer from '@/components/Footer';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import { isDev } from '@/utils/utils';
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import {
    LoginForm,
    ProFormCaptcha,
    ProFormCheckbox,
    ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, history, useIntl, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import CELLS from 'vanta/dist/vanta.cells.min';
import styles from './index.less';

const LoginMessage: React.FC<{
    content: string;
}> = ({ content }) => {
    return (
        <Alert
            style={{
                marginBottom: 24,
            }}
            message={content}
            type="error"
            showIcon
        />
    );
};

const Login: React.FC = () => {
    // state
    const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
    const [type, setType] = useState<string>('account');
    const { login } = useModel('AppState');
    const [vanta, setVanta] = useState<any>(null);
    const bgRef = useRef(null);

    const intl = useIntl();
    // methods
    const handleSubmit = async (values: API.LoginParams) => {
        const user = await login(values.username, values.password);
        if (user) {
            const defaultLoginSuccessMessage = intl.formatMessage({
                id: 'pages.login.success',
                defaultMessage: '登录成功！',
            });
            message.success(defaultLoginSuccessMessage);
            const urlParams = new URL(window.location.href).searchParams;
            history.push(urlParams.get('redirect') || '/');
            return;
        }
    };
    const { status, type: loginType } = userLoginState;

    /**
     * 背景动效
     */
    useEffect(() => {
        if (isDev) {
            return;
        }
        if (!vanta) {
            setVanta(
                CELLS({
                    el: bgRef.current,
                }),
            );
        }

        return () => {
            vanta?.destroy();
        };
    }, [vanta]);

    return (
        <div className={styles.container}>
            <div className={styles.login_bg} ref={bgRef}></div>
            <div className={styles.content}>
                <LoginForm
                    className={styles.login_form}
                    logo={<img alt="logo" src="../logo.svg" />}
                    title="Leon X Platform"
                    subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
                    initialValues={{
                        autoLogin: true,
                    }}
                    onFinish={async (values) => {
                        await handleSubmit(values as API.LoginParams);
                    }}
                >
                    <Tabs
                        activeKey={type}
                        onChange={setType}
                        centered
                        items={[
                            {
                                key: 'account',
                                label: intl.formatMessage({
                                    id: 'pages.login.accountLogin.tab',
                                    defaultMessage: '账户密码登录',
                                }),
                            },
                            {
                                key: 'mobile',
                                label: intl.formatMessage({
                                    id: 'pages.login.phoneLogin.tab',
                                    defaultMessage: '手机号登录',
                                }),
                            },
                        ]}
                    />

                    {status === 'error' && loginType === 'account' && (
                        <LoginMessage
                            content={intl.formatMessage({
                                id: 'pages.login.accountLogin.errorMessage',
                                defaultMessage: '账户或密码错误(admin/ant.design)',
                            })}
                        />
                    )}
                    {type === 'account' && (
                        <>
                            <ProFormText
                                name="username"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className={styles.prefixIcon} />,
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'pages.login.username.placeholder',
                                    defaultMessage: '用户名: admin or user',
                                })}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.username.required"
                                                defaultMessage="请输入用户名!"
                                            />
                                        ),
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={styles.prefixIcon} />,
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'pages.login.password.placeholder',
                                    defaultMessage: '密码: ant.design',
                                })}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.password.required"
                                                defaultMessage="请输入密码！"
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </>
                    )}

                    {status === 'error' && loginType === 'mobile' && (
                        <LoginMessage content="验证码错误" />
                    )}
                    {type === 'mobile' && (
                        <>
                            <ProFormText
                                fieldProps={{
                                    size: 'large',
                                    prefix: <MobileOutlined className={styles.prefixIcon} />,
                                }}
                                name="mobile"
                                placeholder={intl.formatMessage({
                                    id: 'pages.login.phoneNumber.placeholder',
                                    defaultMessage: '手机号',
                                })}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.phoneNumber.required"
                                                defaultMessage="请输入手机号！"
                                            />
                                        ),
                                    },
                                    {
                                        pattern: /^1\d{10}$/,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.phoneNumber.invalid"
                                                defaultMessage="手机号格式错误！"
                                            />
                                        ),
                                    },
                                ]}
                            />
                            <ProFormCaptcha
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={styles.prefixIcon} />,
                                }}
                                captchaProps={{
                                    size: 'large',
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'pages.login.captcha.placeholder',
                                    defaultMessage: '请输入验证码',
                                })}
                                captchaTextRender={(timing, count) => {
                                    if (timing) {
                                        return `${count} ${intl.formatMessage({
                                            id: 'pages.getCaptchaSecondText',
                                            defaultMessage: '获取验证码',
                                        })}`;
                                    }
                                    return intl.formatMessage({
                                        id: 'pages.login.phoneLogin.getVerificationCode',
                                        defaultMessage: '获取验证码',
                                    });
                                }}
                                name="captcha"
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.captcha.required"
                                                defaultMessage="请输入验证码！"
                                            />
                                        ),
                                    },
                                ]}
                                onGetCaptcha={async (phone) => {
                                    const result = await getFakeCaptcha({
                                        phone,
                                    });
                                    if (result === false) {
                                        return;
                                    }
                                    message.success('获取验证码成功！验证码为：1234');
                                }}
                            />
                        </>
                    )}
                    <div
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <ProFormCheckbox noStyle name="autoLogin">
                            <FormattedMessage
                                id="pages.login.rememberMe"
                                defaultMessage="自动登录"
                            />
                        </ProFormCheckbox>
                        <a
                            style={{
                                float: 'right',
                            }}
                        >
                            <FormattedMessage
                                id="pages.login.forgotPassword"
                                defaultMessage="忘记密码"
                            />
                        </a>
                    </div>
                </LoginForm>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
