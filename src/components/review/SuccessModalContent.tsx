import { Button, Flex, Typography } from 'antd';
const SuccessModalContent = (props:any) => {
  return (
    <>
      <Typography.Paragraph className='text-black text-center fw-semibold mb-5'>
        Your review has been submitted successfully
      </Typography.Paragraph>
      <Flex gap={12} justify='center' className='mt-4'>
        <Button size='small' onClick={props?.cancelReviewAddSuccessModal} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Close</Button>
        {/* <Button size='small' className='rounded-pill px-4' onClick={props?.GotitSuccess} type='primary'>Got it</Button> */}
      </Flex>
    </>
  )
}

export default SuccessModalContent