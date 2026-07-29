import { Button, Checkbox, Dropdown, Flex, Typography } from 'antd'
import Link from 'next/link'
import contestantImage from "@/assets/images/contestant-image.png"
import henceforthApi from '@/utils/henceforthApi'
import { MenuProps } from 'antd/lib'
import MoreIcon from '@/components/Icons/MoreIcon'
import TrashFilled from '@/components/Icons/TrashFilled'

interface ParticipantsCardProps {
  contest_link: string
  email: string
  name: string
  profile_pic: string
  _id: string
  submit: boolean

}

const ParticipantsCard = (props: ParticipantsCardProps) => {

  console.log(props?.submit, "props");

  return (
    <div className='participant-card p-md-4 p-3 rounded-4 position-relative'>
      <div className='position-relative'>
        <div className='position-absolute top-0 end-0'>
          <Flex gap={8} align='center'>
            {props?.submit &&
              <Checkbox />}
            {/* <button className='btn-icon fw-medium text-danger'>
              <TrashFilled />
            </button> */}
          </Flex>
        </div>
        <Link className='text-black text-decoration-none' href={`/profile/participant/${props?._id}/view`}>
          <Flex align='center'>
            <img src={props?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.profile_pic}` : contestantImage.src} className='object-fit-cover border bg-light' alt="contestant image" onError={(e) => { e.currentTarget.src = contestantImage.src }} width={150} height={150} />

            <div className='d-flex flex-column gap-1 text-start p-4'>
              <Typography.Title level={5} className='m-0 fw-bold primary-font-size text-black'>
                {props?.name}</Typography.Title>
              <Typography.Paragraph className='m-0 fw-medium secondary-font-size text-black'>{props?.email}</Typography.Paragraph>
              <Typography.Paragraph className='m-0 fw-medium secondary-font-size text-danger'>{props?.contest_link}</Typography.Paragraph>
            </div>
          </Flex>
        </Link>
      </div>
    </div>
  )
}

export default ParticipantsCard