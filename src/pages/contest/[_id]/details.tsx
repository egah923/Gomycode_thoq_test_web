import { Avatar, Button, Checkbox, Col, Divider, Flex, Form, Grid, Image, Input, Radio, Rate, Row, Select, Space, Spin, Tag, Typography, Upload } from 'antd';
import React, { Fragment, ReactNode, use, useContext, useEffect, useState } from 'react'
import profile from "@/assets/images/profile.png"
import contentImage from "@/assets/images/contest-image.png"
import InfoBadge from '@/components/InfoBadge';
import CommentIcon from '@/components/Icons/CommentIcon';
import WrapperElement from '@/components/common/WrapperElement';
import SectionTitle from '@/components/common/SectionTitle';
import CommonModal from '@/components/common/CommonModal';
import PaymentCard from '@/components/PaymentCard';
import EditOutlined from '@/components/Icons/EditOutlined';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BorderRight from '@/components/Icons/BorderRight';
import ContestantTable from '@/components/cards/contestant/ContestantTable';
import ContestantCard from '@/components/cards/contestant/ContestantCard';
import MediaHeldBadge from '@/components/cards/votingcard/MediaHeldBadge';
import ListItemComponent from '@/components/common/ListItemComponent';
import UploadButtonIcon from '@/components/UploadButtonIcon';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import UploadIcon from '@/components/Icons/UploadIcon';
import { AfterFillingFields, ContestPlatform, ContestStatus, VoteType } from '@/utils/henceforthEnums';
import henceforthApi from '@/utils/henceforthApi';
import { GetServerSideProps } from 'next';
import YoutubeTag from '@/components/cards/votingcard/Tags/YoutubeTag';
import FacebookTag from '@/components/cards/votingcard/Tags/FacebookTag';
import ThrowTech from '@/components/cards/votingcard/Tags/ThrowTech';
import uiSettings from '@/utils/uiSettings';
import ThumbUpFilled from '@/components/Icons/ThumbUpFilled';
import CommentComponent from '@/components/comment/CommentComponent';
import RootLayout from '@/layouts/RootLayout';
import { GlobalContext } from '@/context/Provider';
import ThumbUpOutlined from '@/components/Icons/ThumbUpOutlined';
import PlaceholderImage from '@/components/cards/PlaceholderImage';
import henceforthValidations from '@/utils/henceforthValidations';
import TrashFilled from '@/components/Icons/TrashFilled';
import NumberFormatter from '@/components/common/NumberFormatter';
import StripeElement from '@/components/stripe-card/Element';
import { rankingText } from '@/utils/CommonFunctions';
import ReviewComponents from '@/components/ReviewComponents';
import Head from 'next/head';
import dayjs from 'dayjs';


