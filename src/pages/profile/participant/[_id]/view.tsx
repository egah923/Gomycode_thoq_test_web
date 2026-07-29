import WrapperElement from '@/components/common/WrapperElement';
import { Button, Checkbox, Col, Dropdown, Flex, Form, Grid, Input, MenuProps, Radio, Row, Space, Typography, message } from 'antd';
import React, { Fragment, ReactNode, useContext, useState } from 'react'
import participant from "@/assets/images/participant.png"
import MoreIcon from '@/components/Icons/MoreIcon';
import Link from 'next/link';
import Facebook from '@/components/Icons/Facebook';
import Instagram from '@/components/Icons/Instagram';
import Youtube from '@/components/Icons/Youtube';
import LocationIcon from '@/components/Icons/LocationIcon';
import CommonModal from '@/components/common/CommonModal';
import RootLayout from '@/layouts/RootLayout';
import { GetServerSideProps } from 'next';
import henceforthApi from '@/utils/henceforthApi';
import { GlobalContext } from '@/context/Provider';
import { AfterFillingFields, FillingInfo } from '@/utils/henceforthEnums';
import { useRouter } from 'next/router';
import contestantImage from "@/assets/images/contestant-image.png"

const ParticipantProfile = (props: any) => {
  const [form] = Form.useForm()
  const { Toast } = useContext(GlobalContext)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter()
  const screens = Grid.useBreakpoint()
  console.log(props?.social_media, "props");


  //   [
  //     {
  //         "type": "1",
  //         "url": "https://staging.seezone.io/contest/create",
  //         "_id": "668031938b7a5ffd342f197f"
  //     }
  // ]
  // ******************** Social Links Dropdown ********************
  const dropDownitems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a href={''} target='_blank'>
          <Facebook />
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a href="" target='_blank'>
          <Instagram />
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a href="" target='_blank'>
          <Youtube />
        </a>
      ),
    },
  ];


  // const dropDownitems: MenuProps['items'] = props?.social_media?.map((item, index) => ({
  //   key: `${index}`,
  //   label: (
  //     <a href={item.link} target="_blank" rel="noopener noreferrer">
  //       <Facebook />
  //     </a>
  //   ),
  // })) || [];

  // ************************ Participant For Edit Modal ************************

  const showParticipantForEdit = () => {
    setShowEditModal(true)
  }
  const cancelParticipantForEdit = () => {
    setShowEditModal(false)
  }

  const [formValues, setFormValues] = useState({
    creator_comment: null,
    after_filling_fields: ""
  }) as any;
  console.log(formValues, "formValues")

  // ************************ Review Contestent Form ************************
  const onFinish = async (values: any) => {
    // debugger
    let payLoad = {
      contest_id: props?.data?.contest_id,
      contestent_id: Array(props?.data?._id),
    }

    if (formValues?.creator_comment?.trim()) {
      payLoad["creator_comment"] = formValues?.creator_comment?.trim()
    }

    if (formValues?.after_filling_fields) {
      payLoad["after_filling_fields"] = formValues?.after_filling_fields
      payLoad['type'] = FillingInfo.EDIT
    } else {
      payLoad['type'] = FillingInfo.SUBMIT
    }

    console.log(payLoad, "payLoad________");

    // return
    try {
      setFormLoading(true)
      const apiRes = await henceforthApi.Contestent.reviewcontestentFormDetail(payLoad);
      console.log(apiRes.data);

      if (formValues?.creator_comment) {
        Toast.success('Form sent back to the participant.')
      } else {
        Toast.success('Form submitted successfully.')
      }


      setFormValues({
        creator_comment: null,
        type: null
      })

      router.replace({
        pathname: "/profile/participants-form"
      })
      setFormLoading(true)
      form.resetFields();
      cancelParticipantForEdit();
      setConfirmSubmit(false)

    } catch (error) {
      Toast.error(error)
      setFormLoading(true)
    }
  }



  return (
    <>
      <section className='py-4 py-md-5'>
        <div className="container">
          <WrapperElement>

            <Flex justify='space-between' align='center' className='mb-5'>
              <Link href="/profile/participants-form" className='text-black fw-medium'>{"< Participant Forms"}</Link>

              {props?.social_media ?
                <Dropdown trigger={['click']} menu={{ items: dropDownitems }} placement="bottomLeft">
                  <Button type='text' className='btn-icon align-self-start' icon={<MoreIcon />}></Button>
                </Dropdown> : ''}
            </Flex>


            <Row align={'middle'} gutter={[24, 24]} className='mb-4 mb-md-5'>
              <Col span={24} md={8} lg={8} xl={8} xxl={8}>
                <img
                  src={props?.data?.profile_pic ? `${henceforthApi.API_FILE_ROOT_SMALL}${props?.data?.profile_pic}` : contestantImage.src}
                  alt={'participant'} className='object-fit-cover img-fluid w-100' onError={(e) => { e.currentTarget.src = contestantImage.src }} />
              </Col>
              <Col span={24} md={16} lg={16} xl={16} xxl={16}>
                <div className='d-flex flex-column gap-3 text-start p-md-4'>
                  <div>
                    <Typography.Title level={5} className='m-0 fw-bold primary-font-size text-black text-capitalize'>
                      {props?.data?.name}</Typography.Title>
                    {/* , Male */}
                    <Typography.Paragraph className='m-0 fw-semibold secondary-font-size text-black'>{props?.data?.age}</Typography.Paragraph>
                  </div>
                  <Typography.Paragraph className='m-0 fw-bold secondary-font-size text-light'>{props?.data?.email}</Typography.Paragraph>
                  <Typography.Paragraph className='m-0 fw-medium secondary-font-size text-primary'>{props?.data?.contest_link}</Typography.Paragraph>
                  <Typography.Paragraph className='m-0 fw-bold secondary-font-size text-light text-capitalize'>
                    <Space>
                      <LocationIcon />
                      <span>{props?.data?.location}</span>
                    </Space>
                  </Typography.Paragraph>
                </div>
              </Col>
            </Row>


            <Row gutter={[0, 40]}>
              <Col span={24}>
                <div>
                  <Typography.Title level={4} className='fw-bold text-black'>About</Typography.Title>
                  <Typography.Paragraph className='text-black fw-normal'>{props?.data?.about}</Typography.Paragraph>
                </div>
              </Col>

              {props?.data?.video_intro &&
                <Col span={24} sm={20} md={20} lg={16} xl={14} xxl={12}>
                  <div>
                    <Typography.Title level={4} className='fw-bold text-black mb-4'>Video Intro</Typography.Title>
                    <video height={300} width={screens.md ? 400 : '100%'} className='border border-light' controls autoPlay playsInline muted loop src={henceforthApi.FILES.video(props?.data?.video_intro)}></video>
                  </div>
                </Col>
              }
              <Col span={24}>
                <div>
                  <Typography.Title level={4} className='fw-bold text-black'>Additional Message</Typography.Title>
                  <Typography.Paragraph className='text-black fw-normal'>Thanks for inviting me to participate in this amazing contest.</Typography.Paragraph>
                </div>
              </Col>
            </Row>

            <Form onFinish={onFinish} onFinishFailed={(error: any) => console.log(error)}>

              <Form.Item className="my-5" valuePropName="checked" name={'confirm_check'} rules={[{
                required: true, validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Please check the checkbox.'))
              }]}>
                <Checkbox onChange={(e) => { console.log(e?.target?.checked) }}>Looks good. I will Submit</Checkbox>
              </Form.Item>

              <Flex gap={20} vertical={screens.sm ? false : true}>
                <Button type='primary' size='large' htmlType='submit' shape='round'>Confirm & Submit</Button>
                <Button type='default' size='large' shape='round' onClick={showParticipantForEdit}>Send Back To Participant For Edit</Button>
              </Flex>
            </Form>
          </WrapperElement>
        </div>
      </section>


      {/* ************************ Confirm Modal ************************ */}
      <CommonModal isModalOpen={showEditModal} handleCancel={cancelParticipantForEdit} title="Enter Comment">
        <WrapperElement>
          <Form form={form} className='light_theme_form' layout='vertical' onFinish={onFinish} onFinishFailed={(error: any) => console.log(error)
          }>

            {!confirmSubmit && <Fragment>
              {/* Comment */}
              <Form.Item className='mb-2' name={'creator_comment'} rules={[{ required: true, message: 'Please enter the comment' }]} label={<label className='text-black fw-semibold'>Enter Comments</label>} >
                <Input.TextArea rows={4} size='large' onChange={(e) => setFormValues((prev: any) => ({
                  ...prev,
                  creator_comment: e.target.value
                }))} className='bg-transparent ps-0' placeholder='What you want user to correct in form' />
              </Form.Item>
              {/* Review or Submit */}
              <Form.Item className='my-3' name={'after_filling_fields'} rules={[{ required: true, message: 'Please select the any option!!' }]} label={<label className='text-black fw-semibold'>What Should Participants Do After Editing?</label>}>
                <Radio.Group value={formValues.after_filling_fields} onChange={(e) => setFormValues((prev: any) => ({
                  ...prev,
                  after_filling_fields: e.target.value,
                }))}>
                  <Radio value={AfterFillingFields.REVIEW} className='text-black'>Send Back for Review</Radio>
                  <Radio value={AfterFillingFields.SUBMIT} className='text-black'>Submit Directly</Radio>
                </Radio.Group>
              </Form.Item>
              {/* Buttons */}
              <Flex gap={12} justify='center' className='mt-4'>
                <Button size='middle' htmlType='button' onClick={cancelParticipantForEdit} className='rounded-pill px-4 px-md-5 bg-black text-white' type='default'>Close</Button>
                <Button size='middle' className='rounded-pill px-4 px-md-5 text-black' onClick={() => { setConfirmSubmit(true) }} type='primary'>Send</Button>
              </Flex>
            </Fragment>}

            {/* Confirmation Submission */}
            {confirmSubmit && <WrapperElement className='text-center'>
              <Typography.Paragraph className='text-black'>
                Are you sure you want to submit this form?
              </Typography.Paragraph>
              <Typography.Paragraph className='text-black'>
                It can't be  edited after submission
              </Typography.Paragraph>
              <Flex className='mt-4' gap={12} justify={'center'}>
                <Button size='small' htmlType='button' onClick={() => setConfirmSubmit(false)} className='rounded-pill px-4' type='primary'>Go Back</Button>
                <Button size='small' loading={formLoading} htmlType='submit' className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Confirm</Button>
              </Flex>
            </WrapperElement>}
          </Form>
        </WrapperElement>
      </CommonModal>
    </>
  )
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const _id = context.query._id as string;
    console.log(_id, typeof _id);

    // *********************** Get Contest BY Id API Call ***********************
    const apiRes = await henceforthApi.Contestent.contestentFormDetail(_id);
    const res = apiRes;
    console.log(res, "Detail_");
    return { props: res };
  } catch (error) {
    console.error('Error fetching', error);
    return {
      props: {
        storeDetail: null,
        error: 'Failed to fetch'
      }
    };
  }
};


ParticipantProfile.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default ParticipantProfile