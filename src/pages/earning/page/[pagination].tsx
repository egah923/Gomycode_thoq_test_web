import React, { Fragment, ReactNode, useContext, useEffect, useState } from 'react'
import { Avatar, Button, Card, Checkbox, Col, Dropdown, Flex, Form, Grid, Input, MenuProps, Pagination, Popconfirm, Row, Spin, Table, Tabs, TabsProps, Tooltip, Typography } from 'antd';
import MoreIcon from '@/components/Icons/MoreIcon';
import TabBadge from '@/components/common/TabBadge';
import WrapperElement from '@/components/common/WrapperElement';
import ProfileWrapperElement from '@/components/common/ProfileWrapperElement';
import SearchIcon from '@/components/Icons/SearchIcon';
import ContestCard from '@/components/cards/contest/ContestCard';
import placeholder from "@/assets/images/contestant-image.png"
import Link from 'next/link';
import { ContestStatus, FillingInfo } from '@/utils/henceforthEnums';
import { PlusOutlined, EyeFilled, DownloadOutlined, DeleteFilled, EditFilled } from '@ant-design/icons'
import henceforthApi from '@/utils/henceforthApi';
import { ContestCardProps } from '@/utils/interface';
import { useRouter } from 'next/router';

import { GlobalContext } from '@/context/Provider';
import TrashFilled from '@/components/Icons/TrashFilled';
import ContestLayout from '@/layouts/ContestLayout';
import EditIcon from '@/components/Icons/EditIcon';
import DollarIcon from '@/components/Icons/DollarIcon';
import PayoutIcon from '@/components/Icons/PayoutIcon';
import WithdrawIcon from '@/components/Icons/WithdrawIcon'
import PaypalIcon from '@/components/Icons/Paypal';
import StripeIcon from '@/components/Icons/Stripe';
import FlutterWave from '@/components/Icons/Flutter';
import { NextPage } from 'next';
import CommonModal from '@/components/common/CommonModal';
import henceforthValidations from '@/utils/henceforthValidations';
import Paypal from '@/components/Icons/Paypal';
import dateFormat from '@/utils/dateFormatter';
const earningColumns: any = [
    {
        title: 'Ref ID',
        dataIndex: 'ref_id',
        width: 120,
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                {res?.ref_id}
            </Typography.Paragraph>
        )
    },
    {
        title: 'Transaction Date',
        dataIndex: 'created_at',
        width: 120,
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                {dateFormat(res?.created_at).format("MMM D, YYYY, hh:mma")}
            </Typography.Paragraph>
        )
    },
    {
        title: 'Amount',
        dataIndex: 'total_amount',
        width: 100,
        ellipsis: {
            showTitle: false,
        },
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                {'$' + res?.total_amount}
            </Typography.Paragraph>
        )
    },
    {
        title: 'Contest',
        dataIndex: 'contest',
        width: 100,
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                {res?.contest_id?.title}
            </Typography.Paragraph>
        )
    },
    // {
    //     title: 'Actions',
    //     dataIndex: 'actions',
    //     key: 'actions',
    //     width: 100,
    //     fixed: 'right',
    // },
];
const payoutColumns: any = [
    {
        title: 'Ref ID',
        dataIndex: 'ref_id',
        width: 120,
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                {res?.ref_id}
            </Typography.Paragraph>
        )
    },
    {
        title: 'Transaction Date',
        dataIndex: 'created_at',
        width: 120,
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                {dateFormat(res?.created_at).format("MMM D, YYYY, hh:mma")}
            </Typography.Paragraph>
        )
    },
    {
        title: 'From',
        dataIndex: 'account_type',
        ellipsis: {
            showTitle: false,
        },
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                <div className='d-flex gap-2 align-items-center'>
                    {res?.account_type == 'STRIPE' && <StripeIcon />}
                    {res?.account_type == 'FLUTTER_WAVE' && <FlutterWave />}
                    {res?.account_type == 'PAYPAL' && <PaypalIcon />}
                    <p className='m-0 p-0'>{henceforthValidations.remUndrscore(res?.account_type).toUpperCase()}</p>
                </div>
            </Typography.Paragraph>
        ),
        width: 100
    },
    {
        title: 'Amount',
        dataIndex: 'total_amount',
        ellipsis: {
            showTitle: false,
        },
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                {'$' + res?.total_amount}
            </Typography.Paragraph>
        ),
        width: 100
    },
    {
        title: 'Status',
        dataIndex: 'content',
        render: (_: any, res: any) => (
            <Typography.Paragraph className='m-0'>
                <p className={`m-0 p-0 ${res?.status == 'SUCCESS' ? 'text-success' : res?.status == 'PENDING' ? 'text-primary' : 'text-danger'}`} >{res?.status}</p>
            </Typography.Paragraph>
        ),
        width: 100,

    },
    // {
    //     title: 'Actions',
    //     dataIndex: 'actions',
    //     key: 'actions',
    //     width: 100,
    //     fixed: 'right',
    //     render: (title) => (
    //         <Tooltip color='#fff' placement="topLeft" title={title}>
    //             {title}
    //         </Tooltip>
    //     ),
    // },
];