const ViewContest = (props: any) => {
  console.log(props)
  const screens = Grid.useBreakpoint();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenSuccess, setIsModalOpenSuccess] = useState(false);

  const [id, setId] = useState(null)
  const [form] = Form.useForm()
  const [formLoading, setFormLoading] = useState(false)
  console.log(props, "props");
  const [state, setState] = useState(props as any)
  const [uploadLoading, setUploadLoading] = useState(false as any)



  const getKey = async (contestent_id: any) => {

    try {
      let payload = {
        contest_id: router?.query?._id as string,
        round_id: props?.round_id as string,
        contestent_id: contestent_id,
      }

      const apiRes = await henceforthApi.Contest.payment(payload)
      if (apiRes?.data?.client_secret) {
        router.replace({ query: { ...router.query, secret_key: String(apiRes?.data?.client_secret) } }, undefined, { shallow: true, scroll: false })
        showModal()
      } else {
        setState({ ...state, total_votes: apiRes?.data?.total_votes })
        Toast.success(apiRes?.data?.message)
      }
    } catch (error) {
      Toast.error(error)
    }
  }



  React.useEffect(() => {
    if (router.query.redirect_status === "succeeded") {
      showModalSuccess()
    }
  }, [router?.query?.redirect_status]);













  // useEffect(() => {
  //   if (!router.query.secret_key && isModalOpen) {
  //     getKey()
  //   }
  // }, [isModalOpen, setIsModalOpen])
  // if (!router.query.secret_key && isModalOpen) {
  //   getKey()
  // }
  // React.useEffect(() => {
  //   if (router.query.secret_key == null && router.query.secret_key != undefined) {
  //     de
  //     setIsModalOpen(false)
  //     Toast.success('Vote Successfully')
  //   }
  // }, [router?.query?.secret_key]);


  // ************************ Edit Contest Logic ************************




  // Current time in milliseconds
  const currentTime = dayjs().valueOf();

  const EditLink = <Link href={`/contest/${props?._id}/edit`} className='mb-md-2 mb-lg-0'>
    <EditOutlined />
  </Link>



  // Function to check editability
  function isEditable(startTime, startDates, currentTime) {
    const startDate = dayjs(startDates).format('YYYY-MM-DD');
    const currentDate = dayjs(currentTime).format('YYYY-MM-DD');

    const startOnlyTime = dayjs(startTime).format('HH:mm'); // Only time part of startTime
    const currentOnlyTime = dayjs(currentTime).format('HH:mm'); // Only time part of currentTime

    // Compare dates first
    if (startDate === currentDate) {
      // If the dates are the same, compare the times
      if (startOnlyTime === currentOnlyTime) {
        return null;
      } else if (currentOnlyTime < startOnlyTime) {
        return EditLink;
      } else {
        return null;
      }
    } else if (currentDate < startDate) {
      // If the current date is before the start date
      return EditLink;
    } else {
      // If the current date is after the start date
      return null;
    }
  }
  // ************************ Upload Image API Call ************************
  const updateFormField = (form, keyPath, value) => {
    if (Array.isArray(keyPath)) {
      const formValues = form.getFieldValue(keyPath[0]) || [];
      const nestedFieldName = keyPath.slice(1);
      formValues[nestedFieldName[0]] = {
        ...formValues[nestedFieldName[0]],
        [nestedFieldName[1]]: value,
      };
      form.setFieldsValue({ [keyPath[0]]: formValues });
      console.log(value, "nested_____value_______");

    } else {
      form.setFieldsValue({ [keyPath]: value });

      console.log(value, "value_______");

    }
  };




  const handleFileUpload = async (keyPath, fileList, type?: boolean, mediatype?: string) => {
    // console.log(keyPath, "valuessssssssssssss")
    let typeOfKey = typeof keyPath == "object" ? keyPath.join('') : keyPath
    try {
      if (fileList?.length > 0) {
        const file = fileList[0].originFileObj;
        if (file) {
          const isImage = file.type.startsWith('image/') && (file.type.includes('jpeg') || file.type.includes('png') || file.type.includes('jpg'));
          const isVideo = file.type.startsWith('video/') && (file.type.includes('mp4') || file.type.includes('mov'));
          // Handle invalid file types
          if (!isImage && !isVideo) {
            if (!isImage) {
              return Toast.error('Please upload a valid image (.jpeg, .jpg, .png)');
            }
            if (!isVideo) {
              return Toast.error('Please upload a valid video (.mp4, .mov)');
            }
          }
          if (isVideo && file.size > 20 * 1024 * 1024) {
            return Toast.error('Video file size should not exceed 20 MB');
          }
          setUploadLoading({
            [typeOfKey]: true
          })
          // setUploadLoading(true)
          let uploadApiRes = await henceforthApi.Common.uploadFile('file', file);
          // updateFormField(form, keyPath, uploadApiRes?.data);
          let fileList = [{
            uid: uploadApiRes?.data?.file_name || uploadApiRes?.data?.Key,
            name: uploadApiRes?.data?.file_name || uploadApiRes?.data?.Key,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(uploadApiRes?.data?.file_name || uploadApiRes?.data?.Key),
          }]
          if (type) {
            form.setFieldValue(mediatype, uploadApiRes?.data?.type)
          }
          updateFormField(form, keyPath, { fileList });
        }
      }
      // Toast.success('File uploaded successfully');
    } catch (error) {
      Toast.error(error);

    }
    finally {
      setUploadLoading({
        [typeOfKey]: false
      })
    }
  }

  // ************* Payment Modal *************
  const showModal = (id?: any) => {
    // debugger;
    setIsModalOpen(true);
    console.log(id, "iddddddddd");

  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // ************* Payment Success Modal *************
  const showModalSuccess = () => {
    setIsModalOpenSuccess(true);
    setIsModalOpen(false);
  };

  const closeAllModal = () => {
    setIsModalOpenSuccess(false);
    setIsModalOpen(false);
  };


  const handleOkSuccess = () => {
    setIsModalOpenSuccess(false);
    router.replace(`/contest/${props?._id}/details`)

  };

  const handleCancelSuccess = () => {
    setIsModalOpenSuccess(false);
    router.replace(`/contest/${props?._id}/details`)
  };


  const { Toast } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState({
    is_contest_like: props?.is_like,
    total_likes: props?.total_likes
  });

  const [commentCount, setCommentCount] = useState(props?.total_comments)


  // ************* Like Contest API Call *************
  const likeContest = async (_id: string) => {
    try {
      setLoading(true)
      let payLoad = {
        id: _id
      }
      const apiRes = await henceforthApi.Contest.likeContest(payLoad);
      Toast.success(apiRes.message);

      setLiked(prev => ({
        is_contest_like: !prev.is_contest_like,
        total_likes: prev.is_contest_like ? prev.total_likes - 1 : prev.total_likes + 1
      }));

      setLoading(false)
    } catch (error) {
      Toast.error(error);
      setLoading(false)
    }
  }

  // ************* Folllow Contest API Call *************

  const followContest = async (_id: string) => {
    try {
      setLoading(true)
      let payLoad = {
        id: _id
      }
      const apiRes = await henceforthApi.Contest.followContest(payLoad);
      Toast.success(apiRes.message);

      router.replace({
        pathname: `/contest/type/contest-follow`,
      })

      setLoading(false)
    } catch (error) {
      Toast.error(error);
      setLoading(false)
    }
  }


  // ************************ Participant Form Submission API Call ************************
  const onFinish = async (values: any) => {
    console.log(values, "values?.contest_act");


    let payLoad = {
      contest_id: props?._id,
      contestent_name: values?.contestent_name,
      age: values?.age,
      location: values?.location,
      about: values?.about,
      material: values?.material?.fileList[0]?.name,
      profile_pic: values?.profile_pic?.fileList[0]?.name,
      video_intro: values?.video_intro?.fileList[0]?.name,
      contest_act: values?.contest_act?.fileList[0]?.name,
      social_media: values.social_media?.map((media: any) => ({
        type: media?.type,
        url: media?.url,
      })),
      contest_be_watched: values.contest_be_watched,
      contest_link: values.contest_link,
    }

    console.log(payLoad);

    // return
    try {
      setFormLoading(true);
      const apiRes = await henceforthApi.Contestent.contestentFormSubmission(payLoad);
      Toast.success('Form submitted successfully.')
      console.log(apiRes);

      router.replace({
        pathname: `/profile/contest-joined`,
        // query: {
        //   status: apiRes?.data?.status
        // }
      })

    } catch (error) {
      Toast.error(error)
      setFormLoading(false);
    }

  }




  {/* ****************************************** Update Vote Count ****************************************** */ }
  const [voteCounts, setVoteCounts] = useState(props?.contestent?.map(contestant => ({
    id: contestant._id,
    total_votes: Number(contestant?.total_votes)
  })));


  const updateVoteCount = (contestantId) => {
    setVoteCounts(prev =>
      prev.map(vote =>
        vote?.id === contestantId ? { ...vote, total_votes: vote?.total_votes + 1 } : vote
      )
    );
  };
  return (
    <Fragment>
      <Head>
        <title>
          {uiSettings.capitalize(props?.title)} | SEEzone
        </title>
      </Head>
      {/* ****************************************** Status Pending New ****************************************** */}
      {props?.status === ContestStatus.PENDING &&
        <section className='py-4'>
          <div className="container">
            <WrapperElement>
              <Row justify={'space-between'} gutter={[{ xs: 12, sm: 12, md: 24 }, { xs: 12, sm: 12, md: 24 }]}>
                <Col span={24} md={12} lg={11} xl={10} className='align-self-lg-center'>
                  <div className='d-flex flex-column gap-3'>
                    {/* Contest Info */}
                    <Flex className='mb-3' gap={8} align='center'>
                      <Avatar src={profile.src} size={40} shape='circle'></Avatar>
                      <Typography.Text className='text-decoration-underline fw-medium text-black text-capitalize'>{props?.full_name}</Typography.Text>
                    </Flex>

                    {/* Contest Name */}
                    <div className='col-12 col-md-7 col-lg-7 col-xl-7 col-xxl-7'>
                      <Flex justify='space-between' gap={8} vertical={screens.lg ? false : true}>
                        <Typography.Title level={4} className={`m-0 fw-bold sub-title-font-size text-capitalize`}>{props?.title}</Typography.Title>
                        {(props?.status === ContestStatus.PENDING && props?.is_creator) &&
                          <>
                            {isEditable(props?.start_time, props?.start_date, currentTime)}
                          </>
                        }
                      </Flex>


                      <Divider className='border border-black my-1' />
                    </div>
                    {/* Contest Date */}
                    <ul className='list-unstyled d-flex flex-column gap-1 m-0'>
                      <li className='fw-semibold text-black'>Start Date: {
                        uiSettings.formatDate(props?.start_date)}, {uiSettings.formatTime(props?.start_time)}
                      </li>
                      <li className='fw-semibold text-black'>End Date: {uiSettings.formatDate(props?.end_date)}, {uiSettings.formatTime(props?.end_time)}</li>
                    </ul>

                    {/* Contest Held On */}
                    <Flex align='center' gap={12}>
                      <Typography.Text className='fw-medium text-secondary'>Contest held on:</Typography.Text>
                      <MediaHeldBadge
                        media_type={props?.contest_be_watched === ContestPlatform.YOUTUBE ? <YoutubeTag /> : props?.contest_be_watched === ContestPlatform.FACEBOOK ? <FacebookTag /> : <ThrowTech />} />
                    </Flex>
                  </div>
                </Col>

                {/* ****************** Contest Image ****************** */}
                <Col span={24} md={12} lg={12} xl={10}>
                  <div>
                    {/* <img src={contentImage.src} className='img-fluid mb-3 rounded-top-3 shadow-sm' alt="content Image" /> */}
                    <img src={props?.cover_media ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.cover_media}` : contentImage.src} className='w-100 mb-3 rounded-top-3 shadow-sm object-fit-cover' alt="content Image" height={380} onError={(e) => { e.currentTarget.src = contentImage.src }} />
                  </div>
                </Col>
              </Row>
            </WrapperElement>

            <WrapperElement className='mt-5'>
              <ListItemComponent list={[
                { title: "Number of Finalists:", description: props?.total_finalist || 0 },
                { title: "Total Number of Contestants:", description: props?.contestent?.length || 0 },
                { title: "Number of Rounds:", description: props?.rounds?.length || 0 },
                { title: "Reward for Participants:", description: "Yes" },
                { title: "Number of votes that can be casted:", description: props?.number_of_time_vote > 100 ? "As Much As They Can" : props?.number_of_time_vote },
                { title: "Contest Link:", description: <Link href={props?.contest_link}>{props?.contest_link || "N/A"}</Link> },
                { title: "Reward for Voters:", description: props?.is_voter_prize ? "Yes" : "No" },
                { title: "Status", description: <Tag color='red'>{props?.status}</Tag> }
              ]} />

              {props?.add_info &&
                <div className='mt-2'>
                  <Typography.Paragraph className="fw-semibold text-black mb-2">Additional Information:</Typography.Paragraph>
                  <Typography.Paragraph className="fw-medium">{props?.add_info}</Typography.Paragraph>
                </div>
              }
            </WrapperElement>
          </div>
        </section>}

      {/* ****************** Submit Participant Form ****************** */}

      {(props?.status === ContestStatus.PENDING) &&
        <div className="container">
          <Row>
            <Col span={24}>
              <WrapperElement className='mt-5 mb-5'>
                <div>
                  <div className='mb-3'>
                    <SectionTitle title='Description' className='fw-bold' />
                  </div>
                  <Typography.Paragraph className='text-black mb-3'>When Alex Rider learns that his uncle Ian has been killed in the line of duty as a British spy - and not in a car accident like he's been told - everything changes for this otherwise normal teen. </Typography.Paragraph>
                </div>


                {(props?.is_contestent && !props?.is_data_added) &&
                  <Fragment>
                    <Typography.Paragraph className='text-black mt-3'>Creator Invites you to participate in this contest</Typography.Paragraph>
                    <div>
                      <InfoBadge title={'Fill form to Participate'} stats="" className='primary-font-size' />
                    </div>

                    <div className='mt-5 mb-4'>
                      <SectionTitle title='Enter Details Below and Submit Form for Review' className='fw-bold' />
                    </div>

                    <Form scrollToFirstError layout='vertical' className='light_theme_form mb-5' name="participant-form" form={form} onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
                      {/* Full Name */}
                      <Form.Item name={'contestent_name'} rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value) {
                              return Promise.reject(new Error('Please enter the full name'));
                            }
                            if (value && !henceforthValidations.nameValidation(value)) {
                              return Promise.reject(new Error('Name should contain alphabets only. For example, John Doe'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}>
                        <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Name' />
                      </Form.Item>

                      {/* Age  */}
                      <Form.Item name={'age'} rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value) {
                              return Promise.reject(new Error('Please enter the age'));
                            }
                            if (value && value < 16) {
                              return Promise.reject(new Error('Minimum age should be 16'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}>
                        <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Age' onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }} />
                      </Form.Item>
                      {/* Location */}
                      <Form.Item name={'location'} rules={[{ required: true, message: 'Please enter the location' }]}>
                        <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Location' />
                      </Form.Item>
                      {/* About */}
                      <Form.Item name={'about'} label={<label>About You [Optional]</label>}>
                        <Input.TextArea rows={3} size='large' className='bg-transparent ps-0' placeholder='About' />
                      </Form.Item>
                      {/* material */}
                      <div>
                        <div className='my-3'>
                          <SectionTitle title='Upload Material' className='sub-title-font-size fw-bold' />
                        </div>
                        <Spin spinning={uploadLoading?.material ? uploadLoading?.material : false} style={{ width: 102 }}>
                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.material !== curr?.material} className='m-0'>
                            {
                              ({ getFieldValue }) => {
                                let file = getFieldValue('material');
                                const fileList = file?.fileList || []
                                return (
                                  <Form.Item className='mb-2' name={'material'} rules={[{ required: true, message: 'Please upload the image' }]}>
                                    <>
                                      <Upload
                                        customRequest={({ onSuccess }: any) =>
                                          onSuccess("ok")
                                        }
                                        accept='.png,.jpeg,.jpg'
                                        showUploadList={{
                                          showPreviewIcon: false
                                        }}
                                        listType="picture-card"
                                        fileList={fileList || []}
                                        onChange={(info) => {
                                          if (info?.fileList[0]?.status === "done") {
                                            handleFileUpload('material', info.fileList);
                                          }
                                        }}
                                      >
                                        {fileList.length >= 1 ? null : <UploadButtonIcon />}
                                      </Upload>
                                    </>
                                  </Form.Item>
                                )
                              }}
                          </Form.Item>
                        </Spin>
                        <Typography.Paragraph className='mb-3 m-0'>{"[ This could be the Act/Performance/Creation/etc., that voters are to vote on]"}</Typography.Paragraph>
                      </div>
                      {/* Upload your image */}
                      <Spin spinning={uploadLoading?.profile_pic ? uploadLoading?.profile_pic : false} style={{ width: 102 }}>
                        <Form.Item shouldUpdate={(prev: any, curr: any) => prev.profile_pic !== curr.profile_pic} className='m-0' label={<label className='fw-normal text-black base-font-size'>Upload your image</label>
                        }>
                          {
                            ({ getFieldValue }) => {
                              let file = getFieldValue('profile_pic');
                              const fileList = file?.fileList || []
                              return (
                                <Form.Item name="profile_pic" rules={[{ required: true, message: 'Please upload cover media' }]}>
                                  <Upload
                                    customRequest={({ onSuccess }: any) =>
                                      onSuccess("ok")
                                    }
                                    accept='.png,.jpeg,.jpg'
                                    showUploadList={{ showPreviewIcon: false }}
                                    listType="picture-card"
                                    fileList={fileList || []}
                                    onChange={(info) => {
                                      if (info?.fileList[0]?.status === "done") {
                                        handleFileUpload('profile_pic', info.fileList)
                                      }
                                    }}
                                  >
                                    {fileList.length >= 1 ? null : <UploadButtonIcon />}
                                  </Upload>
                                </Form.Item>
                              )
                            }
                          }
                        </Form.Item>
                      </Spin>


                      {/* Video Intro */}
                      <div>
                        <Spin spinning={uploadLoading?.video_intro ? uploadLoading?.video_intro : false} style={{ width: 102 }}>
                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.video_intro !== curr?.video_intro} className='m-0'>
                            {
                              ({ getFieldValue }) => {
                                let file = getFieldValue('video_intro');
                                const fileList = file?.fileList || []

                                return (
                                  <Form.Item name={'video_intro'} className='mb-2' label={<label className='text-black primary-font-size'>Video Intro</label>} rules={[{ required: true, message: 'Please upload the video' }]}>
                                    <>
                                      <Upload
                                        customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                        accept="video/mp4,video/*"
                                        listType="picture-card"
                                        showUploadList={{
                                          showPreviewIcon: false
                                        }}
                                        onChange={(info) => {
                                          if (info?.fileList[0]?.status === "done") {
                                            handleFileUpload('video_intro', info.fileList)
                                          }
                                        }}
                                      >
                                        {fileList.length >= 1 ? null : <UploadButtonIcon />}
                                      </Upload>
                                    </>
                                  </Form.Item>
                                )
                              }}
                          </Form.Item>
                        </Spin>

                        <Typography.Paragraph className='mb-3 m-0'>{"[Upload a maximum of one minute video intro about you]"}</Typography.Paragraph>
                      </div>

                      {/* social_media Links */}
                      <Form.List name="social_media" initialValue={Array.from({ length: 1 }, () => ({}))}>
                        {(fields, { add, remove }) => (
                          <div>
                            {fields.map((field, index) => {
                              return (
                                <div key={index}>
                                  <Form.Item name={[field.name, 'type']}>
                                    <Select size='large' className='bg-transparent ps-0' placeholder='Enter social media Handles'>
                                      <Select.Option value="Facebook">Facebook</Select.Option>
                                      <Select.Option value="YouTube">YouTube</Select.Option>
                                      <Select.Option value="Tiktok">Tiktok</Select.Option>
                                      <Select.Option value="URL_Link">URL Link</Select.Option>
                                    </Select>
                                  </Form.Item>
                                  <Flex align='start' gap={8}>
                                    <Form.Item className='w-100' name={[field.name, 'url']}>
                                      <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter Link here' />
                                    </Form.Item>
                                    {
                                      index > 0 &&
                                      <Button icon={<TrashFilled />} danger onClick={() => {
                                        remove(field.name); console.log("field removed", field);

                                      }} size='small' htmlType='button' type="primary" className='text-white fw-normal text-black' shape='default'></Button>
                                    }
                                  </Flex>
                                </div>
                              )
                            })}

                            <Form.Item>
                              <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal text-black' shape='round'>+ Add More</Button>
                            </Form.Item>
                          </div>

                        )}
                      </Form.List>
                      <Typography.Paragraph italic className='text-black m-0 mb-3'>{'[ This will help you gain more visibility]'}</Typography.Paragraph>

                      {/* Contest Be Watched */}
                      <Form.Item name={'contest_be_watched'} rules={[{ required: true, message: 'Please enter the link' }]}>
                        <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste the link where your contest material can be viewed/watch i.e., YouTube, Tiktok, url link, etc' />
                      </Form.Item>

                      {/* Contest Link */}
                      <Form.Item name={'contest_link'} rules={[{ required: true, message: 'Please enter the contest link' }]}>
                        <Input type='text' size='large' className='bg-transparent ps-0 w-100' placeholder='Paste Link here...' />
                      </Form.Item>

                      {/* Contest Act */}
                      <Flex gap={8} align='start' className='w-100 position-relative'>
                        <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contest_act !== curr?.contest_act} className='m-0 w-100'>
                          {
                            ({ getFieldValue }) => {
                              const file = getFieldValue('contest_act');
                              const fileList = file?.fileList[0]?.name
                              console.log(fileList);
                              return (
                                <Form.Item>
                                  {
                                    <Input type='text' size='large' className='bg-transparent ps-0 flex-grow-1 w-100' placeholder='Upload your contest act here [Optional]' value={fileList} readOnly disabled />
                                  }
                                </Form.Item>
                              )
                            }
                          }
                        </Form.Item>
                        <Spin spinning={uploadLoading?.contest_act ? uploadLoading?.contest_act : false}>
                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contest_act !== curr?.contest_act} className='m-0'>
                            {
                              ({ getFieldValue }) => {
                                let file = getFieldValue('contest_act');
                                const fileList = file?.fileList || []
                                return (
                                  <Form.Item name={'contest_act'}>
                                    <Upload prefixCls='upload-contest-act'
                                      fileList={fileList || []}
                                      customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                      showUploadList={{
                                        showPreviewIcon: false
                                      }}
                                      accept="video/mp4,video/*"
                                      onChange={(info) => {
                                        if (info?.fileList[0]?.status === "done") {
                                          handleFileUpload('contest_act', info.fileList)
                                        }
                                      }}>
                                      <Button size='large' htmlType='button' className='border-0 border-bottom border-black rounded-0 bg-transparent' icon={<UploadIcon />}></Button>
                                    </Upload>
                                  </Form.Item>
                                )
                              }}
                          </Form.Item>

                        </Spin>
                      </Flex>

                      <Flex className='mt-4' align='center' wrap={screens.md ? 'nowrap' : 'wrap'} gap={12} justify={screens.md ? 'end' : 'start'}>
                        <Button size='small' loading={formLoading} disabled={props?.after_filling_fields === AfterFillingFields.SUBMIT} className={`rounded-pill px-4 ${screens.sm ? '' : 'w-100'}`} type='primary' htmlType='submit'>Send Back For Review & Submission</Button>
                        <Link href={'/profile/contest-joined?status=PENDING&pagination=1&limit=10'} className={screens.sm ? '' : 'w-100'}>
                          <Button size='small' className={`rounded-pill px-4 border-black bg-transparent text-black ${screens.sm ? '' : 'w-100'}`} type='default'>Cancel</Button>
                        </Link>
                        <Button size='small' loading={formLoading} className={`rounded-pill px-4 ${screens.sm ? '' : 'w-100'}`} disabled={props?.after_filling_fields === AfterFillingFields.REVIEW} type='primary' htmlType='submit'>Submit</Button>
                      </Flex>

                      {/* after_filling_fields */}
                    </Form>
                  </Fragment>}
              </WrapperElement>
            </Col>
          </Row>
        </div>}



      {/* ****************************************** Status Upcoming, Ongoing & COMPLETED ****************************************** */}

      {props?.status !== ContestStatus.PENDING &&
        <section className='py-md-5 py-4'>
          <div className="container">
            <WrapperElement>
              {/* ****************** Contest Info ****************** */}
              <Row justify={'space-between'} gutter={[{ xs: 12, sm: 12, md: 24 }, { xs: 12, sm: 12, md: 24 }]}>
                <Col span={24} md={11} lg={11} xl={10} className='align-self-lg-center'>
                  <div className='d-flex flex-column gap-3'>
                    {/* Contest Info */}
                    <Flex className='mb-3' gap={8} align={screens.lg ? 'center' : 'start'} vertical={screens.lg ? false : true}>
                      <Flex gap={12} align='center'>
                        <Avatar src={profile.src} size={40} shape='circle'></Avatar>
                        <Typography.Text className='text-decoration-underline fw-medium text-black text-capitalize'>{props?.full_name}</Typography.Text>
                        {props?.status === ContestStatus.COMPLETED &&
                          <>
                            <Rate count={5} value={props?.average_rating} allowHalf disabled />
                          </>
                        }


                      </Flex>
                      {props?.status === ContestStatus.COMPLETED &&
                        <>
                          {props?.total_reviews > 0 ?
                            <p className='text-lg-end text-center secondary-font-size text-black fw-medium m-0'><NumberFormatter props={props?.total_reviews} /> Reviews</p>
                            : ''}
                        </>
                      }
                    </Flex>

                    {/* Contest Name */}
                    <div className='col-12 col-md-7 col-lg-7 col-xl-7 col-xxl-7'>
                      <Flex justify='space-between'>
                        <Typography.Title level={4} className={`m-0 fw-bold sub-title-font-size text-capitalize`}>{props?.title}</Typography.Title>
                        {(props?.status === ContestStatus.UPCOMING && props?.is_creator) &&
                          <>
                            {isEditable(props?.start_time, props?.start_date, currentTime)}
                          </>
                        }
                      </Flex>
                      <Divider className='border border-black my-1' />
                    </div>
                    {/* Contest Date */}
                    <ul className='list-unstyled d-flex flex-column gap-1 m-0'>
                      <li className='fw-semibold text-black'>Start Date: {
                        uiSettings.formatDate(props?.start_date)}, {uiSettings.formatTime(props?.start_time)}</li>
                      <li className='fw-semibold text-black'>End Date: {uiSettings.formatDate(props?.end_date)}, {uiSettings.formatTime(props?.end_time)}</li>
                    </ul>

                    {/* Contest Held On */}
                    <Flex align='center' gap={12}>
                      <Typography.Text className='fw-medium text-secondary'>Contest held on:</Typography.Text>
                      <MediaHeldBadge
                        media_type={props?.contest_be_watched === ContestPlatform.YOUTUBE ? <YoutubeTag /> : props?.contest_be_watched === ContestPlatform.FACEBOOK ? <FacebookTag /> : <ThrowTech />} />
                    </Flex>


                    {/* Contest Buttons */}
                    {(props?.status !== ContestStatus.PENDING) &&
                      <Flex vertical gap={12}>
                        <div>
                          <InfoBadge title={'Total Votes:'} stats={state?.total_votes || 0} className='primary-font-size' />
                        </div>

                        {props?.status !== ContestStatus.COMPLETED &&
                          <div>
                            <Button type='default' className='fw-semibold text-black border-black' onClick={() => followContest(props?._id)} shape='round'>Click here to get update of this contest</Button>
                          </div>
                        }
                      </Flex>
                    }
                  </div>
                </Col>

                {/* ****************** Contest Image ****************** */}
                <Col span={24} md={12} lg={12} xl={10}>
                  <div>
                    <img src={props?.cover_media ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.cover_media}` : contentImage.src} className='w-100 mb-3 rounded-top-3 shadow-sm object-fit-cover' alt="content Image" height={380} onError={(e) => { e.currentTarget.src = contentImage.src }} />
                    {(props?.status !== ContestStatus.PENDING) &&
                      <ul className='list-unstyled d-flex gap-3 gap-md-4 justify-content-md-end m-0'>
                        <li>
                          <Flex align='center' gap={12}>
                            <Button onClick={() => { likeContest(props?._id) }} className='btn-icon' disabled={loading}>
                              {liked.is_contest_like ?
                                <ThumbUpFilled width={32} height={32} /> : <ThumbUpOutlined width={32} height={32} />}
                            </Button>
                            {/* <Typography.Text className='fw-semibold'>{props?.total_likes  || 0}</Typography.Text> */}
                            <Typography.Text className='fw-semibold'>{liked.total_likes ? liked.total_likes : ''}</Typography.Text>
                          </Flex>
                        </li>
                        <li>
                          <Flex align='center' gap={12}>
                            <CommentIcon />
                            <Typography.Text className='fw-semibold'>{commentCount ? commentCount : ''}</Typography.Text>
                          </Flex>
                        </li>
                      </ul>}
                  </div>
                </Col>
              </Row>
            </WrapperElement>




            {/* ****************** Voting is Closed ****************** */}
            <WrapperElement>
              {(props?.status === ContestStatus.COMPLETED) &&
                <>
                  <div className='error-message my-5'>
                    <Typography.Title level={3} className='m-0 text-inherited fw-medium'>Voting is Closed</Typography.Title>
                  </div>

                  {/* ************** Winner ***************/}
                  <div>
                    <Row gutter={[24, 24]}>
                      <Col span={24}>
                        <div>
                          <SectionTitle title='Winner' className='mb-4' />
                        </div>
                      </Col>
                    </Row>

                    <>
                      {props?.winners?.length > 0 ?
                        <Row gutter={[24, 24]}>
                          {
                            Array.isArray(props?.winners) && props?.winners.map((res) => {
                              return (
                                <Col span={24} xs={24} sm={12} md={12} lg={8} xl={8} key={res?._id}>
                                  <ContestantCard {...res} status={props?.status} number_of_time_vote={props?.number_of_time_vote} />
                                </Col>
                              )
                            })
                          }
                        </Row>
                        :
                        <PlaceholderImage sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Winner Found'} />}
                    </>


                  </div>


                  {/* ************** Runner-up s ***************/}
                  <div>
                    <Row gutter={[24, 24]}>
                      <Col span={24}>
                        <div className=''>
                          <SectionTitle title='Runner-up s' className='mb-4' isNotTextTransform />
                        </div>
                      </Col>
                    </Row>

                    <>
                      {props?.runnerups?.length > 0 ?
                        <Row gutter={[24, 24]}>
                          {
                            Array.isArray(props?.runnerups) && props?.runnerups.map((res, index) => {
                              return (
                                <Col span={24} xs={24} sm={12} md={12} lg={8} xl={8} key={index}>
                                  <ContestantCard {...res} status={props?.status} isRunnerUp number_of_time_vote={props?.number_of_time_vote} />
                                </Col>)
                            })}
                        </Row>
                        :
                        <PlaceholderImage sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Runnerup Found'} />}
                    </>

                  </div>


                  {/* ************** Other Contestants - 7 ***************/}
                  <div>
                    <Row>
                      <Col span={24}>
                        <div className='mb-4'>
                          <SectionTitle title={`Other Contestants - ${props?.other_contestent?.length}`} className='mb-4' />
                        </div>
                      </Col>
                    </Row>

                    <div className='bg-light shadow-sm p-4 p-md-5 mb-5'>
                      <>
                        {props?.other_contestent?.length > 0 ?
                          <Row gutter={[24, 24]}>
                            {
                              Array.isArray(props?.other_contestent) && props?.other_contestent.map((res, index) => {
                                return (
                                  <Col span={24} xs={24} sm={12} md={12} lg={8} xl={8} key={index}>
                                    <ContestantCard {...res} isRunnerUp />
                                  </Col>)
                              })}
                          </Row>
                          :
                          <PlaceholderImage sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Contestent Found'} />}
                      </>
                    </div>

                  </div>
                  {/* ****************** Voter’s Reward ****************** */}
                  <div className='mb-4'>
                    <SectionTitle title='Voter’s Reward' className='fw-bold sub-title-font-size' />
                  </div>
                  <ContestantTable res={props?.voter_rewards} SecondtheadType="Contest Round" isVoterRewards />

                  {/* Shan's Vote Contest Feedback Page */}
                  <div className='my-4 mt-5'>
                    <SectionTitle title={`${props?.title}'s Vote Contest Feedback Page`} className='fw-bold sub-title-font-size' />
                  </div>

                  <ListItemComponent list={[
                    { title: "Title", description: props?.title },
                    { title: "Number of votes that can be casted:", description: props?.number_of_time_vote > 100 ? "As Much As They Can" : props?.number_of_time_vote },
                    { title: "Total Number Of Votes:", description: props?.total_votes },
                    // { title: "Reward for Voters:", description: "4.5 M" }
                  ]} />

                  {/* Prizes and Earners */}
                  <div className='mb-4 mt-4'>
                    <Typography.Title level={5} className='fw-bold primary-font-size'>Prizes and Earners</Typography.Title>
                    <div className='bg-primary rounded-4 p-4'>
                      <div className="row align-items-center g-3">
                        <div className='col-lg-2 text-center'>
                          <Typography.Title level={5} className='fw-bold text-black m-0'>{props?.finalists}</Typography.Title>
                          <Typography.Text className='fw-bold text-black'>Finalists</Typography.Text>
                        </div>
                        {screens.md &&
                          <div className='col-lg-2 text-center'>
                            <BorderRight />
                          </div>}
                        {
                          props?.winner_reward?.map((res, index) => {
                            return (
                              <div className='col-lg-2 text-center' key={index}>
                                <Typography.Title level={5} className='fw-bold text-black m-0'>${res?.prize || 0}</Typography.Title>
                                <Typography.Text className='fw-bold text-black'>{index === 0 ? "Winner" : rankingText[index]}</Typography.Text>
                              </div>
                            )
                          })
                        }
                        {/* <div className='col-lg-2 text-center'>
                          <Typography.Title level={5} className='fw-bold text-black m-0'>$100 </Typography.Title>
                          <Typography.Text className='fw-bold text-black'>All others</Typography.Text>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  {/* <div className="row">
                    <div className="col-md-6 col-lg-4 col-xl-4">
                      <div className='bg-light rounded-4 p-4'>
                        <div className="row align-items-center justify-content-between">
                          <div className='col-lg-5 text-center'>
                            <Typography.Title level={5} className='fw-bold text-black m-0'>20</Typography.Title>
                            <Typography.Text className='fw-bold text-black'>Voters</Typography.Text>
                          </div>
                          <div className='col-lg-2 text-center'>
                            <BorderRight />
                          </div>
                          <div className='col-lg-5 text-center'>
                            <Typography.Title level={5} className='fw-bold text-black m-0'>$10</Typography.Title>
                            <Typography.Text className='fw-bold text-black'>Gift Cars Each</Typography.Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {props?.voting_type != 'Others' && <ReviewComponents data={props} hasSeeMore hasTitle hasLoadMore />}
                </>
              }

              {/* <ul className='list-unstyled'>
                <li className='d-flex gap-2 align-items-center'>
                  <Typography.Paragraph className='fw-semibold text-black my-2 m-0'>Current Round:</Typography.Paragraph>
                  <Typography.Paragraph className='fw-semibold text-black my-2 m-0 text-uppercase'>{props?.round_name}</Typography.Paragraph>
                </li>
                {props?.round_status ?
                  <li className='d-flex gap-2 align-items-center'>
                    <Typography.Paragraph className='fw-semibold text-black my-2 m-0'>Round Status:</Typography.Paragraph>
                    <Tag color='warning'>{props?.round_status}</Tag>
                  </li> : ""}
              </ul> */}


            </WrapperElement>


            {/* ****************** UPCOMING & ONGOING ****************** */}
            {((props?.status == ContestStatus.UPCOMING) || props?.status == ContestStatus.ONGOING) && <>
              <Divider className='border border-secondary' />
              <WrapperElement className='mb-3'>
                <Row>
                  <Col span={24}>
                    <div>
                      <ul className='list-unstyled d-flex gap-2 flex-column m-0'>
                        <li className='d-flex justify-content-between flex-column flex-md-row gap-2'>
                          <Typography.Paragraph className='fw-semibold text-black m-0 '>Number of Finalists</Typography.Paragraph>
                          <Typography.Paragraph className='fw-normal text-black'>{props?.total_finalist || 0}</Typography.Paragraph>
                        </li>
                        <li className='d-flex justify-content-between flex-column flex-md-row gap-2'>
                          <Typography.Paragraph className='fw-semibold text-black m-0 '>Reward for Voters:</Typography.Paragraph>
                          <Typography.Paragraph className='fw-normal text-black'>{props?.is_voter_prize ? "Yes" : "No"}</Typography.Paragraph>
                        </li>
                        <li className='d-flex justify-content-between flex-column flex-md-row gap-2'>
                          <Typography.Paragraph className='fw-semibold text-black m-0'>Number of votes that can be casted:</Typography.Paragraph>
                          <Typography.Paragraph className='fw-normal text-black'>{props?.number_of_time_vote > 100 ? "As Much As They Can" : props?.number_of_time_vote}</Typography.Paragraph>
                        </li>
                        {props?.is_voter_prize &&
                          <li className='d-flex justify-content-between flex-column flex-md-row gap-2'>
                            <Typography.Paragraph className='fw-semibold text-black m-0 '>Number of Voters to be Picked</Typography.Paragraph>
                            <Typography.Paragraph className='fw-normal text-black'>{props?.total_voters || 0}</Typography.Paragraph>
                          </li>}
                        <li className='d-flex justify-content-between flex-column flex-md-row gap-2'>
                          <Typography.Paragraph className='fw-semibold text-black m-0 '>Contest Link:</Typography.Paragraph>
                          <Typography.Paragraph className='fw-normal text-black'>{<Link href={props?.contest_link}>{props?.contest_link || "N/A"}</Link>}</Typography.Paragraph>
                        </li>
                      </ul>
                      {(props?.is_creator && !props?.is_voter_prize && props?.status === ContestStatus.UPCOMING) &&
                        <div className='text-start text-md-end mb-3'>
                          <Link href={`/contest/${props?._id}/add-randomizer`}><Button size='small' type='primary' htmlType='button' shape='round'>Add Randomizer</Button></Link>
                        </div>}
                      <div>
                        {props?.add_info && <>
                          <Typography.Paragraph className='fw-semibold text-black m-0  mb-2'>Additional Information:</Typography.Paragraph>
                          <Typography.Paragraph className='fw-normal text-black'>{props?.add_info}</Typography.Paragraph>
                        </>}
                      </div>
                    </div>
                  </Col>
                </Row>
              </WrapperElement>



              <WrapperElement>
                <Row>
                  <Col span={24}>
                    <div className='mb-4'>
                      <SectionTitle title='Contestants' />
                    </div>
                  </Col>
                </Row>
                <Row gutter={[24, 24]}>
                  {
                    (props?.contestent?.length ? props?.contestent : props?.voting_on_other_not_contestents)?.map((res) => {
                      let total_voted = props?.total_voted;
                      let number_of_time_vote = props?.number_of_time_vote;
                      let voted_contestent_id = props?.voted_contestent_id
                      console.log(voted_contestent_id, "voted_id")
                      let disabled: boolean = false;
                      let showText: boolean = false;
                      if (voted_contestent_id === res?._id) {
                        showText = true
                      }

                      console.log(number_of_time_vote);
                      if (voted_contestent_id === null && props?.round_status == "ONGOING") {
                        disabled = false
                      } else {
                        if (props?.round_status != "ONGOING") {
                          disabled = true;

                        }
                        if ((total_voted < number_of_time_vote) && (res?._id !== voted_contestent_id) && total_voted > 0) {
                          disabled = true;

                        }

                        if ((total_voted < number_of_time_vote) && (res?._id === voted_contestent_id) && total_voted > 0) {
                          disabled = false;

                        }
                        // if ((total_voted < number_of_time_vote) && (res?._id != voted_contestent_id)) {
                        //   disabled = true;

                        // }
                        else {
                          if (total_voted >= number_of_time_vote) {
                            disabled = true
                          } else {
                            if (total_voted > 0 && (res?._id === voted_contestent_id)) {
                              disabled = false;
                            }
                          }

                        }
                      }

                      const currentVotes = voteCounts.find(vote => vote.id === res?._id)?.total_votes;
                      return (
                        <Col span={24} xs={24} sm={12} md={12} lg={8} xl={8} key={res?._id}>
                          <ContestantCard
                            status={props?.status}
                            is_contestent_pic_reveal={props?.is_contestent_pic_reveal}
                            disabled={disabled}
                            {...res}
                            total_votes={currentVotes}
                            setId={setId}
                            getKey={getKey}
                            showModal={showModal}
                            showText={showText}
                            isVoting
                            contest_id={router?.query?._id}
                            round_id={props?.round_id}
                            vote_type={props?.vote_type}
                            updateVoteCount={updateVoteCount}
                            voted_contestent_id={voted_contestent_id}
                            number_of_time_vote={props?.number_of_time_vote}
                          />
                          {/* {res?._id}
                          <br />
                          {props?.voted_contestent_id} */}
                        </Col>
                      )
                    })
                  }
                </Row>

                {/* Payment Modal */}
                <CommonModal isMaskable={false} title="Payment" isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel}>
                  {/* <Spin spinning={true}> */}
                  <Row gutter={[{ xs: 12, sm: 12, md: 24 }, { xs: 24, sm: 24, md: 24 }]}>
                    <Col span={24} md={12} lg={12}>
                      <WrapperElement>
                        <Typography.Title className='fw-semibold primary-font-size mb-3'>Choose Payment Method</Typography.Title>
                        <Radio.Group className='mb-4 mb-md-5'>
                          <Radio className='text-black'>Mastercard</Radio>
                          {/* <Radio className='text-black'>Paypal</Radio> */}
                        </Radio.Group>
                        <PaymentCard />

                        <div className="card-payment-notes mt-3">
                          <h6 className='mb-2'>Note:</h6>
                          <ul className='p-0 mb-0 d-flex gap-1 flex-column'>
                            <li>
                              Card Number: Typically a 16-digit number located on the front of the card.
                            </li>
                            <li>CVC Number (Card Verification Code): A 3-digit (Visa, MasterCard, Discover) or 4-digit (American Express) security code located on the back (or front for Amex) of the card.</li>
                            <li>Expiry Date: The month and year of expiration, usually found on the front of the card (e.g., "MM/YY").</li>
                          </ul>
                        </div>
                      </WrapperElement>
                    </Col>
                    <Col span={24} md={12} lg={12}>
                      <WrapperElement>
                        <Flex justify='space-between' align='center'>
                          <Typography.Title className='fw-semibold primary-font-size m-0'>Total to Pay for Vote:</Typography.Title>
                          <Typography.Title className='fw-semibold primary-font-size m-0'>{props?.cost_per_vote}</Typography.Title>
                        </Flex>
                        <Divider className='border-black my-3' />
                        <StripeElement cost_per_vote={props?.cost_per_vote} contest_id={props._id} showModalSuccess={showModalSuccess} closeAllModal={closeAllModal} />
                      </WrapperElement>
                    </Col>
                  </Row>
                  {/* </Spin> */}
                </CommonModal>

                {/* Payment Success Modal */}
                <CommonModal title="Congratulations!" isModalOpen={isModalOpenSuccess} handleOk={handleOkSuccess} handleCancel={handleCancelSuccess}>
                  <Typography.Title className='fw-semibold primary-font-size m-0 my-4 mb-5 text-center'>Your Vote is successfully casted</Typography.Title>
                  <Flex gap={12} justify='center'>
                    <Button size='small' onClick={handleCancelSuccess} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button>
                    <Button size='small' className='rounded-pill px-4' onClick={handleCancelSuccess} type='primary'>Got it</Button>
                  </Flex>
                </CommonModal>
              </WrapperElement>



              {props?.status === ContestStatus.ONGOING && <>
                <WrapperElement className='mt-4'>
                  <div className='mb-4 mb-md-5'>
                    <SectionTitle title={`The See - ${props?.title} Contest`} />
                  </div>


                  {/* Evicted Contestants */}
                  <div className='mb-4'>
                    <SectionTitle title='Evicted Contestants' className='fw-semibold px-3' />
                  </div>
                  <ContestantTable res={props?.evicted_contestent} SecondtheadType="Votes Gained" />
                </WrapperElement>




                {/* Round 1 - (4) */}
                <WrapperElement className='my-4 my-md-5 pt-4 pt-md-5'>
                  <div className='d-flex flex-column gap-5'>
                    {
                      Array.isArray(props?.rounds) && props?.rounds?.map((res) => {
                        return (
                          <div key={res?._id}>
                            <div className='mb-3' >
                              <SectionTitle
                                title={`Round ${res?.round}  - (${props?.rounds?.length})`}
                                className='fw-semibold px-md-3 sub-title-font-size' />
                            </div>
                            <ContestantTable res={res?.contestents} SecondtheadType={'Votes Gained'} />
                          </div>
                        )
                      })

                    }
                  </div>
                </WrapperElement>

              </>}

              {props?.additional_info && <WrapperElement className='mt-md-5 mt-4'>
                <div className='mb-3'>
                  <SectionTitle title='Description' className='fw-bold' />
                </div>
                <Typography.Paragraph className='text-black primary-font-size'>{props?.additional_info} </Typography.Paragraph>
              </WrapperElement>}


              {/* Contest Comments */}
              {/* <Divider className='border border-black' /> */}
              {/* <CommentComponent contest_id={props?._id as string} setCommentCount={setCommentCount} /> */}
            </>}
          </div>

        </section>}




      {((props?.is_contestent || props?.is_reward_voter) && (!props?.is_creator)) &&
        <section>
          <div className="container">
            <Row>
              <Col span={24}>
                <WrapperElement><div className='my-4 mt-5'>
                  <SectionTitle title={`Creator Details:`} className='fw-bold sub-title-font-size' />
                </div>

                  <ListItemComponent list={[
                    { title: "Name", description: props?.full_name },
                    { title: "Email", description: props?.email },
                    { title: "Phone", description: props?.country_code + props?.phone_number },
                    { title: "Country", description: props?.country },
                    { title: "Address:", description: props?.full_address },
                    { title: "Postal Code:", description: props?.postal_code },
                    // { title: "Reward for Voters:", description: "4.5 M" }
                  ]} /></WrapperElement>
              </Col>
            </Row>
          </div>
        </section>}

      {/* ****************************************** Comments ****************************************** */}
      <section className='pb-5'>
        <div className="container">
          <Row>
            <Col span={24}>
              <CommentComponent contest_id={router.query._id as string} setCommentCount={setCommentCount} />
            </Col>
          </Row>
        </div>
      </section>
    </Fragment >
  )
}



export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const _id = context.query._id as string;
    console.log(_id, typeof _id);

    // *********************** Get Contest BY Id API Call ***********************
    const apiRes = await henceforthApi.Contest.details(_id);
    const contestDetail = apiRes?.data;
    console.log(apiRes, "Detail_");
    return { props: contestDetail };
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


ViewContest.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default ViewContest