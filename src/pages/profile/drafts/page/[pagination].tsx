import TabBadge from '@/components/common/TabBadge'
import WrapperElement from '@/components/common/WrapperElement'
import ProfileLayout from '@/layouts/ProfileLayout'
import henceforthApi from '@/utils/henceforthApi'
import uiSettings from '@/utils/uiSettings'
import { Avatar, Button, Col, Flex, Pagination, Row, Typography } from 'antd'
import Link from 'next/link'
import React, { Fragment, ReactNode, useContext, useEffect, useState } from 'react'
import placeholerCover from "@/assets/images/video-cover.png"
import SectionTitle from '@/components/common/SectionTitle'
import RootLayout from '@/layouts/RootLayout'
import { useRouter } from 'next/router'
import { DeleteFilled, EyeFilled } from "@ant-design/icons"
import { GlobalContext } from '@/context/Provider'
import PlaceholderImage from '@/components/cards/PlaceholderImage'

const DraftsContests = () => {
  const router = useRouter()
  const { Toast } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false)
  const [contestsData, setContestsData] = useState({
    draftListing: null,
    count: 0
  }) as any;


  const handlePagination = (page: number, pageSize: number) => {
    router.replace({
      query: { ...router.query, pagination: page, limit: pageSize }
    }, undefined, { shallow: true, scroll: false })
  }


  // ******************** Contest Reward Listing ********************
  const draftListing = async () => {
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

      const apiRes = await henceforthApi.Contest.contestDraftListing(urlSearchParams.toString());
      setContestsData((prev) => ({
        ...prev, draftListing: apiRes,
        count: apiRes.count
      }))

      setLoading(false)

    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  }


  useEffect(() => {
    draftListing()
  }, [router?.query?.pagination])


  // ********************** Delete Draft **********************
  const deleteDraft = async (id: string) => {
    try {
      const apiRes = await henceforthApi.Contest.contestDraftDelete(id);
      Toast.success(apiRes.message)
      draftListing();
    } catch (error) {
      Toast.error(error)
    }
  }


  return (
    <ProfileLayout>
      <Row className="py-4 py-md-5">
        <Col span={24}>
          <WrapperElement>
            <div className="tabs-wrapper mt-4">
              <SectionTitle className='mb-4 fw-bold' title={<Flex align='center'>
                <span className='me-2'>Draft Contests</span>
                <TabBadge>{contestsData?.count}</TabBadge>
              </Flex>} />
              <div className='shadow bg-light'>
                <div className="table-responsive">
                  <table className='table mb-0 align-middle rewards-table'>
                    <thead>
                      <tr>
                        <th>Sno.</th>
                        <th>Contest Name</th>
                        <th>Created Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        contestsData?.draftListing?.data?.length ?
                          <Fragment>
                            {Array.isArray(contestsData?.draftListing?.data) && contestsData?.draftListing?.data?.map((res: any, index: number) => {
                              return (
                                <tr key={res?._id}>
                                  <td>
                                    <Typography.Text className='fw-semibold text-black'>{`${(router?.query?.pagination!='1')?(Number(router?.query?.pagination)-1)*10+index+1:index+1}`}</Typography.Text>
                                  </td>
                                  <td>
                                    <Flex gap={12} align='center'>
                                      <Typography.Text className='fw-semibold text-black text-capitalize'>{res?.title}</Typography.Text>
                                    </Flex>
                                  </td>
                                  <td>
                                    <Typography.Text className='fw-semibold text-black'>{uiSettings.formatDate(res?.created_at)}</Typography.Text>
                                  </td>
                                  <td>
                                    <Flex gap={16}>
                                      <Link href={`/profile/drafts/${res?._id}`}><Button type='primary' className='text-black fw-semibold' shape='circle' icon={<EyeFilled />}></Button>
                                      </Link>
                                      <Button type='primary' shape='circle' className='text-white' onClick={() => deleteDraft(res?._id)} danger icon={<DeleteFilled />}></Button>
                                    </Flex>
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
                        total={contestsData?.draftListing?.count}
                        current={Number(router?.query?.page)}
                        responsive={true}
                        onChange={handlePagination}
                        hideOnSinglePage={false}
                      />
                    </div>
                  </Col>
                </Row>


              </div>
            </div>
          </WrapperElement>
        </Col>
      </Row>
    </ProfileLayout>
  )
}



DraftsContests.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default DraftsContests