
import React, { useContext, useState } from 'react'
import { Button, Flex, Form, Input } from 'antd';
import { useRouter } from 'next/router';
import henceforthApi from '@/utils/henceforthApi';
import { GlobalContext } from '@/context/Provider';
import { setCookie } from 'nookies';
import { COOKIES_USER_ACCESS_TOKEN } from '@/context/actionTypes';
import Link from 'next/link';
import AuthLayout from '@/layouts/AuthLayout';
import { userInfo } from 'os';

var countdownTimer = null as any;

const VerifyAccount = () => {
  const router = useRouter();
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { Toast, setUserInfo, } = useContext(GlobalContext);
  const [form] = Form.useForm();
  const [resendLoading, setResendLoading] = useState(false);
  const [timerCount, setTimerCount] = React.useState(30);
  const countRef = React.useRef(0);

  // ********************* Router Queries *********************
  const emailTypeQuery = router?.query?.type === "email";
  const phoneTypeQuery = router?.query?.type === "phone";
  const forgotPasswordTypeQuery = router?.query?.type === "forgot";

  const contactMedium = (emailTypeQuery || forgotPasswordTypeQuery) ? String(router?.query?.email) : `${String(router?.query?.country_code)} ${String(router?.query?.phone_number)}`


  // ********************* Verify Account API Call *********************
  const onFinish = async (values: any) => {
    try {
      let payLoad = {} as any;
      setFormLoading(true)

      // ********************* Verify Email API Call *********************
      if (emailTypeQuery) {
        payLoad = {
          email: router?.query?.email,
          otp: values.otp,
          device_type: "ANDROID",
          fcm_token: "string"
        }

        const apiRes = await henceforthApi.Auth.emailVerification(payLoad);
        console.log(apiRes);

        if (apiRes?.data?.access_token) {
          const acessToken = apiRes?.data?.access_token
          setCookie(this, COOKIES_USER_ACCESS_TOKEN, acessToken, { path: '/' })
          setUserInfo(apiRes.data)
        }
        Toast.success(apiRes?.message)
        router.replace({ pathname: `/auth/verify/phone`, query: { country_code: String(router?.query?.country_code), phone_number: router?.query?.phone_number } })
        form.resetFields();
        setFormLoading(false)
        initialiseInterval()

      }


      // ********************* Verify Phone API Call *********************
      if (phoneTypeQuery) {

        payLoad = {
          otp: values?.otp,
        }

        const apiRes = await henceforthApi.Auth.phoneVerification(payLoad);
        console.log(apiRes);
        Toast.success(apiRes?.message)
        router.replace({
          pathname: router?.query?.redirect ? String(router?.query?.redirect) : '/'
        })


        setUserInfo((prev) => ({
          ...prev,
          is_phone_verified: true
        }));
      }

      // ********************* Verify Email For Password API Call *********************
      if (forgotPasswordTypeQuery) {
        payLoad = {
          email: router?.query?.email,
          otp: values?.otp,
        }

        const apiRes = await henceforthApi.Auth.verfiyEmailForPassword(payLoad);
        console.log(apiRes);
        router.replace({
          pathname: '/auth/password/set',
          query: {
            email: router?.query?.email,
            otp: values?.otp,
          }
        })
        Toast.success(apiRes?.message)

      }

    } catch (error) {
      console.log(error);
      Toast.error(error)
      setFormLoading(false)

    }
  }

  // ********************* Resend OTP API Call *********************
  const resendOtp = async () => {
    try {
      setLoading(true)
      let payLoad = {} as any;

      if (router?.query?.type === "email") {
        payLoad = {
          email: router?.query?.email
        }
      }

      if (router?.query?.type === "phone") {
        payLoad = {
          phone_number: Number(router?.query?.phone_number),
          country_code: router?.query?.country_code
        }
      }

      if (router?.query?.type === "email") {
        let apiRes = await henceforthApi.Auth.resendOtpEmail(payLoad);
        Toast.success(apiRes?.message)
        setLoading(false)
      }
      if (router?.query?.type === "phone") {
        let apiRes = await henceforthApi.Auth.resendOtpPhone(payLoad);
        Toast.success(apiRes?.message)
        setLoading(false)
      }


    } catch (error) {
      Toast.error(error)
      setLoading(false)
    }
  }

  // ********************* Timer For Resend OTP *********************
  const reStart = () => {
    setTimerCount(30);
  };


  React.useEffect(() => {
    if (resendLoading) {
      return;
    } else {
      initialiseInterval();
    }
    return () => {
      clearInterval(countdownTimer);
      countdownTimer = null;
      reStart();
    };
  }, []);

  const initialiseInterval = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      setTimerCount(30);
    }
    countRef.current = +new Date();
    let _second = 30;
    function timer() {
      if (_second < 1) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        return;
      } else {
        _second -= 1;
      }
      setTimerCount(30 - Math.round((+new Date() - countRef.current) / 1000));
    }
    countdownTimer = setInterval(() => timer(), 1000);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const mediumDescriptionText = (emailTypeQuery || forgotPasswordTypeQuery) ? "Email" : "Phone"
  return (
    <AuthLayout pageTitle={`Verify ${mediumDescriptionText}`} title={`Verify ${mediumDescriptionText}`} description={`Enter the OTP you received on the ${mediumDescriptionText}`} contact_medium={contactMedium}>
      <Form className='dark-form' form={form} layout='vertical' onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
        {/* OTP */}
        <Form.Item className='mb-4' name="otp" rules={[{ required: true, message: 'Please enter otp!' }]}>
          <Input type='text' size='large' className='bg-transparent' placeholder='Enter OTP' maxLength={6} />
        </Form.Item>
        {/* Submit Button */}
        <Form.Item className='text-center'>
          <Flex justify="center" gap={12}>
            {phoneTypeQuery &&
              <Link href={router?.query?.redirect ? String(router?.query?.redirect) : '/'}>
                <Button size='large' ghost className='rounded-pill px-5 text-white' type='primary'>SKIP</Button>
              </Link>
            }
            <Button htmlType='submit' size='large' loading={formLoading} className='rounded-pill px-5' type='primary'>VERIFY</Button>
          </Flex>
        </Form.Item>
      </Form>
      {/* Resend OTP Button */}

      {/* {!phoneTypeQuery && */}

      <div className='text-center'>
        {timerCount > 0 ? (
          <p className='text-white-75 fw-normal'>Resend OTP in
            <span className='text-primary'> 00:{timerCount > 9 ? timerCount : "0" + timerCount}</span>
          </p>
        ) : (
          <>
            <Button
              className='text-white-75 fw-normal' loading={loading} type='text' htmlType='button' onClick={() => {
                if (!loading) {
                  initialiseInterval(); resendOtp();
                }
              }}><span className="text-decoration-underline">Resend code</span>
            </Button>
          </>
        )}
      </div>
    </AuthLayout>

  )
}


export default VerifyAccount
