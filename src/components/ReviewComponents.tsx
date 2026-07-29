import React, { Fragment, useContext, useEffect, useState } from 'react'
import SectionTitle from './common/SectionTitle'
import { Avatar, Button, Checkbox, Col, Divider, Flex, Form, Grid, Input, Row, Select, Space, Spin, Typography } from 'antd'
import ReplyIcon from './Icons/ReplyIcon'
import NumberFormatter from './common/NumberFormatter'
import ThumbUpFilled from './Icons/ThumbUpFilled'
import profile from "@/assets/images/profile.png"
import IsContestant from '@/components/review/IsContestant';
import NotContestant from '@/components/review/NotContestant';
import SuccessModalContent from '@/components/review/SuccessModalContent';
import FindProfile from '@/components/review/FindProfile';
import RatingComponent from '@/components/RatingComponent';
import VoteUpArrow from '@/components/Icons/VoteUpArrow';
import ChatLine from '@/components/Icons/ChatLine';
import VerifiedIcon from '@/components/Icons/VerifiedIcon';
import CommonModal from './common/CommonModal'
import Link from 'next/link'
import { GlobalContext } from '@/context/Provider'
import WrapperElement from './common/WrapperElement'
import henceforthApi from '@/utils/henceforthApi'
import { useRouter } from 'next/router'
import FilterIcon from './Icons/FilterIcon'
import PlaceholderImage from './cards/PlaceholderImage'
import GetFinalistPosition from './GetFinalistPosition'
import ThumbUpOutlined from './Icons/ThumbUpOutlined'

