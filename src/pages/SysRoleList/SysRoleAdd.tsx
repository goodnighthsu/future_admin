import { SysRoleModel } from '@/models/SysRoleListState';
import { requestSysRole } from '@/services/requests/requestSysRole';
import { UserOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';
import styles from './SysRoleAdd.less';

interface ISysRoleAdd {
    sysRole?: SysRoleModel;
    onClose: () => void;
}

const SysRoleAdd: React.FC<ISysRoleAdd> = (props) => {
    // props
    const { sysRole, onClose } = props;

    // state
    const [title, setTitle] = useState<string | undefined>(sysRole?.title);
    const [detail, setDetail] = useState<string | undefined>(sysRole?.detail);
    const [isEnable, setIsEnable] = useState<boolean>(false);

    // methods
    const changeTitle = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.currentTarget.value)
    }

    const changeDetail = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDetail(e.currentTarget.value)
    }

    const clickSubmit = async () => {
        const params: SysRoleModel = {title: title, detail: detail};
        // edit
        if (sysRole) {
            params.id = sysRole.id;
            const response = await requestSysRole.put(params);
            if (!response) return;
            message.success('角色更新成功');
            onClose();
            return;
        }
        // add
        const response = await requestSysRole.add(params);
        if (!response) return;
        message.success('角色创建成功');
        onClose();
    }

    // effect
    // input check
    useEffect(() => {
        if (!title || title.length <= 0) {
            setIsEnable(false);
            return;
        }

        setIsEnable(true);
    }, [title]);

    return (
        <div className={styles.popPage}>
            <div className={styles.cell}>
                <div className={`${styles.cell_title} ${styles.need}`}>角色名:</div>
                <Input prefix={<UserOutlined />} placeholder='Role name' value={title} onChange={changeTitle}/>
            </div>
            
            <div className={styles.cell}>
                <div style={{alignSelf: 'start'}} className={styles.cell_title} >备注:</div>
                <Input.TextArea autoSize={{minRows: 3}} value={detail} onChange={changeDetail}/>
            </div>
            <div className={styles.model_footer}>
                <Button type='primary' disabled={!isEnable} onClick={clickSubmit}>
                    {sysRole?.id ? '保存' : '创建'}
                </Button>
            </div>
        </div>
    )
}

export default SysRoleAdd;