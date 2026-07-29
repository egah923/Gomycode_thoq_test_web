import { Button, Flex, Grid, Typography, Skeleton, Rate, Tooltip, Dropdown, Menu } from 'antd'
import StarFilled from '../../Icons/StarFilled'
import StarGradient from '../../Icons/StarGradient'
import MediaHeldBadge from './MediaHeldBadge'
import henceforthApi from '@/utils/henceforthApi'
import ThrowTech from './Tags/ThrowTech'
import FacebookTag from './Tags/FacebookTag'
import YoutubeTag from './Tags/YoutubeTag'
import placeholerCover from "@/assets/images/video-cover.png"
import { VotingCardProps } from '@/utils/interface'
import uiSettings from '@/utils/uiSettings'
import { ContestStatus, ContestPlatform } from '@/utils/henceforthEnums'
import { Fragment, useContext, useState } from 'react'
import { GlobalContext } from '@/context/Provider'
import { useRouter } from 'next/router'
import GetFinalistPosition from '@/components/GetFinalistPosition'
import { EllipsisOutlined } from '@ant-design/icons';
const VotingCard = (props: VotingCardProps) => {
  const screens = Grid.useBreakpoint()
  const { userInfo, Toast } = useContext(GlobalContext)
  // console.log(userInfo?.access_token, "props________");
  const router = useRouter();
  const placeholderImage = placeholerCover.src
  const [loading, setLoading] = useState(true);

  // console.log(props, "props");

  const handleVoteClick = () => {
    if (userInfo?.access_token) {
      // router.push(`/contest/${props?._id}/details`);
      window.open(`/contest/${props?._id}/details`, '_self');
    } else {
      Toast.warn('Login to continue')
      router.push(`/auth/signin`);
    }
  };


  const finalists = <Fragment>
    {Array.from({ length: props?.total_finalist }).map((_, index) => (
      <Fragment key={index}>
        <GetFinalistPosition position={index + 1} />
        {index !== (props?.total_finalist - 1) && ', '}
      </Fragment>
    ))}
  </Fragment>
  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => {
        if (!userInfo?.access_token) {
          Toast.warn("Login to continue")
          router.push(`/auth/signin`);
          return
        }
        window.open(`/contest/${props?._id}/details`, "_self");
      }}>
        Open in same Tab
      </Menu.Item>
      <Menu.Item key="2" onClick={() => {
        if (!userInfo?.access_token) {
          Toast.warn("Login to continue")
          router.push(`/auth/signin`);
          return
        }
        window.open(`/contest/${props?._id}/details`, "_blank");
      }}>
        Open in new Tab
      </Menu.Item>
    </Menu>
  );

  return (
    <div className='video-card shadow rounded-3 overflow-hidden h-100 d-flex flex-column' role='button'>
      <div role='button' onClick={() => {
        if (!userInfo?.access_token) {
          Toast.warn("Login to continue")
          router.push(`/auth/signin`);
          return
        }
        router.push(`/contest/${props?._id}/details`)
      }} className='video-card__image position-relative'>
        <div>
          <img src={props?.cover_media ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.cover_media}` : placeholderImage} className='w-100 object-fit-cover' width={'100%'} height={250} alt={props?.title} onError={(e) => { e.currentTarget.src = placeholderImage }} />
          <span className='position-absolute top-0 start-0 m-3'>
            <MediaHeldBadge media_type={
              props?.contest_be_watched.toLocaleUpperCase() === ContestPlatform.YOUTUBE ? <YoutubeTag /> :
                props?.contest_be_watched.toLocaleUpperCase() === ContestPlatform.FACEBOOK ? <FacebookTag /> :
                  <ThrowTech />}></MediaHeldBadge>
          </span>
        </div>
      </div>
      <div className='video-card__content p-4 d-flex flex-column gap-3 text-start h-100'>
        <Flex className='flex-grow-1' justify={screens.lg ? 'space-between' : 'space-between'} vertical={screens.lg ? false : true} gap={12}>
          <div className='text-start'>
            <Tooltip title={props?.title}>
              <Typography.Title level={5} className={`m-0 text-capitalize line-clamp line-1 ${screens.md ? "sub-title-font-size" : "primary-font-size"}`}>{props?.title}</Typography.Title>
            </Tooltip>


            {props?.status === ContestStatus.COMPLETED &&
              <Fragment>
                {props?.total_finalist > 0 ?
                  <Typography.Title level={5} className='base-font-size m-0 text-nowrap d-flex'>
                    <span className='flex-shrink-0'>Finalists:</span>
                    <Tooltip title={finalists}>
                      <span className='line-clamp line-1'>{finalists}</span>
                    </Tooltip>
                  </Typography.Title>
                  : ''}
              </Fragment>
            }

          </div>

          {props?.status === ContestStatus.COMPLETED &&
            <ul className='list-unstyled m-0 d-flex flex-column gap-1  flex-shrink-0'>
              <li className='d-inline-flex gap-1 flex-nowrap'>
                <Rate count={5} value={props?.average_rating} allowHalf disabled />
              </li>
              <li className='text-lg-end text-start secondary-font-size text-black fw-medium m-0'>{props?.total_reviews || 0} Reviews</li>
            </ul>}
        </Flex>
        <div>
          <div className='mb-3'>
            {/* <Flex justify={'space-between'} align={screens.lg ? '' : 'center'} vertical={screens.lg ? false : true} gap={12}> */}
            <Flex>
              <ul className='list-unstyled m-0 d-flex flex-column gap-1'>
                <li className='secondary-font-size m-0 text-light text-start fw-medium'>
                  <span>Start Date: {' '}</span>
                  <span className='text-dark fw-semibold'>{uiSettings.formatDate(props?.start_date)}, {uiSettings.formatTime(props?.start_time)}</span>
                </li>
                <li className='secondary-font-size m-0 text-light fw-medium text-start'>
                  <span>End Date:{' '}</span>
                  <span className='text-dark fw-semibold'>{uiSettings.formatDate(props?.end_date)}, {uiSettings.formatTime(props?.end_time)}</span></li>
                <li className='secondary-font-size m-0 text-light fw-medium text-start'>
                  <span> Number of votes that can be casted: {' '}</span>
                  <span className='text-dark fw-semibold'>{props?.number_of_time_vote > 100 ? "As Much As They Can" : props?.number_of_time_vote}</span></li>
                {((props?.status !== ContestStatus.UPCOMING)) &&
                  <li className='secondary-font-size m-0 text-light fw-medium text-start'>
                    <span>Number of votes casted:{' '}</span>
                    <span className='text-dark fw-semibold'>{props?.total_voted}</span></li>}
              </ul>
            </Flex>
            {((props?.status === ContestStatus.ONGOING) && (props.is_voted)) &&
              <p className='text-warning fw-medium m-0 mt-1'>Vote already casted</p>
            }
          </div>
          <Flex className='align_items-center justify-content-between' >
            <Button onClick={(e) => { handleVoteClick(); e.stopPropagation(); }} disabled={props?.status !== ContestStatus.ONGOING} size='small' type='primary' className='shadow-md px-4 align-self-lg-end' shape='round' htmlType='button'>Vote Now</Button>
            <Dropdown overlay={menu} trigger={['click']}>
              <Button shape="circle" icon={<EllipsisOutlined />} />
            </Dropdown>
          </Flex>
        </div>
      </div>
    </div>
  )
}


export default VotingCard