const Earning = () => {
    const router = useRouter()
    const { Toast, userInfo } = useContext(GlobalContext)
    const screens = Grid.useBreakpoint()
    const [earningData, setEarningData] = useState({
        data: [],
        total_amount: 0,
        count: 0
    })
    const [withdrawOpen, setWithdrawOpen] = useState(false)
    const [form] = Form.useForm()
    const [payoutData, setPayoutData] = useState({
        data: [],
        total_amount: 0,
        count: 0
    } as any)
    const usageMetrics2 = [
        {
            cardBackground: "#fff",
            class: "cursor-pointer",
            iconBackground: "linear-gradient(135deg, rgba(0, 171, 85, 0) 0%, rgba(0, 171, 85, 0.24) 97.35%)",
            icon: <DollarIcon />,
            textColor: "#202224",
            title: '$' + `${earningData?.total_amount || 0}`,
            count: "Balances",
            link: '/earning/page/1?type=balances',
            withdraw_button: true,
        },
        {
            cardBackground: "#fff",
            class: "cursor-pointer",
            iconBackground: "linear-gradient(135deg, rgba(0, 171, 85, 0) 0%, rgba(0, 171, 85, 0.24) 97.35%)",
            icon: <PayoutIcon />,
            textColor: "#202224",
            title: '$' + `${payoutData?.total_amount || 0}`,
            count: "Payout",
            link: '/earning/page/1?type=payout'
        },

    ]
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    useEffect(() => {
        if (router.query.type === 'balances') {
            setActiveIndex(0);
        } else {
            setActiveIndex(1);
        }
    }, [router.query.type]);

    const totalEarnings = async () => {
        try {
            let query = router.query
            let urlSearchParam = new URLSearchParams()
            if (query.pagination) {
                urlSearchParam.set('pagination', `${Number(router.query.pagination) - 1}`)
            }
            urlSearchParam.set('limit', String(10))
            const apiRes = await henceforthApi.Common.earning(urlSearchParam.toString())
            setEarningData(apiRes)
        } catch (error) {

        }
    }
    const getPayouts = async () => {
        try {
            let query = router.query
            let urlSearchParam = new URLSearchParams()
            if (query.pagination) {
                urlSearchParam.set('pagination', `${Number(router.query.pagination) - 1}`)
            }
            urlSearchParam.set('limit', String(10))
            const apiRes = await henceforthApi.Common.getPayouts(urlSearchParam.toString())
            setPayoutData(apiRes)
        } catch (error) {

        }
    }
    const handlePagination = (page: number, pageSize: number) => {
        router.replace({
            query: { ...router.query, pagination: page },
        }, undefined, { shallow: true, scroll: false })
    }
    const withdrawAmount = async (values: any) => {
        try {
            let payload = {
                amount: Number(values?.amount)
            }
            const apiRes = await henceforthApi.BankAccount.amountWithdraw(payload)
            console.log(apiRes)
            totalEarnings()
            getPayouts()
            router.replace('/earning/page/1?type=payout')
            setWithdrawOpen(false)
        } catch (error) {
            Toast.error(error)
        }
    }
    useEffect(() => {
        // if (router.query.type == 'balances') {
        totalEarnings()
        // } else {
        getPayouts()
        // }
    }, [router.query?.pagination, router.query?.limit, router.query.type])
    console.log(activeIndex)
    return (
        // <ProfileLayout>
        <Row className="py-4 py-md-5">
            <Col span={24}>
                <WrapperElement noPadding>
                    <div className=''>
                        <h3 className='fw-bold  text-black'>Wallet</h3>
                    </div>
                    <div className="tabs-wrapper mt-4">
                        <Row gutter={[20, 20]}>
                            {usageMetrics2.map((data: any, index: number) => {
                                const isActive = (activeIndex === index);
                                return (
                                    <Col onClick={() => { setActiveIndex(index); router.replace(data.link) }} xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className={`gutter-row `} key={index}>
                                        <Card className={`dashboard-widget-card ${isActive ? 'border-color-card' : ''} text-center h-100`} style={{ background: isActive ? '#F5F5F5' : data.cardBackground, cursor: 'pointer' }} >
                                            <div className='d-flex gap-4'>
                                                <div className='d-flex align-items-center justify-content-center'>
                                                    {data.icon}
                                                </div>
                                                <div className='d-flex justify-content-between w-100'>
                                                    <div className='dashboard-widget-card-content'>
                                                        <Typography.Paragraph className="m-0 text-start mb-2 " style={{ color: data.textColor }}>{data.count}</Typography.Paragraph>
                                                        <Typography.Title level={3} className='m-0 text-start mb-1 fw-bold' style={{ color: data.textColor }}>{data.title}</Typography.Title>
                                                    </div>
                                                    {data?.withdraw_button && <div className='d-flex justify-content-center align-items-center'>
                                                        <Button
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                if (userInfo?.is_bank_added) {
                                                                    setWithdrawOpen(true)
                                                                } else {
                                                                    router.push('/bank-acount/add')
                                                                }
                                                            }}
                                                            style={{ zIndex: 1 }}
                                                            icon={<><WithdrawIcon /></>} disabled={!earningData?.total_amount} className='bg-black text-white'>Withdraw</Button>
                                                    </div>}
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                )
                            })}
                        </Row>


                    </div>
                    {/* <Spin> */}

                    <div className='tabs-wrapper mt-4'>
                        <div className=''>
                            <h5 className='fw-bold  text-black'>{router.query.type == 'balances' ? 'Balances' : 'Payouts'}</h5>
                        </div>
                        <Table columns={router.query?.type == 'payout' ? payoutColumns : earningColumns} dataSource={router.query?.type == 'payout' ? payoutData?.data : earningData?.data} pagination={false} scroll={{ x: '100%' }} className="w-100 border-3" />
                    </div>
                    <Row justify={'center'} className="mt-4">
                        <Col span={24} className="text-center home-page-vote-cards">
                            <Pagination current={Number(router.query.pagination) || 1} pageSize={Number(router.query.limit) || 9} total={router.query?.type == 'payout' ? payoutData?.count : earningData?.count} hideOnSinglePage={true} onChange={handlePagination} showSizeChanger={false} />
                        </Col>
                    </Row>
                    {/* </Spin> */}
                </WrapperElement>
                <CommonModal title="Withdraw Amount" isModalOpen={withdrawOpen} handleCancel={() => {
                    setWithdrawOpen(false)
                }} >
                    <WrapperElement>
                        <div className='d-flex justify-content-between align-items-center'>
                            <Typography.Title className='fw-semibold primary-font-size m-0 mb-3' >Enter Amount</Typography.Title>
                            <Typography.Title className='fw-semibold primary-font-size m-0 mb-3' >Total Amount :{'$' + earningData?.total_amount || 0}</Typography.Title>
                        </div>
                        <Form layout='vertical' className='light_theme_form' onFinish={withdrawAmount} form={form} >
                            <Form.Item
                                name="amount"
                                rules={[
                                    { required: true, message: 'Please enter the amount' },
                                    {
                                        pattern: /^[0-9]+(\.[0-9]{1,2})?$/, // Regex for a valid amount (e.g., 100, 100.00, 99.99)
                                        message: 'Please enter a valid amount',
                                    },
                                ]}
                            >
                                <Input
                                    maxLength={12}
                                    size="large"
                                    className="bg-transparent ps-0"
                                    placeholder="Enter amount"
                                />
                            </Form.Item>
                            <Flex className='mt-3' gap={12} justify={screens.lg ? 'end' : 'start'} >
                                <Button size='small' onClick={() => {
                                    setWithdrawOpen(false)
                                }} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'> Cancel </Button>
                                < Button size='small' className='rounded-pill px-4 bg-white' htmlType='submit' type='default'> Send </Button>
                            </Flex>
                        </Form>
                    </WrapperElement>
                </CommonModal>
            </Col>
        </Row>
        // </ProfileLayout>
    )
}
Earning.getLayout = (page: ReactNode) => (
    <ContestLayout>
        {page}
    </ContestLayout>
);



export default Earning