const ReviewComponents = ({ data, hasSearch, hasTitle, hasSeeMore, hasLoadMore }: any) => {
  const router = useRouter()
  const screens = Grid.useBreakpoint();
  const { Toast } = useContext(GlobalContext);
  const [contestants, setContestants] = useState('');
  const [findProfile, setFindProfile] = useState(false);
  const [id, setId] = useState(null)
  const [form] = Form.useForm()
  const [formLoading, setFormLoading] = useState(false)
  // ************* Add Review Modal *************
  const [reviewAddModalOpen, setReviewAddModalOpen] = useState(false);
  const showReviewAddModal = () => {
    setReviewAddModalOpen(true)
  }
  const cancelReviewAddModal = () => {
    setReviewAddModalOpen(false)

  }

  // ************* Add Review Success Modal *************
  const [reviewSuccessModalOpen, setReviewSuccessModalOpen] = useState(false);
  const showReviewAddSuccessModal = () => {
    setReviewAddModalOpen(false)
    setReviewSuccessModalOpen(true)
  }
  const cancelReviewAddSuccessModal = () => {
    setReviewSuccessModalOpen(false)
  }

  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortQuery, setSortQuery] = useState(1)
  const [reviews, setReviews] = useState([] as any)
  const [count, setCount] = useState(0 as any)
  const [pagination, setPagination] = useState(0)
  console.log(reviews, "reviews____________");
  console.log(count, "count__________");


  const getListingReviews = async () => {
    setLoading(true);
    try {
      const apires = await henceforthApi.Contest.getreviews(String(router?.query?._id), pagination, searchQuery, sortQuery);
      setReviews(prevReviews => pagination === 0 ? apires?.data : prevReviews.concat(apires?.data));
      setCount(apires?.count);
    } catch (error) {
      Toast.error('Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Pagination state changed:", pagination);
    getListingReviews()
  }, [pagination, searchQuery, sortQuery])




  // **************** Reviews Search ****************
  const handleSearchChange = (e: any) => {
    const value = e?.target?.value.trim();
    setSearchQuery(value);

    setTimeout(() => {
      const query = value ? { ...router.query, search: value } : { ...router.query };

      router.push({
        pathname: router.pathname,
        query: query,
      }, undefined, { shallow: true });
    }, 1000);
  };



  // **************** Reviews Sorting ****************
  const handleSortChange = (value: any) => {
    setSortQuery(value);
    const query = value ? { ...router.query, sort: value } : { ...router.query };
    router.push({
      pathname: router.pathname,
      query: query,
    }, undefined, { shallow: true });
  };


  // **************** Like Contest ****************
  const LikeContestReview = async (id) => {
    let payLoad = { id } as any;
    try {
      const apiRes = await henceforthApi.Contest.reviewLike(payLoad);
      Toast.success(apiRes.message);

      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === id
            ? { ...review, is_like: !review.is_like, total_likes: review.is_like ? review.total_likes - 1 : review.total_likes + 1 }
            : review
        )
      );
    } catch (error) {
      Toast.error('Error liking the review');
    }
  };


  return (
    <>
      {/*  Reviews */}
      {data?.reviews_list.length ?
        <div className='my-4 mt-5'>
          <SectionTitle title={"All Reviews"} className='fw-bold sub-title-font-size mb-2' />
          <div className='d-flex flex-column gap-2'>
            {data?.reviews_list?.sort((a, b) => b._id - a._id)?.map((res: any) => {
              console.log(res, "res______");

              return <div key={res?._id}><RatingComponent key={res?._id} filledStarcount={res?._id} feedback_count={res?.count} /></div>
            })}

          </div>
        </div> : ""}

      <Divider className='border border-secondary mt-5' />

      {/* onSearch */}
      {hasSearch &&
        <Row justify={'end'}>
          <Col sm={20} span={24} md={16} lg={10} xl={8} xxl={8}>
            <Flex gap={12}>
              <div className="video-search-input position-relative m-0 w-100">
                <Input.Search size="large" value={searchQuery} type="text" placeholder="Search..." onChange={handleSearchChange} />
              </div>
              <div>
                <Select
                  value={sortQuery}
                  prefixCls="sort-select"
                  suffixIcon={<FilterIcon />}
                  onChange={handleSortChange}
                // onBlur={() => setVisible(false)}
                >
                  <Select.Option value={'1'}>New To Oldest</Select.Option>
                  <Select.Option value={'2'}>Oldest To New</Select.Option>
                </Select>
              </div>
            </Flex>
          </Col>
        </Row>}



      {/* Review From Contestant(s) That Won - 5 */}
      <div className='my-4 mt-5'>
        {hasTitle &&
          <Flex gap={28} align='center' className='mb-5'>
            <SectionTitle title={`Review From Contestant(s) That Won - ${count ? count : ''}`} className='fw-bold sub-title-font-size m-0' />
            <VoteUpArrow />
          </Flex>}
        <div className='d-flex flex-column gap-4'>
          <Spin spinning={loading}>
            {reviews?.length > 0 ?
              <>
                {reviews?.map((res: any, index) => {
                  console.log(res);

                  return (
                    <div key={index}>
                      <Flex gap={30} align='start'>
                        <div className='position-relative'>
                          <img src={res?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${res?.profile_pic}` : profile.src} width={60} height={60} className='rounded-circle border' />
                          <span className='position-absolute' style={{ left: 30, bottom: -20 }}><ChatLine /></span>
                        </div>
                        <div className='flex-grow-1'>
                          <Typography.Title className='fw-semibold text-black primary-font-size m-0'><span className='me-2 text-capitalize'>{res?.name}</span> <VerifiedIcon /></Typography.Title>
                          {res?.position === 0 ? '' : <div><Typography.Paragraph className='fw-normal text-dark secondary-font-size my-1'>Contestant Winner - <GetFinalistPosition position={res?.position} /> Position - <span className='text-capitalize'>{data?.title}</span></Typography.Paragraph>
                            {res?.contestent_votes > 0 ?
                              <Typography.Paragraph className='fw-semibold text-black secondary-font-size m-0'>Won with
                                <span className='text-primary fw-bold'> {res?.contestent_votes} </span> of
                                <span className='text-primary fw-bold'><NumberFormatter props={data?.total_votes} /> </span>
                                votes
                              </Typography.Paragraph> : ''}
                            <Divider className='border border-secondary my-2' /></div>}
                          <Flex gap={screens.lg ? 24 : 12} className='mb-4' align={screens.md ? 'center' : 'start'} vertical={screens.md ? false : true}>
                            <Typography.Paragraph className='fw-medium text-black my-md-2 mb-0'>Said:</Typography.Paragraph>
                            <Checkbox checked={res?.is_reward_receive} className='fw-medium'>Yes I Recieved My Prize</Checkbox>
                            <Checkbox checked={res?.is_prize_liked} className='fw-medium'>Yes, I Liked My Prize</Checkbox>
                          </Flex>

                          <div>
                            <Typography.Paragraph className='fw-semibold text-black my-2'>Additional Information:</Typography.Paragraph>
                            <Typography.Paragraph className='text-black'><q>{res?.add_info}</q></Typography.Paragraph>
                          </div>

                          <ul className='list-unstyled d-flex gap-3 align-items-center mb-2'>
                            <li>
                              <Space>
                                <Button className='btn-icon' onClick={() => LikeContestReview(res?._id)}>
                                  {res.is_like ? <ThumbUpFilled /> : <ThumbUpOutlined />}
                                </Button>
                                {res?.total_likes ? <Typography.Text className="fw-medium text-dark secondary-font-size m-0">Helpful - <NumberFormatter props={res?.total_likes} /></Typography.Text> : ''}
                              </Space>
                            </li>
                            {/*   {res?.total_comments ?
                              <li>
                                <Space>
                                  <Button className='btn-icon'><ReplyIcon /></Button>
                                  <Typography.Text className="fw-medium text-dark secondary-font-size m-0">Comments - <NumberFormatter props={res?.total_comments} /></Typography.Text>
                                </Space>
                              </li> : ''}*/}
                          </ul>
                        </div>
                      </Flex>
                      <Divider className='border border-secondary my-4' />
                    </div>
                  )

                })}
              </>
              :
              <PlaceholderImage xs={16} sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Review Added'} />
            }
          </Spin>
        </div>

        {hasLoadMore && (count > reviews?.length) ?
          <div className='text-center mt-4' onClick={() => { setPagination(pagination + 1) }}>
            <Button size='large' className='primary-font-size fw-normal' type='text'>Load more...</Button>
          </div> : ''}
      </div>

      {/* Reviews From Voter(s) That Won - 23 */}
      <div className='my-4 mt-5'>
        {/* <Flex gap={28} align='center' className='mb-5'>
       <SectionTitle title={"Reviews From Voter(s) That Won - 23"} className='fw-bold sub-title-font-size m-0' />
       <VoteUpArrow />
     </Flex> */}



        <Flex className='text-center mt-5' gap={12} justify='center'>
          {hasSeeMore &&
            <>
              {reviews?.length > 0 &&
                <Link href={`/contest/${data._id}/voter/reviews`}>
                  <Button size='small' className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>See More</Button>
                </Link>
              }
            </>}
          {data?.is_contestent &&
            <Button size='small' className='rounded-pill px-4' htmlType='button' onClick={() => { showReviewAddModal(); setContestants('Yes'); setFindProfile(false) }} type='primary'>ADD REVIEW</Button>}
        </Flex>
      </div>


      {/* ****************** Write your Review *******************/}
      <CommonModal title="Write your Review" isModalOpen={reviewAddModalOpen} handleOk={showReviewAddModal} handleCancel={cancelReviewAddModal}>
        <WrapperElement>
          {contestants === 'Yes' &&
            <IsContestant
              cancelReviewAddModal={cancelReviewAddModal}
              contestants={contestants}
              selectOption={(e: any) => setContestants(e.target.value)}
              FindMyprofile={() => { setFindProfile(true), setContestants('') }} />
          }

          {contestants === 'No' &&
            <NotContestant
              contactHere={() => {
                setContestants('No');
                showReviewAddSuccessModal();
                setContestants('Yes')
              }}
            />}

          {findProfile &&
            <FindProfile
              setcount={setCount}
              pagination={pagination}
              setReviews={setReviews}
              getreviews={getListingReviews}
              cancelReviewAddModal={cancelReviewAddModal}
              findProfileSubmit={() => {
                showReviewAddSuccessModal();
                setContestants('')
              }}
            />
          }

        </WrapperElement>
      </CommonModal>

      {/* ****************** Review Add Success Modal ****************** */}
      <CommonModal title="Congratulations!" isModalOpen={reviewSuccessModalOpen} handleOk={showReviewAddSuccessModal} handleCancel={cancelReviewAddSuccessModal}>
        <WrapperElement>
          <SuccessModalContent
            cancelReviewAddSuccessModal={cancelReviewAddSuccessModal}
            GotitSuccess={() => {
              setContestants('');
              cancelReviewAddSuccessModal()
            }} />
        </WrapperElement>
      </CommonModal>

    </>
  )
}

export default ReviewComponents