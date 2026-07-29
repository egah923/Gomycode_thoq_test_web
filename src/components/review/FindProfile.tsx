import { GlobalContext } from '@/context/Provider';
import henceforthApi from '@/utils/henceforthApi';
import { Button, Checkbox, Divider, Flex, Form, Input, Radio, Rate, Space, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useContext } from 'react';

const FindProfile = (props: any) => {

  const [form] = Form.useForm()
  const { Toast } = useContext(GlobalContext)
  const router = useRouter()



  const onFinish = async (values: any) => {
    let payload = {
      contest_id: String(router?.query?._id),
      is_reward_receive: values?.reward,
      is_prize_liked: values?.prize,
      ratings: values?.rating,
      add_info: values?.comment?.trim(),
      type: "CONTESTENT"
    }
    try {
      const apires = await henceforthApi.Contest.reviewadd(payload)
      // Toast.success("Review Added Successfully!")
      if (apires) {
        props?.findProfileSubmit()
      }

      getListingReviews();
      router.replace(router.asPath, undefined, { shallow: false, scroll: true });

    } catch (error) {
      Toast.error(error);
    }
  }

  const getListingReviews = async () => {
    try {
      const apires = await henceforthApi.Contest.getreviews(String(router?.query?._id), "0", '', '1')
      console.log(apires, "apires")
      props?.setcount(apires?.count)
      props?.setReviews(apires?.data)
    } catch (error) {

    }
  }

  return (
    <div>
      <Typography.Paragraph className='text-black text-center fw-semibold mb-5'>
        You have been recognized as one of the voters and as one of the selected reward beneficiaries you can leave a review
      </Typography.Paragraph>
      <Form form={form} onFinish={onFinish} layout='vertical' className='light_theme_form'>
        <Form.Item name="reward" rules={[{ required: true, message: 'Please select' }]} label={<label className='fw-medium text-black'>Did You Recieve Your Reward</label>}>
          <Radio.Group>
            <Space direction="horizontal">
              <Radio value={true} className='text-black'>Yes, I did</Radio>
              <Radio value={false} className='text-black'>No, I Didn't</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="prize" rules={[{ required: true, message: 'Please select' }]} label={<label className='fw-medium text-black'>Did you like your prize?</label>}>
          <Radio.Group>
            <Space direction="horizontal">
              <Radio value={true} className='text-black'>Yes, I did</Radio>
              <Radio value={false} className='text-black'>No, I Didn't</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item name='rating' rules={[{ required: true, message: 'Please rate the contest' }]} label={<label className='fw-medium text-black'>Rate this Organizer</label>}>
          <Rate allowClear />
        </Form.Item>
        <Typography.Paragraph className='text-secondary fw-medium mb-5'>
          <span className='text-black fw-semibold'>Addition information:</span>  <span className='fw-normal'>Lorem ipsum dolor sit amet consectetur. Semper viverra enim pellentesque sit gravida justo tincidunt. Tellus velit facilisi quis platea. Quisque varius aliquet tempor velit elementum elementum massa. Neque interdum lorem adipiscing mi enim  egestas lectus.</span>
        </Typography.Paragraph>

        <Form.Item name="comment" rules={[{ required: true, whitespace: true, message: 'Please enter comment' }]}>
          <Input.TextArea placeholder='Enter the comment' rows={5}></Input.TextArea>
        </Form.Item>
        {/* <Divider className='border border-secondary mb-2' /> */}
        <Form.Item
          className="border-0"
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('Please accept Terms and Conditions.')),
            },
          ]}
        >
          <Checkbox className="fw-medium"
            onChange={(e) => { console.log(e?.target?.checked) }}>I confirm that I'm the real contestant and that every information I gave is true and by me.
          </Checkbox>
        </Form.Item>
        {/* <Checkbox className='fw-medium'>I confirm that I'm the real contestant and that every information I gave is true and by me.</Checkbox> */}

        <Flex gap={12} justify='center' className='mt-4'>
          <Button size='small' onClick={() => { form.resetFields(); props?.cancelReviewAddModal() }} className='rounded-pill px-4 border-black bg-black text-white' type='default'>Close</Button>
          <Button size='small' className='rounded-pill px-4' htmlType='submit' type='primary'>Submit</Button>
        </Flex>
      </Form>
    </div>
  )
}

export default FindProfile