import CommentIcon from '@/components/Icons/CommentIcon'
import ReplyIcon from '@/components/Icons/ReplyIcon'
import henceforthApi from '@/utils/henceforthApi'
import { ContestCardProps } from '@/utils/interface'
import { Button, Dropdown, Flex, Menu, Space, Tooltip, Typography } from 'antd'
import Link from 'next/link'
import contest from "@/assets/images/contest.png"
import uiSettings from '@/utils/uiSettings'
import { useContext, useState } from 'react'
import { GlobalContext } from '@/context/Provider'
import ThumbUpFilled from '@/components/Icons/ThumbUpFilled'
import ThumbUpOutlined from '@/components/Icons/ThumbUpOutlined'
import placeholerCover from "@/assets/images/video-cover.png"
import EditIcon from '@/components/Icons/EditIcon'
import EditOutlined from '@/components/Icons/EditOutlined'
import { EllipsisOutlined } from '@ant-design/icons';

const ContestCard = (props: ContestCardProps) => {
  console.log(props, "props___________");


  const { Toast } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState({
    is_contest_like: props?.is_contest_like,
    total_likes: props?.total_likes
  });
  const [share, setShare] = useState(props?.total_share);

  const likeContest = async (_id: string) => {
    try {
      setLoading(true)
      let payLoad = {
        id: props?.contest_id ? props?.contest_id : props?._id
      }
      const apiRes = await henceforthApi.Contest.likeContest(payLoad);
      Toast.success(apiRes.message);

      setLiked(prev => ({
        is_contest_like: !prev.is_contest_like,
        total_likes: prev.is_contest_like ? prev.total_likes - 1 : prev.total_likes + 1
      }));

      setLoading(false)
    } catch (error) {
      Toast.error(error);
      setLoading(false)
    }
  }


  // ****************** Share Contest API CALL ******************
  const shareContest = async (_id: string) => {
    try {
      setLoading(true)
      let payLoad = {
        // id: _id
        id: props?.contest_id ? props?.contest_id : props?._id
      }
      const apiRes = await henceforthApi.Contest.shareContest(payLoad);
      // Toast.success(apiRes.message);
      setShare(share + 1)

      setLoading(false)
    } catch (error) {
      Toast.error(error);
      setLoading(false)
    }


  }
  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={()=>{window.open(props?.contest_id ? `/contest/${props?.contest_id}/details` : `/contest/${props?._id}/details`,"_self");}}>
        Open in same Tab
      </Menu.Item>
      <Menu.Item key="2" onClick={()=>{window.open(props?.contest_id ? `/contest/${props?.contest_id}/details` : `/contest/${props?._id}/details`,"_blank");}}>
        Open in new Tab
      </Menu.Item>
    </Menu>
  );
  

  const placeholderImage = placeholerCover.src
  return (

    <div className='contest-card rounded-3 overflow-hidden shadow h-100 d-flex flex-column'>
      <div className="contest-card__image">
        <Link className='text-decoration-none text-black' href={props?.contest_id ? `/contest/${props?.contest_id}/details` : `/contest/${props?._id}/details`}>
          <img src={props?.cover_media ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.cover_media}` : placeholderImage} className='w-100 object-fit-cover h-100' height={250} alt={props?.title} onError={(e) => { e.currentTarget.src = placeholderImage }} />
          </Link>
      </div>
      <div className="contest-card__content bg-primary p-3 flex-grow-1 d-flex flex-column">
        <div>
          <Flex justify='space-between' align='start'>
            <Tooltip title={props?.title}>
              <Typography.Title level={4} className='fw-bold m-0 primary-font-size mb-1 text-capitalize line-clamp line-1'>
                  {props?.title}
              </Typography.Title>
            </Tooltip>
            {
              (props.isEdit && props?.is_detail_filled) && <Link href={props?.href}><EditOutlined width={16} height={16} /></Link>
            }
          </Flex>
          <ul className='d-flex gap-3 list-unstyled align-items-center'>
            <li className='text-black secondary-font-size fw-medium'>{uiSettings.formatDate(props?.start_date)}</li>
            {/* <li className='text-black secondary-font-size fw-medium'>{props?.round}</li> */}
          </ul>
        </div>
       <Flex justify='space-between' align='center'>
       <ul className='m-0 d-flex gap-3 list-unstyled align-items-center mt-auto'>
          <li>
            <Flex align='center' gap={4}>
              <Button onClick={(e) => { likeContest(props?._id); e.stopPropagation() }} className='btn-icon' disabled={loading}>
                {liked.is_contest_like ?
                  <ThumbUpFilled width={20} height={20} /> : <ThumbUpOutlined width={20} height={20} />}
              </Button>
              <span className='text-secondary secondary-font-size fw-medium'>{liked.total_likes ? liked.total_likes : ''}</span>
            </Flex>
          </li>
          <li>
            <Flex align='center' gap={4}>
              <CommentIcon width={20} height={20} />
              <span className='text-secondary secondary-font-size fw-medium'>{props?.total_comments ? props?.total_comments : ''}</span>
            </Flex>
          </li>
          <li>
            <Flex align='center' gap={4}>
              <Button onClick={(e) => { shareContest(props?._id); e.stopPropagation() }} className='btn-icon' disabled={loading}>
                <ReplyIcon width={20} height={20} />
              </Button>
              <span className='text-secondary secondary-font-size fw-medium'>{share ? share : ''}</span>
            </Flex>
          </li>
        </ul>
        <Dropdown overlay={menu} trigger={['click']}>
              <Button type='text' ghost size='small' className='border-black   py-1'  shape='circle' icon={<EllipsisOutlined className='fs-4' />} />
            </Dropdown>
       </Flex>
      </div>
    </div>

  )
}

export default ContestCard