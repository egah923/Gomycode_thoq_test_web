import SectionTitle from '@/components/common/SectionTitle';
import WrapperElement from '@/components/common/WrapperElement';
import { Col, Form, Input, Row, Upload, Typography, Select, Flex, Checkbox, Grid, Radio, Button, DatePicker, TimePicker, Divider, InputNumber, UploadProps, } from 'antd';
import React, { Fragment, ReactNode, useContext, useEffect, useState } from 'react'
import UploadButtonIcon from '@/components/UploadButtonIcon';
import UploadIcon from '@/components/Icons/UploadIcon';
import CommonModal from '@/components/common/CommonModal';
import TrashFilled from '@/components/Icons/TrashFilled';
import dayjs from "dayjs";
import henceforthApi from '@/utils/henceforthApi';
import { GlobalContext } from '@/context/Provider';
// import { useBeforeUnSaved } from '@/utils/CommonFunctions';
import { AfterFillingFields, ContestPlatform, FormFillingType, VoteType } from '@/utils/henceforthEnums';
import { useRouter } from 'next/router';
import RootLayout from '@/layouts/RootLayout';
import { GetServerSideProps } from 'next';
import { UploadFile } from 'antd/lib';



{/* <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.video_intro !== curr?.contestent?.video_intro} className='m-0'>
  {
    ({ getFieldValue }) => {
      const file = getFieldValue(['contestent', field.name, 'video_intro']);
      const fileList = file?.fileList || []
      console.log(file?.fileList, 'contestent');

      return (
        <Form.Item name={[field.name, 'video_intro']} className='mb-2' label={<label className='text-black primary-font-size'>Video Intro</label>} rules={[{ required: true, message: 'Please upload the video' }]}>
          <>
            <Upload
              customRequest={({ onSuccess }: any) => onSuccess("ok")}
              accept="video/mp4,video/*"
              listType="picture-card"
              showUploadList={{
                showPreviewIcon: false
              }}
              fileList={fileList || []}
              onChange={(info) => {
                if (info?.fileList[0]?.status === "done") {
                  handleFileUpload(['contestent', index, 'video_intro'], info.fileList);
                }
              }}
            >
              {
                fileList?.length ? null :
                  <UploadButtonIcon />
              }
            </Upload>
          </>
        </Form.Item>
      )
    }}
</Form.Item> */}


