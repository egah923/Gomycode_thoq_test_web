import React, { Fragment, useContext, useEffect, useState } from 'react'
import CommentForm from './CommentForm'
import WrapperElement from '../common/WrapperElement'
import { Button, Flex, Form, Grid, Spin, Typography } from 'antd'
import SectionTitle from '../common/SectionTitle'
import CommentsList from './CommentsList'
import henceforthApi from '@/utils/henceforthApi'
import { GlobalContext } from '@/context/Provider'
import { CommentsListProps } from '@/utils/interface'

const CommentComponent = ({ setCommentCount, contest_id }: any) => {
  const { Toast } = useContext(GlobalContext)
  const [formLoading, setFormLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState(null) as any
  const [showMoreComments, setShowMoreComments] = useState(false)
  // console.log(comments);

  const [form] = Form.useForm()

  // ********************** Create Comment API Call **********************
  const onFinish = async (values: any) => {

    try {
      setFormLoading(true)
      let payLoad = {
        contest_id: contest_id,
        comment: values?.comment
      }
      const apiRes = await henceforthApi.Contest.contestCreateComment(payLoad);
      console.log(apiRes);
      form.resetFields()
      getContestComments()
      Toast.success('Comment Added Successfully.')
      setFormLoading(false)
    } catch (error) {
      Toast.error(error)
      setFormLoading(false)
    }
  }

  // ********************** Get Comments API Call **********************

  const getContestComments = async () => {

    try {
      setLoading(true)
      const apiRes = await henceforthApi.Contest.contestCommentListing(contest_id);
      // console.log(apiRes);
      setComments(apiRes)
      setCommentCount(apiRes?.count || 0);
      setLoading(false)
    } catch (error) {
      Toast.error(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getContestComments()
  }, [contest_id])

  const screens = Grid.useBreakpoint()


  return (
    <Fragment>
      <WrapperElement className='mt-md-4 pt-5'>
        <div className='mb-3'>
          <Flex justify='space-between' vertical={screens.md ? false : true}>
            <SectionTitle title={`Comments  -  ${comments?.count ? comments?.count : ''}`} className='fw-bold m-0' />
            <Typography.Title className='text-light sub-title-font-size m-0 fw-medium'>Contest Votes Reviews</Typography.Title>
          </Flex>
        </div>
      </WrapperElement>
      {/* *************************** Comment Form **************************** */}
      <CommentForm onFinish={onFinish} formLoading={formLoading} form={form} />

      {/* *************************** Comments List **************************** */}
      <WrapperElement className='mt-4'>
        <Spin spinning={loading} tip size="large">
          <div className='d-flex flex-column gap-4'>
            {
              Array.isArray(comments?.data) && comments?.data?.slice(0, (showMoreComments ? comments?.data?.length : 3)).map((res: CommentsListProps) => {
                return (
                  <CommentsList  {...res} key={res?._id} getContestComments={getContestComments} />
                )
              })
            }
          </div>
        </Spin>

        {comments?.data?.length > 5 &&
          <div className='text-center mt-4 mt-md-5'>
            <Button size='middle' type='default' onClick={() => setShowMoreComments(!showMoreComments)} className='shadow-md px-4 px-md-5 bg-transparent text-primary shadow-md border-white' shape='round' htmlType='submit'>
              <span className='text-shadow-md'>
                {showMoreComments ? "See Less " : "See More"}</span>
            </Button>
          </div>}
      </WrapperElement>
    </Fragment>
  )
}

export default CommentComponent
