import WrapperElement from "@/components/common/WrapperElement";
import ContestLayout from "@/layouts/ContestLayout";
import { Button, Card, Col, Collapse, DatePicker, Flex, Form, Input, Popconfirm, Radio, Row } from "antd";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { theme, Typography } from "antd/lib";
import Link from "next/link";
import React, { ReactNode, useContext, useState } from "react";
import papalImage from '@/assets/images/Paypal_2014_logo 1.png'
import stripeImage from '@/assets/images/stripe.png'
import flutterwaveImage from '@/assets/images/flutter.png'
import { GlobalContext } from "@/context/Provider";
import dayjs from "dayjs";
import { addressFind, loadGoogleMapScript } from "@/utils/CommonFunctions";
import ShouldUpdateImage from "@/components/ShouldUpdateImage";
import henceforthApi from "@/utils/henceforthApi";
import { BankCode } from "@/components/BankCode";
import { useRouter } from "next/router";
import countryCode from '@/utils/countryCode.json'
const BankAcountAdd = () => {
    let optionsUk: CheckboxGroupProps<string>['options'] = [
        {
            label: <>
                <img className="mr-3" src={stripeImage.src} alt="" />
            </>, value: 'stripe'
        },
        {
            label: <>
                <img src={papalImage.src} alt="" />
            </>, value: 'paypal'
        },
        // {
        //     label: <>
        //         <img src={flutterwaveImage.src} alt="" />
        //     </>, value: 'flutterwave'
        // },
    ]
    let optionsOther: CheckboxGroupProps<string>['options'] = [
        {
            label: <>
                <img className="mr-3" src={stripeImage.src} alt="" />
            </>, value: 'stripe'
        },
        {
            label: <>
                <img src={papalImage.src} alt="" />
            </>, value: 'paypal'
        },
        {
            label: <>
                <img src={flutterwaveImage.src} alt="" />
            </>, value: 'flutterwave'
        },
    ]


    const [dob, setDob] = useState({
        dob_date: '',
        dob_month: '',
        dob_year: ''
    });
    const [form] = Form.useForm();
    const locationSearchRef = React.useRef(null) as any
    const [loading, setLoading] = useState(false)
    const uploadButton = (
        <>
            <div className="my-3">
                <Button type="primary" size="large">{'Upload'}</Button>
            </div>
        </>
    );

    const handleDateChange = (date: any) => {
        if (date) {
            const dob_date = date.date(); // Extracts the day
            const dob_month = date.month() + 1; // Extracts the month (1-indexed)
            const dob_year = date.year(); // Extracts the year
            setDob({
                dob_date,
                dob_month,
                dob_year
            });

        }
    };
    const { userInfo, setUserInfo, Toast } = useContext(GlobalContext)
    const getCurrencyFromCountry = (countryName: string) => {
        const countryData = countryCode.find(
            (item: any) => item?.name?.toLowerCase() === countryName?.toLowerCase()
        );
        return countryData ? { code: countryData.code } : null;
    }
    const router = useRouter()
    console.log(userInfo)
    const watchForm: any = Form.useWatch([], form)
    const onFinish = async (values: any) => {
        let countyKey = getCurrencyFromCountry(values?.country)
        console.log(values)
        let payload = {} as any
        setLoading(true)
        try {
            if (userInfo?.country == 'United Kingdom') {
                if (watchForm?.bank_type == 'stripe') {
                    if (!values?.file) return Toast.warn('Please upload identity document front')
                    if (!values?.file2) return Toast.warn('Please upload identity document back')
                }
                if (watchForm?.bank_type == 'stripe') {
                    payload.first_name = values?.first_name;
                    payload.last_name = values?.last_name;
                    payload.account_number = values?.account_number;
                    payload.routing_number = values?.routing_number;
                    payload.email = values?.email;
                    payload.phone_no = values?.phone_no;
                    payload.line1 = values?.line1;
                    payload.line2 = values?.line2;
                    payload.city = values?.city;
                    payload.state = values?.state;
                    payload.country = countyKey?.code;
                    payload.postal_code = values?.postal_code;
                    payload.dob_date = String(dob?.dob_date);
                    payload.dob_month = String(dob?.dob_month);
                    payload.dob_year = String(dob?.dob_year);
                    payload.type = 'stripe'
                }
                else if (watchForm?.bank_type == 'paypal') {
                    payload.paypal_email = values?.paypal_email;
                    payload.type = 'paypal'
                }
                if (watchForm?.bank_type == 'stripe') {
                    if (values?.file?.file) {
                        let fileName = await henceforthApi.Common.paymentUploadFile("file", values?.file?.file?.originFileObj)
                        payload.front_file_id = fileName?.file_id
                    }
                    if (values?.file2?.file) {
                        let fileName = await henceforthApi.Common.paymentUploadFile("file", values?.file?.file?.originFileObj)
                        payload.back_file_id = fileName?.file_id;
                    }
                }
            } else {
                if (userInfo?.pay_type === 'STRIPE') {
                    if (!values?.file) return Toast.warn('Please upload identity document front')
                    if (!values?.file2) return Toast.warn('Please upload identity document back')
                }
                if (userInfo?.pay_type == 'STRIPE') {
                    payload.first_name = values?.first_name;
                    payload.last_name = values?.last_name;
                    payload.account_number = values?.account_number;
                    payload.routing_number = values?.routing_number;
                    payload.email = values?.email;
                    payload.phone_no = values?.phone_no;
                    payload.line1 = values?.line1;
                    payload.line2 = values?.line2;
                    payload.city = values?.city;
                    payload.state = values?.state;
                    payload.country = values?.country;
                    payload.postal_code = values?.postal_code;
                    payload.dob_date = String(dob?.dob_date);
                    payload.dob_month = String(dob?.dob_month);
                    payload.dob_year = String(dob?.dob_year);
                    payload.type = 'stripe'
                }
                else if (userInfo?.pay_type == 'PAYPAL') {
                    payload.paypal_email = values?.paypal_email;
                    payload.type = 'paypal'
                }
                else if (userInfo?.pay_type == 'FLUTTERWAVE') {
                    payload.flw_account_bank = values?.flw_account_bank;
                    payload.flw_account_number = values?.flw_account_number;
                    payload.type = 'flutterwave';
                }
                if (userInfo?.pay_type === 'STRIPE') {
                    if (values?.file?.file) {
                        let fileName = await henceforthApi.Common.paymentUploadFile("file", values?.file?.file?.originFileObj)
                        payload.front_file_id = fileName?.file_id
                    }
                    if (values?.file2?.file) {
                        let fileName = await henceforthApi.Common.paymentUploadFile("file", values?.file?.file?.originFileObj)
                        payload.back_file_id = fileName?.file_id;
                    }
                }
            }
            const apiRes = await henceforthApi.BankAccount.addBank(payload);
            console.log(apiRes)
            router.replace('/bank-acount')
            setUserInfo({ ...userInfo, is_bank_added: true })
        } catch (error) {
            setLoading(false)
            Toast.error(error)
        }
    }
    const initPlaceAPI = () => {
        if (locationSearchRef.current) {
            let autocomplete = new (window as any).google.maps.places.Autocomplete(locationSearchRef?.current?.input);
            autocomplete.addListener('place_changed', async () => {
                let place = autocomplete.getPlace();
                const formatAddress = place.formatted_address
                const address = addressFind(place.address_components, formatAddress)
                console.log(address)
                form.setFieldsValue({
                    address_line_1: address?.sublocality1,
                    address_line_2: address?.sublocality2,
                    city: address?.city,
                    country: address?.country,
                    state: address?.state,
                    street_name: address?.street_number,
                    postal_code: address?.pin_code,
                })
                console.log(form.getFieldsValue())
            }
            );
        }
    }


    React.useEffect(() => {
        loadGoogleMapScript(() => {
            initPlaceAPI()
        })
    }, [])
    console.log(watchForm)
    return (
        <>
            <Row className="py-4 py-md-5">
                <Col span={24}>
                    {/* <WrapperElement noPadding> */}
                    <div className=''>
                        <h3 className='fw-bold  text-black'>Bank Acount</h3>
                        {/* <Typography.Text className="fs-18 fw-normal text-black"></Typography.Text> */}
                    </div>
                    <div className="mt-3">
                        <Form form={form} className='light_theme_form' onFinish={onFinish}>
                            {userInfo?.country == 'United Kingdom' ?
                                <>
                                    <Col span={24} className="" >
                                        {!userInfo?.is_bank_added && <label className='fw-semibold text-black primary-font-size'>Enter the account where you would like to receive your money</label>}
                                        <div className="radio-bank mt-3">
                                            <Form.Item name={'bank_type'} rules={[{ required: true, message: "Please select bank type" }]} className="bg-transparent w-75" >
                                                <Radio.Group options={optionsUk} size="large" />
                                            </Form.Item>
                                        </div>
                                    </Col>
                                    {watchForm?.bank_type == 'stripe' && <>
                                        <Row gutter={[24, 12]}>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>First name</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, whitespace: true, message: "Please enter first name" }]} className="bg-transparent w-75" name={'first_name'} >
                                                        <Input size="large"
                                                            onKeyPress={(e: any) => {
                                                                if (!/[a-zA-Z ]/.test(e.key) || (e.key === ' ' && !e.target.value)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            maxLength={30} placeholder={'First Name'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Last Name</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, whitespace: true, message: "Please enter last name" }]} className="bg-transparent w-75" name={'last_name'} >
                                                        <Input size="large" onKeyPress={(e: any) => {
                                                            if (!/[a-zA-Z ]/.test(e.key) || (e.key === ' ' && !e.target.value)) {
                                                                e.preventDefault();
                                                            }
                                                        }} maxLength={30} placeholder={'Last Name'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>


                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Account Number</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={
                                                        [{ required: true, message: 'Please enter account number' },
                                                        () => ({
                                                            validator(_, value) {
                                                                if (value) {
                                                                    if (isNaN(value) || value.includes('.')) {
                                                                        return Promise.reject(`Enter a valid account number`);
                                                                    }
                                                                    return Promise.resolve();
                                                                }
                                                                else {
                                                                    return Promise.resolve();
                                                                }
                                                            },
                                                        }),
                                                        ]
                                                    } className="bg-transparent w-75" name={'account_number'} >
                                                        <Input.Password size="large"
                                                            maxLength={30} placeholder={'Account Number'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Routing Number</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, whitespace: true, message: 'Please enter routing number' }]} className="bg-transparent w-75" name={'routing_number'} >
                                                        <Input size="large"
                                                            maxLength={15} placeholder={"Enter routing number"} />
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Enter your email</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[
                                                        {
                                                            type: 'email',
                                                            message: 'Please enter valid Email',
                                                        },
                                                        {
                                                            required: true,
                                                            message: 'Please enter Email',
                                                        },
                                                    ]} className="bg-transparent w-75" name={'email'} >
                                                        <Input size="large" placeholder={"Enter your email"} />
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>DOB</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: "Please select date of birth" }]} className="bg-transparent w-75" name={'date_of_birth'} >
                                                        <DatePicker size="large" onChange={handleDateChange} inputReadOnly showToday={false} allowClear={false} style={{ width: '100%' }}
                                                            format="DD MMM YYYY" defaultPickerValue={dayjs().subtract(18, 'year')} disabledDate={(current: any) => current.isAfter(dayjs().subtract(18, 'year'))} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Phone Number</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[() => ({
                                                        validator(_: any, value) {
                                                            if (value) {
                                                                if (isNaN(value)) {
                                                                    return Promise.reject(`Enter a valid phone number`);
                                                                }
                                                                if (value.length > 15) {
                                                                    return Promise.reject(`Enter a valid phone number`);
                                                                }
                                                                if (value.length < 8) {
                                                                    return Promise.reject(`Enter a valid phone number`);
                                                                }
                                                                return Promise.resolve();
                                                            }
                                                            else {
                                                                return Promise.resolve();
                                                            }
                                                        },
                                                    }),]} className="bg-transparent w-75" name={'phone_no'} >
                                                        <Input size="large" onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) { e.preventDefault(); } }} type="text" placeholder="Enter Phone no." className='rounded' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Address</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter address' }]} className="bg-transparent w-75" name={'line1'} >
                                                        <Input ref={(ref) => locationSearchRef.current = ref} onFocus={() => {
                                                            setTimeout(() => {
                                                                loadGoogleMapScript(() => {
                                                                    initPlaceAPI()
                                                                })
                                                            }, 500)
                                                        }} size="large" placeholder={'Enter address'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>City</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter city' }]} className="bg-transparent w-75" name={'city'} >
                                                        <Input size="large" name='City' placeholder='City' />
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Country</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter country' }]} className="bg-transparent w-75" name={'country'} >
                                                        <Input size="large" name='Country' placeholder='Country' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>State</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter state' }]} className="bg-transparent w-75" name={'state'} >
                                                        <Input size="large" name="state" placeholder='State' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Street Name</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: false, whitespace: true, message: 'Please enter Street Name' }]} className="bg-transparent w-75" name={'street_name'} >
                                                        <Input size="large" name='Street Name' placeholder='Street Name' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Postal Code</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: false, whitespace: true, message: 'Please enter postal code' }]} className="bg-transparent w-75" name={'postal_code'} >
                                                        <Input size="large" name='Postal Code' placeholder='Postal Code'
                                                            onKeyPress={(e: any) => {
                                                                if (!/^\d$/.test(e.key) || (e.key === ' ' && !e.target.value)) {
                                                                    e.preventDefault();
                                                                } else {
                                                                    e.target.value = String(e.target.value).trim()
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </Col>


                                            {/* <Row gutter={[20, 20]} className="mb-2"> */}
                                            <>
                                                <Col span={24} >
                                                    <label htmlFor="text-start">Upload identity document front side</label>
                                                    <div className="w-100 text-center upload-file">
                                                        <ShouldUpdateImage button={uploadButton} name='file' />
                                                    </div>
                                                </Col>
                                            </>
                                            {/* </Row> */}
                                            {/* <Row gutter={[20, 20]} className="mb-2"> */}
                                            <>
                                                <Col span={24} >
                                                    <label htmlFor="text-start">Upload identity document back side</label>
                                                    <div className="w-100 text-center upload-file">
                                                        <ShouldUpdateImage button={uploadButton} name='file2' />
                                                    </div>
                                                </Col>
                                            </>

                                        </Row>
                                    </>}
                                    <>
                                        {watchForm?.bank_type == 'paypal' &&
                                            <Row gutter={[24, 12]}>
                                                <Col span={24} className="" >
                                                    {/* <label className='fw-semibold text-black primary-font-size'>Enter your email</label> */}
                                                    <div className="radio-bank mt-3">
                                                        <Form.Item rules={[
                                                            {
                                                                type: 'email',
                                                                message: 'Please enter valid Email',
                                                            },
                                                            {
                                                                required: true,
                                                                message: 'Please enter Email',
                                                            },
                                                        ]} className="bg-transparent w-75" name={'paypal_email'} >
                                                            <Input size="large" placeholder={"Enter your paypal email"} />
                                                        </Form.Item>
                                                    </div>
                                                </Col>

                                            </Row>}
                                    </>
                                </>
                                :
                                <>
                                    {userInfo?.pay_type == 'STRIPE' &&
                                        <Row gutter={[24, 12]}>
                                            <Col span={24} className="" >
                                               {!userInfo?.is_bank_added &&  <label className='fw-semibold text-black primary-font-size'>Enter the account where you would like to receive your money</label>}
                                                <div className="radio-bank mt-3">
                                                    <img className="mr-3" src={stripeImage.src} alt="" />
                                                    {/* <Form.Item className="bg-transparent w-75" >
                                                    <Radio.Group options={optionsOther} size="large" defaultValue="flutterwave" />
                                                </Form.Item> */}
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>First name</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, whitespace: true, message: "Please enter first name" }]} className="bg-transparent w-75" name={'first_name'} >
                                                        <Input size="large"
                                                            onKeyPress={(e: any) => {
                                                                if (!/[a-zA-Z ]/.test(e.key) || (e.key === ' ' && !e.target.value)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            maxLength={30} placeholder={'First Name'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Last Name</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, whitespace: true, message: "Please enter last name" }]} className="bg-transparent w-75" name={'last_name'} >
                                                        <Input size="large" onKeyPress={(e: any) => {
                                                            if (!/[a-zA-Z ]/.test(e.key) || (e.key === ' ' && !e.target.value)) {
                                                                e.preventDefault();
                                                            }
                                                        }} maxLength={30} placeholder={'Last Name'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>


                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Account Number</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={
                                                        [{ required: true, message: 'Please enter account number' },
                                                        () => ({
                                                            validator(_, value) {
                                                                if (value) {
                                                                    if (isNaN(value) || value.includes('.')) {
                                                                        return Promise.reject(`Enter a valid account number`);
                                                                    }
                                                                    return Promise.resolve();
                                                                }
                                                                else {
                                                                    return Promise.resolve();
                                                                }
                                                            },
                                                        }),
                                                        ]
                                                    } className="bg-transparent w-75" name={'account_number'} >
                                                        <Input.Password size="large"
                                                            maxLength={30} placeholder={'Account Number'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Routing Number</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, whitespace: true, message: 'Please enter routing number' }]} className="bg-transparent w-75" name={'routing_number'} >
                                                        <Input size="large"
                                                            maxLength={15} placeholder={"Enter routing number"} />
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Enter your email</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[
                                                        {
                                                            type: 'email',
                                                            message: 'Please enter valid Email',
                                                        },
                                                        {
                                                            required: true,
                                                            message: 'Please enter Email',
                                                        },
                                                    ]} className="bg-transparent w-75" name={'email'} >
                                                        <Input size="large" placeholder={"Enter your email"} />
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>DOB</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: "Please select date of birth" }]} className="bg-transparent w-75" name={'date_of_birth'} >
                                                        <DatePicker size="large" onChange={handleDateChange} inputReadOnly showToday={false} allowClear={false} style={{ width: '100%' }}
                                                            format="DD MMM YYYY" defaultPickerValue={dayjs().subtract(18, 'year')} disabledDate={(current: any) => current.isAfter(dayjs().subtract(18, 'year'))} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Phone Number</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[() => ({
                                                        validator(_: any, value) {
                                                            if (value) {
                                                                if (isNaN(value)) {
                                                                    return Promise.reject(`Enter a valid phone number`);
                                                                }
                                                                if (value.length > 15) {
                                                                    return Promise.reject(`Enter a valid phone number`);
                                                                }
                                                                if (value.length < 8) {
                                                                    return Promise.reject(`Enter a valid phone number`);
                                                                }
                                                                return Promise.resolve();
                                                            }
                                                            else {
                                                                return Promise.resolve();
                                                            }
                                                        },
                                                    }),]} className="bg-transparent w-75" name={'phone_no'} >
                                                        <Input size="large" onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) { e.preventDefault(); } }} type="text" placeholder="Enter Phone no." className='rounded' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Address</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter address' }]} className="bg-transparent w-75" name={'line1'} >
                                                        <Input ref={(ref) => locationSearchRef.current = ref} onFocus={() => {
                                                            setTimeout(() => {
                                                                loadGoogleMapScript(() => {
                                                                    initPlaceAPI()
                                                                })
                                                            }, 500)
                                                        }} size="large" placeholder={'Enter address'} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>City</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter city' }]} className="bg-transparent w-75" name={'city'} >
                                                        <Input size="large" name='City' placeholder='City' />
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Country</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter country' }]} className="bg-transparent w-75" name={'country'} >
                                                        <Input size="large" name='Country' placeholder='Country' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>State</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: true, message: 'Please enter state' }]} className="bg-transparent w-75" name={'state'} >
                                                        <Input size="large" name="state" placeholder='State' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Street Name</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: false, whitespace: true, message: 'Please enter Street Name' }]} className="bg-transparent w-75" name={'street_name'} >
                                                        <Input size="large" name='Street Name' placeholder='Street Name' />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Postal Code</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[{ required: false, whitespace: true, message: 'Please enter postal code' }]} className="bg-transparent w-75" name={'postal_code'} >
                                                        <Input size="large" name='Postal Code' placeholder='Postal Code'
                                                            onKeyPress={(e: any) => {
                                                                if (!/^\d$/.test(e.key) || (e.key === ' ' && !e.target.value)) {
                                                                    e.preventDefault();
                                                                } else {
                                                                    e.target.value = String(e.target.value).trim()
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <>
                                                <Col span={24} >
                                                    <label htmlFor="text-start">Upload identity document front side</label>
                                                    <div className="w-100 text-center upload-file">
                                                        <ShouldUpdateImage button={uploadButton} name='file' />
                                                    </div>
                                                </Col>
                                            </>
                                            <>
                                                <Col span={24} >
                                                    <label htmlFor="text-start">Upload identity document back side</label>
                                                    <div className="w-100 text-center upload-file">
                                                        <ShouldUpdateImage button={uploadButton} name='file2' />
                                                    </div>
                                                </Col>
                                            </>

                                        </Row>}

                                    {userInfo?.pay_type == 'PAYPAL' &&
                                        <Row gutter={[24, 12]}>
                                            <Col span={24} className="" >
                                                {!userInfo?.is_bank_added && <label className='fw-semibold text-black primary-font-size'>Enter the account where you would like to receive your money</label>}
                                                <div className="radio-bank mt-3">
                                                    <img className="mr-3" src={papalImage.src} alt="" />
                                                    {/* <Form.Item className="bg-transparent w-75" >
                                                    <Radio.Group options={optionsOther} size="large" defaultValue="flutterwave" />
                                                </Form.Item> */}
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                {/* <label className='fw-semibold text-black primary-font-size'>Enter your email</label> */}
                                                <div className="radio-bank mt-3">
                                                    <Form.Item rules={[
                                                        {
                                                            type: 'email',
                                                            message: 'Please enter valid Email',
                                                        },
                                                        {
                                                            required: true,
                                                            message: 'Please enter Email',
                                                        },
                                                    ]} className="bg-transparent w-75" name={'paypal_email'} >
                                                        <Input size="large" placeholder={"Enter your paypal email"} />
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                        </Row>}
                                    {userInfo?.pay_type == 'FLUTTERWAVE' &&
                                        <Row gutter={[24, 12]}>
                                            <Col span={24} className="" >
                                             {!userInfo?.is_bank_added &&    <label className='fw-semibold text-black primary-font-size'>Enter the account where you would like to receive your money</label>}
                                                <div className="radio-bank mt-3">
                                                    <img className="mr-3" src={flutterwaveImage.src} alt="" />
                                                    {/* <Form.Item className="bg-transparent w-75" >
                                                    <Radio.Group options={optionsOther} size="large" defaultValue="flutterwave" />
                                                </Form.Item> */}
                                                </div>
                                            </Col>
                                            <Col span={24} className="" >
                                                <BankCode form={form} />
                                            </Col>

                                            <Col span={24} className="" >
                                                <Form.Item

                                                    name="flw_account_number" // Changed the name to reduce autofill likelihood
                                                    rules={[
                                                        { required: true, whitespace: true, message: 'Please enter account number' },
                                                        () => ({
                                                            validator(_, value) {
                                                                if (value) {
                                                                    if (isNaN(value) || value.includes('.')) {
                                                                        return Promise.reject('Enter a valid account number');
                                                                    }
                                                                    return Promise.resolve();
                                                                } else {
                                                                    return Promise.resolve();
                                                                }
                                                            },
                                                        }),
                                                    ]}

                                                >
                                                    <Input.Password
                                                        size="large"
                                                        maxLength={30}
                                                        className='text-black'
                                                        placeholder="Account Number"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>}
                                </>}

                            <div className="d-flex gap-2">
                                <Button size='large' htmlType='button' className='rounded-pill px-4 shadow-sm text-black bg-white border-black' type='default'>Cancel</Button>
                                <Button type='primary' loading={loading} disabled={loading} size='large' htmlType='submit' shape='round'>Submit</Button>
                            </div>
                        </Form>

                    </div>
                    {/* </WrapperElement> */}
                </Col>
            </Row >
        </>
    )
}
BankAcountAdd.getLayout = (page: ReactNode) => (
    <ContestLayout>
        {page}
    </ContestLayout>
);

export default BankAcountAdd;