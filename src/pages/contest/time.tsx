import SectionTitle from '@/components/common/SectionTitle';
import WrapperElement from '@/components/common/WrapperElement';
import { Col, Form, Input, Row, Upload, Typography, Select, Flex, Checkbox, Grid, Radio, Button, DatePicker, TimePicker, Divider, InputNumber, Space, Alert, } from 'antd';
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
import countryCode from "@/utils/countryCode.json"
import henceforthValidations from '@/utils/henceforthValidations';
import { CloseSquareFilled } from '@ant-design/icons';

const CreateContest = () => {
  const [error, setError] = useState(null);

  // const [routerWarning, setRouterWarning] = useState(false)
  // useBeforeUnSaved(!routerWarning, `/contest/create`)
  const router = useRouter()
  const screens = Grid.useBreakpoint();
  const [round, setRound] = useState(1) as any;
  const [formLoading, setFormLoading] = useState(false)
  const [openInviteModal, setOpenInviteModal] = useState(false)
  const [openInviteSuccessModal, setOpenInviteSuccessModal] = useState(false)
  const { Toast } = useContext(GlobalContext)
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
          form.setFieldValue('full_address', place.formatted_address)
          form.setFieldValue('country', items?.country)
          form.setFieldValue('state', items?.state)
          form.setFieldValue('city', items?.city)
          form.setFieldValue('postal_code', items?.postal_code)
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
    try {
      if (fileList?.length > 0) {
        const file = fileList[0].originFileObj;
        if (file) {
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
      Toast.success('File uploaded successfully');
    } catch (error) {
      Toast.error(error);
    }
  };

  // ************************ Invite Users Emails ************************
  const [userEmailsInvite, setUserEmailsInvite] = useState({
    invite_info: null,
    invite_from: null,
    contestent: []
  }) as any;

  const InviteUser = async (values: any) => {
    interface InviteContestProps {
      contestent_email: string;
      after_filling?: string;
    }

    let arr = {
      contestent: [] as InviteContestProps[]
    };

    const isCreatorFillingForm = form.getFieldValue('filling_any_info');

    const afterFilling = isCreatorFillingForm === FormFillingType.NONE ? form.getFieldValue('after_filling') : form.getFieldValue('contestent')[0]?.after_filling


    for (let index = 0; index < values?.all_contestent_email?.length; index++) {
      let obj = {
        contestent_email: values?.all_contestent_email[index],
        after_filling: afterFilling,
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

  console.log(userEmailsInvite?.contestent, 'userEmailsInvite?.contestent');

  // ************************ Create Contest API Call ************************
  const onFinish = async (values: any) => {
    console.log(values, "values?.contest_act");
    let payLoad = {
      title: values?.title,
      cover_media_type: form.getFieldValue('cover_media_type'),
      cover_media: values?.cover_media?.fileList[0]?.name,
      contest_act: values?.contest_act?.fileList[0]?.name,
      contest_be_watched: values?.contest_be_watched,
      contest_link: values?.contest_link,
      vote_type: values?.vote_type,
      cost_per_vote: values?.cost_per_vote ? Number(values?.cost_per_vote) : null,
      number_of_time_vote: Number(values?.number_of_time_vote),
      total_contestent: Number(values?.total_contestent),
      is_contestent_pic_reveal: values?.is_contestent_pic_reveal,
      filling_any_info: values?.filling_any_info,
      contestent: values?.contestent,
      // "total_winners": "string",
      // after_filling_fields: values?.after_filling_fields || null,
      is_winner_prize: values?.is_winner_prize,
      // winner_reward_type: values?.winner_reward_type,
      // winner_reward: values?.winner_reward,
      full_name: values?.full_name,
      email: values?.email,
      full_address: values?.full_address,
      phone_number: Number(values?.phone_number),
      country_code: String(values?.country_code),
      country: values?.country,
      state: values?.state,
      city: values?.city,
      postal_code: values?.postal_code,
      is_voter_prize: values?.is_voter_prize,
      voter_reward: values?.voter_reward ? values?.voter_reward : null,
      add_info: values?.add_info
    } as any;


    if (values?.is_winner_prize) {
      payLoad['winner_reward_type'] = values?.winner_reward_type;
      payLoad['winner_reward'] = values?.winner_reward;
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
        round: index + 1,
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



    const contestentArray: any[] = [];
    if (values?.contestent?.length) {
      let data = values.contestent.filter((res) => res.contestent_name !== undefined);

      console.log(values.contestent);

      for (let a = 0; a < data.length; a++) {
        let contestentObj: any = {
          is_creator_filling: data[a].is_creator_filling,
          after_filling: AfterFillingFields.SUBMIT,
          contestent_email: data[a].contestent_email,
          contestent_name: data[a].contestent_name,
          age: Number(data[a].age),
          location: data[a].location,
          about: data[a].about,
          material: data[a].material?.fileList[0]?.name,
          profile_pic: data[a].profile_pic?.fileList[0]?.name,
          video_intro: data[a].video_intro?.fileList[0]?.name,
          contest_act: data[a].contest_act?.fileList[0]?.name,
          social_media: data[a].social_media?.map((media: any) => ({
            type: media?.type,
            url: media?.url,
          })),
          contest_be_watched: data[a].contest_be_watched,
          contest_link: data[a].contest_link,
        };

        contestentArray.push(contestentObj);
      }
    }

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
      payLoad['contestent'] = contestentArray;
    }

    console.log(contestentArray, "contestentArray");
    console.log(payLoad, "payLoad__________");




    console.log(payLoad?.contestent?.length, Number(values?.total_contestent));

    if (payLoad?.contestent?.length > Number(values?.total_contestent)) {
      Toast.warn("Maximun limit reached")
      return
    }

    if (payLoad?.contestent?.length !== Number(values?.total_contestent)) {
      Toast.warn("Please fill the form for all contestants.")
      return
    }



    // return
    try {
      setFormLoading(true);
      const apiRes = await henceforthApi.Contest.create(payLoad);
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


  useEffect(() => {
    const fieldsToReset = [];
    for (let i = 0; i < numberOfInputs; i++) {
      fieldsToReset.push(['start_date', i], ['start_time', i], ['end_date', i], ['end_time', i]);
    }
    form.resetFields(fieldsToReset);
  }, [numberOfInputs]);



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
  const [lastInputValue, setLastInputValue] = useState<number>();

  const renderContestantNumberInputs = () => {
    const input = [] as any;
    for (let i = 0; i < numberOfInputs; i++) {
      input.push(
        <Col span={24} md={12} lg={8} xl={6} key={i}>
          <Form.Item name={["next_round_contestent", i]} dependencies={['total_contestent']}
            rules={[
              { required: true, message: `Please enter the contestants for round ${i + 1}` },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const totalContentest = getFieldValue('total_contestent');

                  if (totalContentest <= value && i === 0) {
                    return Promise.reject(new Error('Contestants passed in first round should be less than total contestants.'));
                  }

                  if (value < 1) {
                    return Promise.reject(new Error('Contestants should be more than 0.'));
                  }
                  if (i > 0 && value >= getFieldValue(["next_round_contestent", i - 1])) {
                    return Promise.reject(new Error(`The number of contestants for round ${i + 1} should be less than round ${i}.`));
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
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


  // ************************ Time and Date Inputs for Round ************************
  const renderTimeDateForRound = () => {


    const disableStartDate = (current, roundIndex) => {
      if (roundIndex > 0) {
        const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);
        return current && current.isBefore(dayjs(prevRoundEndDate).startOf('day'));
      }
      return current && current.isBefore(dayjs().subtract(1, 'day'));
    };

    const disableEndDate = (current, roundIndex) => {
      const startValue = form.getFieldValue(['rounds', roundIndex, 'start_date']);
      if (roundIndex > 0) {
        const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);
        return (
          current &&
          (current.isBefore(dayjs(startValue).startOf('day')) ||
            current.isBefore(dayjs(prevRoundEndDate).startOf('day')))
        );
      }
      return current && current.isBefore(dayjs(startValue).startOf('day'));
    };

    const disableHoursUntilCurrent = (selectedDate, roundIndex) => {
      const currentHour = dayjs().hour();
      const disabledHours = [];

      if (selectedDate && selectedDate.isSame(dayjs(), 'day')) {
        for (let hour = 0; hour < currentHour; hour++) {
          disabledHours.push(hour);
        }
      }

      if (roundIndex > 0) {
        const prevRoundEndTime = form.getFieldValue(['rounds', roundIndex - 1, 'end_time']);
        const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);

        if (selectedDate && selectedDate.isSame(prevRoundEndDate, 'day')) {
          const prevEndHour = dayjs(prevRoundEndTime).hour();
          for (let hour = 0; hour < prevEndHour; hour++) {
            disabledHours.push(hour);
          }
        }
      }

      return disabledHours;
    };

    const validateTimeRange = (_, values, roundIndex) => {
      const { start_date, start_time, end_date, end_time } = values;

      if (start_date && start_time && end_date && end_time) {
        const startTime = dayjs(`${start_date.format('YYYY-MM-DD')} ${start_time.format('HH:mm')}`);
        const endTime = dayjs(`${end_date.format('YYYY-MM-DD')} ${end_time.format('HH:mm')}`);

        if (endTime.isBefore(startTime)) {
          return Promise.reject(new Error('End time must be after start time'));
        }

        if (endTime.isSame(startTime)) {
          return Promise.reject(new Error('End time must be different from start time'));
        }

        if (roundIndex > 0) {
          const prevRoundEndTime = form.getFieldValue(['rounds', roundIndex - 1, 'end_time']);
          const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);

          if (start_date.isSame(prevRoundEndDate, 'day')) {
            const prevEndTime = dayjs(`${prevRoundEndDate.format('YYYY-MM-DD')} ${prevRoundEndTime.format('HH:mm')}`);

            if (startTime.isBefore(prevEndTime)) {
              return Promise.reject(new Error('Start time of the round must be after the end time of the previous round'));
            }
          }
        }
      }

      return Promise.resolve();
    };

    let inputs = [];

    for (let i = 0; i < numberOfInputs; i++) {
      inputs.push(
        <Col span={24} sm={12} md={12} lg={12} xl={11} xxl={11} key={i}>
          <label className='fw-bold text-black primary-font-size mb-3'>Round {i + 1}</label>
          <Row gutter={[24, 12]}>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item
                className='w-100 m-0'
                name={['rounds', i, 'start_date']}
                rules={[{ required: true, message: `Please enter the start date for round ${i + 1}` }]}
              >
                <DatePicker
                  disabledDate={(current) => disableStartDate(current, i)}
                  type='text'
                  size='large'
                  className='bg-transparent ps-0 w-100'
                  placeholder='Start Date'
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item
                className='w-100 m-0'
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.rounds?.[i]?.start_date !== currentValues.rounds?.[i]?.start_date
                }
              >
                {({ getFieldValue }) => {
                  const selectedDate = getFieldValue(['rounds', i, 'start_date']);
                  return (
                    <Form.Item
                      name={['rounds', i, 'start_time']}
                      rules={[
                        { required: true, message: `Please enter the start time for round ${i + 1}` },
                        { validator: (_, value) => validateTimeRange(_, { start_date: selectedDate, start_time: value, end_time: form.getFieldValue(['rounds', i, 'end_time']) }, i) },
                      ]}
                    >
                      <TimePicker
                        format='HH'
                        disabledHours={() => disableHoursUntilCurrent(selectedDate, i)}
                        size='large'
                        hideDisabledOptions
                        className='bg-transparent ps-0 w-100'
                        placeholder='Start Time'
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item
                className='w-100 m-0'
                name={['rounds', i, 'end_date']}
                rules={[{ required: true, message: `Please enter the end date for round ${i + 1}` }]}
              >
                <DatePicker
                  disabledDate={(current) => disableEndDate(current, i)}
                  type='text'
                  size='large'
                  className='bg-transparent ps-0 w-100'
                  placeholder='End Date'
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item
                className='w-100 m-0'
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.rounds?.[i]?.end_date !== currentValues.rounds?.[i]?.end_date
                }
              >
                {({ getFieldValue }) => {
                  const selectedDate = getFieldValue(['rounds', i, 'end_date']);
                  return (
                    <Form.Item
                      className='w-100'
                      name={['rounds', i, 'end_time']}
                      rules={[
                        { required: true, message: `Please enter the end time for round ${i + 1}` },
                        { validator: (_, value) => validateTimeRange(_, { start_date: form.getFieldValue(['rounds', i, 'start_date']), start_time: form.getFieldValue(['rounds', i, 'start_time']), end_date: selectedDate, end_time: value }, i) },
                      ]}
                    >
                      <TimePicker
                        format='HH'
                        disabledHours={() => disableHoursUntilCurrent(selectedDate, i)}
                        size='large'
                        hideDisabledOptions
                        className='bg-transparent ps-0 w-100'
                        placeholder='End Time'
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </Col>
      );
    }

    return inputs;
  };





  // ************************ Set Fields Values ************************
  React.useEffect(() => {
    const initialContestentValues = Array.from({ length: 1 }, () => ({
      is_creator_filling: true,
      // after_filling: AfterFillingFields.REVIEW,
    }));

    form.setFieldsValue({
      filling_any_info: FormFillingType.SOME,
      contestent: initialContestentValues,
      is_contestent_pic_reveal: true,
      vote_type: VoteType.FREE,
      is_winner_prize: false,
      is_voter_prize: true,
    });

    inviteForm.setFieldsValue({
      invite_from: 'Email',
    });
  }, [form, inviteForm]);

  const [selectedOptions, setSelectedOptions] = useState([] as any);
  console.log(selectedOptions, "selectedOptions")

  const handleSelectChange = (value: any, index: any) => {
    // Update selected options
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[index] = value;
    setSelectedOptions(newSelectedOptions);
  };
  const handleDelete = (index) => {
    // Remove the selected option and update the state
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions.splice(index, 1);
    setSelectedOptions(newSelectedOptions);
  };

  const [selectedOptions1, setSelectedOptions1] = useState([] as any);
  console.log(selectedOptions, "selectedOptions")

  const handleSelectChange1 = (value: any, index: any) => {
    // Update selected options
    const newSelectedOptions1 = [...selectedOptions1];
    newSelectedOptions1[index] = value;
    setSelectedOptions1(newSelectedOptions1);
  };
  const handleDelete1 = (index) => {

    // Remove the selected option and update the state
    const newSelectedOptions1 = [...selectedOptions1];
    newSelectedOptions1.splice(index, 1);
    setSelectedOptions1(newSelectedOptions1);
  };


  ;


  return (
    <>
      <section className='py-md-5 py-4'>
        <div className="container">
          <Row>
            <Col span={24}>
              <WrapperElement>
                <SectionTitle title='Create Voting For Your Contest' className='mb-4' />
                <Form initialValues={{ contestent: { is_creator_filling: true } }} className='light_theme_form' form={form} layout='vertical' onFinish={onFinish} onFinishFailed={(errorInfo: any) => { console.log("Failed:", errorInfo); setError(errorInfo) }}>
                  {/* Contest Title */}
                  <Form.Item name="title" rules={[{
                    required: true,
                    message: 'Please enter the contest title!'
                  }]}>
                    <Input
                      type='text' size='large' className='bg-transparent ps-0'
                      placeholder='Title of Your Contest' />
                  </Form.Item>
                  {/* Cover Media */}
                  <div className='mb-3'>
                    <Form.Item shouldUpdate={(prev: any, curr: any) => prev.cover_media !== curr.cover_media} className='m-0'>
                      {
                        ({ getFieldValue }) => {
                          let file = getFieldValue('cover_media');
                          const fileList = file?.fileList || []
                          return (
                            <Form.Item name="cover_media" className='m-0' rules={[{ required: true, message: 'Please upload cover media!' }]}>
                              <Upload
                                customRequest={({ onSuccess }: any) =>
                                  onSuccess("ok")
                                }
                                // accept='image/*'
                                showUploadList={{
                                  showPreviewIcon: false
                                }}
                                listType="picture-card"
                                fileList={fileList || []}
                                onChange={(info) => {
                                  if (info?.fileList[0]?.status === "done") {
                                    handleFileUpload('cover_media', info.fileList, true, 'cover_media_type');
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
                    <Typography.Paragraph className='mt-2 m-0'>Upload your contest cover media</Typography.Paragraph>
                  </div>

                  {/* Contest Act */}
                  <div>
                    <Form.Item shouldUpdate={(prev: any, curr: any) => prev.contest_act !== curr.contest_act} className='m-0'>
                      {
                        ({ getFieldValue }) => {
                          let file = getFieldValue('contest_act');
                          const fileList = file?.fileList || []
                          // console.log(file?.fileList, 'contest_act');
                          return (
                            <Form.Item name="contest_act" className='m-0' label={<label className='fw-semibold text-black primary-font-size'>Upload Your Contest Acts/Performance/Creation/Display/Others [Optional]</label>
                            }>
                              <Upload
                                customRequest={({ onSuccess }: any) =>
                                  onSuccess("ok")
                                }
                                // accept='image/*'
                                showUploadList={{ showPreviewIcon: false }}
                                listType="picture-card"
                                fileList={fileList || []}
                                onChange={(info) => {
                                  if (info?.fileList[0]?.status === "done") {
                                    handleFileUpload('contest_act', info.fileList)
                                  }
                                }}
                              >
                                {fileList.length >= 1 ? null : <UploadButtonIcon />}
                              </Upload>
                            </Form.Item>)
                        }}
                    </Form.Item>
                    <Typography.Paragraph className='mt-2 m-0'> This field is optional as long as your audience knows where to find and watch/view your contest material</Typography.Paragraph>
                  </div>

                  {/* Contest Be Watched */}
                  <Form.Item name="contest_be_watched" rules={[{ required: true, message: 'Please select option for contest be watched!' }]}>
                    <Select size='large' className='bg-transparent ps-0' placeholder='Where can your contest be watched/Viewed?   i.e., YouTube, Tiktok, url link, etc'>
                      <Select.Option value={ContestPlatform.YOUTUBE}>{ContestPlatform.YOUTUBE}</Select.Option>
                      <Select.Option value={ContestPlatform.FACEBOOK}>{ContestPlatform.FACEBOOK}</Select.Option>
                      <Select.Option value={ContestPlatform.THROWTECH}>{ContestPlatform.THROWTECH}</Select.Option>
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
                  <Form.Item
                    label={<label className='fw-semibold text-black primary-font-size'>Please state how many number of rounds in all</label>}
                    name="rounds_number"
                    rules={[
                      { required: true, message: 'Please enter rounds!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value && value <= 0) {
                            return Promise.reject(new Error('Round cannot be zero.'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input
                      size='large'
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className='bg-transparent ps-0'
                      placeholder='Please enter rounds!!!'
                      onChange={(e) => setRound(e.target.value)}
                    />
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

                  {/* Next Round Contestent */}
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.next_round_contestent?.[0] !== curr?.next_round_contestent?.[0]} className='m-0'>
                    {
                      ({ getFieldValue }) => {
                        const firstRoundContestant = getFieldValue(["next_round_contestent", 0]);
                        console.log(firstRoundContestant, "xxxxxxxxxxxxxxxxxxxxx");
                        return (
                          <Form.Item name="total_contestent" label={<label className='fw-bold text-black primary-font-size mb-3'>Specify Total Number Of Contestants</label>} rules={[
                            { required: true, message: 'Please enter the number of contestants!' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value <= firstRoundContestant) {
                                  return Promise.reject(new Error(`Total number of contestants must be greater than contestants that are pass to the first round.`));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}>
                            <Input type='text' size='large' onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }} className='bg-transparent ps-0' placeholder='Please enter number of contestant' />
                          </Form.Item>
                        )
                      }
                    }
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


                  {/* What Should participants do after filling the fields? */}
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev.filling_any_info !== curr.filling_any_info}>
                    {({ getFieldValue }) => {
                      let val = getFieldValue('filling_any_info');
                      return (
                        <>
                          {val === FormFillingType.NONE &&
                            <>
                              {/* {participant} */}
                              <Form.Item shouldUpdate={(prev, curr) => prev?.after_filling !== curr?.after_filling}>
                                {({ getFieldValue }) => {
                                  let x = getFieldValue('after_filling');
                                  console.log(x, 'xxxxxxx');
                                  return (
                                    <>
                                      <Form.Item name="after_filling" label={<label className='fw-bold text-black primary-font-size mb-2'>What Should participants do after filling the fields?</label>}>
                                        <Radio.Group className='mb-2'>
                                          <Radio value={AfterFillingFields.REVIEW} className='text-black'>Send To Me For Review and Submission</Radio>
                                          <Radio value={AfterFillingFields.SUBMIT} className='text-black'>Participant Can Submit Directly</Radio>
                                        </Radio.Group >
                                      </Form.Item>
                                      <Button size='small' htmlType='button' type="default" onClick={showInviteModal} className='text-black fw-normal text-black mb-4' shape='round'>Invite Your Participants To Fill The Fields</Button>
                                    </>
                                  )
                                }}
                              </Form.Item>
                            </>
                          }

                          {val === FormFillingType.SOME &&
                            <>
                              {/* Some: Who Should Fill the Forms: Participants & Me */}
                              <div className='mb-4'>
                                <Form.Item shouldUpdate={(prev, curr) => prev.contestent !== curr.contestent}>
                                  {({ getFieldValue }) => {
                                    const contestants = getFieldValue('contestent') || [];
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

                                                    <Form.Item name={[field.name, 'is_creator_filling']} label={<label className='fw-bold text-black primary-font-size mb-2'>Who Should Fill the Forms</label>} rules={[{ required: true, message: 'Please select an option!' }]} initialValue={false}>
                                                      <Radio.Group>
                                                        <Radio value={true} className='text-black'>Me</Radio>
                                                        <Radio value={false} className='text-black'>Participants</Radio>
                                                      </Radio.Group>
                                                    </Form.Item>


                                                    {!isCreatorFilling && (
                                                      <>

                                                        <Form.Item name={[field.name, 'after_filling']} label={<label className='fw-bold text-black primary-font-size mb-2'>What Should participants do after filling the fields?</label>} rules={[{ required: true, message: 'Please select an option!' }]}>
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
                                                        <Form.Item
                                                          name={[field.name, 'contestent_name']}
                                                          rules={[
                                                            { required: true, message: 'Please enter the full name' },
                                                            ({ getFieldValue }) => ({
                                                              validator(_, value) {
                                                                if (value && !henceforthValidations.nameValidation(value)) {
                                                                  return Promise.reject(new Error('Name should contain alphabets only. For example, John Doe'));
                                                                }
                                                                return Promise.resolve();
                                                              },
                                                            }),
                                                          ]}
                                                        >
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter your full name' />
                                                        </Form.Item>

                                                        {/* Email */}
                                                        <Form.Item name={[field.name, 'contestent_email']} rules={[{ whitespace: true, type: "email", required: true, message: 'Please enter the vaild email' }]}>
                                                          <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter your Email' />
                                                        </Form.Item>
                                                        {/* Age */}
                                                        <Form.Item name={[field.name, 'age']} rules={[
                                                          { required: true, message: 'Please enter the age!' },
                                                          ({ getFieldValue }) => ({
                                                            validator(_, value) {
                                                              if (value && value < 16) {
                                                                return Promise.reject(new Error('Minimum age should be 16.'));
                                                              }
                                                              return Promise.resolve();
                                                            },
                                                          }),
                                                        ]}
                                                        >
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
                                                        <Form.Item name={[field.name, 'about']} label={<label>About You [Optional]</label>}>
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
                                                                const file = getFieldValue(['contestent', field.name, 'material']);
                                                                const fileList = file?.fileList || []

                                                                return (
                                                                  <Form.Item className='mb-2' name={[field.name, 'material']} rules={[{ required: true, message: 'Please upload the image' }]}>
                                                                    <>
                                                                      <Upload
                                                                        customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                                                        fileList={fileList || []}
                                                                        onChange={(info) => {
                                                                          if (info?.fileList[0]?.status === "done") {
                                                                            handleFileUpload(['contestent', index, 'material'], info.fileList);
                                                                          }
                                                                        }}
                                                                        // accept='image/*'
                                                                        listType="picture-card"
                                                                        showUploadList={{
                                                                          showPreviewIcon: false
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
                                                          </Form.Item>


                                                          <Typography.Paragraph className='mb-3 m-0'>{"[ This could be the Act/Performance/Creation/etc., that voters are to vote on]"}</Typography.Paragraph>
                                                        </div>

                                                        {/* Profile Pic */}
                                                        <div>

                                                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.profile_pic !== curr?.contestent?.profile_pic} className='m-0'>
                                                            {
                                                              ({ getFieldValue }) => {
                                                                const file = getFieldValue(['contestent', field.name, 'profile_pic']);
                                                                const fileList = file?.fileList || []

                                                                return (
                                                                  <Form.Item className='mb-2' name={[field.name, 'profile_pic']} rules={[{ required: true, message: 'Please upload the profile pic' }]}>
                                                                    <>
                                                                      <Upload
                                                                        customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                                                        onChange={(info) => {
                                                                          if (info?.fileList[0]?.status === "done") {
                                                                            handleFileUpload(['contestent', index, 'profile_pic'], info.fileList);
                                                                          }
                                                                        }}
                                                                        // accept='image/*'
                                                                        fileList={fileList || []}
                                                                        listType="picture-card"
                                                                        showUploadList={{
                                                                          showPreviewIcon: false
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
                                                          </Form.Item>


                                                          <Typography.Paragraph className='mb-3 m-0'>Upload Contestant picture</Typography.Paragraph>
                                                        </div>

                                                        {/* Video Intro */}
                                                        <div>

                                                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.video_intro !== curr?.contestent?.video_intro} className='m-0'>
                                                            {
                                                              ({ getFieldValue }) => {
                                                                const file = getFieldValue(['contestent', field.name, 'video_intro']);
                                                                const fileList = file?.fileList || []

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
                                                          </Form.Item>

                                                          <Typography.Paragraph className='mb-3 m-0'>{"[Upload a maximum of one minute video intro about you]"}</Typography.Paragraph>
                                                        </div>

                                                        {/* Social Media */}
                                                        <div>
                                                          <label className='text-black primary-font-size'>Enter Social Media Handles (optional)</label>
                                                          <Form.Item>
                                                            <Form.List name={[field.name, 'social_media']} initialValue={[{}]}>
                                                              {(subFields, subOpt) => (
                                                                <Fragment>
                                                                  {subFields.map((subField, subIndex) => (
                                                                    <div key={subIndex}>
                                                                      {/* Social Media Handler */}
                                                                      <Form.Item name={[subField.name, 'type']}>
                                                                        <Select size='large' className='bg-transparent ps-0' placeholder='Enter social media Handles'>
                                                                          <Select.Option value="1">Facebook</Select.Option>
                                                                          <Select.Option value="2">YouTube</Select.Option>
                                                                          <Select.Option value="3">Tiktok</Select.Option>
                                                                          <Select.Option value="4">URL Link</Select.Option>
                                                                        </Select>
                                                                      </Form.Item>
                                                                      {/* Social Media Link */}
                                                                      <Flex align='start' gap={8}>
                                                                        <Form.Item className='w-100' name={[subField.name, 'url']}>
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
                                                          <Input type='text' size='large' className='bg-transparent ps-0 w-100' placeholder='Paste Link here...' />
                                                        </Form.Item>

                                                        {/* Contest Act */}
                                                        <Flex gap={8} align='start' className='w-100 position-relative'>
                                                          <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.contest_act !== curr?.contestent?.contest_act} className='m-0 w-100'>
                                                            {
                                                              ({ getFieldValue }) => {

                                                                const file = getFieldValue(['contestent', field.name, 'contest_act']);
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
                                                          <Form.Item name={[field.name, 'contest_act']}>
                                                            <Upload prefixCls='upload-contest-act'
                                                              onChange={(info) => {
                                                                if (info?.fileList[0]?.status === "done") {
                                                                  handleFileUpload(['contestent', index, 'contest_act'], info?.fileList);
                                                                }
                                                              }}>
                                                              <Button size='large' htmlType='button' className='border-0 border-bottom border-black rounded-0 bg-transparent' icon={<UploadIcon />}></Button>
                                                            </Upload>
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

                  {userEmailsInvite?.contestent.length > 0 &&
                    <div className='mb-4'>
                      <SectionTitle title='Invited Contestants' className='mb-3 sub-title-font-size fw-bold' />
                      <ul>
                        {userEmailsInvite?.contestent.map((res, index) => {

                          console.log(res);

                          return (
                            <li key={index}>
                              <Flex gap={4} align='center'>
                                <span>{res?.contestent_email}</span>
                                <Button size='small' type='text' danger icon={<TrashFilled />} onClick={() => {
                                  setUserEmailsInvite((prev) => {
                                    const newContestent = [...prev.contestent];
                                    newContestent.splice(index, 1);
                                    return { ...prev, contestent: newContestent }
                                  })
                                }}>
                                </Button>
                              </Flex>
                            </li>
                          )
                        })}
                      </ul>
                    </div>}



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
                                            <Select
                                              onChange={(value) => handleSelectChange1(value, index)}
                                              popupMatchSelectWidth={true} size='large' className='bg-transparent ps-0' placeholder='Please select position!!!'>
                                              {
                                                [...Array(lastInputValue)].map((_, index) => {
                                                  return (
                                                    <Select.Option
                                                      disabled={selectedOptions1.includes(Number(index + 1))}
                                                      key={index} value={Number(index + 1)}> {(index != 0) ? `${index} Runner Up` : "Winner"}</Select.Option>
                                                  )
                                                })
                                              }
                                            </Select>
                                          </Form.Item>

                                          <Flex className='mb-4'>
                                            <Form.Item className='w-100' name={[field.name, 'prize']} label={<label className='text-black primary-font-size fw-bold'>Specify / Describe Reward
                                              {/* (For) */}
                                            </label>}
                                              rules={[
                                                { required: true, message: 'Please enter the reward amount' },
                                                ({ getFieldValue }) => ({
                                                  validator(_, value) {
                                                    if (value !== undefined && value <= 0) {
                                                      return Promise.reject(new Error('Reward amount must be greater than zero.'));
                                                    }
                                                    return Promise.resolve();
                                                  },
                                                }),
                                              ]}
                                            >
                                              <InputNumber size='large' className='bg-transparent ps-0 w-100' placeholder='Enter Amount' onKeyPress={(e) => {
                                                if (!/[0-9]/.test(e.key)) {
                                                  e.preventDefault();
                                                }
                                              }} />
                                            </Form.Item>
                                            {
                                              index > 0 &&
                                              <Button icon={<TrashFilled />} danger onClick={() => {
                                                {
                                                  handleDelete1(index)
                                                  remove(field.name); console.log("field removed", field);

                                                }

                                              }} size='small' htmlType='button' type="primary" className='text-white fw-normal text-black' shape='default'></Button>
                                            }
                                          </Flex>
                                        </div>
                                      ))}

                                      {fields?.length < lastInputValue ?
                                        <Form.Item>
                                          <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal text-black' shape='round'>+ Add More</Button>
                                        </Form.Item> : ""}
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
                    <Typography.Paragraph className='text-black m-0 mb-3'>We will only show this to your winners at the end of the voting period.</Typography.Paragraph>
                  </div>

                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item name="full_name" rules={[{ required: true, message: 'Please enter the full name' }, ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value && !henceforthValidations.nameValidation(getFieldValue('full_name'))) {
                            return Promise.reject(new Error(`Name should conatins alphabets only. for eg - John Doe`));
                          } else {
                            return Promise.resolve();
                          }
                        },
                      })]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Full Name' />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={9}>
                      <Form.Item name="email" rules={[{ whitespace: true, type: "email", required: true, message: 'Please enter the valid email' }]}>
                        <Input size='large' className='bg-transparent ps-0' placeholder='Email Address' />
                      </Form.Item>
                    </Col>
                    <Col span={24} lg={15}>
                      <Space.Compact className='w-100 gap-3'>
                        <Form.Item className='flex-shrink-0' name="country_code" rules={[{ required: true, message: 'Please select country code!' }]}>
                          <Select placeholder='Country Code' prefixCls='country-code-field' style={{ minWidth: 140, width: "100%" }} showSearch>
                            {
                              countryCode?.map((res) => {
                                return (
                                  <Select.Option key={res?.dial_code} value={res.dial_code}>{res?.flag} {res?.dial_code}</Select.Option>
                                )
                              })
                            }
                          </Select>
                        </Form.Item>
                        <Form.Item name="phone_number" className='w-100' rules={[{ required: true, message: 'Please enter the phone number' }]}>
                          <Input size='large' className='bg-transparent ps-0 w-100' placeholder='Phone Number' onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }} />
                        </Form.Item>
                      </Space.Compact>
                    </Col>
                    <Col span={24} lg={24}>
                      <Form.Item name="full_address" rules={[{ required: true, message: 'Please enter the address' }]}>
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
                                      {/* {
                                        index >= 1 &&
                                        <Divider />
                                      } */}
                                      {/* <Divider orientation='left' orientationMargin={0} className='my-2 fw-bold mt-4'>For Round {index + 1}</Divider> */}
                                      <Fragment>
                                        <Form.Item name={[field.name, 'round']} rules={[{ required: true, message: 'Please select the round' }]}>
                                          <Select onChange={(value) => handleSelectChange(value, index)} popupMatchSelectWidth={true} size='large' className='bg-transparent ps-0' placeholder='Select Round'>
                                            {
                                              Array.from({ length: numberOfInputs }).map((_, index) => {
                                                return (
                                                  <>
                                                    <Select.Option disabled={selectedOptions.includes(Number(index + 1))} value={index + 1}>{index + 1} Round</Select.Option>
                                                  </>
                                                )
                                              })
                                            }


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
                                        <Form.Item name={[field.name, 'no_of_voter']}

                                          rules={[
                                            { type: "number", required: true, message: 'Please enter the no of voter to be selected' },
                                            ({ getFieldValue }) => ({
                                              validator(_, value) {
                                                if (value !== undefined && value <= 0) {
                                                  return Promise.reject(new Error('voters cannot be zero.'));
                                                }
                                                return Promise.resolve();
                                              },
                                            }),
                                          ]}
                                        >
                                          <InputNumber size='large' className='bg-transparent ps-0 w-100' placeholder='Number of Voters to Be Selected' onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                              e.preventDefault();
                                            }
                                          }} />
                                        </Form.Item>
                                      </Fragment>

                                      {
                                        index > 0 &&
                                        <Button icon={<TrashFilled />} danger onClick={() => {
                                          {
                                            handleDelete(index)
                                            remove(field.name); console.log("field removed", field);
                                          }
                                        }} size='small' htmlType='button' type="primary" className='text-white fw-normal text-black mb-5' shape='default'>Delete</Button>
                                      }

                                    </div>
                                  ))}
                                  {fields?.length < numberOfInputs ?
                                    <Form.Item>

                                      <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal text-black' shape='round'>+ Add More</Button>
                                    </Form.Item> : ""}
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

                  <Form.Item className='my-4' valuePropName="checked" name={'confirm_check'} rules={[{
                    required: true, validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Please check the checkbox.'))
                  }]}>
                    <Checkbox className='text-black' onChange={(e) => { console.log(e?.target?.checked) }}>I confirm and Consent</Checkbox>
                  </Form.Item>

                  {error?.errorFields &&
                    <div className='my-3'>
                      <Alert
                        message="Please Filled there fields!!"
                        description={error?.errorFields?.flatMap((obj: any) => <p className='m-0 mb-1 text-danger'>{obj?.errors}</p>
                        )}
                        type="error"
                        closable={{
                          'aria-label': 'close',
                          closeIcon: <CloseSquareFilled />,
                        }}
                        onClose={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => console.log(e, 'I was closed.')}
                      />
                    </div>
                  }

                  <Flex gap={12} justify={screens.md ? 'end' : 'start'}>
                    <Button size='small' className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button>
                    <Button size='small' htmlType='submit' loading={formLoading} className='rounded-pill px-4' type='primary'>Submit</Button>
                  </Flex>
                  <div>

                  </div>
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