import { StateEnum } from "./models/BaseModel";
import { SysUserModel } from "./models/SysUserListState";
import { SysPermissionModel } from "./models/models/SysPermissionModel";

/**
 * 按权限组返回允许访问的route path
 * 
 * @param permissions 权限组
 * @returns String[] path
 */
const getEnablePermission = (permissions: SysPermissionModel[]): string[] => {
  let paths: string[] = [];

  permissions.forEach( permission => {
    if (permission.state !== StateEnum.enable || !permission.path) {
      return;
    }
    paths.push(permission.path);

    const subPaths = getEnablePermission(permission.children ?? []);

    paths = [...paths, ...subPaths];
    return paths;
  })

  return paths;
}

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: SysUserModel } | undefined) {
  const { currentUser } = initialState ?? {};
  let paths = getEnablePermission(currentUser?.permissions ?? []);
  paths = ['/', ...paths];
  return {
    canAdmin: currentUser,
    routeFilter: (route: any) => {
      return paths.includes(route.path);
    },
  };
}