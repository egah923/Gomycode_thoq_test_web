import { Button, Flex, Form, Input, Radio, Space, Typography } from 'antd';

const IsContestant = (props: any) => {
const[form]=Form.useForm()

  console.log(props)
  const onFinish=()=>{
    props?.FindMyprofile()
  }
  return (
    <>
      <Typography.Paragraph className='text-black text-center fw-semibold mb-5'>
        Only Contestants are to leave Review & Ratings
      </Typography.Paragraph>

      <Form form={form} layout='vertical' onFinish={onFinish} className='light_theme_form'>
        <Form.Item label={<label className='fw-medium text-black'>Are You One of the Contestants? </label>}>
          <Radio.Group defaultValue={props?.contestants} onChange={props?.selectOption}>
            <Space direction="horizontal">
              <Radio value={'Yes'} className='text-black'>Yes</Radio>
              <Radio value={'No'} className='text-black'>No</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {props?.contestants === "Yes" &&
          <Form.Item name={'name'} rules={[{ required: true,whitespace:true, message: 'Please enter name or number' }]}>
            <Input placeholder='Enter Your Contesting Name or Code or Number' />
          </Form.Item>}

        <Flex gap={12} justify='center' className='mt-4'>
          <Button size='small' onClick={()=>{form.resetFields();props?.cancelReviewAddModal()}} className='rounded-pill px-4 border-black bg-black text-white' type='default'>Close</Button>
         {props?.contestants!='Yes'? <Button size='small' className='rounded-pill px-4' onClick={props?.FindMyprofile} htmlType='button' type='primary'>Find my Profile</Button>
          :<Button size='small' className='rounded-pill px-4'  htmlType='submit' type='primary'>Proceed</Button>}
        </Flex>
      </Form>
    </>
  )
}

export default IsContestant

