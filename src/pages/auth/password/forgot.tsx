
import React, { ReactNode, useContext, useState } from 'react'
import Link from 'next/link';
import { Button, Flex, Form, Input } from 'antd';
import henceforthApi from '@/utils/henceforthApi';
import { GlobalContext } from '@/context/Provider';
import { useRouter } from 'next/router';
import AuthLayout from '@/layouts/AuthLayout';


const ForgotPassword = () => {
  const [formLoading, setFormLoading] = useState(false);
  const { Toast } = useContext(GlobalContext);
  const router = useRouter();

  // ********************* Forgot Password API Call *********************
  const onFinish = async (values: any) => {
    try {
      setFormLoading(true);
      let payLoad = {
        email: values?.email,
      }

      const apiRes = await henceforthApi.Auth.forgetPassword(payLoad);
      console.log(apiRes.message);

      router.replace({
        pathname: `/auth/verify/forgot`, query: {
          email: values?.email,
        }
      })

    } catch (error) {
      Toast.error(error);
      setFormLoading(false)
    }
  }

  return (
    <>
      <Form className='dark-form' layout='vertical' onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
        {/* Email */}
        <Form.Item className='mb-4' name={"email"} rules={[{ required: true, message: 'Please enter email!' }]}>
          <Input type='email' size='large' className='bg-transparent' placeholder='Enter Email' />
        </Form.Item>
        {/* Submit Button */}
        <Form.Item className='text-center'>
          <Button size='large' loading={formLoading} htmlType='submit' className='rounded-pill px-5' type='primary'>SUBMIT</Button>
        </Form.Item>
      </Form>
      {/* Login bUtton */}
      <Flex justify='center' align='center'>
        <Link className='text-white-75 fw-normal' href='/auth/signin'>Back to Login</Link>
      </Flex>
    </>
  )
}

ForgotPassword.getLayout = (page: ReactNode) => (
  <AuthLayout title="Forgot Password" description='Enter your registered email id.' pageTitle='Forgot Password'>
    {page}
  </AuthLayout>
);

export default ForgotPassword
