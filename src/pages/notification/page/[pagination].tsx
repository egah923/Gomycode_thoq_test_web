
import Link from "next/link";
import React, { ReactElement, ReactNode, useContext, useEffect, useState } from "react";
import notificationImage from '@/assets/images/placeholder.svg';
import bellImage from '@/assets/images/notification.svg';
import { Button, Col, Empty, Grid, Pagination, Row, Select, Space, Typography } from "antd";
import { useRouter } from "next/router";
import henceforthApi from "@/utils/henceforthApi";
import { GlobalContext } from "@/context/Provider";
import dateFormat from "@/utils/dateFormatter";
import RootLayout from "@/layouts/RootLayout";
import profile from "@/assets/images/profile.png"
import ChevronDown from "@/components/Icons/ChevronDown";
import henceforthEnums from "@/utils/henceforthEnums";
import PlaceholderImage from "@/components/cards/PlaceholderImage";
const Notification = () => {
    const screens = Grid.useBreakpoint();
    const [loading, setLoading] = useState(false)
    const { Toast } = useContext(GlobalContext)
    const router = useRouter();
    const [state, setState] = useState({
        count_read: 0,
        count_unread: 0,
        read: [] as any,
        unread: [] as any
    })


    const readAllNotication = async () => {
        try {
            let apiRes = await henceforthApi.Notification.allRead()
            await initialise();
        }
        catch (error) {
            Toast.error(error)
        }
    }

    const onChangeRouter = (key: string, value: string) => {
        router.replace({
            query: { ...router.query, [key]: value }
        })
    }


    const handleFilter = (value: any) => {
        onChangeRouter("filter", value)
    }

    const readSingleNotification = async (id: string) => {
        try {
            let apiRes = await henceforthApi.Notification.readById(id)
            await initialise();
        }
        catch (error) {
            Toast.error(error)
        }
    }

    const handlePagination = (page: number, pageSize: number) => {
        router.replace({
            query: { ...router.query, pagination: page, limit: pageSize }
        })
    }

    const initialise = async () => {
        setLoading(true)
        try {
            let query = router.query
            let urlSearchParam = new URLSearchParams()
            if (query.pagination) {
                urlSearchParam.set('pagination', `${Number(router.query.pagination) - 1}`)
            }
            urlSearchParam.set('limit', '10')
            // if (query.filter) {
            //     urlSearchParam.set('type', String(router.query.filter).toUpperCase())
            // }
            let apiRes = await henceforthApi.Notification.listing(urlSearchParam.toString())
            setState(apiRes)
            // setCount(apiRes?.count_unread)
        } catch (error) {
            Toast.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        initialise()
    }, [router.query.pagination, router.query.filter])
    return (
        <React.Fragment>
            <section className="notification-section section">
                <div className="container pb-5">
                    <Row justify={'space-between'} align={'middle'} gutter={[20, 20]}>
                        <Col span={24} lg={16} xl={15} xxl={15}>
                            <div className="d-flex align-items-center  mt-3 justify-content-between">
                                <Typography.Title level={4} className="fs-4 mb-0">Notifications</Typography.Title>
                                {/* <Select
                                    size="large"
                                    prefixCls="other-select"
                                    suffixIcon={<ChevronDown />}
                                    onChange={handleFilter}
                                    defaultValue="All"
                                    style={{ width: 140 }}
                                    options={[
                                        { value: 'ALL', label: 'All' },
                                        { value: henceforthEnums.Notification_type.LIVE_STREAMING, label: 'Live Streaming' },
                                        { value: henceforthEnums.Notification_type.SCHEDULE_LIVE_STREAMING, label: 'Schedule Live Streaming' },
                                        { value: henceforthEnums.Notification_type.LIKE_GAME, label: 'Like Campaign' },
                                        { value: henceforthEnums.Notification_type.FOLLOW_USER, label: 'Support User' },
                                        { value: henceforthEnums.Notification_type.GAME_WINNER, label: 'Support Recieved' },
                                        { value: henceforthEnums.Notification_type.GAME_TERMINATE, label: 'Terminate' },
                                    ]}
                                /> */}
                            </div>
                        </Col>
                        <Col span={24} lg={16} xl={15} xxl={15}>
                            <Space size={'middle'} className="notification-card d-flex" direction="vertical">
                                <div className="d-flex align-items-center justify-content-between gap-2 gap-sm-4 flex-wrap">
                                    <Typography.Title level={5} className="mb-0 fs-16">Unread Notification</Typography.Title>
                                    {state?.count_unread > 0 && <Button type="link" className="text-blue p-0 h-100 fs-14 fw-600" onClick={readAllNotication}>Mark all as read</Button>}
                                </div>

                                {
                                    state?.count_unread == 0 ?
                                        <Empty
                                            imageStyle={{ height: 60 }}
                                            description={
                                                <span>
                                                    Nothing new for you.
                                                </span>
                                            }
                                        ></Empty> :

                                        <ul className="list-unstyled mb-4">
                                            {
                                                state?.unread?.sort((a: any, b: any) => b.created_at - a.created_at)?.map((res: any, index: any) => <li key={index * 1} className="notification-list w0 d-flex align-items-center justify-content-between mb-2">
                                                    <span onClick={() => readSingleNotification(res?._id)}
                                                    >
                                                        <Space className="d-flex align-items-start align-items-sm-center gap-3">
                                                            <div className="notification-image mt-2 mt-sm-0">
                                                                <img src={res?.data?.cover_media ? henceforthApi.FILES.imageOriginal(res?.data?.cover_media) : profile.src} alt="img" className="img-fluid" />
                                                            </div>
                                                            <div className="notification-text d-flex flex-column">
                                                                <Typography.Text className="mb-1 fs-16 fw-400">{res.title}</Typography.Text>
                                                                <Typography.Text className="fs-12 text-secondary fw-600">{dateFormat(res?.created_at).fromNow()}</Typography.Text>
                                                            </div>
                                                        </Space>
                                                    </span>
                                                    <Button shape="circle" onClick={() => readSingleNotification(res?._id)} type="link" className="p-0"><span className="red-dot">
                                                        {/* <Icons.CrossLine /></span><span className="cross"><Icons.RedDot /> */}
                                                    </span></Button>
                                                </li>)
                                            }
                                        </ul>
                                }

                                <div className="d-flex align-items-center justify-content-between gap-4">
                                    <Typography.Title level={5} className="fs-16">Previous notification</Typography.Title>
                                </div>

                                {/* notification read list */}
                                {state.count_read == 0 ?
                                    <Empty
                                        // image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                        imageStyle={{ height: 60 }}
                                        description={
                                            <span>
                                                Nothing new for you.
                                            </span>
                                        }
                                    >
                                    </Empty> :
                                    <div>
                                        <ul className="list-unstyled m-0">
                                            {state?.read?.map((res: any, index: number) => <li key={index * 1} className="notification-list d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-start align-items-sm-center gap-3">
                                                    <div className="notification-image">
                                                    <img src={res?.data?.cover_media ? henceforthApi.FILES.imageOriginal(res?.data?.cover_media) : profile.src} alt="img" className="img-fluid" />
                                                    </div>
                                                    <div className="notification-text d-flex flex-column">
                                                                <Typography.Text className="mb-1 fs-16 fw-400">{res.title}</Typography.Text>
                                                                <Typography.Text className="fs-12 text-secondary fw-600">{dateFormat(res?.created_at).fromNow()}</Typography.Text>
                                                            </div>
                                                </div>
                                                {/* <Button shape="circle" onClick={() => readSingleNotification(res?._id)} type="link" className="p-0"><span className="cross"><Icons.CrossLine /></span></Button> */}
                                            </li>)}
                                        </ul>
                                        {/* Pagination  */}
                                        <Row justify={'center'} className="mt-4 mb-4">
                                            <Pagination showSizeChanger={false} current={Number(router.query.pagination) || 1} pageSize={Number(router.query.limit) || 10} total={state?.count_read} hideOnSinglePage={true} disabled={loading} onChange={handlePagination} />
                                        </Row>
                                    </div>
                                }

                            </Space>


                        </Col>
                        <Col span={24} lg={7} xl={8} xxl={7} className="d-none d-lg-block">
                            <img src={bellImage.src} alt="" className="img-fluid" />
                        </Col>
                    </Row>
                </div>
            </section>
        </React.Fragment>
    )
}
Notification.getLayout = (page: ReactNode) => (
    <RootLayout noFooter>
        {page}
    </RootLayout>
);
export default Notification;