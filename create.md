

import SectionTitle from '@/components/common/SectionTitle';
import WrapperElement from '@/components/common/WrapperElement';
import { Col, Form, Input, Row, Image, Upload, UploadFile, Typography, Select, Flex, Checkbox, Grid, Radio, Button, Space, DatePicker, TimePicker, Modal, Divider, InputNumber, } from 'antd';
import React, { Fragment, ReactNode, useContext, useState } from 'react'
import type { GetProp, UploadProps } from 'antd';
import UploadButtonIcon from '@/components/UploadButtonIcon';
import UploadIcon from '@/components/Icons/UploadIcon';
import CommonModal from '@/components/common/CommonModal';
import Link from 'next/link';
import TrashFilled from '@/components/Icons/TrashFilled';
import dayjs from "dayjs";
import henceforthApi from '@/utils/henceforthApi';
import { GlobalContext } from '@/context/Provider';
import { useBeforeUnSaved } from '@/utils/CommonFunctions';
import { AfterFillingFields, FormFillingType, VoteType } from '@/utils/henceforthEnums';
import { useRouter } from 'next/router';
import RootLayout from '@/layouts/RootLayout';
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

// const getBase64 = (file: FileType): Promise<string> =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = (error) => reject(error);
//   });


const CreateContest = () => {
  const router = useRouter()
  const screens = Grid.useBreakpoint();
  const [state, setState] = useState({ round: 1 }) as any;
  const [formLoading, setFormLoading] = useState(false)
  const [openInviteModal, setOpenInviteModal] = useState(false)
  const [openInviteSuccessModal, setOpenInviteSuccessModal] = useState(false)
  const { Toast } = useContext(GlobalContext)
  const [routerWarning, setRouterWarning] = useState(false)
  <!-- useBeforeUnSaved(!routerWarning, `/contest/create`) -->
  const locationSearchRef = React.useRef(null as any)
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();





  // ************************ Google Address Picker ************************
  function loadGoogleMapScript(callback: any) {
    if (
      typeof (window as any).google === "object" &&
      typeof (window as any).google.maps === "object"
    ) {
      callback();
    } else {
      const googleMapScript = document.createElement("script");
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD4MHXWLSqsVoZ7kIF3Bq1pVKMlUTO4HOU&libraries=places`;
      window.document.body.appendChild(googleMapScript);
      googleMapScript.addEventListener("load", callback);
    }
  }
  const runTry = (cb: any) => {
    loadGoogleMapScript(() => {
      cb()
    })
  }
  const initPlaceAPI = () => {
    if (locationSearchRef?.current) {
      let autocomplete = new (window as any).google.maps.places.Autocomplete(locationSearchRef?.current?.input);
      autocomplete.addListener('place_changed', async () => {
        let place = autocomplete.getPlace();
        if (!place.geometry) {
          Toast.error('Please enter a valid location')
          return
        }
        const address = place?.address_components
        // const coordinate = place?.geometry?.location

        let items: any = {}
        if (Array.isArray(address) && address?.length > 0) {
          let zipIndex = address.findIndex(res => res.types.includes("postal_code"))
          let administrativeAreaIndex = address?.findIndex(res => res?.types.includes("administrative_area_level_1", "political"))
          let localityIndex = address?.findIndex(res => res?.types?.includes("locality", "political"))
          let countryIndex = address?.findIndex(res => res?.types?.includes("country", "political"))

          if (zipIndex > -1) {
            items.postal_code = address[zipIndex]?.long_name
          }
          if (administrativeAreaIndex > -1) {
            items.state = address[administrativeAreaIndex]?.long_name
          }
          if (localityIndex > -1) {
            items.city = address[localityIndex]?.long_name
          }
          if (countryIndex > -1) {
            items.country = address[countryIndex]?.long_name
          }

          form.setFieldValue('address', place.formatted_address)
          form.setFieldValue('country', items?.country)
          form.setFieldValue('state', items?.state)
          form.setFieldValue('city', items?.city)
          form.setFieldValue('postal_code', items?.postal_code)
          // form.setFieldValue('lat', coordinate?.lat())
          // form.setFieldValue('lng', coordinate?.lng())
        }
      }
      );
    }
  }




  React.useEffect(() => {
    runTry(() => {
      setTimeout(() => {
        initPlaceAPI()
      }, 0)
    })
  }, [])




  // ************************ Invite Users Emails ************************
  const [userEmailsInvite, setUserEmailsInvite] = useState({
    invite_info: '',
    invite_from: '',
    contestent: [{ contestent_email: '' }]
  }) as any;


  const InviteUser = async (values: any) => {
    let arr = {
      contestent: [] as { contestent_email: string }[]
    };

    for (let index = 0; index < values?.all_contestent_email?.length; index++) {
      let obj = {
        contestent_email: values?.all_contestent_email[index]
      };
      arr.contestent.push(obj);
    }

    setUserEmailsInvite({
      invite_info: values?.invite_info,
      invite_from: values?.invite_from,
      contestent: arr.contestent
    });

    inviteForm.resetFields();
    showInviteSuccessModal();
  };
  // ************************ Create Contest API Call ************************

  const onFinish = async (values: any) => {
    // debugger;
    let payLoad = {
      title: values?.title,
      contest_be_watched: values?.contest_be_watched,
      contest_link: values?.contest_link,
      vote_type: values?.vote_type,
      cost_per_vote: values?.cost_per_vot ? Number(values?.cost_per_vote) : null,
      number_of_time_vote: Number(values?.number_of_time_vote),
      total_contestent: Number(values?.total_contestent),
      is_contestent_pic_reveal: values?.is_contestent_pic_reveal,
      filling_any_info: values?.filling_any_info,
      contestent: values?.contestent,
      // "total_winners": "string",
      after_filling_fields: values?.after_filling_fields || null,
      is_winner_prize: values?.is_winner_prize,
      winner_reward_type: values?.winner_reward_type,
      winner_reward: values?.winner_reward,
      full_name: values?.full_name,
      email: values?.email,
      phone_number: Number(values?.phone_number),
      country: values?.country,
      state: values?.state,
      city: values?.city,
      postal_code: values?.postal_code,
      is_voter_prize: values?.is_voter_prize,
      voter_reward: values?.voter_reward ? values?.voter_reward : null,
      add_info: values?.add_info
    }


    // Cover Media File
    const cover_media_file = values?.cover_media?.fileList[0]?.originFileObj;
    console.log(cover_media_file, "cover_media_file");
    // console.log(cover_media_file.File,"cover_media_file");

    if (cover_media_file) {
      let uploadCoverMediaImageApiRes = await henceforthApi.Common.uploadFile('file', cover_media_file);
      console.log("uploadCoverMediaImageApiRes?.data.file_name", uploadCoverMediaImageApiRes?.data.file_name);
      payLoad['cover_media'] = uploadCoverMediaImageApiRes?.data.file_name;
      payLoad['cover_media_type'] = uploadCoverMediaImageApiRes?.data.type;
    }



    // Contest Act Image
    const contest_act = values?.contest_act?.fileList[0]?.originFileObj;
    console.log(contest_act, "contest_act");

    if (contest_act) {
      let uploadContestActApiRes = await henceforthApi.Common.uploadFile('file', contest_act);
      console.log("uploadContestActApiRes?.data.file_name", uploadContestActApiRes?.data.file_name);
      payLoad['contest_act'] = uploadContestActApiRes?.data.file_name
    }



    let arr: any = []
    for (let index = 0; index < values?.next_round_contestent?.length; index++) {
      let next_round_contestent = values?.next_round_contestent[index]
      let name = values?.name[index]
      let start_date = values?.start_date[index]
      let start_time = values?.start_time[index]
      let end_date = values?.end_date[index]
      let end_time = values?.end_time[index]
      arr.push({
        next_round_contestent: Number(next_round_contestent),
        name,
        round: Number(values?.next_round_contestent?.length),
        start_date: dayjs(start_date).valueOf(),
        start_time: dayjs(start_time).valueOf(),
        end_date: dayjs(end_date).valueOf(),
        end_time: dayjs(end_time).valueOf(),
      })
    }


    if (arr?.length) {
      payLoad['rounds'] = arr;
    }


    let contestentArray = [] as any;
    for (let a = 0; a < values?.contestent?.length; a++) {
      console.log(a);


      let socialMediaArray = values?.contestent[a]?.social_media?.map((media: any) => ({
        handle: media?.handle,
        link: media?.link
      }));



      let contestentObj = {
        is_creator_filling: values?.contestent[a].is_creator_filling,
        contestent_email: values?.contestent[a].contestent_email,
        contestent_name: values?.contestent[a].contestent_name,
        age: values?.contestent[a].age,
        location: values?.contestent[a].location,
        about: values?.contestent[a].about,
        material: "string",
        profile_pic: "string",
        video_intro: "string",
        contest_act: "string",
        social_media: socialMediaArray,
        contest_be_watched: values?.contestent[a].contest_be_watched,
        contest_link: values?.contestent[a].contest_link,
      }

      contestentArray.push(contestentObj)

    }

    // console.log(contestentArray);


    if (values?.filling_any_info === FormFillingType.SOME) {
      payLoad['contestent'] = contestentArray;
    }

    if (values?.filling_any_info !== FormFillingType.SOME) {
      payLoad['contestent'] = userEmailsInvite?.contestent;
      payLoad['invite_info'] = userEmailsInvite?.invite_info;
    }

    console.log(userEmailsInvite, "userEmailsInvite?.contestent");
    // console.log(userEmailsInvite?.invite_info,"userEmailsInvite?.invite_info");



    console.log(payLoad, "payLoad__________");



    try {
      setFormLoading(true);
      const apiRes = await henceforthApi.Contest.create(payLoad);
      console.log(apiRes);
      Toast.success(apiRes.message)

      router.replace({
        pathname: `/contest/${apiRes?.data?._id}/details`, query: {
          status: apiRes?.data?.status
        }
      })

    } catch (error) {
      Toast.error(error)
      setFormLoading(false);
    }

  }


  // ************************ Open Invite Modal ************************
  const showInviteModal = () => {
    setOpenInviteModal(true)
  }
  const cancelInviteModal = () => {
    setOpenInviteModal(false)
  }

  // ************************ Open Invite Success Modal ************************
  const showInviteSuccessModal = () => {
    setOpenInviteSuccessModal(true)
    setOpenInviteModal(false)
  }
  const cancelInviteSuccessModal = () => {
    setOpenInviteSuccessModal(false)
  }


  // ************************ Render Round Name Inputs ************************
  let numberOfInputs = state.round;

  const renderRoundNameInputs = () => {
    const input = [] as any;
    for (let i = 0; i < numberOfInputs; i++) {
      input.push(
        <Col span={24} md={12} lg={8} xl={6} key={i}>
          <Form.Item name={["name", i]} rules={[{ required: true, message: `Please enter the round ${i + 1} name` }]}>
            <Input type='text' size='large' className='bg-transparent ps-0' placeholder={`Enter round ${i + 1} name`} />
          </Form.Item>
        </Col>
      );
    }
    return input;
  };

  // ************************ Render Contestant Number Inputs ************************
  const renderContestantNumberInputs = () => {
    const input = [] as any;
    for (let i = 0; i < numberOfInputs; i++) {
      input.push(
        <Col span={24} md={12} lg={8} xl={6} key={i}>
          <Form.Item name={["next_round_contestent", i]} rules={[{ required: true, message: `Please enter the contestants for round ${i + 1}` }]}>
            <Input type='text' size='large' onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }} className='bg-transparent ps-0' placeholder={`Enter contestant for round ${i + 1}`} />
          </Form.Item>
        </Col>
      )
    }
    return input;
  }

  // ************************ Time and Date Inputs for Round ************************

  const renderTimeDateForRound = () => {
    let input = [] as any;

    for (let i = 0; i < numberOfInputs; i++) {
      input.push(
        <Col span={24} sm={12} md={12} lg={12} xl={11} xxl={11} key={i}>
          <label className='fw-bold text-black primary-font-size mb-3'>Round {i + 1}</label>
          <Row gutter={[24, 12]}>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item className='w-100' name={["start_date", i]} rules={[{ required: true, message: `Please enter the start date for round ${i + 1}` }]}>
                <DatePicker disabledDate={(current) => current.isBefore(dayjs().subtract(1, "day"))} type='text' size='large' className='bg-transparent ps-0 w-100' placeholder='Start Date' />
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item className='w-100' name={["start_time", i]} rules={[{ required: true, message: `Please enter the start time for round ${i + 1}` }]}>
                <TimePicker type='text' size='large' className='bg-transparent ps-0 w-100' placeholder='Start Time' />
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item className='w-100' name={["end_date", i]} rules={[{ required: true, message: `Please enter the end date for round ${i + 1}` }]}>
                <DatePicker disabledDate={(current) => current.isBefore(dayjs().subtract(1, "day"))} type='text' size='large' className='bg-transparent ps-0 w-100' placeholder='End Date' />
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item className='w-100' name={["end_time", i]} rules={[{ required: true, message: `Please enter the end time for round ${i + 1}` }]}>
                <TimePicker type='text' size='large' className='bg-transparent ps-0 w-100' placeholder='End Time' />
              </Form.Item>
            </Col>
          </Row>
        </Col>

      )
    }
    return input;
  }

  // ************************ Set Fields Values ************************
  React.useEffect(() => {
    form.setFieldValue('filling_any_info', FormFillingType.SOME);
    form.setFieldsValue({
      contestent: Array.from({ length: 1 }, () => ({
        is_creator_filling: true,
      })),
    });
    form.setFieldsValue({
      contestent: Array.from({ length: 1 }, () => ({
        after_filling_fields: AfterFillingFields.REVIEW,
      })),
    });
    form.setFieldValue('after_filling_fields', AfterFillingFields.REVIEW);
    form.setFieldValue('is_contestent_pic_reveal', true);
    form.setFieldValue('vote_type', VoteType.FREE);
    form.setFieldValue('is_winner_prize', true);
    form.setFieldValue('is_voter_prize', true);
    inviteForm.setFieldValue('invite_from', 'Email');

  }, [])



  // ************************ After Filling Fields ************************
  const participant = <> <Form.Item name="after_filling_fields" label={<label className='fw-bold text-black primary-font-size mb-2'>What Should participants do after filling the fields?</label>}>
    <Radio.Group className='mb-2'>
      <Radio value={AfterFillingFields.REVIEW} className='text-black'>Send To Me For Review and Submission</Radio>
      <Radio value={AfterFillingFields.SUBMIT} className='text-black'>Participant Can Submit Directly</Radio>
    </Radio.Group >
  </Form.Item>
    <Button size='small' htmlType='button' type="default" onClick={showInviteModal} className='text-black fw-normal text-black mb-4' shape='round'>Invite Your Participants To Fill The Fields</Button>
  </>


  // const [previewOpen, setPreviewOpen] = useState(false);
  // const [previewImage, setPreviewImage] = useState('');
  // const [fileList, setFileList] = useState<UploadFile[]>([
  //   {
  //     uid: '-1',
  //     name: 'image.png',
  //     status: 'done',
  //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  //   }
  // ]);

  // const handlePreview = async (file: UploadFile) => {
  //   if (!file.url && !file.preview) {
  //     file.preview = await getBase64(file.originFileObj as FileType);
  //   }

  //   setPreviewImage(file.url || (file.preview as string));
  //   setPreviewOpen(true);
  // };

  // const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
  //   setFileList(newFileList);



  return (
    <>
      <section className='py-md-5 py-4'>
        <div className="container">
          <Row>
            <Col span={24}>
              <WrapperElement>
                <SectionTitle title='Create Voting For Your Contest' className='mb-4' />

                <Form className='light_theme_form' form={form} layout='vertical' onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
                  {/* Contest Title */}
                  <Form.Item name="title" rules={[{ required: true, message: 'Please enter the contest title!' }]}>
                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Title of Your Contest' />
                  </Form.Item>

                  {/* Cover Media */}
                  <div className='mb-3'>
                    <Form.Item shouldUpdate={(prev: any, curr: any) => prev.cover_media !== curr.cover_media} className='m-0'>
                      {
                        ({ getFieldValue }) => {
                          let x = getFieldValue('cover_media')?.fileList;
                          return (
                            <Form.Item name="cover_media" className='m-0' rules={[{ required: true, message: 'Please upload cover media!' }]}>
                              <Upload
                                customRequest={({ onSuccess }: any) =>
                                  onSuccess("ok")
                                }
                                showUploadList={{
                                  showPreviewIcon: false
                                }}
                                listType="picture-card"
                              >
                                {x?.length ? null : <UploadButtonIcon />}
                              </Upload>
                            </Form.Item>
                          )
                        }
                      }
                    </Form.Item>
                    <Typography.Paragraph className='mt-2 m-0'>Upload your contest cover media</Typography.Paragraph>
                  </div>

                  {/* Contest Act */}
                  <div>
                    <Form.Item shouldUpdate={(prev: any, curr: any) => prev.contest_act !== curr.contest_act} className='m-0'>
                      {
                        ({ getFieldValue }) => {
                          let x = getFieldValue('contest_act')?.fileList;
                          return (
                            <Form.Item name="contest_act" className='m-0' label={<label className='fw-semibold text-black primary-font-size'>Upload Your Contest Acts/Performance/Creation/Display/Others [Optional]</label>
                            }>
                              <Upload
                                customRequest={({ onSuccess }: any) =>
                                  onSuccess("ok")
                                }
                                showUploadList={{
                                  showPreviewIcon: false
                                }}
                                listType="picture-card"
                              >
                                {/* <UploadButtonIcon /> */}
                                {x?.length ? null : <UploadButtonIcon />}
                              </Upload>
                            </Form.Item>)
                        }}
                    </Form.Item>
                    <Typography.Paragraph className='mt-2 m-0'> This field is optional as long as your audience knows where to find and watch/view your contest material</Typography.Paragraph>
                  </div>

                  {/* Contest Be Watched */}
                  <Form.Item name="contest_be_watched" rules={[{ required: true, message: 'Please select option for contest be watched!' }]}>
                    <Select size='large' className='bg-transparent ps-0' placeholder='Where can your contest be watched/Viewed?   i.e., YouTube, Tiktok, url link, etc'>
                      <Select.Option value="YouTube">YouTube</Select.Option>
                      <Select.Option value="Tiktok">Tiktok</Select.Option>
                      <Select.Option value="URL Link">URL Link</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Contest Link */}
                  <Form.Item name="contest_link" rules={[{ required: true, message: 'Please enter contest link!' }]}>
                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste Link here...' />
                  </Form.Item>

                  {/* Vote Type */}
                  <div className='mt-3'>
                    <SectionTitle title='Vote Type' className='mb-2 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="vote_type" shouldUpdate={(prev: any, curr: any) => prev.vote_type !== curr.vote_type}>
                    <Radio.Group>
                      <Radio value={VoteType.FREE} className='text-black'>Free</Radio>
                      <Radio value={VoteType.PAID} className='text-black'>Paid</Radio>
                    </Radio.Group>
                  </Form.Item>

                  {/* Cost Per Vote */}
                  <Form.Item className='m-0' shouldUpdate={(prev: any, curr: any) => prev.vote_type !== curr.vote_type}>
                    {({ getFieldValue }) => {
                      let val = getFieldValue('vote_type');
                      // console.log(val, 'val');
                      return (
                        <Fragment>
                          {val === VoteType.PAID &&
                            <Fragment>
                              <div>
                                <SectionTitle title='Cost Per Vote' className='mb-2 sub-title-font-size fw-bold' />
                              </div>
                              <Form.Item name="cost_per_vote" rules={[{ required: true, message: 'Please enter cost per vote!' }]}>
                                <Row>
                                  <Col span={24} md={16} lg={12} xl={10} xxl={8}>
                                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Specify amount here' onKeyPress={(e) => {
                                      if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    }} />
                                  </Col>
                                </Row>
                              </Form.Item>
                            </Fragment>
                          }
                        </Fragment>)
                    }
                    }
                  </Form.Item>


                  {/* Number Of Time Vote */}
                  {/* md={16} lg={12} xl={10} xxl={8} */}
                  <Row>
                    <Col span={24}>
                      <label className='fw-semibold text-black primary-font-size'>Number of times a person can vote for their favorite contestants/Participants/Act/Creativity</label>
                      <Form.Item className='w-100' name="number_of_time_vote" rules={[{ required: true, message: 'Please select an option!' }]}>
                        <Select size='large' className='bg-transparent ps-0' placeholder='Please select!!!'>
                          <Select.Option value="0">As Much As They Can</Select.Option>
                          <Select.Option value="1">1</Select.Option>
                          <Select.Option value="2">2</Select.Option>
                          <Select.Option value="3">3</Select.Option>
                          <Select.Option value="4">4</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* No of Rounds */}
                  <div className='mt-3'>
                    <SectionTitle title='Specify Vote Time Period' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item label={<label className='fw-semibold text-black primary-font-size'>Please state how many number of round in all</label>} rules={[{ required: true, message: 'Please select rounds!' }]}>
                    <Select size='large' className='bg-transparent ps-0' placeholder='Please select rounds!!!' onChange={(value) => setState({
                      ...state, round: value
                    })}>
                      <Select.Option value="1">1</Select.Option>
                      <Select.Option value="2">2</Select.Option>
                      <Select.Option value="3">3</Select.Option>
                      <Select.Option value="4">4</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Number of rounds Name */}
                  <label className='fw-semibold text-black primary-font-size'>Name Your Round</label>
                  <Row gutter={[24, 12]}>
                    {renderRoundNameInputs()}
                  </Row>

                  {/* Number of contestant */}
                  <label className='fw-semibold text-black primary-font-size'>Specify how many contestants are needed to pass to the next round</label>
                  <Row gutter={[24, 12]}>
                    {renderContestantNumberInputs()}
                  </Row>


                  {/* Voting time period */}
                  <label className='fw-bold text-black primary-font-size mb-3'>Voting time period</label>
                  <Row gutter={[24, 24]} justify={'space-between'}>
                    {renderTimeDateForRound()}
                  </Row>

                  {/* Total Number Of Contestants */}
                  <div className='mt-3'>
                    <SectionTitle title='Contestant Details' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="total_contestent" label={<label className='fw-bold text-black primary-font-size mb-3'>Specify Total Number Of Contestants</label>} rules={[{ required: true, message: 'Please enter the number of contestant!' }]}>
                    <Input type='text' size='large' onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }} className='bg-transparent ps-0' placeholder='Please enter number of contestant' />
                  </Form.Item>

                  {/* Is Contestent Pic Reveal */}
                  <label className='fw-bold text-black primary-font-size mb-2'>Reveal My Contestants Pics During Voting Period</label>
                  <Typography.Paragraph italic className='text-black m-0 mb-3'>Please note that we will reveal their pics and names after the voting has ended. So you will be required to still provide their pics in the column below even if you select 'No</Typography.Paragraph>
                  <Form.Item name="is_contestent_pic_reveal">
                    <Radio.Group className='mb-3'>
                      <Radio value={true} className='text-black'>Yes</Radio>
                      <Radio value={false} className='text-black'>No</Radio>
                    </Radio.Group>
                  </Form.Item>

                  {/* Add Contestants */}
                  <div className='mt-3'>
                    <SectionTitle title='Add Contestants' className='mb-4 sub-title-font-size fw-bold' />
                  </div>

                  {/* Filling Any Info */}
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev.filling_any_info !== curr.filling_any_info} className='m-0'>
                    {() => {
                      return <Form.Item name="filling_any_info" label={<label className='fw-bold text-black primary-font-size mb-2'>Are you Filling Any?</label>} >
                        <Radio.Group>
                          <Radio value={FormFillingType.SOME} className='text-black'>Some</Radio>
                          <Radio value={FormFillingType.NONE} className='text-black'>None</Radio>
                        </Radio.Group >
                      </Form.Item>
                    }}
                  </Form.Item>


                  {/* Who Should Fill the Forms: Radio */}
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev.filling_any_info !== curr.filling_any_info}>
                    {({ getFieldValue }) => {
                      let val = getFieldValue('filling_any_info');
                      // console.log(val, 'val');

                      return (
                        <>
                          {val === FormFillingType.NONE &&
                            <>
                              {participant}
                            </>
                          }

                          {val === FormFillingType.SOME &&
                            <>
                              {/* Some: Who Should Fill the Forms: Participants & Me */}
                              <div className='mb-4'>
                                <Form.Item shouldUpdate={(prev, curr) => prev.contestent !== curr.contestent}>
                                  {({ getFieldValue }) => {
                                    const contestants = getFieldValue('contestent') || [];
                                    // console.log(contestants, "contestants");

                                    return (
                                      <>
                                        <Form.List name="contestent" initialValue={Array.from({ length: 1 }, () => ({}))}>
                                          {(fields, { add, remove }) => (
                                            <>
                                              {fields.map((field, index) => {
                                                const isCreatorFilling = getFieldValue(['contestent', field.name, 'is_creator_filling']);
                                                return (
                                                  <div key={field.key}>
                                                    <Flex className='my-3' justify='space-between' align='center'>
                                                      <label className='fw-bold text-black sub-title-font-size'>Contestants {field.key + 1}</label>
                                                      {index > 0 &&
                                                        <Button icon={<TrashFilled />} danger onClick={() => remove(field.name)} size='small' htmlType='button' type="primary" className='text-white fw-normal' shape='default'></Button>
                                                      }
                                                    </Flex>

                                                    <Form.Item name={[field.name, 'is_creator_filling']} label={<label className='fw-bold text-black primary-font-size mb-2'>Who Should Fill the Forms</label>} rules={[{ required: true, message: 'Please select an option!' }]}>
                                                      <Radio.Group>
                                                        <Radio value={true} className='text-black'>Me</Radio>
                                                        <Radio value={false} className='text-black'>Participants</Radio>
                                                      </Radio.Group>
                                                    </Form.Item>


                                                    {!isCreatorFilling && (
                                                      <>
                                                        <Form.Item name={[field.name, 'after_filling_fields']} label={<label className='fw-bold text-black primary-font-size mb-2'>What Should participants do after filling the fields?</label>} rules={[{ required: true, message: 'Please select an option!' }]}>
                                                          <Radio.Group className='mb-2'>
                                                            <Radio value={AfterFillingFields.REVIEW} className='text-black'>Send To Me For Review and Submission</Radio>
                                                            <Radio value={AfterFillingFields.SUBMIT} className='text-black'>Participant Can Submit Directly</Radio>
                                                          </Radio.Group >
                                                        </Form.Item>
                                                        <Button size='small' htmlType='button' type="default" onClick={showInviteModal} className='text-black fw-normal text-black mb-4' shape='round'>Invite Your Participants To Fill The Fields</Button>
                                                      </>
                                                    )}

                                                    {isCreatorFilling && (
                                                      <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>


                                                        {/* Full Name */}
                                                        <Form.Item name={[field.name, 'contestent_name']} rules={[{ required: true, message: 'Please enter the full name' }]}>
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter your full Name' />
                                                        </Form.Item>
                                                        {/* Email */}
                                                        <Form.Item name={[field.name, 'contestent_email']} rules={[{ type: "email", required: true, message: 'Please enter the vaild email' }]}>
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter your Email' />
                                                        </Form.Item>
                                                        {/* Age */}
                                                        <Form.Item name={[field.name, 'age']} rules={[{ required: true, message: 'Please enter the age!' }]}>
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter Age' onKeyPress={(e) => {
                                                            if (!/[0-9]/.test(e.key)) {
                                                              e.preventDefault();
                                                            }
                                                          }} />
                                                        </Form.Item>
                                                        {/* Location */}
                                                        <Form.Item name={[field.name, 'location']} rules={[{ required: true, message: 'Please enter the location' }]}>
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Location' />
                                                        </Form.Item>
                                                        {/* About You */}
                                                        <Form.Item name={[field.name, 'about']} rules={[{ required: true, message: 'Please enter the info' }]} label={<label>About You [Optional]</label>}>
                                                          <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Please enter!!!' />
                                                        </Form.Item>

                                                        {/* Upload Material Image */}
                                                        <div className='mt-3'>
                                                          <SectionTitle title='Upload Material' className='sub-title-font-size fw-bold' />
                                                        </div>

                                                        <div>
                                                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.material !== curr?.contestent?.material} className='m-0'>
                                                            {
                                                              ({ getFieldValue }) => {
                                                                const x = getFieldValue(['contestent', field.name, 'material'])?.fileList;
                                                                // let x = getFieldValue('material')?.fileList;
                                                                console.log(x);

                                                                return (
                                                                  <Form.Item className='mb-2' name={[field.name, 'material']} rules={[{ required: true, message: 'Please upload the image' }]}>
                                                                    <>
                                                                      <Upload
                                                                        customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                                                        listType="picture-card"
                                                                        showUploadList={{
                                                                          showPreviewIcon: false
                                                                        }}
                                                                      >
                                                                        {
                                                                          x?.length ? null :
                                                                            <UploadButtonIcon />
                                                                        }
                                                                      </Upload>
                                                                    </>
                                                                  </Form.Item>
                                                                )
                                                              }}
                                                          </Form.Item>


                                                          <Typography.Paragraph className='mb-3 m-0'>{"[ This could be the Act/Performance/Creation/etc., that voters are to vote on]"}</Typography.Paragraph>
                                                        </div>

                                                        {/* Profile Pic */}
                                                        <div>
                                                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.profile_pic !== curr?.contestent?.profile_pic} className='m-0'>
                                                            {
                                                              ({ getFieldValue }) => {
                                                                const x = getFieldValue(['contestent', field.name, 'profile_pic'])?.fileList;
                                                                return (
                                                                  <Form.Item name={[field.name, 'profile_pic']} className='mb-2' label={<label className='text-black primary-font-size'>Upload your image</label>} rules={[{ required: true, message: 'Please upload the image' }]}>
                                                                    <>
                                                                      <Upload
                                                                        // customRequest={({ onSuccess }) => onSuccess("ok")}
                                                                        listType="picture-card"
                                                                        showUploadList={{
                                                                          showPreviewIcon: false
                                                                        }}
                                                                      >
                                                                        {
                                                                          x?.length ? null :
                                                                            <UploadButtonIcon />
                                                                        }
                                                                      </Upload>
                                                                    </>
                                                                  </Form.Item>
                                                                )
                                                              }}
                                                          </Form.Item>


                                                          <Typography.Paragraph className='mb-3 m-0'>Upload Contestant picture</Typography.Paragraph>
                                                        </div>

                                                        {/* Video Intro */}
                                                        <div>

                                                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.video_intro !== curr?.contestent?.video_intro} className='m-0'>
                                                            {
                                                              ({ getFieldValue }) => {
                                                                const x = getFieldValue(['contestent', field.name, 'video_intro'])?.fileList;
                                                                console.log(x);

                                                                return (
                                                                  <Form.Item name={[field.name, 'video_intro']} className='mb-2' label={<label className='text-black primary-font-size'>Video Intro</label>} rules={[{ required: true, message: 'Please upload the video' }]}>
                                                                    <>
                                                                      <Upload
                                                                        customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                                                        listType="picture-card"
                                                                        showUploadList={{
                                                                          showPreviewIcon: false
                                                                        }}
                                                                      >
                                                                        {
                                                                          x?.length ? null :
                                                                            <UploadButtonIcon />
                                                                        }
                                                                      </Upload>
                                                                    </>
                                                                  </Form.Item>
                                                                )
                                                              }}
                                                          </Form.Item>

                                                          <Typography.Paragraph className='mb-3 m-0'>{"[Upload a maximum of one minute video intro about you]"}</Typography.Paragraph>
                                                        </div>

                                                        {/* Social Media */}
                                                        <div>
                                                          <label className='text-black primary-font-size'>Enter Social Media Handles (optional)</label>
                                                          <Form.Item>
                                                            <Form.List name={[field.name, 'social_media']} initialValue={Array.from({ length: 1 }, () => ({}))}>
                                                              {(subFields, subOpt) => (
                                                                <Fragment>
                                                                  {subFields.map((subField, subIndex) => (
                                                                    <div key={subIndex}>
                                                                      {/* Social Media Handler */}
                                                                      <Form.Item name={[subField.name, 'handle']} rules={[{ required: true, message: 'Please Select' }]}>
                                                                        <Select size='large' className='bg-transparent ps-0' placeholder='Enter social media Handles'>
                                                                          <Select.Option value="1">Facebook</Select.Option>
                                                                          <Select.Option value="2">YouTube</Select.Option>
                                                                          <Select.Option value="3">Tiktok</Select.Option>
                                                                          <Select.Option value="4">URL Link</Select.Option>
                                                                        </Select>
                                                                      </Form.Item>
                                                                      {/* Social Media Link */}
                                                                      <Flex align='start' gap={8}>
                                                                        <Form.Item className='w-100' name={[subField.name, 'link']} rules={[{ required: true, message: 'Please enter tge link' }]}>
                                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter Link here' />
                                                                        </Form.Item>
                                                                        {subIndex > 0 &&
                                                                          <Button icon={<TrashFilled />} danger onClick={() => subOpt.remove(subField.name)} size='large' htmlType='button' type="primary" className='text-white fw-normal' shape='default'></Button>
                                                                        }
                                                                      </Flex>
                                                                    </div>
                                                                  ))}
                                                                  <div className='text-end'>
                                                                    <Button size='small' htmlType='button' type="default" className='text-black fw-normal' shape='round' onClick={() => subOpt.add()}>
                                                                      + Add More
                                                                    </Button>
                                                                  </div>
                                                                </Fragment>
                                                              )}
                                                            </Form.List>
                                                          </Form.Item>
                                                        </div>

                                                        <Typography.Paragraph italic className='text-black m-0 mb-3'>{'[ This will help you gain more visibility]'}</Typography.Paragraph>

                                                        {/* Contest Be Watched */}
                                                        <Form.Item name={[field.name, 'contest_be_watched']} rules={[{ required: true, message: 'Please enter the link' }]}>
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste the link where your contest material can be viewed/watch i.e., YouTube, Tiktok, url link, etc' />
                                                        </Form.Item>

                                                        {/* Contest Link */}
                                                        <Form.Item name={[field.name, 'contest_link']} rules={[{ required: true, message: 'Please enter the contest link' }]}>
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste Link here...' />
                                                        </Form.Item>

                                                        {/* Contest Act */}
                                                        <Flex gap={8} align='start'>
                                                          <Form.Item name={[field.name, 'contest_act']} rules={[{ required: true, message: 'Please upload' }]} className='w-100'>
                                                            <Space.Compact className='w-100'>
                                                              <Input type='text' size='large' className='bg-transparent ps-0 flex-grow-1 w-100' placeholder='Upload your contest act here [Optional]' readOnly disabled />
                                                              <Upload prefixCls='upload-contest-act' >
                                                                <Button size='large' htmlType='button' className='border-0 border-bottom border-black rounded-0 bg-transparent' icon={<UploadIcon />}></Button>
                                                              </Upload>
                                                            </Space.Compact>
                                                          </Form.Item>
                                                        </Flex>
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                              <Form.Item>
                                                <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal' shape='round'>+ Add More</Button>
                                              </Form.Item>
                                            </>
                                          )}
                                        </Form.List>
                                      </>
                                    );
                                  }}
                                </Form.Item>
                              </div>

                            </>
                          }
                        </>)
                    }}
                  </Form.Item>

                  {/* Number of Winners to Be Selected */}
                  {/* <div className='mt-3'>
                    <SectionTitle title='Number of Winners to Be Selected' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="total_winners">
                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter Number of Winners to Be Selected' />
                  </Form.Item> */}


                  {/* Are There Any Prize For Winners? */}
                  <div className='mt-3'>
                    <SectionTitle title='Are There Any Prize For Winners?' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="is_winner_prize" shouldUpdate={(prev: any, curr: any) => prev.is_winner_prize !== curr.is_winner_prize} className='m-0'>
                    <Radio.Group size='large'>
                      <Radio value={true} className='text-black'>Yes</Radio>
                      <Radio value={false} className='text-black'>No</Radio>
                    </Radio.Group>
                  </Form.Item>


                  {/* Are There Any Prize For Winners? */}
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev.is_winner_prize !== curr.is_winner_prize}>
                    {({ getFieldValue }) => {
                      let val = getFieldValue('is_winner_prize');
                      // console.log(val, 'val');
                      return (
                        <Fragment>
                          {
                            val &&
                            <Fragment>
                              <div className='mt-3'>
                                <SectionTitle title='Specify Reward Type' className='mb-4 sub-title-font-size fw-bold' />
                              </div>

                              {/* <Form.Item name="winner_prize_round">
                                <Select size='large' className='bg-transparent ps-0' placeholder='Select Round'>
                                  <Select.Option value="1">Round 1</Select.Option>
                                  <Select.Option value="2">Round 2</Select.Option>
                                  <Select.Option value="3">Round 3</Select.Option>
                                  <Select.Option value="4">Round 4</Select.Option>
                                </Select>
                              </Form.Item> */}

                              {/* Specify Reward Type */}
                              <Form.Item name="winner_reward_type" rules={[{ required: true, message: 'Please enter the reward description' }]}>
                                <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Enter reward description here...' />
                              </Form.Item>

                              <Typography.Paragraph italic className='text-black m-0 mb-4'>Note: The SEE platform has zero tolerance for defaulting on or falsely mentioning rewards. It is mandatory that all your selected winners receive their prizes. Any confirmed case of non-compliance could lead to the termination of your SEE account and possible penalties.</Typography.Paragraph>


                              {/* State Number of Finalists  */}
                              <div className='my-3'>
                                <SectionTitle title='State Number of Finalists ' className='mb-2 sub-title-font-size fw-bold' />
                                <Typography.Paragraph italic className='text-black m-0'>This is an important field as it will enable our voting Stystem to efficiently put up your finalist according to Number of highest votes</Typography.Paragraph>
                              </div>

                              {/* <Flex justify='space-between' align='center'>
                                <Form.Item name="total_finalist">
                                  <Checkbox.Group className='mt-3'>
                                    <Checkbox value={"winner"} className='text-black'>Winner</Checkbox>
                                    <Checkbox value={"first_runner_up"} className='text-black'>1st Runner Up</Checkbox>
                                    <Checkbox value={"second_runner_up"} className='text-black'>2nd Runner Up</Checkbox>
                                    <Checkbox value={"third_runner_up"} className='text-black'>3rd Runner Up</Checkbox>
                                  </Checkbox.Group>
                                </Form.Item>
                                <Button type='text' className='fw-medium btn-text'><span>+Add More</span></Button>
                              </Flex> */}


                              <Form.Item>
                                <Form.List name="winner_reward" initialValue={Array.from({ length: 1 }, () => ({}))}>
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map((field, index) => (
                                        <div key={index}>
                                          {/* label={<label className='text-black primary-font-size fw-bold'>Select Finalists Position</label>} */}
                                          <Form.Item name={[field.name, 'position']} rules={[{ required: true, message: 'Please select the option' }]}>
                                            <Select size='large' className='bg-transparent ps-0' placeholder='Please select position!!!'>
                                              <Select.Option value={Number(1)}>Winner</Select.Option>
                                              <Select.Option value={Number(2)}>1st Runner Up</Select.Option>
                                              <Select.Option value={Number(3)}>2nd Runner Up</Select.Option>
                                              <Select.Option value={Number(4)}>3rd Runner Up</Select.Option>
                                            </Select>
                                          </Form.Item>

                                          <Flex className='mb-4'>
                                            <Form.Item className='w-100' name={[field.name, 'reward']} label={<label className='text-black primary-font-size fw-bold'>Specify / Describe Reward (For)</label>} rules={[{ required: true, message: 'Please enter the reward amount' }]}>
                                              <InputNumber onScroll={(e) => { e.preventDefault() }} size='large' className='bg-transparent ps-0 w-100' placeholder='Enter Amount' onKeyPress={(e) => {
                                                if (!/[0-9]/.test(e.key)) {
                                                  e.preventDefault();
                                                }
                                              }} />
                                            </Form.Item>
                                            {
                                              index > 0 &&
                                              <Button icon={<TrashFilled />} danger onClick={() => {
                                                remove(field.name); console.log("field removed", field);

                                              }} size='small' htmlType='button' type="primary" className='text-white fw-normal text-black' shape='default'></Button>
                                            }
                                          </Flex>
                                        </div>
                                      ))}
                                      <Form.Item>
                                        <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal text-black' shape='round'>+ Add More</Button>
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              </Form.Item>
                              {/* Number of Winners to Be Selected */}
                              {/* <Form.Item name="total_winners" label={<label className='text-black primary-font-size fw-bold'>Number of Winners to Be Selected</label>}>
                                <Input size='large' className='bg-transparent ps-0' placeholder='Number of Winners to Be Selected' />
                              </Form.Item> */}
                              {/* Rewards */}
                            </Fragment>
                          }
                        </Fragment>
                      )
                    }}
                  </Form.Item>



                  {/* Contact Details */}
                  <div className='mt-3'>
                    <SectionTitle title='Contact Details' className='mb-2 sub-title-font-size fw-bold' />
                    <Typography.Paragraph className='text-black m-0'>We will only show this to your winners at the end of the voting period.</Typography.Paragraph>
                  </div>

                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item name="full_name" rules={[{ required: true, message: 'Please enter the full name' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Full Name' />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={12}>
                      <Form.Item name="email" rules={[{ type: "email", required: true, message: 'Please enter the valid email' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Email Address' />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={12}>
                      <Form.Item name="phone_number" rules={[{ required: true, message: 'Please enter the phone number' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Phone Number' onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }} />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={24}>
                      <Form.Item name="address" rules={[{ required: true, message: 'Please enter the address' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Address' ref={(ref) => locationSearchRef.current = ref} />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={12} xl={8}>
                      <Form.Item name="country" rules={[{ required: true, message: 'Please enter the country' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Country' />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={12} xl={8}>
                      <Form.Item name="state" rules={[{ required: true, message: 'Please enter the state' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='State' />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={12} xl={8}>
                      <Form.Item name="city" rules={[{ required: true, message: 'Please enter the city' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='City' />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={12} xl={8}>
                      <Form.Item name="postal_code" rules={[{ required: true, message: 'Please enter the postal code' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Postal Code' />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Are you Rewarding Your Voters? */}
                  <div className='mt-3'>
                    <SectionTitle title='Are you Rewarding Your Voters?' className='mb-2 sub-title-font-size fw-bold' />
                  </div>

                  <Form.Item name="is_voter_prize" rules={[{ required: true, message: 'Please select an option' }]} shouldUpdate={(prev: any, curr: any) => prev.is_voter_prize !== curr.is_voter_prize}>
                    <Radio.Group className='mt-3' size='large'>
                      <Radio value={true} className='text-black'>Yes</Radio>
                      <Radio value={false} className='text-black'>No</Radio>
                    </Radio.Group>
                  </Form.Item>


                  {/* Specify Reward Type */}
                  <div className='mt-3'>
                    <SectionTitle title='Specify Reward Type' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev.is_voter_prize !== curr.is_voter_prize}>
                    {({ getFieldValue }) => {
                      let val = getFieldValue('is_voter_prize');
                      return (
                        <Fragment>
                          {val &&
                            <Form.List name="voter_reward" initialValue={Array.from({ length: 1 }, () => ({}))}>
                              {(fields, { add, remove }) => (
                                <>
                                  {fields.map((field, index) => (
                                    <div key={index}>
                                      {
                                        index >= 1 &&
                                        <Divider />
                                      }
                                      <Fragment>
                                        <Form.Item name={[field.name, 'round']} rules={[{ required: true, message: 'Please select the round' }]}>
                                          <Select size='large' className='bg-transparent ps-0' placeholder='Select Round'>
                                            <Select.Option value="1">1 Round</Select.Option>
                                            <Select.Option value="2">2 Round</Select.Option>
                                            <Select.Option value="3">3 Round</Select.Option>
                                            <Select.Option value="4">4 Round</Select.Option>
                                          </Select>
                                        </Form.Item>


                                        <Form.Item name={[field.name, 'reward_type']} rules={[{ required: true, message: 'Please enter the reward description' }]}>
                                          <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Enter reward description here...' />
                                        </Form.Item>

                                        <Typography.Paragraph italic className='text-black m-0 mb-4'>Note: The SEE platform has zero tolerance for defaulting on or falsely mentioning rewards. It is mandatory that all your selected winners receive their prizes. Any confirmed case of non-compliance could lead to the termination of your SEE account and possible penalties.</Typography.Paragraph>

                                        <div className='mt-3'>
                                          <SectionTitle title='Number of Voters to Be Selected' className='mb-4 sub-title-font-size fw-bold' />
                                        </div>

                                        {/* number_of_voter */}
                                        <Form.Item name={[field.name, 'no_of_voter']} rules={[{ required: true, message: 'Please enter the no of voter to be selected' }]}>
                                          <Input size='large' className='bg-transparent ps-0' placeholder='Number of Voters to Be Selected' onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                              e.preventDefault();
                                            }
                                          }} />
                                        </Form.Item>
                                      </Fragment>

                                      {
                                        index > 0 &&
                                        <Button icon={<TrashFilled />} danger onClick={() => {
                                          remove(field.name); console.log("field removed", field);

                                        }} size='small' htmlType='button' type="primary" className='text-white fw-normal text-black mb-5' shape='default'>Delete</Button>
                                      }

                                    </div>
                                  ))}
                                  <Form.Item>
                                    <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal text-black' shape='round'>+ Add More</Button>
                                  </Form.Item>
                                </>
                              )}
                            </Form.List>
                          }
                        </Fragment>
                      )
                    }
                    }
                  </Form.Item>


                  {/* add_info */}
                  <Form.Item name="add_info">
                    <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Additional Information [Optional]' />
                  </Form.Item>

                  <div className='mt-3'>
                    <SectionTitle title='Consent and Submission' className='mb-4 sub-title-font-size fw-bold' />
                    <Typography.Paragraph className='fw-normal text-black'> I confirm that the information provided is accurate and agree to SEE Ltd.'s terms and conditions for posting auditions. I understand that SEE Ltd. reserves the right to review and approve all audition postings to ensure they meet the platform's standards for quality and safety.</Typography.Paragraph>
                  </div>

                  <Form.Item className='my-4' rules={[{ required: true, message: 'Please check the checkbox' }]}>
                    <Checkbox className='text-black'>I confirm and Consent</Checkbox>
                  </Form.Item>

                  <Flex gap={12} justify={screens.md ? 'end' : 'start'}>
                    <Button size='small' className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button>
                    <Button size='small' htmlType='submit' loading={formLoading} className='rounded-pill px-4' type='primary'>Submit</Button>
                  </Flex>
                </Form>
              </WrapperElement>
            </Col>
          </Row>
        </div>
      </section >

      {/* Invite Modal */}
      <CommonModal title="Invite Your Participants" isModalOpen={openInviteModal} handleCancel={cancelInviteModal} >
        <WrapperElement>
          <Typography.Title className='fw-semibold primary-font-size m-0 mb-3'>Enter any Specific Information</Typography.Title>
          <Form layout='vertical' className='light_theme_form' onFinish={InviteUser} form={inviteForm}>
            <Form.Item name="invite_info" rules={[{ required: true, message: 'Please enter the invite info' }]}>
              <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Additional/Important Information Here' />
            </Form.Item>
            <Form.Item className='mb-2' name={'invite_from'} label={<label className='fw-semibold primary-font-size'>Invite from:</label>} rules={[{ required: true, message: 'Please select an option' }]}>
              <Radio.Group>
                <Radio value={'Phone'}>Phone Contacts</Radio>
                <Radio value={'Email'}>Email</Radio>
                <Radio value={'Facebook'}>Facebook</Radio>
                <Radio value={'WhatsApp'}>WhatsApp</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="all_contestent_email" className='mb-2' label={<label className='fw-semibold primary-font-size'>Enter Email & Send</label>}>
              {/* <Input size='large' className='bg-transparent ps-0' placeholder='Enter Email & Send' /> */}
              <Select
                mode="tags"
                // size={size}
                placeholder="Enter Email & Send"
                // onChange={handleChange}
                style={{ width: '100%' }}
              // options={options}
              />
            </Form.Item>
            <Flex className='mt-3' gap={12} justify={screens.lg ? 'end' : 'start'}>
              <Button size='small' onClick={cancelInviteModal} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button>
              <Button size='small' className='rounded-pill px-4 bg-white' htmlType='submit' type='default'>Send</Button>
            </Flex>
          </Form>
        </WrapperElement>
      </CommonModal>

      {/* Invite Success Modal */}
      <CommonModal title="Success!" isModalOpen={openInviteSuccessModal} handleCancel={cancelInviteSuccessModal} >
        <WrapperElement>
          <Typography.Paragraph className='text-black'>
            Hey there! You created a voting page. Remember to enter/update your voting start and end time, update your link where viewers can easily reach new acts/performances/ creativity of your contestants.
          </Typography.Paragraph>
          <Flex className='mt-3' gap={12} justify={'center'}>
            {/* <Link href="/contest/1"><Button size='small' className='rounded-pill px-4' type='primary'>View Voting Contest Page</Button></Link> */}
            <Button size='small' className='rounded-pill px-4' type='primary' onClick={cancelInviteSuccessModal}>Go Back on Create Voting </Button>
            {/* <Button size='small' onClick={cancelInviteSuccessModal} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button> */}
          </Flex>
        </WrapperElement>
      </CommonModal>
    </>
  )
}


CreateContest.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default CreateContest