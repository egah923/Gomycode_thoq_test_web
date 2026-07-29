import { GlobalContext } from "@/context/Provider"
import countryCode from "@/utils/countryCode.json"
import henceforthApi from "@/utils/henceforthApi"
import { Form, Select } from "antd"
import { Bakbak_One } from "next/font/google"
import { ReactNode, useContext, useEffect, useMemo, useState } from "react"
export const BankCode = (props: any) => {
    const [bankCode, setBankCode] = useState([] as any)
    const { userInfo } = useContext(GlobalContext)
    const [loading, setLoading] = useState(false)
    const getCurrencyFromCountry = (countryName: string) => {
        const countryData = countryCode.find(
            (item: any) => item.name.toLowerCase() === countryName.toLowerCase()
        );

        return countryData ? { code: countryData.code } : null;
    }
    const getFlutterWaveData = async () => {
        setLoading(true)
        let x: any = getCurrencyFromCountry(userInfo?.country)
        try {
            const apiRes = await henceforthApi.BankAccount.getFlutterWaveData(x.code);
            setBankCode(apiRes?.data?.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    const [data, setData] = useState<any>("")
    const searchedData = useMemo(() => bankCode?.reduce((prev: any, curr: any) => {
        if ([curr.name.toLowerCase(), curr.name.toLowerCase()].some(match => match.includes(data.toLowerCase().trim())) || !data.trim()) {
            prev.push({
                value: curr.code,
                label: <span key={curr?.name} className='text-light-grey'> {curr?.code} - {curr?.name}</span>,

            })
        }

        return prev
    }, [] as Array<{ value: string, label: ReactNode }>), [data, bankCode])
    // useEffect(() => {
    //     getFlutterWaveData()
    // }, [])
    return <Form.Item name="flw_account_bank"
        rules={[{ required: true, whitespace: true, message: 'Please select' }]}
        >

        <Select
            loading={loading}
            onFocus={() => getFlutterWaveData()}
            placeholder="Select bank code"
            showSearch
            // className='text-white'
            // prefixCls="pill-dropdown"
            onSearch={setData}
            bordered={false}
            filterOption={false}
            options={searchedData}
        />
    </Form.Item>

}
