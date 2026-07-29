import { ReactNode, useContext, useState } from 'react'
import { Button, Form, Input } from 'antd';
import { GlobalContext } from '@/context/Provider';
import { useRouter } from 'next/router';
import henceforthApi from '@/utils/henceforthApi';
import henceforthValidations from '@/utils/henceforthValidations';
import AuthLayout from '@/layouts/AuthLayout';

const SetPassword = () => {
  const [formLoading, setFormLoading] = useState(false);
  const { Toast } = useContext(GlobalContext);
  const router = useRouter();

  // ********************* Reset Password API Call *********************
  const onFinish = async (values: any) => {
    try {
      setFormLoading(true);
      let payLoad = {
        email: router?.query?.email,
        otp: router?.query?.otp,
        password: values?.password
      }

      const apiRes = await henceforthApi.Auth.resetPassword(payLoad);
      console.log(apiRes.message);
      router.replace({ pathname: `/auth/signin` })
      Toast.success(apiRes.message);

    } catch (error) {
      Toast.error(error);
      setFormLoading(false)
    }
  }

  return (
    <>
      <Form className='dark-form' layout='vertical' onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
        {/* New Password */}
        <Form.Item className='mb-4' name="password" rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error(`Please enter your password for eg - John@1234`));
              }
              if (value && !henceforthValidations.strongPassword(getFieldValue('password'))) {
                return Promise.reject(new Error(`Password should be at least 8 characters long including one uppercase, one lowercase, one special character and one number. for eg - John@1234`));
              }
              else {
                return Promise.resolve();
              }
            },
          }),
        ]}>
          <Input.Password type='password' size='large' className='bg-transparent' placeholder='New Password' />
        </Form.Item>
        {/* Confirm Password */}
        <Form.Item className='mb-4' name={"confirm_password"} rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error(`Please enter new password again.`));
              }
              if (value && (getFieldValue('confirm_password') !== getFieldValue('password'))) {
                return Promise.reject(new Error(`Password and Confirm Password doesn't match`));
              }
              else {
                return Promise.resolve();
              }
            },
          }),
        ]}
          dependencies={['password']}>
          <Input.Password type='password' size='large' className='bg-transparent' placeholder='Confirm Password' />
        </Form.Item>
        {/* Submit Button */}
        <Form.Item className='text-center mt-5'>
          <Button size='large' className='rounded-pill px-5' loading={formLoading} htmlType='submit' type='primary'>UPDATE PASSWORD</Button>
        </Form.Item>
      </Form>
    </>
  )
}

SetPassword.getLayout = (page: ReactNode) => (
  <AuthLayout title="Enter New Password" description='' pageTitle='Reset Password'>
    {page}
  </AuthLayout>
);

export default SetPassword
