import { SearchOutlined } from "@ant-design/icons";
import { Input, Table } from "antd";
import React, { useState } from "react";
import styles from './SelectForm.less';

/**
 * 下拉弹出框
 */
export interface ISelectForm {
    options: ISelectOption[];
}

/**
 * 下拉选项
 */
 export interface ISelectOption {
    
    /**
     * 
     */
    title: string;

    type: ESelectOption;

    condition?: ETSelectOptionCondition;

    options?: IOption;
}

export interface IOption {
    value: string | number;
    label: string;
}

/**
 * 下拉选项类型枚举
 */
 export enum ESelectOption {
    /**
     * 筛选的值要和项完全一至
     */
    general = 'general',
    
    /**
     * 筛选的值只要包含项就可以
     */
    include = 'include',
    
    date = 'date',
    
    /**
     * 时 分 秒
     */
    time = 'time',
    
    /**
     * 没有时分秒
     */
    day = 'day',
    
    number = 'number',
    
    long = 'long',
    
    text = 'text',
}

/**
 * 筛选条件枚举
 */
export enum ETSelectOptionCondition {
    between  = 'between',
    gt = 'gt',
    less = 'less',
}

const SelectForm: React.FC<ISelectOption> = (props) => {
    const {options} = props;

    const [result, setResult] = useState<IOption[]>(options ?? []);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

    const filter = (value) => {

    }

    const columns =[
        {
            title: '全选',
            render: (item:IOption) => {
                return <div>
                    {item.value}
                </div>
            }
        }
    ]
    
    return (
        <div className={styles.page}>
            <Input className={styles.search} placeholder='搜索' suffix={<SearchOutlined />} allowClear
                onChange={event => filter(event.currentTarget.value)} />
            <Table columns={columns} dataSource={result} size='small' pagination={false} rowKey={'value'} scroll={{y: 300}}
                rowSelection={{
                    type:'checkbox',
                    selectedRowKeys: selectedKeys,
                    onChange: (selectedRowKeys) => {
                        console.log('selectedRowKeys changed: ', selectedRowKeys);
                        setSelectedKeys(selectedRowKeys);
                    }
                }}
            />
        </div>
    );
}

export default SelectForm;