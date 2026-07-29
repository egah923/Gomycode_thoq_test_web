import { Avatar, Button, Divider, Dropdown, Flex, Form, Input, MenuProps, Space, Typography } from 'antd'
import { Fragment, useContext, useEffect, useState } from 'react'
import ReplyIcon from '@/components/Icons/ReplyIcon';
import profile from "@/assets/images/profile.png";
import ThumbUpFilled from '../Icons/ThumbUpFilled';
import ChatLine from '../Icons/ChatLine';
import { CommentsListProps } from '@/utils/interface';
import uiSettings from '@/utils/uiSettings';
import henceforthApi from '@/utils/henceforthApi';
import ThumbUpOutlined from '../Icons/ThumbUpOutlined';
import { GlobalContext } from '@/context/Provider';
import MoreIcon from '../Icons/MoreIcon';
import CommentForm from './CommentForm';
interface CommentsListPropsNew extends CommentsListProps {
  getContestComments: () => void,
}
const CommentsList = (props: CommentsListPropsNew) => {
  const { userInfo } = useContext(GlobalContext)
  const { Toast } = useContext(GlobalContext);
  const [formLoading, setFormLoading] = useState(false)
  const [isCommentEdited, isSetCommentEdited] = useState(false)
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);
  const [likedComment, setLikedComment] = useState({
    is_like: props?.is_like,
    total_likes: props?.total_likes
  });
  // ********************** Delete Comment API Call **********************
  const commentDelete = async () => {
    try {
      const apiRes = await henceforthApi.Contest.contestCommentDelete(props?._id);
      Toast.success(apiRes.message)
      props.getContestComments()
    } catch (error) {
      Toast.error(error)
    }
  }
  // ********************** Edit Comment API Call **********************
  useEffect(() => {
    form.setFieldValue('comment', props?.comment)
  },)
  const onFinish = async (values: any) => {
    setFormLoading(true)
    try {
      setFormLoading(true)
      let payLoad = {
        comment_id: props?._id,
        comment: values?.comment
      }
      const apiRes = await henceforthApi.Contest.editContestComment(payLoad);
      form.resetFields()
      props.getContestComments();
      isSetCommentEdited(false)
      setFormLoading(false)
      Toast.success("Comment Updated Successfully!!")
    } catch (error) {
      Toast.error(error)
      setFormLoading(false)
      Toast.error(error)
    }
  }
  // ******************** Comment Action DropDown ********************
  const dropDownitems: MenuProps['items'] = [
    {
      key: 'edit',
      label: (
        <button disabled={isCommentEdited} className='btn-icon fw-medium' onClick={() => isSetCommentEdited(true)}>
          Edit
        </button>
      ),
    },
    {
      key: 'delete',
      label: (
        <button onClick={commentDelete} className='btn-icon fw-medium'>
          Delete
        </button>
      ),
    }
  ];
  // ********************** Like Comment API Call **********************
  const likeContest = async (_id: string, contest_id: string) => {
    try {
      setLoading(true)
      let payLoad = {
        contest_id: contest_id,
        comment_id: _id
      }
      const apiRes = await henceforthApi.Contest.likeContestComment(payLoad);
      Toast.success(apiRes.message);
      setLikedComment(prev => ({
        is_like: !prev.is_like,
        total_likes: prev?.is_like ? prev?.total_likes - 1 : prev?.total_likes + 1
      }));
      setLoading(false)
    } catch (error) {
      Toast.error(error);
      setLoading(false)
    }
  }
  const toggleShowFullComment = () => {
    setShowFullComment(!showFullComment);
  };
  const commentToShow = showFullComment ? props.comment : `${props.comment.slice(0, 200)}...`;
  return (
    <Fragment>
      <Flex gap={30} align='start'>
        <div className='position-relative'>
          <Avatar className='border' src={<img src={props?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.profile_pic}` : profile.src} className='w-100 object-fit-cover' height={250} alt="video cover" onError={(e) => { e.currentTarget.src = profile.src }} />} size={60} shape='circle'></Avatar>
          <span className='position-absolute' style={{ left: 30, bottom: -20 }}><ChatLine /></span>
        </div>
        <div className='flex-grow-1'>
          <Flex justify='space-between'>
            <div>
              <Typography.Title className='fw-semibold text-black primary-font-size m-0 text-capitalize'>{props?.name}</Typography.Title>
              <Typography.Text className='fw-normal text-dark secondary-font-size m-0'>{uiSettings.formatDate(props?.created_at)}</Typography.Text>
            </div>
            {/* {props?.user_id === userInfo?._id &&
              <Dropdown trigger={['click']} menu={{ items: dropDownitems }} placement="bottomLeft">
                <Button type='text' className='btn-icon align-self-start' icon={<MoreIcon />}></Button>
              </Dropdown>} */}
          </Flex>
          <Divider className='border border-black my-2' />
          {!isCommentEdited && <Fragment>
            {/* <Typography.Paragraph className='fw-medium text-black my-2'>{props?.comment}</Typography.Paragraph> */}
            <Typography.Paragraph className='fw-medium text-black my-2'>{commentToShow}</Typography.Paragraph>

            {props.comment.length > 200 ?
              <>
                {!showFullComment &&
                  <Button className="text-primary fw-semibold text-decoration-none p-0 h-unset bg-transparent border-0 bg-transparent shadow-none" type="link" onClick={toggleShowFullComment}>Show more</Button>
                }
                {showFullComment &&
                  <Button className="text-primary fw-semibold text-decoration-none p-0 h-unset bg-transparent border-0 bg-transparent shadow-none" type="link" onClick={toggleShowFullComment}>Show less</Button>
                }
              </> : ''}
            <ul className='list-unstyled d-flex gap-3 align-items-center mb-2'>
              <li>
                <Space>
                  <Button className='btn-icon' onClick={() => likeContest(props._id, props.contest_id)}>
                    {likedComment.is_like ?
                      <ThumbUpFilled /> : <ThumbUpOutlined />}
                  </Button>
                  <Typography.Text className="fw-medium text-dark secondary-font-size m-0">
                    {likedComment?.total_likes ? likedComment?.total_likes : ''}
                  </Typography.Text>
                </Space>
              </li>
              {props?.total_replies ?
                <li>
                  <Space>
                    <Button className='btn-icon'><ReplyIcon /></Button>
                    <Typography.Text className="fw-medium text-dark secondary-font-size m-0">{props?.total_replies ? props?.total_replies : ''} Replies</Typography.Text>
                  </Space>
                </li> : ''}
            </ul>
          </Fragment>}
          {isCommentEdited &&
            <Fragment>
              <Form name="edit_comment_form" className='comment-form light_theme_form mb-5' onFinish={onFinish} form={form}>
                <Form.Item name="comment">
                  <Input.TextArea placeholder="Write your comment here..." rows={5} className='bg-transparent border-top-0 border-start-0 border-end-0' />
                </Form.Item>
                <Form.Item className='text-md-end test-start'>
                  <Flex justify='end' gap={16}>
                    <Button shape='round' onClick={() => isSetCommentEdited(false)}>Cancel</Button>
                    <Button size='small' type='primary' loading={formLoading} disabled={formLoading} className='shadow-md px-4 px-md-5' shape='round' htmlType='submit'>Send</Button>
                  </Flex>
                </Form.Item>
              </Form>
            </Fragment>
          }
        </div>
      </Flex>
      <Divider className='border border-black my-2' />
    </Fragment>
  )
}
export default CommentsList