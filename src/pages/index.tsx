import FilterIcon from "@/components/Icons/FilterIcon";
import SearchIcon from "@/components/Icons/SearchIcon";
import { Button, Col, Drawer, Flex, Grid, Input, Pagination, Row, Select, Spin, Tabs, TabsProps, Typography } from "antd";
import Link from "next/link";
import React, { Fragment, ReactNode, use, useContext, useEffect, useState } from "react";
import VotingCard from "@/components/cards/votingcard/VotingCard";
import { ContestStatus } from "@/utils/henceforthEnums";
import { useRouter } from "next/router";
import henceforthApi from "@/utils/henceforthApi";
import { VotingCardProps } from "@/utils/interface";
import PlaceholderImage from "@/components/cards/PlaceholderImage";
import RootLayout from "@/layouts/RootLayout";
import UploadIcon from "@/components/Icons/UploadIcon";
import { GlobalContext } from "@/context/Provider";
import Head from "next/head";


const Home = () => {

    const screen = Grid.useBreakpoint();
    const { userInfo, Toast } = useContext(GlobalContext);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [categoryValue, setCategoryValue] = useState(null as any)
    const [subCategoryValue, setSubCategoryValue] = useState(null as any)

    const [categoryData, setCategoryData] = useState([] as any)

    const [subCategoryData, setSubCategoryData] = useState([] as any)
    const [openDrawer, setOpenDrawer] = useState(false)
    const [state, setState] = useState({
        data: [],
        count: 0
    });
    console.log(categoryData)

    useEffect(() => {
        let mounted = true;

        if (mounted && router.pathname === '/' && router.query.status) {
            router.push(`/?status=${router.query.status}&pagination=1&limit=9`, undefined, { shallow: true });
        }
        if (mounted && router.pathname === '/') {
            router.push(`/?status=ONGOING&pagination=1&limit=9`, undefined, { shallow: true });
        }

        return () => {
            mounted = false;
        };
    }, []);


    const onChangeRouter = (key: string, value: string) => {
        if (value) {
            router.replace({
                query: { ...router.query, [key]: value }
            }, undefined, { shallow: true, scroll: false });
        } else {
            const { [key]: removedkey, ...updatedQuery } = router.query;
            router.replace({ query: updatedQuery }, undefined, { shallow: true, scroll: false });
        }

        console.log(router.query);

    }

    const onChange = (value: string) => {
        onChangeRouter("status", value)
        console.log(value, "value__________");

    };

    const onSearch = (value: string) => {
        onChangeRouter("search", String(value).trim())
    }

    const handlePagination = (page: number, pageSize: number) => {
        router.replace({
            query: { ...router.query, pagination: page, limit: pageSize },
        }, undefined, { shallow: true, scroll: false })
    }


    const initialise = async () => {
        try {
            setLoading(true)
            let query = router.query
            let urlSearchParam = new URLSearchParams()
            if (query.pagination) {
                urlSearchParam.set('pagination', `${Number(router.query.pagination) - 1}`)
            }
            if (query.limit) {
                urlSearchParam.set('limit', String(router.query.limit))
            }
            if (query?.search) {
                urlSearchParam.set('search', String(router.query.search));
            }
            if (query?.sort) {
                urlSearchParam.set('sort', String(router.query.sort))
            }
            if (categoryValue) {
                urlSearchParam.set('catagory_id', String(categoryValue))
            }
            if (subCategoryValue) {
                urlSearchParam.set('sub_catagory_id', String(subCategoryValue))
            }
            if (query.status) {
                urlSearchParam.set('status', String(router.query.status).toUpperCase() as string)
            }
            let apiRes = await henceforthApi.Contest.listing(urlSearchParam.toString() || "status=ONGOING&pagination=1&limit=9")
            setState(apiRes)
            setLoading(false)
            // console.log(apiRes);

        } catch (error) {

        } finally {
            setLoading(false)
        }
    }

    const getCategories = async () => {
        try {
            const apiRes = await henceforthApi.Contest.categoryListing()
            setCategoryData(apiRes?.data)
        } catch (error) {
        }

    }
    const getSubCategories = async () => {
        try {
            const apiRes = await henceforthApi.Contest.subCategoryListing(categoryValue as string)
            setSubCategoryData(apiRes?.data)
        } catch (error) {
        }

    }
    useEffect(() => {
        getCategories()
    }, [])
    useEffect(() => {
        if (categoryValue) {
            getSubCategories()
        }
    }, [categoryValue])
    React.useEffect(() => {
        initialise()
    }, [router.query.pagination, router.query.limit, router.query.search, router.query.status, router.query, subCategoryValue, categoryValue])


    const items: TabsProps['items'] = [
        {
            key: ContestStatus.ONGOING,
            label: 'Ongoing Voting',
            children: <Fragment>
                <Spin spinning={loading} tip size="large">
                    {(state.data).length > 0 ?
                        <Row gutter={[{ xs: 12, sm: 24 }, { xs: 12, sm: 24 }]}>
                            {Array.isArray(state.data) && state.data.map((res: VotingCardProps) => {
                                return (
                                    <Col span={24} xs={24} sm={12} md={12} lg={12} xl={8} xxl={8} key={res._id}>
                                        <VotingCard {...res} />
                                    </Col>
                                )
                            })}
                        </Row>
                        :
                        <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />
                    }
                </Spin>
            </Fragment>
        },
        {
            key: ContestStatus.COMPLETED,
            label: 'Finished Voting',
            children: <Fragment>
                <Spin spinning={loading} tip size="large">
                    {(state.data).length > 0 ?
                        <Row gutter={[{ xs: 12, sm: 24 }, { xs: 12, sm: 24 }]}>
                            {Array.isArray(state.data) && state.data.map((res: VotingCardProps) => {
                                return (
                                    <Col span={24} xs={24} sm={12} md={12} lg={12} xl={8} xxl={8} key={res._id}>
                                        <VotingCard {...res} />
                                    </Col>
                                )
                            })}
                        </Row>
                        :
                        <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />
                    }
                </Spin>
            </Fragment>
        },
        {
            key: ContestStatus.UPCOMING,
            label: 'Upcoming Voting',
            children: <Fragment>
                <Spin spinning={loading} tip size="large">
                    {(state.data).length > 0 ?
                        <Row gutter={[{ xs: 12, sm: 24 }, { xs: 12, sm: 24 }]}>
                            {Array.isArray(state.data) && state.data.map((res: VotingCardProps) => {
                                return (
                                    <Col span={24} xs={24} sm={12} md={12} lg={12} xl={8} xxl={8} key={res._id}>
                                        <VotingCard {...res} />
                                    </Col>
                                )
                            })}
                        </Row>
                        :
                        <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />
                    }
                </Spin>
            </Fragment>
        },
    ];


    const handleCreateContestButton = () => {
        if (userInfo?.access_token) {
            router.replace(`/contest/create`);
        } else {
            Toast.warn('Login to continue')
            router.replace(`/auth/signin`);
        }
    };

    const { Option } = Select;


    const [visible, setVisible] = useState(false);


    const handleChange = (value) => {
        console.log(`Selected: ${value}`);
        router.replace({
            query: { ...router.query, sort: String(value) }
        }, undefined, { shallow: true, scroll: false })
        setVisible(false);
    };
    const clearAll = () => {
        setCategoryValue(null);
        setSubCategoryValue(null)
        setOpenDrawer(false)
    }


    return (
        <>
            <Head>
                <title>
                    Home | SEEzone
                </title>
            </Head>
            {/* Hero Section */}
            <section className="hero-section py-5">
                <div className="container">
                    <Row justify={'center'}>
                        <Col span={24} md={17}>
                            <div className="text-center">
                                <Typography.Title level={5} className="fw-medium m-0 mb-1 text-secondary">Welcome To</Typography.Title>
                                <Typography.Title level={1} className="fw-medium m-0 mb-4 fw-bold text-black text-shadow">The Voting Place on SeeZone!</Typography.Title>
                                <div className="mb-4">
                                    <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">Your go-to platform for dynamic, secure voting experiences. Ready to let your audience have a say? With SeeZone’s powerful tools, creators like you can set up free or paid voting options, allowing fans to cast their votes for their favorites and boost engagement. Whether you're running an online contest, managing voting for your content, or hosting a live event, SeeZone helps bring your vision to life.</Typography.Paragraph>
                                    <Typography.Paragraph className="m-0 fw-normal text-shadow-sm text-black mb-2">
                                        {/* <span>Click on</span> */}
                                        <Typography.Text className="text-decoration-none text-dark fw-bold mb-2"> On SeeZone, you can:</Typography.Text>
                                        {/* <span>to showcase your contestants and let your audience have their say!</span>Welcome To */}
                                    </Typography.Paragraph>
                                    <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">Set up customized voting pools for contestants, products, media, and more.</Typography.Paragraph>
                                    <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">Enable secure, real-time voting with options for both free and paid participation.                                    </Typography.Paragraph>
                                    <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">Easily manage voting for live events or on-demand content.                                    </Typography.Paragraph>
                                    <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">Make every vote count!</Typography.Paragraph>
                                    <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">Explore ongoing votes and join the community, or click <span className="text-decoration-none text-dark fw-bold">Set Up Voting</span> to launch your voting experience.</Typography.Paragraph>
                                    <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">Want to learn more? Click <Link href={'/terms-condition'}>Learn More</Link> to discover everything SeeZone offers creators like you!
                                    </Typography.Paragraph>
                                </div>
                                <div className="mt-5">
                                    {/* <Link href={userInfo?.access_token ? "/contest/create" : "/auth/signin"}> */}
                                    <Button onClick={handleCreateContestButton} type='primary' className="shadow-sm px-4 px-md-5" size="large">
                                        Set Up Voting
                                    </Button>
                                    {/* </Link> */}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>



            {/* Video Tabs */}
            <section className="voting-tabs-section py-md-5 py-4">
                <div className="container">
                    <Row justify={'center'}>
                        <Col span={24} md={16} xl={14} xxl={13}>
                            <Flex gap={12}>
                                <div className="video-search-input position-relative m-0 w-100">
                                    <Input.Search size="large" type="text" placeholder="Search..." onSearch={onSearch} onChange={(e) => onSearch(e.target.value)} />
                                    <span className="position-absolute end-0 top-50 translate-middle-y me-4 z-3"><SearchIcon /></span>
                                </div>
                                <div>
                                    <Button type="link" onClick={() => setOpenDrawer(true)} className="border-0"><FilterIcon /></Button>
                                </div>
                            </Flex>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div className="tabs-wrapper text-center mt-4">
                                <Tabs centered={screen.sm ? true : false} activeKey={router.query.status as string} items={items} onChange={onChange} />
                            </div>
                        </Col>
                    </Row>
                    <Row justify={'center'} className="mt-4">
                        <Col span={24} className="text-center home-page-vote-cards">
                            <Pagination current={Number(router.query.pagination) || 1} pageSize={Number(router.query.limit) || 9} total={state.count} hideOnSinglePage={true} disabled={loading} onChange={handlePagination} showSizeChanger={false} />
                        </Col>
                    </Row>
                    <Drawer title="Filters" onClose={() => setOpenDrawer(false)} open={openDrawer}>
                        <div className="">
                        <Typography.Text className='fw-semibold text-black text-capitalize'>{'Sort by'}</Typography.Text>
                            <Select
                                className="w-100 "
                                prefixCls="filter-select"
                                placeholder="Select "
                                onChange={handleChange}
                            >
                                <Select.Option value="1">New To Oldest</Select.Option>
                                <Select.Option value="2">Oldest To New</Select.Option>
                            </Select>
                        </div>
                        <div className="mt-3">
                            <Typography.Text className='fw-semibold text-black text-capitalize'>{'Category'}</Typography.Text>
                            <Select
                                className='w-100'
                                prefixCls="filter-select"
                                value={categoryValue}
                                bordered={false}
                                placeholder="Select Category"
                                onChange={(e: any) => setCategoryValue(e)}
                                options={[
                                    ...categoryData.map((res: any, index: number) => {
                                        return { value: res?._id, label: res?.title }
                                    })
                                ]}
                            />
                        </div>
                        <div className="mt-3">
                            <Typography.Text className='fw-semibold text-black text-capitalize'>{'Sub Category'}</Typography.Text>
                            <Select
                                value={subCategoryValue}
                                className='w-100'
                                prefixCls="filter-select"
                                bordered={false}
                                placeholder="Select Sub Category"
                                onChange={(e: any) => setSubCategoryValue(e)}
                                options={[
                                    ...subCategoryData.map((res: any, index: number) => {
                                        return { value: res?._id, label: res?.title }
                                    })
                                ]}
                            />
                        </div>
                        <div className="mt-3 ">
                            <Button onClick={() => clearAll()} className="rounded" type="primary">Clear All</Button>
                        </div>
                    </Drawer>
                </div>
            </section>
        </>
    )
}

Home.getLayout = (page: ReactNode) => (
    <RootLayout>
        {page}
    </RootLayout>
);

export default Home