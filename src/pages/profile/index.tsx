import React, { Fragment, ReactNode, useContext, useEffect, useState } from 'react'
import { Avatar, Button, Checkbox, Col, Dropdown, Flex, Form, Grid, Input, MenuProps, Pagination, Row, Spin, Tabs, TabsProps, Typography } from 'antd';
import MoreIcon from '@/components/Icons/MoreIcon';
import TabBadge from '@/components/common/TabBadge';
import WrapperElement from '@/components/common/WrapperElement';
import ProfileWrapperElement from '@/components/common/ProfileWrapperElement';
import SearchIcon from '@/components/Icons/SearchIcon';
import ContestCard from '@/components/cards/contest/ContestCard';
import placeholder from "@/assets/images/contestant-image.png"
import Link from 'next/link';
import { ContestStatus, FillingInfo } from '@/utils/henceforthEnums';
import henceforthApi from '@/utils/henceforthApi';
import { ContestCardProps } from '@/utils/interface';
import { useRouter } from 'next/router';
import uiSettings from '@/utils/uiSettings';
import PlaceholderImage from '@/components/cards/PlaceholderImage';
import ProfileLayout from '@/layouts/ProfileLayout';
import RootLayout from '@/layouts/RootLayout';
import contestantImage from "@/assets/images/contestant-image.png"
import { GlobalContext } from '@/context/Provider';
import TrashFilled from '@/components/Icons/TrashFilled';

