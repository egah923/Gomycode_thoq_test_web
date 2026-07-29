import { Button, Flex, Typography } from 'antd';
import profile from "@/assets/images/profile.png"
import { useContext } from 'react';
import { GlobalContext } from '@/context/Provider';
import henceforthApi from '@/utils/henceforthApi';
import Link from 'next/link';
const NotContestant = (props: any) => {

  const { userInfo } = useContext(GlobalContext)
  return (
    <>
      <div>
        <Typography.Paragraph className='text-black text-center fw-semibold mb-5'>
          You have been recognized as one of the voters however, only the selected reward beneficiaries can leave a review
        </Typography.Paragraph>
        <Flex gap={12} align='center' justify='center'>
          <img src={userInfo?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${userInfo?.profile_pic}` : profile.src}
            width={40} height={40} className='rounded-circle object-fit-cover border bg-light' alt="profile img" onError={(e) => { e.currentTarget.src = profile.src }} />

          <Typography.Text className='text-decoration-none fw-semibold text-black'>{userInfo?.name}</Typography.Text>
        </Flex>
      </div>
      <div className='text-center mt-4'>
        <Typography.Paragraph className='text-black text-center fw-semibold mb-3'>
          If you have any issue to report
        </Typography.Paragraph>
        {/* onClick={props?.contactHere} */}
        <Link href={'/?status=ONGOING&pagination=1&limit=9'}>
          <Button size='small' className='rounded-pill px-4 border-black bg-black text-white' type='default'>Contact Us Here</Button>
        </Link>
      </div>
    </>
  )
}

export default NotContestant