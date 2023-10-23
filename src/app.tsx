import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { SysUserModel } from './models/SysUserListState';
import { MenuDataItem } from '@umijs/route-utils';
import { SysPermissionModel } from './models/SysRoleListState';
import { StateEnum } from './models/BaseModel';
import { App } from '@/models/AppState';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: SysUserModel;
  loading?: boolean;
}> {
  if (window.location.pathname !== loginPath) {
    const currestUser = await App.initLocalUser();
    
    return {
      currentUser: currestUser,
      settings: defaultSettings,
    };
  }
  return {
    settings: defaultSettings,
  };
}

/**
 * ISysPermissionModel to MenuDataItem
 * 
 * @param permissions system permissions
 * @returns menus
 */
const permission2Menu = (permissions: SysPermissionModel[]) => {
  return permissions.flatMap((permission: SysPermissionModel) => {
    if (!permission.path || permission.state != StateEnum.enable) {
      return;
    };

    const menu: MenuDataItem = {
      name: permission.detail,
      path: permission.path,
    }
    if (permission.children) {
      menu.children = permission2Menu(permission.children);
    }

    return menu;
  }) as MenuDataItem[];
}

/**
 * load remote menus
 * @returns  menus
 */
const loadMenu = async (permissions: SysPermissionModel[]) => {
  return permission2Menu(permissions);
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    menu: {
      request: () => {
        return loadMenu( App.instance().currentUser?.permissions ?? [])
      },
    },
    rightContentRender: () => <RightContent />,
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    footerRender: () => null,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (! App.instance().currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
