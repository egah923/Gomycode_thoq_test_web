import React, { Fragment, ReactNode, useContext, useEffect, useState } from 'react'
import { Avatar, Button, Col, Flex, Form, Grid, Input, Row, Select, Space, Spin, Typography } from 'antd';
import WrapperElement from '@/components/common/WrapperElement';
import EditIcon from '@/components/Icons/EditIcon';
import VerifiedUser from '@/components/Icons/VerifiedUser';
import CommonModal from '@/components/common/CommonModal';
import CountryCode from "@/utils/countryCode.json"
import henceforthApi from '@/utils/henceforthApi';
import { GlobalContext } from '@/context/Provider';
import { useRouter } from 'next/router';
import henceforthValidations from '@/utils/henceforthValidations';
import dayjs from "dayjs";
import RootLayout from '@/layouts/RootLayout';
import UnVerified from '@/components/Icons/UnVerified';
import Link from 'next/link';
import Head from 'next/head';

const EditProfile = () => {
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm();
  const [formType, setFormType] = useState({
    type: ''
  })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const { userInfo, setUserInfo, Toast } = useContext(GlobalContext)
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<Blob | MediaSource | null>(null);

  const [state, setState] = useState({
    name: userInfo?.name,
    email: userInfo?.email,
    country_code: userInfo?.country_code,
    phone_number: userInfo?.phone_number,
    password_updated_at: userInfo?.password_updated_at,
    is_phone_verified: userInfo?.is_phone_verified,
    is_email_verified: userInfo?.is_email_verified,
    profile_pic: userInfo?.profile_pic,
  })


  // *************** Open Profile Edit Modal *************** 
  const showEditProfileModal = (type: string) => {
    setIsEditOpen(true);
    setFormType({
      type: type
    })

  }

  // *************** Cancel Profile Edit Modal *************** 
  const cancelEditProfileModal = () => {
    setIsEditOpen(false)
  }


  // *************** Set Input Values ***************
  useEffect(() => {
    form.setFieldsValue({
      name: state?.name,
      country_code: state?.country_code,
      phone_number: state?.phone_number
    });
  }, [state, form]);


  // *************** Update Profile Image API Call ***************

  const uploadProfileImage = async (e: any) => {

    // debugger;
    const file = e?.target?.files[0];
    setImageUrl(file);

    setLoading(true)
    try {
      // ************* Upload Profile Image API Call *************
      if (file) {
        let uploadImageApiRes = await henceforthApi.Common.uploadFile('file', e?.target?.files[0]);
        console.log(uploadImageApiRes.data.file_name);
        Toast.success("Image Uploaded successfully");

        // ************* Update Profile Image API Call *************
        let payLoad = {
          profile_pic: uploadImageApiRes.data.file_name
        }
        const apiRes = await henceforthApi.Profile.editProfile(payLoad);

        setUserInfo((prev) => ({
          ...prev,
          profile_pic: apiRes?.data?.profile_pic
        }))

        Toast.success("Image Updated successfully");
        setLoading(false)
      }

    } catch (error) {
      Toast.error(error.message);
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  // *************** Update Profile API Call ***************
  const onFinish = async (values: any) => {
    let payLoad = {} as any;



    try {
      setFormLoading(true)
      // *************** Type Name ***************
      if (formType?.type === 'name') {
        payLoad['name'] = values?.name;


        const apiRes = await henceforthApi.Profile.editProfile(payLoad);
        console.log(apiRes.message, apiRes.data);
        // Toast.success(apiRes.message);
        Toast.success("Profile updated successfully");

        setUserInfo((prev) => ({
          ...prev,
          ...apiRes?.data
        }))


      }

      // *************** Type Phone Number ***************
      if (formType?.type === 'phone_number') {
        payLoad = {
          country_code: values?.country_code,
          phone_number: values?.phone_number
        }

        const apiRes = await henceforthApi.Profile.editProfile(payLoad);
        console.log(apiRes.message, apiRes.data);
        Toast.success("OTP send on you phone. Please check.");

        setUserInfo((prev) => ({
          ...prev,
          ...apiRes?.data
        }))


        router.push({
          pathname: `/auth/verify/phone`,
          query: {
            country_code: String(values?.country_code),
            phone_number: values?.phone_number,
            redirect: '/profile/edit'
          }
        })
      }

      // *************** Type Password ***************
      if (formType?.type === 'password') {
        payLoad = {
          old_password: values?.old_password,
          new_password: values?.new_password,
        }

        const apiRes = await henceforthApi.Profile.editProfile(payLoad);
        console.log(apiRes.message, apiRes.data);
        Toast.success('Password changed successfully.');

        setUserInfo((prev) => ({
          ...prev,
          ...apiRes?.data
        }))
      }

      setFormLoading(false)
      setIsEditOpen(false)

      form.resetFields()

    } catch (error) {
      Toast.error(error)
      setFormLoading(false)
    }
  }


  useEffect(() => {
    if (userInfo) {
      setState({ ...userInfo })
    }
  }, [userInfo])


  console.log(state, "state__________");



  // *************** Calculate Time Difference ***************
  const timestamp = state?.password_updated_at;
  const date = dayjs(timestamp);
  const now = dayjs();

  const differenceInMinutes = now.diff(date, 'minute');
  const differenceInHours = now.diff(date, 'hour');
  const differenceInDays = now.diff(date, 'day');
  const differenceInMonths = now.diff(date, 'month');
  const differenceInYears = now.diff(date, 'year');

  let timeDifference;
  if (differenceInMinutes < 60) {
    timeDifference = `${differenceInMinutes} minutes ago`;
  } else if (differenceInHours < 24) {
    timeDifference = `${differenceInHours} hours ago`;
  } else if (differenceInDays < 30) {
    timeDifference = `${differenceInDays} days ago`;
  } else if (differenceInMonths < 12) {
    timeDifference = `${differenceInMonths} months ago`;
  } else {
    timeDifference = `${differenceInYears} years ago`;
  }

  return (
    <>
      <Head>
        <title>
          Edit Profile | SEEzone
        </title>
      </Head>
      <section className='profile-wrapper py-3 bg-light position-relative'>
        <div className="container">
          <Row>
            <Col span={24}>
              <Form>
                <div className='position-absolute profile-image upload-profile-image start-0 end-0 mx-auto d-inline-block text-center rounded-circle overflow-hidden' style={{ width: 150, height: 150, }}>
                  <Spin spinning={loading}>
                    <div>
                      {imageUrl ?
                        <Avatar shape='circle' size={150} className='fs-1 text-capitalize fw-semibold'>
                          <img src={URL?.createObjectURL(imageUrl)} width={150} height={150} className='object-fit-cover w-100 h-100' alt={state?.name?.slice(0, 1)} />
                        </Avatar>
                        : <>
                          {state?.profile_pic ?
                            <Fragment>
                              <Avatar shape='circle' size={150} className='fs-1 text-capitalize fw-semibold'>
                                <img src={`${henceforthApi.FILES.imageOriginal(state?.profile_pic)}`} className='object-fit-cover w-100 h-100' width={150} alt={state?.name?.slice(0, 1)} />
                                {imageUrl &&
                                  <img src={URL.createObjectURL(imageUrl)} className='object-fit-cover w-100 h-100' alt={state?.name?.slice(0, 1)} />}
                              </Avatar>
                            </Fragment>
                            :
                            <Avatar shape='circle' size={150} className='fs-1 text-uppercase fw-semibold'>
                              {state?.name?.slice(0, 1)}
                            </Avatar>
                          }</>
                      }

                      <Button type='text' className='position-absolute top-50 start-50 translate-middle w-100 h-100 text-white'>
                        <span
                          className='position-absolute w-100 w-100 top-50 start-50 translate-middle z-1'
                          onClick={() => {
                            setState({ ...state, profile_pic: '' });
                          }}>Edit</span>
                        <input
                          type="file"
                          className='position-absolute w-100 h-100 top-50 start-50 translate-middle opacity-0 z-3'
                          role='button'
                          accept='.png,.jpeg,.jpg'
                          onChange={uploadProfileImage}
                        />
                      </Button>
                    </div>
                  </Spin>
                </div>
              </Form>
            </Col>
          </Row>

          <WrapperElement className='pb-5'>
            <div className='py-5'>
              <Row className='mt-5 pt-5'>
                <Col span={24}>
                  <Typography.Title level={5} className='fw-bold mb-4'>Profile</Typography.Title>
                </Col>
              </Row>

              <div className='d-flex flex-column gap-4'>
                {/* Name */}
                <div className='border-bottom border-black'>
                  <Typography.Title level={5} className='fw-bold primary-font-size'>Name</Typography.Title>
                  <Flex justify='space-between' align='center'>
                    <Flex align='center' className='py-2' gap={8}>
                      <Typography.Paragraph className='m-0 text-capitalize'>{state?.name}</Typography.Paragraph>
                    </Flex>
                    <Button icon={<EditIcon />} className='bg-transparent border-0 shadow-none' onClick={() => { showEditProfileModal('name') }}></Button>
                  </Flex>
                </div>
                {/* Email */}
                <div className='border-bottom border-black'>
                  <Typography.Title level={5} className='fw-bold primary-font-size'>Email</Typography.Title>
                  <Flex align='center' className='py-2' gap={12}>
                    <Typography.Paragraph className='m-0'>{state?.email}</Typography.Paragraph>

                    {state?.is_email_verified ?
                      <span><VerifiedUser /></span> : <Link href={`/auth/verify/email?email=${state?.email}&phone_number=${state?.phone_number}&country_code=${state?.country_code}`}><UnVerified /></Link>}
                  </Flex>


                </div>
                {/* Phone Number */}
                <div className='mt-4'>
                  <Typography.Title level={5} className='fw-bold primary-font-size'>Phone No.</Typography.Title>
                  <div className='border-bottom border-black'>
                    <Flex justify='space-between' align='center'>
                      <Flex align='center' className='py-2' gap={12}>
                        <Typography.Paragraph className='m-0'>{state?.country_code} {state?.phone_number}</Typography.Paragraph>
                        {state?.is_phone_verified ?
                          <span><VerifiedUser /></span> :
                          <Link href={`/auth/verify/phone?phone_number=${state?.phone_number}&country_code=${encodeURIComponent(String(state.country_code))}`}><UnVerified /></Link>
                        }
                      </Flex>
                      <Button icon={<EditIcon />} className='bg-transparent border-0 shadow-none' onClick={() => showEditProfileModal('phone_number')}></Button>
                    </Flex>
                  </div>
                </div>
                {/* Password */}
                <div className='mt-4'>
                  <Typography.Title level={5} className='fw-bold primary-font-size'>Password</Typography.Title>
                  <div className='border-bottom border-black'>
                    <Flex justify='space-between' align='center'>
                      <Typography.Paragraph className='m-0'>
                        {/* {!state?.password_updated_at ?
                          "Password never changed" :
                          <>
                            Last updated {differenceInDays == 0 ? `${differenceInMinutes} minutes ` : `${differenceInDays} days`}
                            ago </>} */}

                        {!state?.password_updated_at
                          ? "Password never changed"
                          : <>Last updated {timeDifference}</>}
                      </Typography.Paragraph>
                      <Button icon={<EditIcon />} className='bg-transparent border-0 shadow-none' onClick={() => showEditProfileModal('password')}></Button>
                    </Flex>
                  </div>
                </div>
              </div>
            </div>
          </WrapperElement>
        </div>
      </section>


      <CommonModal title={`Edit ${formType?.type}`} isModalOpen={isEditOpen} handleOk={cancelEditProfileModal} handleCancel={cancelEditProfileModal}>
        <WrapperElement>
          <Form className='light_theme_form dark_password_eye' layout='vertical' form={form} onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
            {/* Name Input */}
            {
              formType.type === 'name' && <>
                <Form.Item name="name" label={<label className='fw-semibold'>Name</label>} rules={[{ whitespace: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error(`Please enter your name`));
                    }
                    if (value && !henceforthValidations.nameValidation(getFieldValue('name'))) {
                      return Promise.reject(new Error(`Name should conatins alphabets only. for eg - John Doe`));
                    }
                    else {
                      return Promise.resolve();
                    }
                  },
                }),
                ]}>
                  <Input placeholder='Enter the Name' />
                </Form.Item>
              </>
            }
            {/* Phone Number Input */}
            {
              formType.type === 'phone_number' && <Flex gap={8} align="" wrap={screens.sm ? false : true}>
                <Form.Item name="country_code" className={`flex-shrink-0 m-0 ${screens.sm ? '' : 'w-100'}`} label={<label className='fw-semibold'>Country Code</label>}>
                  <Select placeholder="Country Code" onInputKeyDown={(e: any) => {
                    if (!/[0-9]/.test(e.key) && e.keyCode !== 8) {
                      e.preventDefault();
                    }
                  }} prefixCls='country-code-field' allowClear showSearch>
                    {CountryCode.map((res) => (
                      <Select.Option key={res.dial_code} value={res.dial_code}>
                        {res.flag} {res.dial_code}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item className='w-100 m-0' name="phone_number" label={<label className='fw-semibold'>Phone Number</label>}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject(new Error('Please enter the phone number'));
                        }
                        if (value.length < 8) {
                          return Promise.reject(new Error('Phone number must be at least 8 digits'));
                        }
                        if (value.length > 15) {
                          return Promise.reject(new Error('Phone number cannot be more than 15 digits'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}>
                  <Input className='w-100' size='large' placeholder='Enter Phone Number' onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }} />
                </Form.Item>
              </Flex>
            }
            {/* Password Input */}
            {
              formType.type === 'password' && <>
                <Form.Item name="old_password" label={<label className='fw-semibold'>Old Password</label>} rules={[{ required: true, message: `Please enter your old password` }]}>
                  <Input.Password type='password' size='large' className='bg-transparent ps-0' placeholder='Enter Old Password' />
                </Form.Item>
                <Form.Item name="new_password" label={<label className='fw-semibold'>New Password</label>} rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(new Error(`Please enter your password`));
                      }
                      if (value && !henceforthValidations.strongPassword(getFieldValue('new_password'))) {
                        return Promise.reject(new Error(`Password should be at least 8 characters long including one uppercase, one lowercase, one special character and one number. for eg - John@1234`));
                      }
                      else {
                        return Promise.resolve();
                      }
                    },
                  }),
                ]}>
                  <Input.Password type='password' size='large' className='bg-transparent ps-0' placeholder='Enter New Password' />
                </Form.Item>

                <Form.Item className='mb-5' label={<label className='fw-semibold'>Confirm Password</label>} name={'confirm_password'} rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(new Error(`Please enter password again.`));
                      }
                      if (value && (getFieldValue('confirm_password') !== getFieldValue('new_password'))) {
                        return Promise.reject(new Error(`Password and Confirm Password doesn't match`));
                      }
                      else {
                        return Promise.resolve();
                      }
                    },
                  }),
                ]}
                  dependencies={['new_password']}>
                  <Input.Password type='password' size='large' className='bg-transparent' placeholder='Confirm Password' autoComplete="off" />
                </Form.Item>
              </>
            }

            {/* Submit Form */}
            <Flex className='mt-5' gap={12} justify={'center'}>
              <Button size='small' htmlType='button' onClick={cancelEditProfileModal} className='rounded-pill px-4 shadow-sm text-black bg-white border-white' type='default'>Cancel</Button>
              <Button size='small' htmlType='submit' className='rounded-pill px-4 fw-semibold text-black' loading={formLoading} type='primary'>Save Changes</Button>
            </Flex>
          </Form>
        </WrapperElement>
      </CommonModal>

    </>
  )
}




EditProfile.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default EditProfile