
import React, { ReactNode, useContext, useState } from 'react'
import Link from 'next/link';
import EyeIcon from '@/components/Icons/EyeIcon';
import { Button, Flex, Form, Input } from 'antd';
import { useRouter } from 'next/router';
import { GlobalContext } from '@/context/Provider';
import henceforthApi from '@/utils/henceforthApi';
import { setCookie } from 'nookies';
import { COOKIES_USER_ACCESS_TOKEN } from '@/context/actionTypes';
import henceforthValidations from '@/utils/henceforthValidations';
import { ContestStatus } from '@/utils/henceforthEnums';
import AuthLayout from '@/layouts/AuthLayout';

const SignIn = () => {
  const [formLoading, setFormLoading] = useState(false);
  const { setUserInfo,requestNotification, Toast } = useContext(GlobalContext);
  const router = useRouter();

  // ********************* Login API Call *********************
  const onFinish = async (values: any) => {
    let fcmToken = await requestNotification()
    console.log(fcmToken)
    let payLoad = {
      email: values?.email,
      password: values?.password,
      device_type: "ANDROID",
      fcm_token: fcmToken ?? "xyz",
    }

    try {
      setFormLoading(true);
      const apiRes = await henceforthApi.Auth.login(payLoad);


      console.log(apiRes?.data?.is_email_verified);

      if (!apiRes?.data?.is_email_verified) {
        return router.replace({ pathname: `/auth/verify/email`, query: { email: values?.email, phone_number: values?.phone_number, country_code: String(values?.country_code) } })
      }

      setCookie(this, COOKIES_USER_ACCESS_TOKEN, apiRes?.data?.access_token, {
        path: "/",
      });

      setUserInfo(apiRes.data)
      router.replace({
        pathname: `/`, query: {
          status: ContestStatus.UPCOMING,
          pagination: "0",
          limit: '9'
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
        <Form.Item name="email" rules={[{ whitespace: true, type: "email", required: true, message: 'Please enter your email!' }]}>
          <Input type='email' size='large' className='bg-transparent ps-0' placeholder='Enter the Email' />
        </Form.Item>
        {/* Password */}
        <Form.Item name="password" rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error(`Please enter your password`));
              }
              if (value && !henceforthValidations.strongPassword(getFieldValue('password'))) {
                return Promise.reject(new Error(`Password should be at least 8 characters long including one uppercase, one lowercase, one special character and one number. for eg - John@1234`));
              } else {
                return Promise.resolve();
              }
            },
          }),
        ]}>
          <Input.Password type='password' size='large' className='bg-transparent ps-0' suffix={<EyeIcon />} placeholder='Enter Your Password' />
        </Form.Item>
        {/* Forgot Password Link */}
        <Flex justify='end' align='center' className='mb-4'>
          <Link className='text-white-75' href='/auth/password/forgot'>Forgot Password?</Link>
        </Flex>
        {/* Submit Button */}
        <Form.Item className='text-center'>
          <Button size='large' loading={formLoading} className='rounded-pill px-5' htmlType='submit' type='primary'>LOG IN</Button>
        </Form.Item>
      </Form>
      {/* Register Button */}
      <Flex justify='center' align='center'>
        <Link className='text-white-75' href='/auth/signup'>Create account?</Link>
      </Flex>
    </>
  )
}

SignIn.getLayout = (page: ReactNode) => (
  <AuthLayout title="Welcome Back!" pageTitle="Sign In">
    {page}
  </AuthLayout>
);

export default SignIn