const EditContest = (props: any) => {
  // const [routerWarning, setRouterWarning] = useState(false)
  // useBeforeUnSaved(!routerWarning, `/contest/create`);

  const router = useRouter()
  const screens = Grid.useBreakpoint();
  const [round, setRound] = useState(props?.rounds?.length) as any;
  const [formLoading, setFormLoading] = useState(false)
  const [openInviteModal, setOpenInviteModal] = useState(false)
  const [openInviteSuccessModal, setOpenInviteSuccessModal] = useState(false)
  const { Toast } = useContext(GlobalContext)
  const locationSearchRef = React.useRef(null as any)
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [contestDetail, setContestDetail] = useState({ ...props })

  // ************************ Set Fields Values ************************
  useEffect(() => {
    if (contestDetail) {
      form?.setFieldsValue({
        ...contestDetail,
      })
    }
  }, [contestDetail])

  console.log(contestDetail);



  useEffect(() => {
    if (props?.contestent?.length) {
      form.setFieldsValue({
        contestent: props.contestent.map((res, index) => ({
          is_creator_filling: res?.is_creator_filling,
          contestent_email: res?.email,
          contestent_name: res?.name,
          age: res?.age,
          location: res?.location,
          about: res?.about,
          material: res?.material,
          profile_pic: res?.profile_pic,
          video_intro: res?.video_intro,
          contest_act: res?.contest_act,
          social_media: res?.social_media.map((data) => ({
            handle: data.type,
            link: data.url,
          })),
          contest_be_watched: res?.contest_be_watched,
          contest_link: res?.contest_link,
          key: index.toString(), // Ensure to include a unique key for each form item
        })),
      });
    }
  }, [props, form]);

  useEffect(() => {

    if (props?.cover_media) {
      form.setFieldValue("cover_media", "IMAGE")
    }

    if (props?.rounds?.length) {
      form.setFieldValue("no_of_rounds", props?.rounds?.length)

      const roundName = props.rounds.map((res: any) => res.round_name);
      const contestentPassNextRound = props.rounds.map((res: any) => res?.next_round_contestent);
      const roundStartDate = props.rounds.map((res: any) => res?.start_date);
      const roundEndDate = props.rounds.map((res: any) => res?.end_date);
      const roundStartTime = props.rounds.map((res: any) => res?.start_time);
      const roundEndTime = props.rounds.map((res: any) => res?.end_time);


      form.setFieldsValue({
        name: roundName,
        next_round_contestent: contestentPassNextRound,
        start_date: roundStartDate.map((res: any) => dayjs(res)),
        end_date: roundEndDate.map((res: any) => dayjs(res)),
        start_time: roundStartTime.map((res: any) => dayjs(res)),
        end_time: roundEndTime.map((res: any) => dayjs(res)),
      });
    }
  }, [props, form]);




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

          form.setFieldValue('full_address', place.formatted_address)
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
    invite_info: null,
    invite_from: null,
    contestent: []
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
      contestent: arr.contestent,
    });

    inviteForm.resetFields();
    showInviteSuccessModal();
  };

  // ************************ Upload Image API Call ************************
  const [fileListCoverMedia, setFileListCoverMedia] = useState([
    {
      uid: '-1',
      name: props?.cover_media,
      status: 'done',
      url: henceforthApi.FILES.imageMedium(props?.cover_media),
    }
  ]) as any;

  // State for contest_act file list
  const [fileListContestAct, setFileListContestAct] = useState([
    {
      uid: '-1',
      name: props?.contest_act,
      status: 'done',
      url: henceforthApi.FILES.imageMedium(props?.contest_act),
    }
  ]) as any;

  // Function to handle file upload
  const handleFileUpload = async (keyPath, fileList, setFileList) => {
    if (fileList?.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        try {
          let uploadApiRes = await henceforthApi.Common.uploadFile('file', file);
          const uploadedFile = {
            uid: uploadApiRes?.data?.file_name,
            name: uploadApiRes?.data?.file_name,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(uploadApiRes?.data?.file_name),
          };

          console.log(uploadedFile, "uploadedFile");

          setFileList([uploadedFile]); // Update fileList state with uploaded file info
          updateFormField(form, keyPath, uploadedFile.name); // Update form field with uploaded file URL
          Toast.success('File uploaded successfully');
        } catch (error) {
          console.error('Error uploading file:', error);
          Toast.error('Failed to upload file: ' || error);
        }
      }
    }
  };

  // Function to handle file removal
  const handleRemove = (keyPath, setFileList) => {
    setFileList([]); // Clear the fileList state
    updateFormField(form, keyPath, null); // Clear the form field value as well
  };

  // Function to update form field values
  const updateFormField = (form, keyPath, value) => {
    if (Array.isArray(keyPath)) {
      const formValues = form.getFieldValue(keyPath[0]) || [];
      const nestedFieldName = keyPath.slice(1);
      formValues[nestedFieldName[0]] = {
        ...formValues[nestedFieldName[0]],
        [nestedFieldName[1]]: value,
      };
      form.setFieldsValue({ [keyPath[0]]: formValues });
    } else {
      form.setFieldsValue({ [keyPath]: value });
    }
  };


  // ************************ Create Contest API Call ************************

  const onFinish = async (values: any) => {
    console.log(values, "values?.contest_act", values?.start_date);

    console.log(values?.contestent);

    let payLoad = {
      contest_id: router.query._id,
      title: values?.title,
      status: contestDetail?.status,
      contest_be_watched: values?.contest_be_watched,
      contest_link: values?.contest_link,

      cover_media_type: values?.cover_media?.type,
      cover_media: values?.cover_media?.file_name,
      contest_act: values?.contest_act?.file_name,

      contestent: values?.contestent,
      vote_type: values?.vote_type,
      cost_per_vote: values?.cost_per_vote ? Number(values?.cost_per_vote) : null,

      number_of_time_vote: Number(values?.number_of_time_vote),
      total_contestent: Number(values?.total_contestent),
      is_contestent_pic_reveal: values?.is_contestent_pic_reveal,
      filling_any_info: values?.filling_any_info,
      // contestent: values?.contestent,
      // "total_winners": "string",
      after_filling_fields: values?.after_filling_fields || null,
      is_winner_prize: values?.is_winner_prize,
      winner_reward_type: values?.winner_reward_type,
      winner_reward: values?.winner_reward,
      full_name: values?.full_name,
      full_address: values?.full_address,
      email: values?.email,
      phone_number: Number(values?.phone_number),
      country: values?.country,
      state: values?.state,
      city: values?.city,
      postal_code: values?.postal_code,
      voter_reward: values?.voter_reward ? values?.voter_reward : null,
      add_info: values?.add_info,
      is_voter_prize: values?.is_voter_prize,
    }


    // **************************** Create Round Array ****************************
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

    // **************************** Create Contestant Array ****************************
    const contestentArray = [] as any;
    console.log(values?.contestent, "contestent__________");

    for (let a = 0; a < values?.contestent?.length; a++) {
      const socialMediaArray = values?.contestent[a]?.social_media?.map((media: any) => ({
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
        material: values?.contestent[a].material?.file_name,
        profile_pic: values?.contestent[a].profile_pic?.file_name,
        video_intro: values?.contestent[a].video_intro?.file_name,
        contest_act: values?.contestent[a].contest_ac?.file_namet,
        social_media: socialMediaArray,
        contest_be_watched: values?.contestent[a].contest_be_watched,
        contest_link: values?.contestent[a].contest_link,
      }

      contestentArray.push(contestentObj)
    }

    // **************************** Contestant Array ****************************

    if (userEmailsInvite?.contestent?.length > 0) {
      if (contestentArray.length > 0) {
        // Both arrays are not empty
        payLoad['contestent'] = userEmailsInvite.contestent.concat(contestentArray);
      } else {
        // Only userEmailsInvite.contestent has elements
        payLoad['contestent'] = userEmailsInvite.contestent;
      }
      payLoad['invite_info'] = userEmailsInvite.invite_info;
    } else if (contestentArray.length > 0) {
      // Only contestentArray has elements
      // payLoad['contestent'] = contestentArray;
    }


    console.log(payLoad, "payLoad__________");

    // return
    try {
      setFormLoading(true);
      const apiRes = await henceforthApi.Contest.edit(payLoad);
      Toast.success(apiRes.message)

      router.push({
        pathname: `/contest/${apiRes?.data?._id}/details`
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
  let numberOfInputs = round || 1;


  const renderRoundNameInputs = () => {
    const input = [] as any;
    for (let i = 0; i < numberOfInputs; i++) {
      input.push(
        <Col span={24} md={12} lg={8} xl={6} key={i} >
          <Form.Item name={["name", i]} rules={[{ required: true, message: `Please enter the round ${i + 1} name` }]} >
            <Input type='text' size='large' className='bg-transparent ps-0' placeholder={`Enter round ${i + 1} name`} />
          </Form.Item>
        </Col>
      );
    }
    return input;
  };

  // ************************ Render Contestant Number Inputs ************************
  const [lastInputValue, setLastInputValue] = useState<number>();
  // console.log(typeof lastInputValue, "lastInputValue");

  const renderContestantNumberInputs = () => {
    const input = [] as any;
    for (let i = 0; i < numberOfInputs; i++) {
      input.push(
        <Col span={24} md={12} lg={8} xl={6} key={i} >
          <Form.Item name={["next_round_contestent", i]} rules={[{ required: true, message: `Please enter the contestants for round ${i + 1}` }]} >
            <InputNumber type='number' size='large'
              onChange={(value: any) => {
                if (i === numberOfInputs - 1) {
                  setLastInputValue(value);
                }
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }} className='bg-transparent ps-0 w-100' placeholder={`Enter contestant for round ${i + 1}`} />
          </Form.Item>
        </Col>
      )
    }

    return input;
  }




  // // ************************ Time and Date Inputs for Round ************************

  const renderTimeDateForRound = () => {
    const disableStartDate = (current, roundIndex) => {
      if (roundIndex > 0) {
        const prevRoundEndDate = form.getFieldValue(['end_date', roundIndex - 1]);
        return current && current.isBefore(dayjs(prevRoundEndDate).add(1, 'day').startOf('day'));
      }
      return current && current.isBefore(dayjs().subtract(1, 'day'));
    };

    const disableEndDate = (current, roundIndex) => {
      const startValue = form.getFieldValue(['start_date', roundIndex]);
      if (roundIndex > 0) {
        const prevRoundEndDate = form.getFieldValue(['end_date', roundIndex - 1]);
        return (
          current &&
          (current.isBefore(dayjs(startValue).startOf('day')) ||
            current.isBefore(dayjs(prevRoundEndDate).add(1, 'day').startOf('day')))
        );
      }
      return current && current.isBefore(dayjs(startValue).startOf('day'));
    };

    const disableHoursUntilCurrent = (selectedDate) => {
      const currentHour = dayjs().hour();
      const disabledHours = [];
      if (selectedDate && selectedDate.isSame(dayjs(), 'day')) {
        for (let i = 0; i < currentHour; i++) {
          disabledHours.push(i);
        }
      }
      return disabledHours;
    };

    const disableMinutesUntilCurrent = (selectedDate, selectedHour) => {
      if (!selectedHour || !selectedDate || !selectedDate.isSame(dayjs(), 'day')) {
        return [];
      }
      const currentMinute = dayjs().minute();
      const disabledMinutes = [];
      if (dayjs().hour() === selectedHour) {
        for (let i = 0; i < currentMinute; i++) {
          disabledMinutes.push(i);
        }
      }
      return disabledMinutes;
    };

    const validateTimeRange = async (_, values) => {
      const { start_date, start_time, end_time } = values;
      if (start_date && start_time && end_time) {
        const startTime = dayjs(`${start_date.format('YYYY-MM-DD')} ${start_time.format('HH:mm')}`);
        const endTime = dayjs(`${start_date.format('YYYY-MM-DD')} ${end_time.format('HH:mm')}`);

        if (endTime.isBefore(startTime)) {
          return Promise.reject(new Error('End time must be after start time'));
        }
      }
    };

    let inputs = [];

    for (let i = 0; i < numberOfInputs; i++) {
      inputs.push(
        <Col span={24} sm={12} md={12} lg={12} xl={11} xxl={11} key={i} >
          <label className='fw-bold text-black primary-font-size mb-3' > Round {i + 1} </label>
          <Row gutter={[24, 12]} >
            <Col span={24} md={12} lg={11} xl={12} xxl={12} >
              <Form.Item
                className='w-100'
                name={['start_date', i]}
                rules={[{ required: true, message: `Please enter the start date for round ${i + 1}` }]}
              >
                <DatePicker
                  format={'DD MMMM YYYY'}
                  disabledDate={(current) => disableStartDate(current, i)}
                  type='text'
                  size='large'
                  className='bg-transparent ps-0 w-100'
                  placeholder='Start Date'
                />
              </Form.Item>
            </Col>
            < Col span={24} md={12} lg={11} xl={12} xxl={12} >
              <Form.Item
                className='w-100'
                name={['start_time', i]}
                rules={
                  [
                    { required: true, message: `Please enter the start time for round ${i + 1}` },
                    { validator: (_, value) => validateTimeRange(_, { start_date: form.getFieldValue(['start_date', i]), start_time: value, end_time: form.getFieldValue(['end_time', i]) }) },
                  ]}
              >
                <TimePicker
                  format='HH:mm'
                  disabledHours={() => disableHoursUntilCurrent(form.getFieldValue(['start_date', i]))}
                  disabledMinutes={(selectedHour) => disableMinutesUntilCurrent(form.getFieldValue(['start_date', i]), selectedHour)}
                  size='large'
                  className='bg-transparent ps-0 w-100'
                  placeholder='Start Time'
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12} >
              <Form.Item
                className='w-100'
                name={['end_date', i]}
                rules={
                  [
                    { required: true, message: `Please enter the end date for round ${i + 1}` },
                  ]}
              >
                <DatePicker
                  format={'DD MMMM YYYY'}
                  disabledDate={(current) => disableEndDate(current, i)}
                  type='text'
                  size='large'
                  className='bg-transparent ps-0 w-100'
                  placeholder='End Date'
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12} >
              <Form.Item
                className='w-100'
                name={['end_time', i]}
                rules={
                  [
                    { required: true, message: `Please enter the end time for round ${i + 1}` },
                    { validator: (_, value) => validateTimeRange(_, { start_date: form.getFieldValue(['start_date', i]), start_time: form.getFieldValue(['start_time', i]), end_time: value }) },
                  ]}
              >
                <TimePicker
                  format='HH:mm'
                  disabledHours={() => disableHoursUntilCurrent(form.getFieldValue(['end_date', i]))}
                  disabledMinutes={(selectedHour) => disableMinutesUntilCurrent(form.getFieldValue(['end_date', i]), selectedHour)}
                  size='large'
                  className='bg-transparent ps-0 w-100'
                  placeholder='End Time'
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      );
    }

    return inputs;
  };



  // ************************ Set Fields Values ************************
  // ************************ After Filling Fields ************************
  const participant = <><Form.Item name="after_filling_fields" label={< label className='fw-bold text-black primary-font-size mb-2' > What Should participants do after filling the fields ? </label>}>
    <Radio.Group className='mb-2' >
      <Radio value={AfterFillingFields.REVIEW} className='text-black' > Send To Me For Review and Submission </Radio>
      < Radio value={AfterFillingFields.SUBMIT} className='text-black' > Participant Can Submit Directly </Radio>
    </Radio.Group >
  </Form.Item>
    <Button size='small' htmlType='button' type="default" onClick={showInviteModal} className='text-black fw-normal text-black mb-4' shape='round' > Invite Your Participants To Fill The Fields </Button>
  </>

  return (
    <>
      <section className='py-md-5 py-4' >
        <div className="container" >
          <Row>
            <Col span={24}>
              <WrapperElement>
                <SectionTitle title='Create Voting For Your Contest' className='mb-4' />
                <Form
                  className='light_theme_form' form={form} layout='vertical' onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
                  {/* Contest Title */}
                  < Form.Item name="title" rules={[{ required: true, message: 'Please enter the contest title!' }]} >
                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Title of Your Contest' />
                  </Form.Item>
                  {/* Cover Media */}
                  <div className='mb-3' >
                    <Form.Item shouldUpdate={(prev: any, curr: any) => prev.cover_media !== curr.cover_media} className='m-0' >
                      {
                        ({ getFieldValue }) => {
                          let x = getFieldValue('cover_media');
                          // console.log(x);

                          return (
                            <Form.Item name="cover_media" className='m-0' rules={[{ required: true, message: 'Please upload cover media!' }]} >
                              <Upload
                                customRequest={({ onSuccess }) => onSuccess("ok")}
                                // accept='image/*'
                                showUploadList={{ showPreviewIcon: false }
                                }
                                fileList={fileListCoverMedia}
                                listType="picture-card"
                                onChange={(info) => {
                                  const { fileList: newFileList } = info;
                                  setFileListCoverMedia(newFileList); // Update fileListCoverMedia state
                                  if (newFileList.length > 0 && newFileList[0].status === 'done') {
                                    handleFileUpload('cover_media', newFileList, setFileListCoverMedia);
                                  }
                                }}
                                onRemove={() => handleRemove('cover_media', setFileListCoverMedia)}
                              >
                                {
                                  fileListCoverMedia.length >= 1 ? null : <UploadButtonIcon />}
                              </Upload>
                            </Form.Item>
                          )
                        }
                      }
                    </Form.Item>

                    <Typography.Paragraph className='mt-2 m-0' > Upload your contest cover media </Typography.Paragraph>
                  </div>

                  {/* Contest Act */}
                  <div>
                    <Form.Item shouldUpdate={(prev: any, curr: any) => prev.contest_act !== curr.contest_act} className='m-0' >
                      {
                        ({ getFieldValue }) => {
                          let x = getFieldValue('contest_act');
                          return (
                            <Form.Item name="contest_act" className='m-0' label={<label className='fw-semibold text-black primary-font-size' > Upload Your Contest Acts / Performance / Creation / Display / Others[Optional] </label>
                            }>
                              <Upload
                                customRequest={({ onSuccess }) => onSuccess("ok")}
                                // accept='image/*'
                                showUploadList={{ showPreviewIcon: false }}
                                fileList={fileListContestAct}
                                listType="picture-card"
                                onChange={(info) => {
                                  const { fileList: newFileList } = info;
                                  setFileListContestAct(newFileList); // Update fileListContestAct state
                                  if (newFileList.length > 0 && newFileList[0].status === 'done') {
                                    handleFileUpload('contest_act', newFileList, setFileListContestAct);
                                  }
                                }}
                                onRemove={() => handleRemove('contest_act', setFileListContestAct)}
                              >
                                {
                                  fileListContestAct.length >= 1 ? null : <UploadButtonIcon />}
                              </Upload>
                            </Form.Item>)
                        }}
                    </Form.Item>
                    <Typography.Paragraph className='mt-2 m-0' > This field is optional as long as your audience knows where to find and watch / view your contest material </Typography.Paragraph>
                  </div>

                  {/* Contest Be Watched */}
                  <Form.Item name="contest_be_watched" rules={[{ required: true, message: 'Please select option for contest be watched!' }]} >
                    <Select size='large' className='bg-transparent ps-0' placeholder='Where can your contest be watched/Viewed?   i.e., YouTube, Tiktok, url link, etc' >
                      <Select.Option value={ContestPlatform.YOUTUBE}> {ContestPlatform.YOUTUBE} </Select.Option>
                      <Select.Option value={ContestPlatform.FACEBOOK} > {ContestPlatform.FACEBOOK} </Select.Option>
                      <Select.Option value={ContestPlatform.THROWTECH} > {ContestPlatform.THROWTECH} </Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Contest Link */}
                  <Form.Item name="contest_link" rules={[{ required: true, message: 'Please enter contest link!' }]} >
                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste Link here...' />
                  </Form.Item>

                  {/* Vote Type */}
                  <div className='mt-3' >
                    <SectionTitle title='Vote Type' className='mb-2 sub-title-font-size fw-bold' />
                  </div>
                  < Form.Item name="vote_type" shouldUpdate={(prev: any, curr: any) => prev.vote_type !== curr.vote_type}>
                    <Radio.Group>
                      <Radio value={VoteType.FREE} className='text-black' > Free </Radio>
                      < Radio value={VoteType.PAID} className='text-black' > Paid </Radio>
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
                              < Row >
                                <Col span={24} md={16} lg={12} xl={10} xxl={8} >
                                  <Form.Item name="cost_per_vote" rules={[{ required: true, message: 'Please enter cost per vote!' }]} >
                                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Specify amount here' onKeyPress={(e) => {
                                      if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    }
                                    } />
                                  </Form.Item>
                                </Col>
                              </Row>
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
                      <label className='fw-semibold text-black primary-font-size' > Number of times a person can vote for their favorite contestants / Participants / Act / Creativity </label>
                      < Form.Item className='w-100' name="number_of_time_vote" rules={[{ required: true, message: 'Please select an option!' }]} >
                        <Select size='large' className='bg-transparent ps-0' placeholder='Please select!!!' >
                          <Select.Option value="0" > As Much As They Can </Select.Option>
                          <Select.Option value="1" > 1 </Select.Option>
                          <Select.Option value="2" > 2 </Select.Option>
                          <Select.Option value="3" > 3 </Select.Option>
                          <Select.Option value="4" > 4 </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* No of Rounds */}
                  <div className='mt-3' >
                    <SectionTitle title='Specify Vote Time Period' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  < Form.Item name="no_of_rounds" label={< label className='fw-semibold text-black primary-font-size' > Please state how many number of round in all </label>} rules={[{ required: true, message: 'Please enter rounds!' }]}>
                    < Input size='large' onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }} className='bg-transparent ps-0' placeholder='Please enter rounds!!!' onChange={(e) => setRound(e.target.value)} />
                  </Form.Item>

                  {/* Number of rounds Name */}
                  <label className='fw-semibold text-black primary-font-size' > Name Your Round </label>
                  < Row gutter={[24, 12]} >
                    {renderRoundNameInputs()}
                  </Row>

                  {/* Number of contestant */}
                  <label className='fw-semibold text-black primary-font-size' > Specify how many contestants are needed to pass to the next round </label>
                  < Row gutter={[24, 12]} >
                    {renderContestantNumberInputs()}
                  </Row>


                  {/* Voting time period */}
                  <label className='fw-bold text-black primary-font-size mb-3' > Voting time period </label>
                  < Form.Item name="rounds" className='m-0' >
                    <Row gutter={[24, 24]} justify={'space-between'} >
                      {renderTimeDateForRound()}
                    </Row>
                  </Form.Item>

                  {/* Total Number Of Contestants */}
                  <div className='mt-3' >
                    <SectionTitle title='Contestant Details' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  < Form.Item name="total_contestent" label={< label className='fw-bold text-black primary-font-size mb-3' > Specify Total Number Of Contestants </label>} rules={[{ required: true, message: 'Please enter the number of contestant!' }]}>
                    < Input type='text' size='large' onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }} className='bg-transparent ps-0' placeholder='Please enter number of contestant' />
                  </Form.Item>

                  {/* Is Contestent Pic Reveal */}
                  <label className='fw-bold text-black primary-font-size mb-2' > Reveal My Contestants Pics During Voting Period </label>
                  < Typography.Paragraph italic className='text-black m-0 mb-3' > Please note that we will reveal their pics and names after the voting has ended.So you will be required to still provide their pics in the column below even if you select 'No</Typography.Paragraph>
                  < Form.Item name="is_contestent_pic_reveal" >
                    <Radio.Group className='mb-3' >
                      <Radio value={true} className='text-black' > Yes </Radio>
                      < Radio value={false} className='text-black' > No </Radio>
                    </Radio.Group>
                  </Form.Item>

                  {/* Add Contestants */}
                  <div className='mt-3' >
                    <SectionTitle title='Add Contestants' className='mb-4 sub-title-font-size fw-bold' />
                  </div>

                  {/* Filling Any Info */}
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev.filling_any_info !== curr.filling_any_info} className='m-0' >
                    {() => {
                      return <Form.Item name="filling_any_info" label={< label className='fw-bold text-black primary-font-size mb-2' > Are you Filling Any ? </label>} >
                        < Radio.Group >
                          <Radio value={FormFillingType.SOME} className='text-black' > Some </Radio>
                          < Radio value={FormFillingType.NONE} className='text-black' > None </Radio>
                        </Radio.Group>
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

                          {
                            val === FormFillingType.SOME &&
                            <>
                              {/* Some: Who Should Fill the Forms: Participants & Me */}
                              < div className='mb-4' >
                                <Form.Item shouldUpdate={(prev, curr) => prev.contestent !== curr.contestent}>
                                  {({ getFieldValue }) => {
                                    const contestants = getFieldValue('contestent') || [];
                                    // console.log(contestants, "contestants");
                                    return (
                                      <>
                                        <Form.List name="contestent" initialValue={Array.from({ length: props?.contestent?.length || 1 }, () => ({}))} >
                                          {(fields, { add, remove }) => (
                                            <>
                                              {
                                                fields.map((field, index) => {
                                                  const isCreatorFilling = form.getFieldValue(['contestent', field.name, 'is_creator_filling']);

                                                  return (
                                                    <div key={field.key} >
                                                      <Flex className='my-3' justify='space-between' align='center' >
                                                        <label className='fw-bold text-black sub-title-font-size' > Contestants {field.key + 1} </label>
                                                        {
                                                          index > 0 &&
                                                          <Button icon={
                                                            <TrashFilled />} danger onClick={() => remove(field.name)} size='small' htmlType='button' type="primary" className='text-white fw-normal' shape='default'></Button >
                                                        }
                                                      </Flex>

                                                      < Form.Item name={[field.name, 'is_creator_filling']} label={< label className='fw-bold text-black primary-font-size mb-2' > Who Should Fill the Forms </label>} rules={[{ required: true, message: 'Please select an option!' }]}>
                                                        < Radio.Group >
                                                          <Radio value={true} className='text-black' > Me </Radio>
                                                          < Radio value={false} className='text-black' > Participants </Radio>
                                                        </Radio.Group>
                                                      </Form.Item>

                                                      {
                                                        !isCreatorFilling && (
                                                          <>
                                                            <Form.Item name={[field.name, 'after_filling_fields']} label={< label className='fw-bold text-black primary-font-size mb-2' > What Should participants do after filling the fields ? </label>} rules={[{ required: true, message: 'Please select an option!' }]}>
                                                              < Radio.Group className='mb-2' >
                                                                <Radio value={AfterFillingFields.REVIEW} className='text-black' > Send To Me For Review and Submission </Radio>
                                                                < Radio value={AfterFillingFields.SUBMIT} className='text-black' > Participant Can Submit Directly </Radio>
                                                              </Radio.Group>
                                                            </Form.Item>
                                                            < Button size='small' htmlType='button' type="default" onClick={showInviteModal} className='text-black fw-normal text-black mb-4' shape='round' > Invite Your Participants To Fill The Fields </Button>
                                                          </>
                                                        )
                                                      }

                                                      {
                                                        isCreatorFilling && (
                                                          <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                                                            {/* Full Name */}
                                                            < Form.Item name={[field.name, 'contestent_name']} rules={[{ required: true, message: 'Please enter the full name' }]} >
                                                              <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter your full Name' />
                                                            </Form.Item>
                                                            {/* Email */}
                                                            <Form.Item name={[field.name, 'contestent_email']} rules={[{ whitespace: true, type: "email", required: true, message: 'Please enter the vaild email' }]} >
                                                              <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter your Email' />
                                                            </Form.Item>
                                                            {/* Age */}
                                                            <Form.Item name={[field.name, 'age']} rules={[{ required: true, message: 'Please enter the age!' }]} >
                                                              <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter Age' onKeyPress={(e) => {
                                                                if (!/[0-9]/.test(e.key)) {
                                                                  e.preventDefault();
                                                                }
                                                              }
                                                              } />
                                                            </Form.Item>
                                                            {/* Location */}
                                                            <Form.Item name={[field.name, 'location']} rules={[{ required: true, message: 'Please enter the location' }]} >
                                                              <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Location' />
                                                            </Form.Item>
                                                            {/* About You */}
                                                            <Form.Item name={[field.name, 'about']} label={< label > About You[Optional] </label>}>
                                                              < Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Please enter!!!' />
                                                            </Form.Item>

                                                            {/* Upload Material Image */}
                                                            <div className='mt-3' >
                                                              <SectionTitle title='Upload Material' className='sub-title-font-size fw-bold' />
                                                            </div>

                                                            <div>
                                                              <Form.Item shouldUpdate={(prev, curr) => prev?.contestent?.material !== curr?.contestent?.material} className='m-0' >
                                                                {({ getFieldValue }) => {
                                                                  const x = getFieldValue(['contestent', field.name, 'material']);
                                                                  return (
                                                                    <Form.Item className='mb-2' name={[field.name, 'material']} rules={[{ required: true, message: 'Please upload the image' }]} >
                                                                      {/* <Upload
                                                                    customRequest={({ onSuccess }) => onSuccess("ok")}
                                                                    onChange={(info) => {
                                                                      if (info?.fileList[0]?.status === "done") {
                                                                        handleFileUpload(['contestent', index, 'material'], info.fileList);
                                                                      }
                                                                    }}
                                                                    // accept='image/*'
                                                                    listType="picture-card"
                                                                    showUploadList={{ showPreviewIcon: false }}
                                                                  >
                                                                    {x?.fileList?.length ? null : <UploadButtonIcon />}
                                                                  </Upload> */}
                                                                    </Form.Item>
                                                                  )
                                                                }
                                                                }
                                                              </Form.Item>
                                                              < Typography.Paragraph className='mb-3 m-0' > {"[ This could be the Act/Performance/Creation/etc., that voters are to vote on]"} </Typography.Paragraph>
                                                            </div>

                                                            {/* Profile Pic */}
                                                            <div>
                                                              <Form.Item shouldUpdate={(prev, curr) => prev?.contestent?.profile_pic !== curr?.contestent?.profile_pic} className='m-0' >
                                                                {({ getFieldValue }) => {
                                                                  const x = getFieldValue(['contestent', field.name, 'profile_pic']);
                                                                  return (
                                                                    <Form.Item name={[field.name, 'profile_pic']} className='mb-2' label={< label className='text-black primary-font-size' > Upload your image </label>} rules={[{ required: true, message: 'Please upload the image' }]}>
                                                                      {/* <Upload
                                                                    onChange={(info) => {
                                                                      if (info?.fileList[0]?.status === "done") {
                                                                        handleFileUpload(['contestent', index, 'profile_pic'], info.fileList);
                                                                      }
                                                                    }}
                                                                    listType="picture-card"
                                                                    showUploadList={{ showPreviewIcon: false }}
                                                                    // accept='image/*'
                                                                  >
                                                                    {x?.fileList?.length ? null : <UploadButtonIcon />}
                                                                  </Upload> */}
                                                                    </Form.Item>
                                                                  )
                                                                }
                                                                }
                                                              </Form.Item>
                                                              < Typography.Paragraph className='mb-3 m-0' > Upload Contestant picture </Typography.Paragraph>
                                                            </div>

                                                            {/* Video Intro */}
                                                            <div>
                                                              <Form.Item shouldUpdate={(prev, curr) => prev?.contestent?.video_intro !== curr?.contestent?.video_intro} className='m-0' >
                                                                {({ getFieldValue }) => {
                                                                  const x = getFieldValue(['contestent', field.name, 'video_intro']);
                                                                  return (
                                                                    <Form.Item name={[field.name, 'video_intro']} className='mb-2' label={< label className='text-black primary-font-size' > Video Intro </label>} rules={[{ required: true, message: 'Please upload the video' }]}>
                                                                      {/* <Upload
                                                                    customRequest={({ onSuccess }) => onSuccess("ok")}
                                                                    accept="video/mp4,video/*"
                                                                    listType="picture-card"
                                                                    showUploadList={{ showPreviewIcon: false }}
                                                                    onChange={(info) => {
                                                                      if (info?.fileList[0]?.status === "done") {
                                                                        handleFileUpload(['contestent', index, 'video_intro'], info.fileList);
                                                                      }
                                                                    }}
                                                                  >
                                                                    {x?.fileList?.length ? null : <UploadButtonIcon />}
                                                                  </Upload> */}
                                                                    </Form.Item>
                                                                  )
                                                                }}
                                                              </Form.Item>
                                                              < Typography.Paragraph className='mb-3 m-0' > {"[Upload a maximum of one minute video intro about you]"} </Typography.Paragraph>
                                                            </div>

                                                            {/* Social Media */}
                                                            <div>
                                                              <label className='text-black primary-font-size' > Enter Social Media Handles(optional) </label>
                                                              < Form.Item >
                                                                <Form.List name={[field.name, 'social_media']} initialValue={[{}]} >
                                                                  {(subFields, subOpt) => (
                                                                    <>
                                                                      {
                                                                        subFields.map((subField, subIndex) => (
                                                                          <div key={subIndex} >
                                                                            {/* Social Media Handler */}
                                                                            < Form.Item name={[subField.name, 'handle']} >
                                                                              <Select size='large' className='bg-transparent ps-0' placeholder='Enter social media Handles' >
                                                                                <Select.Option value="1" > Facebook </Select.Option>
                                                                                <Select.Option value="2" > YouTube </Select.Option>
                                                                                <Select.Option value="3" > Tiktok </Select.Option>
                                                                                <Select.Option value="4" > URL Link </Select.Option>
                                                                              </Select>
                                                                            </Form.Item>
                                                                            {/* Social Media Link */}
                                                                            < Flex align='start' gap={8} >
                                                                              <Form.Item className='w-100' name={[subField.name, 'link']} >
                                                                                <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter Link here' />
                                                                              </Form.Item>
                                                                              {subIndex > 0 &&
                                                                                <Button icon={< TrashFilled />} danger onClick={() => subOpt.remove(subField.name)} size='large' htmlType='button' type="primary" className='text-white fw-normal' shape='default' > </Button>
                                                                              }
                                                                            </Flex>
                                                                          </div>
                                                                        ))}
                                                                      <div className='text-end' >
                                                                        <Button size='small' htmlType='button' type="default" className='text-black fw-normal' shape='round' onClick={() => subOpt.add()}>
                                                                          + Add More
                                                                        </Button>
                                                                      </div>
                                                                    </>
                                                                  )}
                                                                </Form.List>
                                                              </Form.Item>
                                                            </div>

                                                            < Typography.Paragraph italic className='text-black m-0 mb-3' > {'[ This will help you gain more visibility]'} </Typography.Paragraph>

                                                            {/* Contest Be Watched */}
                                                            <Form.Item name={[field.name, 'contest_be_watched']} rules={[{ required: true, message: 'Please enter the link' }]} >
                                                              <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste the link where your contest material can be viewed/watch i.e., YouTube, Tiktok, url link, etc' />
                                                            </Form.Item>

                                                            {/* Contest Link */}
                                                            <Form.Item name={[field.name, 'contest_link']} rules={[{ required: true, message: 'Please enter the contest link' }]} >
                                                              <Input type='text' size='large' className='bg-transparent ps-0 w-100' placeholder='Paste Link here...' />
                                                            </Form.Item>

                                                            {/* Contest Act */}
                                                            <Flex gap={8} align='start' className='w-100 position-relative' >
                                                              <Form.Item shouldUpdate={(prev, curr) => prev?.contestent?.contest_act !== curr?.contestent?.contest_act} className='m-0 w-100' >
                                                                {({ getFieldValue }) => {
                                                                  const x = getFieldValue(['contestent', field.name, 'contest_act'])?.file_name;
                                                                  return (
                                                                    <Form.Item>
                                                                      <Input type='text' size='large' className='bg-transparent ps-0 flex-grow-1 w-100' placeholder='Upload your contest act here [Optional]' value={x} readOnly disabled />
                                                                    </Form.Item>
                                                                  )
                                                                }}
                                                              </Form.Item>
                                                              < Form.Item name={[field.name, 'contest_act']} >
                                                                {/* <Upload prefixCls='upload-contest-act'
                                                              onChange={(info) => {
                                                                if (info?.fileList[0]?.status === "done") {
                                                                  handleFileUpload(['contestent', index, 'contest_act'], info.fileList);
                                                                }
                                                              }}>
                                                              <Button size='large' htmlType='button' className='border-0 border-bottom border-black rounded-0 bg-transparent' icon={<UploadIcon />}></Button>
                                                            </Upload> */}
                                                              </Form.Item>
                                                            </Flex>
                                                          </div>
                                                        )}
                                                    </div>
                                                  );
                                                })}
                                              <Form.Item>
                                                <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal' shape='round' > + Add More </Button>
                                              </Form.Item>
                                            </>
                                          )
                                          }
                                        </Form.List>
                                      </>
                                    );
                                  }}
                                </Form.Item >
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
                  <div className='mt-3' >
                    <SectionTitle title='Are There Any Prize For Winners?' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  < Form.Item name="is_winner_prize" shouldUpdate={(prev: any, curr: any) => prev.is_winner_prize !== curr.is_winner_prize} className='m-0' >
                    <Radio.Group size='large' >
                      <Radio value={true} className='text-black' > Yes </Radio>
                      < Radio value={false} className='text-black' > No </Radio>
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
                              <div className='mt-3' >
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
                              <Form.Item name="winner_reward_type" rules={[{ required: true, message: 'Please enter the reward description' }]} >
                                <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Enter reward description here...' />
                              </Form.Item>

                              <Typography.Paragraph italic className='text-black m-0 mb-4' > Note: The SEE platform has zero tolerance for defaulting on or falsely mentioning rewards.It is mandatory that all your selected winners receive their prizes.Any confirmed case of non - compliance could lead to the termination of your SEE account and possible penalties.</Typography.Paragraph>


                              {/* State Number of Finalists  */}
                              <div className='my-3' >
                                <SectionTitle title='State Number of Finalists ' className='mb-2 sub-title-font-size fw-bold' />
                                <Typography.Paragraph italic className='text-black m-0' > This is an important field as it will enable our voting Stystem to efficiently put up your finalist according to Number of highest votes </Typography.Paragraph>
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
                                <Form.List name="winner_reward" initialValue={Array.from({ length: 1 }, () => ({}))} >
                                  {(fields, { add, remove }) => (
                                    <>
                                      {
                                        fields.map((field, index) => (
                                          <div key={index} >
                                            {/* label={<label className='text-black primary-font-size fw-bold'>Select Finalists Position</label>} */}
                                            < Form.Item name={[field.name, 'position']} rules={[{ required: true, message: 'Please select the option' }]} >
                                              <Select size='large' className='bg-transparent ps-0' placeholder='Please select position!!!' >
                                                <Select.Option value={Number(1)} > Winner </Select.Option>

                                                {
                                                  [...Array(lastInputValue)].map((_, index) => {
                                                    // console.log(lastInputValue, "lastInputValue");
                                                    return (
                                                      <Select.Option key={index} value={Number(index + 1)
                                                      } > {index + 1} Runner Up </Select.Option>
                                                    )
                                                  })
                                                }


                                              </Select>
                                            </Form.Item>

                                            < Flex className='mb-4' >
                                              <Form.Item className='w-100' name={[field.name, 'reward']} label={< label className='text-black primary-font-size fw-bold' > Specify / Describe Reward(For) </label>} rules={[{ required: true, message: 'Please enter the reward amount' }]}>
                                                < InputNumber size='large' className='bg-transparent ps-0 w-100' placeholder='Enter Amount' onKeyPress={(e) => {
                                                  if (!/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                  }
                                                }} />
                                              </Form.Item>
                                              {
                                                index > 0 &&
                                                <Button icon={
                                                  <TrashFilled />} danger onClick={() => {
                                                    remove(field.name); console.log("field removed", field);

                                                  }
                                                  } size='small' htmlType='button' type="primary" className='text-white fw-normal text-black' shape='default' > </Button>
                                              }
                                            </Flex>
                                          </div>
                                        ))}
                                      <Form.Item>
                                        <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal text-black' shape='round' > + Add More </Button>
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
                  <div className='mt-3' >
                    <SectionTitle title='Contact Details' className='mb-2 sub-title-font-size fw-bold' />
                    <Typography.Paragraph className='text-black m-0' > We will only show this to your winners at the end of the voting period.</Typography.Paragraph>
                  </div>

                  < Row gutter={24} >
                    <Col span={24}>
                      <Form.Item name="full_name" rules={[{ required: true, message: 'Please enter the full name' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='Full Name' />
                      </Form.Item>
                    </Col>
                    < Col span={24} lg={12} >
                      <Form.Item name="email" rules={[{ whitespace: true, type: "email", required: true, message: 'Please enter the valid email' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='Email Address' />
                      </Form.Item>
                    </Col>
                    < Col span={24} lg={12} >
                      <Form.Item name="phone_number" rules={[{ required: true, message: 'Please enter the phone number' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='Phone Number' onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }} />
                      </Form.Item>
                    </Col>
                    < Col span={24} lg={24} >
                      <Form.Item name="full_address" rules={[{ required: true, message: 'Please enter the address' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='Address' ref={(ref) => locationSearchRef.current = ref} />
                      </Form.Item>
                    </Col>
                    < Col span={24} lg={12} xl={8} >
                      <Form.Item name="country" rules={[{ required: true, message: 'Please enter the country' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='Country' />
                      </Form.Item>
                    </Col>
                    < Col span={24} lg={12} xl={8} >
                      <Form.Item name="state" rules={[{ required: true, message: 'Please enter the state' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='State' />
                      </Form.Item>
                    </Col>
                    < Col span={24} lg={12} xl={8} >
                      <Form.Item name="city" rules={[{ required: true, message: 'Please enter the city' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='City' />
                      </Form.Item>
                    </Col>
                    < Col span={24} lg={12} xl={8} >
                      <Form.Item name="postal_code" rules={[{ required: true, message: 'Please enter the postal code' }]} >
                        <Input size='large' className='bg-transparent ps-0' placeholder='Postal Code' />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Are you Rewarding Your Voters? */}
                  <div className='mt-3' >
                    <SectionTitle title='Are you Rewarding Your Voters?' className='mb-2 sub-title-font-size fw-bold' />
                  </div>

                  < Form.Item name="is_voter_prize" rules={[{ required: true, message: 'Please select an option' }]} shouldUpdate={(prev: any, curr: any) => prev.is_voter_prize !== curr.is_voter_prize}>
                    <Radio.Group className='mt-3' size='large' >
                      <Radio value={true} className='text-black' > Yes </Radio>
                      < Radio value={false} className='text-black' > No </Radio>
                    </Radio.Group>
                  </Form.Item>


                  {/* Specify Reward Type */}
                  <div className='mt-3' >
                    <SectionTitle title='Specify Reward Type' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  < Form.Item shouldUpdate={(prev: any, curr: any) => prev.is_voter_prize !== curr.is_voter_prize}>
                    {({ getFieldValue }) => {
                      let val = getFieldValue('is_voter_prize');
                      return (
                        <Fragment>
                          {val &&
                            <Form.List name="voter_reward" initialValue={Array.from({ length: 1 }, () => ({}))} >
                              {(fields, { add, remove }) => (
                                <>
                                  {
                                    fields.map((field, index) => (
                                      <div key={index} >
                                        {
                                          index >= 1 &&
                                          <Divider />
                                        }
                                        < Fragment >
                                          <Form.Item name={[field.name, 'round']} rules={[{ required: true, message: 'Please select the round' }]} >
                                            <Select size='large' className='bg-transparent ps-0' placeholder='Select Round' >
                                              <Select.Option value="1" > 1 Round </Select.Option>
                                              <Select.Option value="2" > 2 Round </Select.Option>
                                              <Select.Option value="3" > 3 Round </Select.Option>
                                              <Select.Option value="4" > 4 Round </Select.Option>
                                            </Select>
                                          </Form.Item>


                                          < Form.Item name={[field.name, 'reward_type']} rules={[{ required: true, message: 'Please enter the reward description' }]} >
                                            <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Enter reward description here...' />
                                          </Form.Item>

                                          < Typography.Paragraph italic className='text-black m-0 mb-4' > Note: The SEE platform has zero tolerance for defaulting on or falsely mentioning rewards.It is mandatory that all your selected winners receive their prizes.Any confirmed case of non - compliance could lead to the termination of your SEE account and possible penalties.</Typography.Paragraph>

                                          < div className='mt-3' >
                                            <SectionTitle title='Number of Voters to Be Selected' className='mb-4 sub-title-font-size fw-bold' />
                                          </div>

                                          {/* number_of_voter */}
                                          <Form.Item name={[field.name, 'no_of_voter']} rules={[{ required: true, message: 'Please enter the no of voter to be selected' }]} >
                                            <Input size='large' className='bg-transparent ps-0' placeholder='Number of Voters to Be Selected' onKeyPress={(e) => {
                                              if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                              }
                                            }
                                            } />
                                          </Form.Item>
                                        </Fragment>

                                        {
                                          index > 0 &&
                                          <Button icon={
                                            <TrashFilled />} danger onClick={() => {
                                              remove(field.name); console.log("field removed", field);

                                            }
                                            } size='small' htmlType='button' type="primary" className='text-white fw-normal text-black mb-5' shape='default' > Delete </Button>
                                        }

                                      </div>
                                    ))}
                                  <Form.Item>
                                    <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal text-black' shape='round' > + Add More </Button>
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
                  <Form.Item name="add_info" >
                    <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Additional Information [Optional]' />
                  </Form.Item>

                  < div className='mt-3' >
                    <SectionTitle title='Consent and Submission' className='mb-4 sub-title-font-size fw-bold' />
                    <Typography.Paragraph className='fw-normal text-black' > I confirm that the information provided is accurate and agree to SEE Ltd.'s terms and conditions for posting auditions. I understand that SEE Ltd. reserves the right to review and approve all audition postings to ensure they meet the platform's standards for quality and safety.</Typography.Paragraph>
                  </div>

                  <Form.Item className='my-4' rules={[{ required: true, message: 'Please check the checkbox' }]} >
                    <Checkbox className='text-black' > I confirm and Consent </Checkbox>
                  </Form.Item>

                  < Flex gap={12} justify={screens.md ? 'end' : 'start'} >
                    <Button size='small' className='rounded-pill px-4 border-black bg-transparent text-black' type='default' > Cancel </Button>
                    < Button size='small' htmlType='submit' loading={formLoading} className='rounded-pill px-4' type='primary' > Submit </Button>
                  </Flex>
                </Form>
              </WrapperElement>
            </Col>
          </Row>
        </div>
      </section>

      {/* Invite Modal */}
      <CommonModal title="Invite Your Participants" isModalOpen={openInviteModal} handleCancel={cancelInviteModal} >
        <WrapperElement>
          <Typography.Title className='fw-semibold primary-font-size m-0 mb-3' > Enter any Specific Information </Typography.Title>
          < Form layout='vertical' className='light_theme_form' onFinish={InviteUser} form={inviteForm} >
            <Form.Item name="invite_info" rules={[{ required: true, message: 'Please enter the invite info' }]} >
              <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Additional/Important Information Here' />
            </Form.Item>
            < Form.Item className='mb-2' name={'invite_from'} label={< label className='fw-semibold primary-font-size' > Invite from: </label>} rules={[{ required: true, message: 'Please select an option' }]}>
              < Radio.Group >
                <Radio value={'Phone'}> Phone Contacts </Radio>
                < Radio value={'Email'} > Email </Radio>
                < Radio value={'Facebook'} > Facebook </Radio>
                < Radio value={'WhatsApp'} > WhatsApp </Radio>
              </Radio.Group>
            </Form.Item>
            < Form.Item name="all_contestent_email" className='mb-2' label={< label className='fw-semibold primary-font-size' > Enter Email & Send </label>}>
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
            < Flex className='mt-3' gap={12} justify={screens.lg ? 'end' : 'start'} >
              <Button size='small' onClick={cancelInviteModal} className='rounded-pill px-4 border-black bg-transparent text-black' type='default' > Cancel </Button>
              < Button size='small' className='rounded-pill px-4 bg-white' htmlType='submit' type='default' > Send </Button>
            </Flex>
          </Form>
        </WrapperElement>
      </CommonModal>

      {/* Invite Success Modal */}
      <CommonModal title="Success!" isModalOpen={openInviteSuccessModal} handleCancel={cancelInviteSuccessModal} >
        <WrapperElement>
          <Typography.Paragraph className='text-black' >
            Hey there! You created a voting page.Remember to enter / update your voting start and end time, update your link where viewers can easily reach new acts / performances / creativity of your contestants.
          </Typography.Paragraph>
          < Flex className='mt-3' gap={12} justify={'center'} >
            {/* <Link href="/contest/1"><Button size='small' className='rounded-pill px-4' type='primary'>View Voting Contest Page</Button></Link> */}
            < Button size='small' className='rounded-pill px-4' type='primary' onClick={cancelInviteSuccessModal} > Go Back on Create Voting </Button>
            {/* <Button size='small' onClick={cancelInviteSuccessModal} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button> */}
          </Flex>
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


EditContest.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default EditContest