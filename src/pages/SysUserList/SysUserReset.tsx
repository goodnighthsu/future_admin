import { SysUserModel } from '@/models/models/SysUserModel';
import { requestSysUser } from '@/services/requests/requestSysUser';
import { Button, Input, Switch, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './SysUserReset.less';

/**
 * 账号密码重置
 */
interface ISysUserReset{
    user: SysUserModel;
    onClose: () => void;
}

const SysUserReset: React.FC<ISysUserReset> = (props) => {
    // props
    const { user, onClose } = props;

    // state
    const [password, setPassword] = useState<string | undefined>(user?.password);
    const [password2, setPassword2] = useState<string | undefined>();
    const [needModify, setNeedModify] = useState<boolean>(true);
    const [isEnable, setIsEnable] = useState<boolean>(false);

    // methods
    const clickSubmit = async () => {
        user.password = password;
        const response = await requestSysUser.put(user);
        if (!response) return;
        message.success('密码已重置');
        onClose();
    }

    // input check
    useEffect(() => {
       // add user
       if (!password || password.length <= 0 || password != password2) {
        setIsEnable(false);
        return;
    }

        setIsEnable(true);
    }, [password, password2]);

    return (
        <div className={styles.popPage}>
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
                    <div className={styles.cell_needModify}>登录需要修改密码:</div>
                </div>
            </div>


            <div className={styles.model_footer}>
                <Button type='primary' disabled={!isEnable} onClick={clickSubmit}>
                    重置密码
                </Button>
            </div>
        </div>
    )
}

export default SysUserReset;