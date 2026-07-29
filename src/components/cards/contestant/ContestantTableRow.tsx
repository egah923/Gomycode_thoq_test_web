import { Avatar, Flex, Typography } from 'antd'
import profile from "@/assets/images/profile.png"
import henceforthApi from '@/utils/henceforthApi'

interface ContestantTableRow {
  _id?: string,
  user_id?: string,
  contestent_name: string,
  profile_pic: string,
  total_votes?: number
  rounds?: string,
  isVoterRewards?: boolean
}
const ContestantTableRow = (props: any) => {

  console.log(props, "props?.total_votes");

  const rounds = props?.rounds?.sort()?.map((res: number, index: number) => {
    return <span>{index < props?.rounds?.length - 1 ? `${res}, ` : `${res}`}</span>
  });


  return (
    <tr>
      <td className='py-3'>
        <Flex gap={12} align='center'>
          <img src={props?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.profile_pic}` : profile.src} className='rounded-circle border bg-light' width={40} height={40} alt="content Image" onError={(e) => { e.currentTarget.src = profile.src }} />
          {/* <Typography.Text className='fw-semibold text-black text-capitalize'>{props?.contestant_name}</Typography.Text> */}
          <Typography.Text className='fw-semibold text-black text-capitalize'>{props?.contestent_name}</Typography.Text>
        </Flex>
      </td>
      <td className='text-end py-3'>
        {props?.isVoterRewards ?
          <Typography.Text className='fw-semibold text-black'>{rounds}</Typography.Text>
          :
          <Typography.Text className='fw-semibold text-black'>{props?.total_votes} Votes</Typography.Text>
        }
      </td>
    </tr>
  )
}

export default ContestantTableRow