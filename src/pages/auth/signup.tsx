import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import UsernameIcon from '@/components/Icons/UserIcon';
import PasswordIcon from '@/components/Icons/PasswordIcon';
import Link from 'next/link';
import EyeIcon from '@/components/Icons/EyeIcon';
import EmailIcon from '@/components/Icons/EmailIcon';
import { Alert, Button, Flex, Form, Input, Select, Space } from 'antd';
import { GlobalContext } from '@/context/Provider';
import { useRouter } from 'next/router';
import henceforthApi from '@/utils/henceforthApi';
import PhoneFilled from '@/components/Icons/PhoneFilled';
import CountryIcon from '@/components/Icons/CountryIcon';
import countryCode from "@/utils/countryCode.json";
import henceforthValidations from '@/utils/henceforthValidations';
import AuthLayout from '@/layouts/AuthLayout';
import { setCookie } from 'nookies';
import { COOKIES_USER_ACCESS_TOKEN } from '@/context/actionTypes';
import { InfoCircleOutlined } from "@ant-design/icons"

const SignUp = () => {
  const [formLoading, setFormLoading] = useState(false);
  const { Toast, setUserInfo,  requestNotification} = useContext(GlobalContext);
  const router = useRouter();
  const [form] = Form.useForm();

  // Auto Detect Location
  const loadGoogleMapScript = (callback) => {
    if (typeof (window as any).google === "object" && typeof (window as any).google.maps === "object") {
      callback();
    } else {
      const googleMapScript = document.createElement("script");
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD4MHXWLSqsVoZ7kIF3Bq1pVKMlUTO4HOU&libraries=places`;
      googleMapScript.async = true;
      googleMapScript.defer = true;
      googleMapScript.onload = callback;
      document.body.appendChild(googleMapScript);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const geocoder = new (window as any).google.maps.Geocoder();
        const latlng = { lat: latitude, lng: longitude };

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === "OK") {
            if (results[0]) {
              const place = results[0];
              const address = place.address_components;
              const countryIndex = address.findIndex(res => res.types.includes("country"));

              if (countryIndex > -1) {
                const countryName = address[countryIndex].long_name;
                form.setFieldsValue({
                  country: countryName,
                });

                const country = countryCode.find(c => c.name === countryName);
                if (country) {
                  form.setFieldsValue({
                    country_code: country.dial_code
                  });
                }
              }
            } else {
              console.error("No results found");
            }
          } else {
            console.error("Geocoder failed due to: " + status);
          }
        });
      }, (error) => {
        console.error("Geolocation failed: " + error.message);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    loadGoogleMapScript(() => {
      detectLocation();
    });
  }, []);

  // Register Form API Call
  const onFinish = async (values) => {
    let fcmToken = await requestNotification()
    const payLoad = {
      country_code: values?.country_code,
      country: values?.country,
      device_type: "ANDROID",
      email: values?.email?.trim(),
      fcm_token: fcmToken ?? "xyz",
      name: values?.name,
      password: values?.password,
      phone_number: Number(values?.phone_number),
    };

    try {
      setFormLoading(true);
      const apiRes = await henceforthApi.Auth.signUp(payLoad);
      Toast.success(apiRes.message);

      if (apiRes?.data?.is_email_verified) {
        setCookie(null, COOKIES_USER_ACCESS_TOKEN, apiRes.data.access_token, {
          path: "/",
        });

        setUserInfo(apiRes?.data);
        router.replace({
          pathname: `/auth/verify/phone`,
          query: {
            country_code: String(values.country_code),
            phone_number: values.phone_number
          }
        });
      } else {
        router.replace({
          pathname: `/auth/verify/email`,
          query: {
            email: values?.email,
            phone_number: values?.phone_number,
            country_code: String(values?.country_code)
          }
        });
      }
    } catch (error) {
      Toast.error(error);
      setFormLoading(false);
    } finally {
      setFormLoading(false);
    }
  };

  const [data, setData] = useState("");
  const searchedData = useMemo(() => countryCode.reduce((prev, curr) => {
    if ([curr.name.toLowerCase(), curr.dial_code.toLowerCase()].some(match => match.includes(data.toLowerCase().trim())) || !data.trim()) {
      prev.push({
        value: curr.dial_code,
        label: <span className='text-light-grey'>{curr.flag} {curr.dial_code}</span>,
      });
    }
    return prev;
  }, []), [data]);

  const handleCountryCodeChange = (value) => {
    const selectedCountry = countryCode.find(country => country.dial_code === value);
    if (selectedCountry) {
      form.setFieldsValue({ country: selectedCountry.name });
    }
  };

  return (
    <>
      <div className='position-fixed top-0 start-0 w-100 text-center justify-content-around'>
        <Alert message={<Flex justify='center' align='center' gap={8}>
          <InfoCircleOutlined />
          <span>Your E-mail cannot be changed later. Please ensure to correctly choose and type your E-mail address.</span></Flex>} className='rounded-0 text-warning' type="warning" showIcon={false} />
      </div>
      <Form layout='vertical'
        name="signup-form"
        form={form}
        className='dark-form'
        onFinish={onFinish}
        initialValues={{ country_code: '+44', country: 'United Kingdom' }}
        onFinishFailed={(errorInfo) => console.log("Failed:", errorInfo)}
        autoComplete="off">
        {/* Name */}
        <Form.Item className='mb-3' name={'name'} rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error(`Please enter name`));
              }
              if (value && !henceforthValidations.nameValidation(getFieldValue('name'))) {
                return Promise.reject(new Error(`Name should contain alphabets only. for eg - John Doe`));
              }
              else {
                return Promise.resolve();
              }
            },
          }),
        ]}>
          <Input type='text' size='large' className='bg-transparent' prefix={<UsernameIcon />} placeholder='Name' autoComplete="off" />
        </Form.Item>
        {/* Email */}
        <Form.Item className='mb-3' name={'email'} rules={[{ whitespace: true, type: "email", required: true, message: 'Please enter email address!' }]}>
          <Input type='email' size='large' className='bg-transparent' prefix={<EmailIcon />} placeholder='Email Address' autoComplete="off" />
        </Form.Item>
        {/* Phone */}
        <Space.Compact className='w-100 mb-0 country-field align-items-start'>
          <div className='form-select-suffix-icon'><PhoneFilled /></div>
          <Form.Item
            name='country_code'
            rules={[{ required: true, message: 'Please select Country Code' }]}>
            <Select
              style={{ width: 90 }}
              showSearch
              prefixCls='country-code-field'
              onSearch={setData}
              onChange={handleCountryCodeChange}
              filterOption={false}
              options={searchedData}
            />
          </Form.Item>
          {/* Phone Number */}
          <Form.Item className="w-100 m-0" name={'phone_number'} rules={[
            { required: true, message: 'Please enter the phone number' },
            { min: 8, message: 'Phone number must be at least 8 digits' },
            { max: 15, message: 'Phone number cannot be more than 15 digits' }
          ]}>
            <Input type='text' size='large' onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }} className='bg-transparent w-100' placeholder='Enter Phone Number' autoComplete="off" />
          </Form.Item>
        </Space.Compact>
        {/* Country */}
        <Space.Compact className='w-100 mb-3 country-field align-items-start'>
          <div className='form-select-suffix-icon'><CountryIcon /></div>
          <Form.Item className='mb-0 w-100' name={'country'} rules={[{ required: true, message: 'Please select country!' }]}>
            <Select placeholder='Select Country' prefixCls='country-code-field' className='w-100' showSearch>
              {countryCode?.map((res) => (
                <Select.Option key={res.name} value={res.name}>{res.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Space.Compact>
        {/* Password */}
        <Form.Item name={'password'} className='mb-3' rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error(`Please enter your password`));
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
          <Input.Password type='password' size='large' className='bg-transparent' prefix={<PasswordIcon />} suffix={<EyeIcon />} placeholder='Enter Password' autoComplete="off" />
        </Form.Item>
        {/* Confirm Password */}
        <Form.Item className='mb-5' name={'confirm_password'} rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error(`Please enter password again.`));
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
          <Input.Password type='password' size='large' className='bg-transparent' prefix={<PasswordIcon />} suffix={<EyeIcon />} placeholder='Confirm Password' autoComplete="off" />
        </Form.Item>
        {/* Signup Button */}
        <Form.Item className='text-center'>
          <Button size='large' className='rounded-pill px-5' loading={formLoading} htmlType="submit" type='primary'>Register</Button>
        </Form.Item>
      </Form>
      {/* Already have an account */}
      <Flex justify='center' align='center' className='text-center text-md-start'>
        <p className='text-white-75'>Already have an account?
          <Link className='text-white-75 ms-2' href='/auth/signin'>Log In</Link>
        </p>
      </Flex>
    </>
  );
};

SignUp.getLayout = (page: ReactNode) => (
  <AuthLayout title="Welcome Back!" pageTitle="Sign Up">
    {page}
  </AuthLayout>
);

export default SignUp;
