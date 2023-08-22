import { StateEnum } from '@/models/BaseModel';
import { SysRoleModel } from '@/models/SysRoleListState';
import { SysUserModel } from '@/models/SysUserListState';
import { requestSysRole } from '@/services/requests/requestSysRole';
import { requestSysUser } from '@/services/requests/requestSysUser';
import { MobileOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Switch } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';
import SysRoleSelect from '../SysRoleList/components/SysRoleSelect';
import styles from './SysUserAdd.less';

/**
 * 账号创建 编辑
 */
interface ISysUserAdd {
    user?: SysUserModel;
    onClose: () => void;
}

const SysUserAdd: React.FC<ISysUserAdd> = (props) => {
    // props
    const { user, onClose } = props;

    // state
    const [title, setTitle] = useState<string | undefined>(user?.account);

    const [mobile, setMobile] = useState<string | undefined>(user?.mobile);
    const [roleId, setRoleId] = useState<String | undefined>(user?.roleId ? String(user?.roleId) : undefined);
    const [password, setPassword] = useState<string | undefined>(user?.password);
    const [password2, setPassword2] = useState<string | undefined>();
    const [needModify, setNeedModify] = useState<boolean>(true);
    const [detail, setDetail] = useState<string | undefined>(user?.detail);
    const initUserState = (user?: SysRoleModel) => {
        if (!user) {
            return true;
        }
        return user.state ===  StateEnum.enable ? true : false
    }
    const [state, setState] = useState<boolean>(initUserState(user));
    const [isEnable, setIsEnable] = useState<boolean>(false);

    const [allRoles, setAllRoles] = useState<SysRoleModel[]>([]);

    // methods
    const changeTitle = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.currentTarget.value)
    }

    const changeDetail = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDetail(e.currentTarget.value)
    }

    const clickSubmit = async () => {
        if (!title) {
            return;
        }
        const params: SysUserModel = {
            account: title, 
            mobile: mobile, 
            roleId: Number(roleId), 
            password: password, 
            state: state ? StateEnum.enable : StateEnum.disable,
            detail: detail };
        // edit
        if (user) {
            params.id = user.id;
            const response = await requestSysUser.put(params);
            if (!response) return;
            onClose();
            return;
        }
        // add
        const response = await requestSysUser.add(params);
        if (!response) return;
        onClose();
    }

    // effects
    useEffect(() => {
        // load system role
        requestSysRole.list(1, 1000)
        .then(result => {
            setAllRoles(result?.datas ?? []); 
        })
    }, []);

    // input check
    useEffect(() => {
        if (!title || title.length <= 0) {
            setIsEnable(false);
            return;
        }

        if (!roleId) {
            setIsEnable(false);
            return;
        }
        if (!user) {
            // add user
            if (!password || password.length <= 0 || password != password2) {
                setIsEnable(false);
                return;
            }
        }

        setIsEnable(true);
    }, [title, roleId, password, password2]);

    return (
        <div className={styles.popPage}>
            <div className={styles.cell}>
                <div  className={styles.cell_item}>
                    <div className={`${styles.cell_title} ${styles.need}`}>账号:</div>
                    <Input className={styles.input} placeholder='Account' prefix={<UserOutlined />} value={title} onChange={changeTitle}/>
                </div>
                <div className={styles.cell_item}>
                    <div className={styles.cell_title}>手机:</div>
                    <Input placeholder='Mobile' value={mobile} prefix={<MobileOutlined />}  onChange={event => setMobile(event.currentTarget.value)}/>
                </div>
                <div className={styles.cell_item}>
                    <div className={`${styles.cell_title} ${styles.need}`}>角色:</div>
                    <SysRoleSelect allRoles={allRoles} role={user?.role} bordered={true} onChange={(roleId) => setRoleId(roleId)}/>
                </div>
            </div>
            {
                !user &&
                <div className={styles.cell}>
                    <div  className={styles.cell_item}>
                        <div className={`${styles.cell_title} ${styles.need}`}>密码:</div>
                        <Input.Password className={styles.input} placeholder='Password' value={password} onChange={ event => setPassword(event.currentTarget.value)}/>
                    </div>
                    <div className={styles.cell_item}>
                        <div className={`${styles.cell_title} ${styles.need}`}>确认密码:</div>
                        <Input.Password placeholder='Password' value={password2} onChange={event => setPassword2(event.currentTarget.value)}/>
                    </div>
                    <div className={`${styles.cell_item} ${styles.needModify}`}>
                        <Switch checked={needModify} onChange={value => setNeedModify(value)}/>
                        <div className={styles.cell_needModify}>首次登录需要修改密码:</div>
                    </div>
                </div>
            }
            <div className={styles.cell}>
                <div  className={styles.cell_item}>
                    <div className={styles.cell_title}>状态:</div>
                    <Switch checked={state} onChange={value => setState(value)}/>
                </div>
                <div className={styles.cell_item}>
                </div>
                <div className={styles.cell_item}>
                </div>
            </div>
            <div className={styles.cell}>
                {/* <div className={styles.cell_item} > */}
                    <div className={styles.cell_title} style={{alignSelf: 'start'}}>
                    备注: 
                    </div>
                    <Input.TextArea placeholder='Notes'  autoSize={{minRows: 3}} value={detail} onChange={changeDetail}/>
                {/* </div> */}
            </div>
            <div className={styles.notes}>
                
            </div>

            <div className={styles.model_footer}>
                <Button type='primary' disabled={!isEnable} onClick={clickSubmit}>
                    {user?.id ? '保存' : '创建'}
                </Button>
            </div>
        </div>
    )
}

export default SysUserAdd;