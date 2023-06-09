import { StateEnum } from "./models/BaseModel";
import { ISysPermissionModel } from "./models/SysRoleListState";
import { ISysUserModel } from "./models/SysUserListState";

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

const getEnablePermission = (permissions: ISysPermissionModel[]): string[] => {
  let paths: string[] = [];

  permissions.forEach( permission => {
    if (permission.state !== StateEnum.enable) {
      return [];
    }
    paths.push(permission.path ?? "");

    const subPaths = getEnablePermission(permission.children ?? []);

    paths = [...paths, ...subPaths];
    return paths;
  })

  return paths;
}


export default function access(initialState: { currentUser?: ISysUserModel } | undefined) {
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