const CreatorProfile = () => {
  const screens = Grid.useBreakpoint();
  const router = useRouter()
  const { Toast, userInfo } = useContext(GlobalContext)
  const [formLoading, setFormLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [contestsData, setContestsData] = useState({
    contestCreated: {
      data: null, total_count: 0, count: 0
    },
    contestJoined: {
      data: null, total_count: 0, count: 0
    },
    rewardListing: null,
    contestFollowed: null,
    contestFormListing: {
      listing: null,
    },
  });

  const [selectedId, setSelectedId] = useState([]);
  console.log(contestsData?.contestFormListing?.listing?.data, "dsasd");



  // ******************** Handle Query for Listing ********************

  const onChange = (key: string) => {
    console.log(key);
    router.replace({
      pathname: `/profile/${key}`
    }, undefined, { shallow: true, scroll: false })
  };

  const onChangeRouter = (key: string, value: string) => {
    if (value) {
      router.replace({
        query: { ...router.query, [key]: value, pagination: "1", limit: '10' }
      }, undefined, { shallow: true, scroll: false });
    } else {
      const { [key]: removedkey, ...updatedQuery } = router.query;
      router.replace({ query: { ...updatedQuery } }, undefined, { shallow: true, scroll: false });
    }
  }

  const onChangeCreatedContest = (value: string) => {
    onChangeRouter("status", value)
    console.log(value, "value");
  }

  const onChangeJoinedContest = (value: string) => {
    onChangeRouter("status", value)
    console.log(value, "value");
  }

  const onSearch = (value: string) => {
    onChangeRouter("search", String(value).trim())
  }


  const handlePagination = (page: number, pageSize: number) => {
    router.replace({
      query: { ...router.query, pagination: page, limit: pageSize }
    }, undefined, { shallow: true, scroll: false })
  }


  // ******************** Contest Reward Listing ********************
  const rewardListing = async () => {
    let query = router.query;
    let urlSearchParams = new URLSearchParams();
    setLoading(true)
    try {
      if (query.pagination) {
        urlSearchParams.set('pagination', `${Number(router.query.pagination) - 1}`)
      }
      else {
        urlSearchParams.set('pagination', '0')
      }

      if (query.limit) {
        urlSearchParams.set('limit', router.query.limit as string)
      }
      else {
        urlSearchParams.set('limit', `10`)
      }

      const apiRes = await henceforthApi.Contest.contestRewardListing(urlSearchParams.toString());
      setContestsData((prev) => ({
        ...prev, rewardListing: apiRes
      }))

      setLoading(false)

    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }


  useEffect(() => {
    rewardListing()
  }, [])



  //  ******************** Contest Listing ********************
  const contestListing = async () => {
    let query = router.query;
    let urlSearchParams = new URLSearchParams();

    try {
      setLoading(true)
      if (query.pagination) {
        urlSearchParams.set('pagination', `${Number(router.query.pagination) - 1}`)
      }

      else {
        urlSearchParams.set('pagination', "0")
      }

      if (query.limit) {
        urlSearchParams.set('limit', router.query.limit as string)
      }
      else {
        urlSearchParams.set('limit', "10")
      }
      if (query.search) {
        urlSearchParams.set('search', router.query.search as string)
      }
      if (query.status) {
        urlSearchParams.set('status', String(router.query.status).toUpperCase() as string)
      }
      else {
        if (((router?.query?.type == "contest-created") || (router?.query?.type == "contest-joined")) && (router?.query?.status === undefined)) {
          urlSearchParams.set('status', 'UPCOMING')
        }
      }
      console.log(router.query.status, "status")


      // **************** Contestent Form Submission ****************
      const contestFormListingApiRes = await henceforthApi.Contestent.listingContestentForm(urlSearchParams?.toString());

      setContestsData((prevState) => ({
        ...prevState,
        contestFormListing: {
          ...prevState.contestFormListing,
          listing: contestFormListingApiRes
        }
      }));
      // console.log(contestsData?.contestFormListing?.listing, "contestsData?.contestFormListing?.listing");



      // **************** Contest Created ****************
      if (router?.query?.type !== "participants-form") {

        const contestCreatedApiRes = await henceforthApi.Contest.contestCreatedListing(urlSearchParams?.toString());
        setContestsData((prevState) => ({
          ...prevState,
          contestCreated: contestCreatedApiRes,
        }));


        // **************** Contest Joined ****************
        console.log(urlSearchParams?.toString(), "urlSearchParams?.toString()");

        const contestJoinedApiRes = await henceforthApi.Contest.contestJoinedListing(urlSearchParams?.toString());
        setContestsData((prevState) => ({
          ...prevState,
          contestJoined: contestJoinedApiRes,
        }));

        // **************** Contest I Follow ****************
        const contestFollowApiRes = await henceforthApi.Contest.contestFollowListing(urlSearchParams?.toString());
        setContestsData((prevState) => ({
          ...prevState,
          contestFollowed: contestFollowApiRes,
        }));
      }
      setLoading(false)

    } catch (error) {
      console.error(error);
      setLoading(false)
    }
  }



  const contestFormListing = async () => {
    let query = router.query;
    let urlSearchParams = new URLSearchParams();
    try {
      setLoading(true)
      if (query.pagination) {
        urlSearchParams.set('pagination', `${Number(router.query.pagination) - 1}`)
      }

      else {
        urlSearchParams.set('pagination', "0")
      }

      if (query.limit) {
        urlSearchParams.set('limit', router.query.limit as string)
      }
      else {
        urlSearchParams.set('limit', "10")
      }
      if (query.search) {
        urlSearchParams.set('search', router.query.search as string)
      }
      if (query.status) {
        urlSearchParams.set('status', String(router.query.status).toUpperCase() as string)
      }
      else {
        if (((router?.query?.type == "contest-created") || (router?.query?.type == "contest-joined")) && (router?.query?.status === undefined)) {
          urlSearchParams.set('status', 'UPCOMING')
        }
      }
      console.log(router.query.status, "status")


      // **************** Contestent Form Submission ****************
      const contestFormListingApiRes = await henceforthApi.Contestent.listingContestentForm(urlSearchParams?.toString());

      setContestsData((prevState) => ({
        ...prevState,
        contestFormListing: {
          ...prevState.contestFormListing,
          listing: contestFormListingApiRes
        }
      }));
      // console.log(contestsData?.contestFormListing?.listing, "contestsData?.contestFormListing?.listing");

      setLoading(false)

    } catch (error) {
      console.error(error);
      setLoading(false)
    }
  }

  const contesCreatedtListing = async () => {
    let query = router.query;
    let urlSearchParams = new URLSearchParams();
    setLoading(true)
    try {

      if (query.pagination) {
        urlSearchParams.set('pagination', `${Number(router.query.pagination) - 1}`)
      }

      else {
        urlSearchParams.set('pagination', "0")
      }

      if (query.limit) {
        urlSearchParams.set('limit', router.query.limit as string)
      }
      else {
        urlSearchParams.set('limit', "10")
      }
      if (query.search) {
        urlSearchParams.set('search', router.query.search as string)
      }
      if (query.status) {
        urlSearchParams.set('status', String(router.query.status).toUpperCase() as string)
      }
      else {
        if (((router?.query?.type == "contest-created") || (router?.query?.type == "contest-joined")) && (router?.query?.status === undefined)) {
          urlSearchParams.set('status', 'UPCOMING')
        }
      }
      console.log(router.query.status, "status")



      const contestCreatedApiRes = await henceforthApi.Contest.contestCreatedListing(urlSearchParams?.toString());
      // setContestsData((prevState) => ({
      //   ...prevState,
      //   contestCreated: contestCreatedApiRes,
      // }));



      if (router?.query?.status) {
        setContestsData((prevState) => ({
          ...prevState,
          contestCreated: {
            data: contestCreatedApiRes, total_count: contestCreatedApiRes?.total_count, count: contestCreatedApiRes?.count
          },
        }));
      } else {
        setContestsData((prevState) => ({
          ...prevState,
          contestCreated: {
            data: null, total_count: contestCreatedApiRes?.total_count, count: null
          },
        }));
      }
      setLoading(false)

    } catch (error) {
      setLoading(false)
      console.error(error);
    }
  }

  // contestFormListing, contesCreatedtListing, contestJoinedListing
  const contestJoinedListing = async () => {
    let query = router.query;
    let urlSearchParams = new URLSearchParams();
    setLoading(true)
    try {
      if (query.pagination) {
        urlSearchParams.set('pagination', `${Number(router.query.pagination) - 1}`)
      }

      else {
        urlSearchParams.set('pagination', "0")
      }

      if (query.limit) {
        urlSearchParams.set('limit', router.query.limit as string)
      }
      else {
        urlSearchParams.set('limit', "10")
      }
      if (query.search) {
        urlSearchParams.set('search', router.query.search as string)
      }
      if (query.status) {
        urlSearchParams.set('status', String(router.query.status).toUpperCase() as string)
      }
      else {
        if (((router?.query?.type == "contest-created") || (router?.query?.type == "contest-joined")) && (router?.query?.status === undefined)) {
          urlSearchParams.set('status', 'UPCOMING')
        }
      }
      console.log(router.query.status, "status")


      // **************** Contest Joined ****************
      console.log(urlSearchParams?.toString(), "urlSearchParams?.toString()");


      const contestJoinedApiRes = await henceforthApi.Contest.contestJoinedListing(urlSearchParams?.toString());

      if (router?.query?.status) {
        setContestsData((prevState) => ({
          ...prevState,
          contestJoined: {
            data: contestJoinedApiRes, total_count: contestJoinedApiRes?.total_count, count: contestJoinedApiRes?.total_count.count
          },
        }));
      } else {
        setContestsData((prevState) => ({
          ...prevState,
          contestJoined: {
            data: null, total_count: contestJoinedApiRes?.total_count, count: null
          },
        }));
      }
      setLoading(false)

    } catch (error) {
      console.error(error);
      setLoading(false)
    }
  }


  // contestFormListing, contesCreatedtListing, contestJoinedListing,contestFollowListing

  const contestFollowListing = async () => {
    let query = router.query;
    let urlSearchParams = new URLSearchParams();

    try {
      setLoading(true)
      if (query.pagination) {
        urlSearchParams.set('pagination', `${Number(router.query.pagination) - 1}`)
      }

      else {
        urlSearchParams.set('pagination', "0")
      }

      if (query.limit) {
        urlSearchParams.set('limit', router.query.limit as string)
      }
      else {
        urlSearchParams.set('limit', "10")
      }
      if (query.search) {
        urlSearchParams.set('search', router.query.search as string)
      }
      if (query.status) {
        urlSearchParams.set('status', String(router.query.status).toUpperCase() as string)
      }
      else {
        if (((router?.query?.type == "contest-created") || (router?.query?.type == "contest-joined")) && (router?.query?.status === undefined)) {
          urlSearchParams.set('status', 'UPCOMING')
        }
      }
      console.log(router.query.status, "status")

      // **************** Contest I Follow ****************
      const contestFollowApiRes = await henceforthApi.Contest.contestFollowListing(urlSearchParams?.toString());
      setContestsData((prevState) => ({
        ...prevState,
        contestFollowed: contestFollowApiRes,
      }));

      setLoading(false)
    } catch (error) {
      console.error(error);
      setLoading(true)
    }
  }


  useEffect(() => {
    contestFormListing(),
      contesCreatedtListing(),
      contestJoinedListing(),
      contestFollowListing()
    contestListing()
  }, [router.query.pagination, router.query.limit, router.query.search, router.query.status, router?.query?.type])



  // ******************** Submitted Forms Route Set ********************
  const submitContestents = (_id, filling_type) => {
    router.replace(
      {
        pathname: '/profile/participants-form/',
        query: {
          // submit: filling_type === 'Submit',
          _id: _id,
          filling_type: filling_type
        },
      },
      undefined, { shallow: true, scroll: false }
    );
  };

  // ******************** Submitted Forms DropDown ********************
  const renderDropdownItems = (_id) => [
    {
      key: 'Submit',
      label: (
        <button className='btn-icon fw-medium' onClick={() => submitContestents(_id, FillingInfo.SUBMIT)}>
          Submit
        </button>
      ),
    },
    {
      key: 'send_back',
      label: (
        <button className='btn-icon fw-medium' onClick={() => submitContestents(_id, FillingInfo.EDIT)}>
          Send Back For Edit
        </button>
      ),
    },
    {
      key: 'delete',
      label: (
        <button className='btn-icon fw-medium' onClick={() => submitContestents(_id, FillingInfo.DELETE)}>
          Delete
        </button>
      ),
    },
  ];



  useEffect(() => {
    const selectedContestentIds = contestsData?.contestFormListing?.listing?.data
      ?.flatMap(data => data.contestents)
      ?.filter(contestent => contestent.is_selected)
      ?.map(contestent => contestent._id) || [];
    setSelectedId(selectedContestentIds);
  }, [contestsData]);

  // ******************** Set Form Submit Checkbox ********************
  const onChecked = (id) => {
    setContestsData((prev) => ({
      ...prev,
      contestFormListing: {
        ...prev.contestFormListing,
        listing: {
          ...prev.contestFormListing.listing,
          data: prev.contestFormListing?.listing?.data.map((contest) => ({
            ...contest,
            contestents: contest.contestents.map((contestent) =>
              contestent._id === id ? { ...contestent, is_selected: !contestent.is_selected } : contestent
            ),
          })),
        },
      },
    }));

    console.log(
      contestsData?.contestFormListing?.listing?.data
        ?.flatMap(contest => contest.contestents)
        ?.find((contestent) => contestent._id === id)?.is_selected,
      'is_selected'
    );
  };

  // ************************ Review Contestent FOrm ************************
  const onFinish = async (values: any) => {
    const payLoad = {
      contest_id: router.query._id,
      contestent_id: selectedId,
    };


    if (router?.query?.filling_type === "EDIT" || router?.query?.filling_type === "SUBMIT") {
      payLoad["after_filling_fields"] = router.query.filling_type === "EDIT" ? "REVIEW" : "SUBMIT"
      payLoad["type"] = router.query.filling_type === "EDIT" ? "EDIT" : "SUBMIT"
    }

    if (router?.query?.filling_type === "DELETE") {
      payLoad["type"] = "DELETE"
    }

    console.log(payLoad, "payLoad________");


    // return
    try {
      setFormLoading(true)
      const apiRes = await henceforthApi.Contestent.reviewcontestentFormDetail(payLoad);
      Toast.success(apiRes.message)
      setFormLoading(true)

      router.replace({ pathname: "/" }, undefined, { shallow: true, scroll: false })
    } catch (error) {
      Toast.error(error)
      setFormLoading(true)
    }
  }


  // ******************** Contest Created Tabs ********************
  const contestCreated: TabsProps['items'] = [
    {
      key: ContestStatus.UPCOMING,
      label: <Typography.Text>Upcoming</Typography.Text>,
      children:
        <Fragment>
          <Spin spinning={loading} tip size="large">
            {contestsData?.contestCreated?.data?.length > 0 ?
              <Row gutter={[24, 40]}>
                {
                  Array.isArray(contestsData?.contestCreated?.data) && contestsData?.contestCreated?.data?.map((res: ContestCardProps) => {
                    return (
                      <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                        <ContestCard  {...res} />
                      </Col>
                    )
                  })
                }
              </Row>
              :
              <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
          </Spin>
        </Fragment>
    },
    {
      key: ContestStatus.ONGOING,
      label: <Typography.Text>Ongoing</Typography.Text>,
      children: <Fragment>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestCreated?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestCreated?.data) && contestsData?.contestCreated?.data?.map((res: ContestCardProps) => {
                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                      <ContestCard  {...res} />
                    </Col>
                  )
                })
              }
            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>
      </Fragment>
    },
    {
      key: ContestStatus.COMPLETED,
      label: <Typography.Text>Completed</Typography.Text>,
      children: <Fragment>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestCreated?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestCreated?.data) && contestsData?.contestCreated?.data?.map((res: ContestCardProps) => {
                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                      <ContestCard  {...res} />
                    </Col>
                  )
                })
              }
            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>
      </Fragment>
    },
    {
      key: ContestStatus.PENDING,
      label: <Typography.Text>Pending</Typography.Text>,
      children: <Fragment>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestCreated?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestCreated?.data) && contestsData?.contestCreated?.data?.map((res: ContestCardProps) => {
                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                      <ContestCard  {...res} />
                    </Col>
                  )
                })
              }
            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>
      </Fragment>
    }
  ]

  // ******************** Contest Joined Tabs ********************
  const contestJoined: TabsProps['items'] = [
    {
      key: ContestStatus.UPCOMING,
      label: <Typography.Text>Upcoming</Typography.Text>,
      children: <Fragment>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestJoined?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestJoined?.data) && contestsData?.contestJoined?.data?.map((res: ContestCardProps) => {
                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                      <ContestCard  {...res} isEdit href={`/profile/contestent/${res?._id}/edit`} />
                    </Col>
                  )
                })
              }
            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>
      </Fragment>
    },
    {
      key: ContestStatus.ONGOING,
      label: <Typography.Text>Ongoing</Typography.Text>,
      children: <Fragment>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestJoined?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestJoined?.data) && contestsData?.contestJoined?.data?.map((res: ContestCardProps) => {
                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                      <ContestCard  {...res} />
                    </Col>
                  )
                })
              }
            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>
      </Fragment>
    },
    {
      key: ContestStatus.COMPLETED,
      label: <Typography.Text>Completed</Typography.Text>,
      children: <Fragment>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestJoined?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestJoined?.data) && contestsData?.contestJoined?.data?.map((res: ContestCardProps) => {
                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                      <ContestCard  {...res} />
                    </Col>
                  )
                })
              }
            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>
      </Fragment>
    },
    {
      key: ContestStatus.PENDING,
      label: <Typography.Text>Pending</Typography.Text>,
      children: <Fragment>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestJoined?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestJoined?.data) && contestsData?.contestJoined?.data?.map((res: ContestCardProps) => {
                  console.log(res, "res");
                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?._id}>
                      <ContestCard  {...res} isEdit href={`/profile/contestent/${res?._id}/edit`} />
                    </Col>
                  )
                })
              }
            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>
      </Fragment>
    }
  ]



  // ******************** Main Tabs Extra Control ********************
  const contestCreatedExtra = <Flex gap={12} className='mt-4 mt-md-0'>
    <div className="video-search-input position-relative m-0 w-100">
      <Input.Search size="large" type="text" placeholder="Search..." className='text-black' onSearch={onSearch} onChange={(e) => onSearch(e.target.value)} />
      <span className="position-absolute end-0 top-50 translate-middle-y me-4 z-3"><SearchIcon /></span>
    </div>
  </Flex>;


  // ******************** Main Tabs ********************
  const items: TabsProps['items'] = [
    {
      key: 'participants-form',
      label: <Flex wrap='nowrap' align='center' gap={4}><Typography.Text>Participants Form</Typography.Text> <TabBadge>{contestsData?.contestFormListing?.listing?.count || 0}</TabBadge></Flex>,
      children: <ProfileWrapperElement>
        <Spin spinning={loading} tip size="large">
          <>
            {contestsData?.contestFormListing?.listing?.data?.length > 0 ? (
              <div className='d-flex flex-column gap-4'>
                {Array.isArray(contestsData?.contestFormListing?.listing?.data) && contestsData?.contestFormListing?.listing?.data?.map((data, index) => (
                  <Fragment key={index}>
                    <Flex justify='space-between' className='mb-4 mb-md-5'>
                      <div className='text-start'>
                        <Typography.Title level={4} className='m-0 mb-2'>Submitted Forms For Review & Submission - ({data?.contestents?.length || 0})</Typography.Title>
                        <Typography.Title level={5} className='m-0 primary-font-size'><span className='fw-bold'>Contest :</span> <span className='fw-medium text-uppercase'>{data?.title}</span></Typography.Title>
                      </div>
                      <Dropdown trigger={['click']} menu={{ items: renderDropdownItems(data?._id) }} placement="bottomLeft">
                        <Button type='text' className='btn-icon align-self-start' icon={<MoreIcon />}></Button>
                      </Dropdown>
                    </Flex>
                    <Form onFinish={onFinish} onFinishFailed={(error) => console.log(error)}>
                      <Form.Item>
                        {data.contestents?.length ? (
                          <Row gutter={[24, 24]}>
                            {Array.isArray(data.contestents) && data?.contestents?.map((res) => (
                              <Col span={24} md={24} lg={12} key={res?._id}>
                                <div className='participant-card p-md-4 p-3 rounded-4 position-relative'>
                                  <div className='position-relative'>
                                    <div className='position-absolute top-0 end-0'>
                                      <Flex gap={8} align='center'>
                                        {(router?.query?.filling_type && (router.query._id === data?._id)) && (
                                          <Checkbox checked={res?.is_selected || false} onChange={() => onChecked(res?._id)} />
                                        )}
                                      </Flex>
                                    </div>
                                    <Link className='text-black text-decoration-none' href={`/profile/participant/${res?._id}/view`}>
                                      <Flex align='center' vertical={screens.sm ? false : true}>
                                        <img src={res?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${res?.profile_pic}` : contestantImage.src} className='object-fit-cover border bg-light' alt="contestant image" onError={(e) => { e.currentTarget.src = contestantImage.src }} width={120} height={120} />
                                        <div className='d-flex flex-column gap-1 text-start p-md-4 p-3 text-center text-sm-start'>
                                          <Typography.Title level={5} className='m-0 fw-bold primary-font-size text-black'>
                                            {res?.name}</Typography.Title>
                                          <Typography.Paragraph className='m-0 fw-medium secondary-font-size text-black'>{res?.email}</Typography.Paragraph>
                                          <Typography.Paragraph className='m-0 fw-medium secondary-font-size text-danger'>{res?.contest_link}</Typography.Paragraph>
                                        </div>
                                      </Flex>
                                    </Link>
                                  </div>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        ) : (
                          <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={"No form submitted found."} />
                        )}
                      </Form.Item>
                      {(router?.query?.filling_type && (router.query._id === data?._id)) && (
                        <>
                          <Form.Item className="my-5" valuePropName="checked" name={'confirm_check'} rules={[{
                            required: true, validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Please check the checkbox.'))
                          }]}>
                            <Checkbox>Looks good. I will Submit</Checkbox>
                          </Form.Item>
                          <Button type='primary' loading={false} disabled={!selectedId?.length} size='large' htmlType='submit' shape='round'>Confirm & Submit</Button>
                        </>
                      )}
                    </Form>
                  </Fragment>
                ))}
              </div>)
              :
              <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Participant Forms Found'} />}
          </>
        </Spin>
        <Row className='mb-4 mb-md-5'>
          <Col span={24}>
            <div className='text-center pb-5'>
              <Pagination
                total={contestsData?.contestFormListing?.listing?.count}
                current={Number(router?.query?.page)}
                responsive={true}
                onChange={handlePagination}
                hideOnSinglePage={true}
              />
            </div>
          </Col>
        </Row>
      </ProfileWrapperElement>,
    },
    {
      key: 'contest-created',
      label: <Flex wrap='nowrap' align='center' gap={4}>
        <Typography.Text>Contest Created</Typography.Text>
        <TabBadge>{contestsData?.contestCreated?.total_count || 0}</TabBadge>
      </Flex>,
      children: <ProfileWrapperElement>
        <div className='tabs-without-border'>
          <Tabs centered activeKey={String(router.query.status || ContestStatus.UPCOMING)} items={contestCreated} onChange={onChangeCreatedContest} tabBarExtraContent={contestCreatedExtra} />
        </div>
        <Row justify={'center'} className="mt-4">
          <Col span={24} className="text-center">
            <Pagination
              total={contestsData?.contestCreated?.count}
              current={Number(router?.query?.page)}
              responsive={true}
              onChange={handlePagination}
              hideOnSinglePage={true}
            />
          </Col>
        </Row>
      </ProfileWrapperElement>,
    },
    {
      key: 'contest-joined',
      label: <Flex wrap='nowrap' align='center' gap={4}><Typography.Text>Contest Joined</Typography.Text> <TabBadge>{contestsData?.contestJoined?.total_count || 0}</TabBadge></Flex>,
      children: <ProfileWrapperElement>
        <div className='tabs-without-border'>
          <Tabs centered activeKey={String(router.query.status || ContestStatus.UPCOMING)} items={contestJoined} onChange={onChangeJoinedContest} tabBarExtraContent={contestCreatedExtra} destroyInactiveTabPane />
        </div>
        <Row justify={'center'} className="mt-4">
          <Col span={24} className="text-center">
            <Pagination
              total={contestsData?.contestJoined?.count}
              current={Number(router?.query?.page)}
              responsive={true}
              onChange={handlePagination}
              hideOnSinglePage={true}
            />
          </Col>
        </Row>
      </ProfileWrapperElement>,
    },
    {
      key: 'rewards',
      label: <Flex wrap='nowrap' align='center' gap={4}><Typography.Text>Rewards</Typography.Text> <TabBadge>{contestsData?.rewardListing?.data?.length || 0}</TabBadge></Flex>,
      children: <div className='shadow bg-light'>
        <div className="table-responsive">
          <table className='table mb-0 align-middle rewards-table'>
            <thead>
              <tr>
                <th>Contest Name</th>
                <th className=''>Contest Round</th>
                <th className=''>Date</th>
                <th className=''>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                contestsData?.rewardListing?.data?.length ?
                  <Fragment>
                    {Array.isArray(contestsData?.rewardListing?.data) && contestsData?.rewardListing?.data?.map((res: any) => {
                      return (
                        <tr key={res?._id}>
                          <td>
                            <Flex gap={12} align='center'>
                              <Avatar src={res?.cover_media ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${res?.cover_media}` : placeholder.src} size={40} shape='square'></Avatar>
                              <Typography.Text className='fw-semibold text-black text-capitalize'>{res?.title}</Typography.Text>
                            </Flex>
                          </td>
                          <td>
                            <Typography.Text className='fw-semibold text-black'>{res?.round?.map((data: number) => data).join(', ')}</Typography.Text>
                          </td>
                          <td>
                            <Typography.Text className='fw-semibold text-black'>{uiSettings.formatDate(res?.created_at)}</Typography.Text>
                          </td>
                          <td>
                            <Link href={`/contest/${res?._id}/details`}><Button type='primary' size='small' className='text-black fw-semibold' shape='round' ghost>View Details</Button></Link>
                          </td>
                        </tr>
                      )
                    })}
                  </Fragment>
                  :
                  <tr>
                    <td colSpan={4}>
                      <PlaceholderImage xs={12} sm={12} md={10} lg={8} xl={6} xxl={6} description="No rewards found." />
                    </td>
                  </tr>
              }

            </tbody>
          </table>
        </div>

        <Row className='mt-4 mt-md-5'>
          <Col span={24}>
            <div className='text-center pb-5'>
              <Pagination
                total={contestsData?.rewardListing?.count}
                current={Number(router?.query?.page)}
                responsive={true}
                onChange={handlePagination}
                hideOnSinglePage={false}
              />
            </div>
          </Col>
        </Row>


      </div>,
    },
    {
      key: 'contest-follow',
      label: <Flex wrap='nowrap' align='center' gap={4}><Typography.Text>Contest I Follow</Typography.Text> <TabBadge>{contestsData?.contestFollowed?.data.length}</TabBadge></Flex>,
      children: <ProfileWrapperElement>
        <Spin spinning={loading} tip size="large">
          {contestsData?.contestFollowed?.data?.length > 0 ?
            <Row gutter={[24, 40]}>
              {
                Array.isArray(contestsData?.contestFollowed?.data) && contestsData?.contestFollowed?.data?.map((res: ContestCardProps) => {

                  console.log(res, "res");

                  return (
                    <Col span={24} sm={12} md={12} lg={8} xl={8} xxl={8} key={res?.contest_id}>
                      <ContestCard  {...res} contest_id={res?.contest_id} />
                    </Col>
                  )
                })
              }

            </Row> :
            <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contest Found'} />}
        </Spin>

        <Col span={24}>
          <div className='text-center'>
            <Pagination
              total={contestsData?.contestFollowed?.count}
              current={Number(router?.query?.page)}
              responsive={true}
              onChange={handlePagination}
              hideOnSinglePage={true}
            />
          </div>
        </Col>
      </ProfileWrapperElement>
    },
  ];

  return (
    <ProfileLayout>
      <Row className="py-4 py-md-5">
        <Col span={24}>
          <WrapperElement>
            <div className="tabs-wrapper mt-4">
              {/* <Tabs centered={screens.xl ? true : false} activeKey={String(router.query.type)} items={items} onChange={onChange} /> */}
            </div>
          </WrapperElement>
        </Col>
      </Row>
    </ProfileLayout>
  )
}



CreatorProfile.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default CreatorProfile