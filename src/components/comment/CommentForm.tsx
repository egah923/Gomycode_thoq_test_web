import React from 'react'
import WrapperElement from '../common/WrapperElement'
import { Button, Form, Input } from 'antd'

const CommentForm = ({ onFinish, formLoading, form }) => {
  return (

    <WrapperElement className='mt-md-4 pt-5'>
      <Form name="comment_form" className='comment-form light_theme_form mb-5' onFinish={onFinish} onFinishFailed={(error: any) => console.log(error)} form={form}>
        <Form.Item name="comment" rules={[{ required: true, message: "Please enter the comment" }]}>
          <Input.TextArea placeholder="Write your comment here..." className='bg-transparent' showCount={true} rows={4} maxLength={350} />
        </Form.Item>
        <Form.Item className='text-md-end test-start'>
          <Button size='small' type='primary' loading={formLoading} disabled={formLoading} className='shadow-md px-4 px-md-5' shape='round' htmlType='submit'>Send</Button>
        </Form.Item>
      </Form>
    </WrapperElement>
  )
}

export default CommentForm