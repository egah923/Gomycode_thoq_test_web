import SectionTitle from '@/components/common/SectionTitle';
import WrapperElement from '@/components/common/WrapperElement';
import { Col, Form, Input, Row, Upload, Typography, Select, Flex, Checkbox, Grid, Radio, Button, DatePicker, TimePicker, Divider, InputNumber, Space, Alert, Spin, } from 'antd';
import React, { Fragment, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import UploadButtonIcon from '@/components/UploadButtonIcon';
import UploadIcon from '@/components/Icons/UploadIcon';
import CommonModal from '@/components/common/CommonModal';
import TrashFilled from '@/components/Icons/TrashFilled';
import dayjs from 'dayjs';
import henceforthApi from '@/utils/henceforthApi';
import { GlobalContext } from '@/context/Provider';
// import { useBeforeUnSaved } from '@/utils/CommonFunctions';
import { AfterFillingFields, ContestPlatform, FormFillingType, VoteType } from '@/utils/henceforthEnums';
import { useRouter } from 'next/router';
import RootLayout from '@/layouts/RootLayout';
import countryCode from "@/utils/countryCode.json"
import henceforthValidations from '@/utils/henceforthValidations';
import { CloseSquareFilled } from '@ant-design/icons';
import Link from 'next/link';
import Head from 'next/head';
import FormCommonCard from '@/components/FormCommonCard';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import moment from 'moment-timezone';
import { GetServerSideProps } from 'next';

dayjs.extend(utc);
dayjs.extend(timezone);

const CompleteDraft = (props: any) => {
  // const timezones = moment.tz.names();
  const [error, setError] = useState(null);
  const [fillingType, setFillingType] = useState(null) as any;
  // const [routerWarning, setRouterWarning] = useState(false)
  // useBeforeUnSaved(!routerWarning, `/contest/create`)
  const router = useRouter()
  const screens = Grid.useBreakpoint();
  const [round, setRound] = useState(props?.rounds?.length || 1) as any;
  const [formLoading, setFormLoading] = useState(false)
  const { Toast } = useContext(GlobalContext)
  const locationSearchRef = React.useRef(null as any)
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [uploadLoading, setUploadLoading] = useState(false as any)
  const [totalContestent, setTotalContestent] = useState(props?.total_contestent || 1)
  const timezones = moment.tz.names();
  const [timeZone, setTimeZone] = useState<any>(props?.time_zone)

  console.log(timeZone, "timezone")
  console.log(props, "propspayload")


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
    // console.log(keyPath, "valuessssssssssssss")
    let typeOfKey = typeof keyPath == "object" ? keyPath.join('') : keyPath
    try {
      if (fileList?.length > 0) {
        const file = fileList[0].originFileObj;

        console.log(file);

        if (file) {
          // const isImage = file.type.startsWith('image/') && (file.type.includes('jpeg') || file.type.includes('png') || file.type.includes('jpg') || file.type.includes('gif'));
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

          console.log(uploadApiRes?.data?.file_name);

          let fileList = [{
            uid: uploadApiRes?.data?.file_name || uploadApiRes?.data?.Key,
            name: uploadApiRes?.data?.file_name || uploadApiRes?.data?.Key,
            status: 'done',
            url: String(uploadApiRes?.data?.file_name)?.endsWith('gif') ? '' : (henceforthApi.FILES.imageMedium(uploadApiRes?.data?.file_name || uploadApiRes?.data?.Key)),

          }]
          // console.log(fileList, "__________")
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



  // const [routerWarning, setRouterWarning] = useState(false)
  // useBeforeUnSaved(!routerWarning, `/contest/${props?._id}/edit`);
  console.log(props, "props______");

  // ************************ Set Fields Values ************************
  // const [finalRoundContestent, setFinalRoundContestent] = useState(props?.rounds?.map((res) => res?.next_round_contestent));

  // useEffect(() => {
  //   const lastRoundContestent = props.rounds.map((res) => res?.next_round_contestent);
  //   const lastValue = lastRoundContestent[lastRoundContestent.length - 1];
  //   setFinalRoundContestent(lastValue)
  // }, [])

  console.log(Intl.DateTimeFormat().resolvedOptions().timeZone, "timezone")

  useEffect(() => {

    let data = props;
    console.log(data, "mayank1")
    let x = data?.rounds?.map((res: any) => {
      let x = dayjs(res?.start_time).tz(timeZone)
      const hours = x.hour();
      const min = x.minute()
      const timeInIST = dayjs().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).set('hour', hours).set('minute', min)
      let y = dayjs(res?.end_time).tz(timeZone)
      const hours1 = y.hour();
      const min1 = y.minute()
      const timeInIST1 = dayjs().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).set('hour', hours1).set('minute', min1)

      return { ...res, name: res?.round_name, start_time: timeInIST, end_time: timeInIST1, start_date: dayjs(res?.start_date), end_date: dayjs(res?.end_date) }
    })
    console.log(x, "mayank")


    if (props) {
      let value = props?.contestent?.map((res: any) => ({
        is_creator_filling: res?.is_creator_filling,
        contestent_email: res?.contestent_email,
        contestent_name: res?.contestent_name,
        age: res?.age,
        location: res?.location,
        about: res?.about,
        material: {
          fileList: [{
            uid: '-1',
            name: res?.material,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(res?.material),
          }]
        },
        profile_pic: {
          fileList: [{
            uid: '-1',
            name: res?.profile_pic,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(res?.profile_pic),
          }]
        },
        video_intro: {
          fileList: [{
            uid: '-1',
            name: res?.video_intro,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(res?.video_intro),
          }]
        },
        contest_act: {
          fileList: [{
            uid: '-1',
            name: res?.contest_act,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(res?.contest_act),
          }]
        },
        social_media: res?.social_media.map((data) => ({
          type: data.type,
          url: data.url,
        })),
        contest_be_watched: res?.contest_be_watched,
        contest_link: res?.contest_link,
      }))
      console.log(value, "valueeeee")

      form.setFieldsValue({
        ...data,
        winner_reward: (props?.winner_reward !== null) ? (props?.winner_reward) : undefined,
        number_of_time_vote:props?.number_of_time_vote?String(props?.number_of_time_vote):undefined,
        contestent: value,
        total_contestent:props?.total_contestent?props?.total_contestent:undefined,
        rounds: x
      })
    }


    // }

    // Set Cover Media 
    if (props?.cover_media) {
      form.setFieldsValue({
        cover_media: {
          fileList: [{
            uid: props?.cover_media,
            name: props?.cover_media,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(props?.cover_media),
          }]
        },
        cover_media_type: props?.cover_media_type
      })
    }


    // Set Cover Media Type
    if (props?.cover_media_type) {
      form.setFieldsValue({
        cover_media_type: props?.cover_media_type
      })
    }

    // Set Contest Act
    if (props?.contest_act) {
      form.setFieldsValue({
        contest_act: {
          fileList: [{
            uid: props?.contest_act,
            name: props?.contest_act,
            status: 'done',
            url: String(props?.contest_act)?.endsWith('gif') ? henceforthApi.FILES.gifOriginal(props?.contest_act) : henceforthApi.FILES.imageMedium(props?.contest_act),
          }]
        },
      })
    }


    if (props?.cost_per_vote) {
      form.setFieldsValue({
        cost_per_vote: props?.cost_per_vote
      })
    }

    // Set Voter Reward
    if (props?.voter_reward?.length) {
      let value = props.voter_reward.map((res) => ({
        round: res?.round,
        reward_type: res?.voter_prize_description,
        no_of_voter: res?.no_of_voter?res?.no_of_voter:undefined
      }));
      form.setFieldsValue({
        voter_reward: value,
      });
    }

    // Set Winner Reward
    // if (props?.winner_reward?.length) {

    //   let value = props.winner_reward.map((res) => ({
    //     position: res?.position,
    //     prize: res?.prize,
    //     _id: res?._id
    //   }))

    //   form.setFieldsValue({
    //     winner_reward: value,
    //   });
    // }

    if (props?.rounds) {
      let voter_prize = props?.rounds?.map((res) => res)
      console.log(voter_prize);


      let value = props.rounds.map((res) => ({
        round: res?.round,
        reward_type: res?.voter_prize_description,
        no_of_voter: res?.no_of_voter
      }))


      form.setFieldsValue({
        voter_reward: value
      })

    }


    if (props?.rounds?.length) {
      form.setFieldValue("no_of_rounds", props?.rounds?.length);
    }

    // Set Rounds
    // if (props?.rounds?.length) {
    //   form.setFieldValue("no_of_rounds", props?.rounds?.length)

    //   const roundId = props.rounds.map((res: any) => res._id);
    //   const roundName = props.rounds.map((res: any) => res.round_name);
    //   const contestentPassNextRound = props.rounds.map((res: any) => res?.next_round_contestent);
    //   const roundStartDate = props.rounds.map((res: any) => res?.start_date);
    //   const roundEndDate = props.rounds.map((res: any) => res?.end_date);
    //   const roundStartTime = props.rounds.map((res: any) => res?.start_time);
    //   const roundEndTime = props.rounds.map((res: any) => res?.end_time);
    //   const round = props.rounds.map((res: any) => res?.round);

    //   console.log(round, "round");



    //   form.setFieldsValue({
    //     _id: roundId,
    //     round: round,
    //     name: roundName,
    //     next_round_contestent: contestentPassNextRound,
    //     start_date: roundStartDate.map((res: any) => dayjs(res)),
    //     end_date: roundEndDate.map((res: any) => dayjs(res)),
    //     start_time: roundStartTime.map((res: any) => dayjs(res)),
    //     end_time: roundEndTime.map((res: any) => dayjs(res)),
    //   });
    // }



    if (props?.rounds?.length) {
      form.setFieldValue("no_of_rounds", props?.rounds?.length);

      const roundId = props.rounds.map((res) => res._id);
      const roundName = props.rounds.map((res) => res.round_name);
      const contestentPassNextRound = props.rounds.map((res) => res?.next_round_contestent);
      const round = props.rounds.map((res) => res?.round);


      form.setFieldsValue({
        _id: roundId,
        round: round,
        name: roundName,
        next_round_contestent: contestentPassNextRound,
      });
    }


  }, []);
  const [loading, setLoading] = useState<boolean>(false); // Initialize loading state

  const contestentData = useMemo(() => {
    const data = props?.contestent?.map((res) => ({
      is_creator_filling: res?.is_creator_filling || false,
      contestent_email: res?.contestent_email || '',
      contestent_name: res?.contestent_name || '',
      after_filling_fields: res?.after_filling_fields || null,
      who_filling_info: res?.who_filling_info || null,
      age: res?.age || '',
      location: res?.location || '',
      about: res?.about || '',
      material: {
        fileList: res?.material ? [{
          uid: '-1',
          name: res.material,
          status: 'done',
          url: henceforthApi.FILES.imageMedium(res.material),
        }] : []
      },
      profile_pic: {
        fileList: res?.profile_pic ? [{
          uid: '-1',
          name: res.profile_pic,
          status: 'done',
          url: henceforthApi.FILES.imageMedium(res.profile_pic),
        }] : []
      },
      video_intro: {
        fileList: res?.video_intro ? [{
          uid: '-1',
          name: res.video_intro,
          status: 'done',
          url: henceforthApi.FILES.imageMedium(res.video_intro),
        }] : []
      },
      contest_act: {
        fileList: res?.contest_act ? [{
          uid: '-1',
          name: res.contest_act,
          status: 'done',
          url: henceforthApi.FILES.imageMedium(res.contest_act),
        }] : []
      },
      social_media: res?.social_media?.map((data) => ({
        type: data.type || '',
        url: data.url || '',
      })) || [],
      contest_be_watched: res?.contest_be_watched || '',
      contest_link: res?.contest_link || '',
    }));

    setLoading(true); // Set loading to false once data is processed
    return data;
  }, []);


  useEffect(() => {
    if (Array.isArray(props?.contestent)) {
      const filteredParticipants = props.contestent
        .filter(contestent => contestent.who_filling_info === "PARTICIPANTS")
        .map(contestent => ({
          contestent_email: contestent?.contestent_email,
          after_filling_fields: contestent?.after_filling_fields
        }));

      setParticipantsArray(filteredParticipants);
    }
  }, []);



  console.log(contestentData, "contestentData")
  // ************************ Invite Users Emails ************************
  const [userEmailsInvite, setUserEmailsInvite] = useState({
    invite_info: null,
    invite_from: null,
    contestent: []
  }) as any;

  const InviteUser = async (values: any) => {
    // debugger;
    let arr = {
      contestent: [] as any
    };

    const after_filling = router?.query?.fillingInfo;
    // const afterFilling = form.getFieldValue(['contestent', field.name, 'after_filling'])
    console.log(after_filling, "afterFilling");

    for (let index = 0; index < values?.all_contestent_email?.length; index++) {
      let obj = {
        contestent_email: values?.all_contestent_email[index],
        after_filling: after_filling,
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



  // ************************ Invite Participants Emails ************************
  const [participantsEmail, setParticipantsEmail] = useState([{ after_filling: '', contestent_email: '', invite_info: '' }]) as any;
  const [participantsArray, setParticipantsArray] = useState([]) as any;



  console.log(participantsArray, "participantsArray")

  const InviteParticipant = (values) => {
    showInviteSuccessModal();

    const { contestent_email, invite_info } = values;
    const after_filling = router?.query?.fillingInfo;

    const newParticipant = { invite_info, after_filling, contestent_email };

    setParticipantsEmail((prev) => [
      ...prev,
      newParticipant
    ]);

    setParticipantsArray((prev) => [
      ...prev.filter(email => email.contestent_email !== ''),
      newParticipant
    ]);

    inviteForm.resetFields();

    router.replace(
      {
        pathname: `/profile/drafts/${router?.query?._id}`,
        query: {
          type: router?.query?.type,
        },
      },
      undefined,
      { shallow: true, scroll: false }
    );

    console.log(participantsArray);
  };

  const findEmailByIndex = (index) => {
    const filteredEmails = participantsEmail.filter(email => email.contestent_email !== '');
    return (index >= 0 && index < filteredEmails.length) ? filteredEmails[index].contestent_email : null;
  };

  const deleteParticipant = (index) => {
    // setParticipantsEmail((prev) => prev.filter((_, i) => i !== index));
    setParticipantsArray((prev) => prev.filter((_, i) => i !== index));
  };

  console.log(participantsArray);

  // ************************ Invite Participants Emails ************************


  const [openInviteModal, setOpenInviteModal] = useState(false)
  const [openInviteSuccessModal, setOpenInviteSuccessModal] = useState(false)
  // ************************ Open Invite Modal ************************
  const showInviteModal = (type, index?, val?) => {
    setOpenInviteModal(true)

    if (type === "PARTICIPANT") {
      router.replace({
        pathname: `/profile/drafts/${router?.query?._id}`, query: {
          type: type,
          fillingInfo: val,
          index: index
        }
      }, undefined, { shallow: true, scroll: false })
    } else {
      router.replace({
        pathname: `/profile/drafts/${router?.query?._id}`, query: {
          type: type,
          fillingInfo: val
        }
      }, undefined, { shallow: true, scroll: false })
    }
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


  const [openErrorMsg, setOpenErrorMsg] = useState(false)


  const [openWarningModal, setOpenWarningModal] = useState(false);


  const showWarningModal = () => {
    setOpenWarningModal(true)
  }
  const cancelWarningModal = () => {
    setOpenWarningModal(false)
  }


  // ************************ Check time difference ************************
  const [showMessage, setShowMessage] = useState<boolean>(false);
  console.log(showMessage, "showmessage")

  debugger
  useEffect(() => {
    const rounds = form?.getFieldValue('rounds');
    console.log(rounds, "rounds");
    if (rounds && rounds.length > 0) {
      debugger
      const startTimeObj = dayjs(`${rounds[0]?.start_date} ${rounds[0]?.start_time}`, 'YYYY-MM-DD HH:mm');
      const currentTimeObj = dayjs();
      if (dayjs(rounds[0]?.start_time).isSame(currentTimeObj, 'day')) {
        const timeDifference = dayjs(rounds[0]?.start_time).diff(currentTimeObj, 'minute');
        if (timeDifference > 0 && timeDifference < 60) {
          setShowMessage(true);
        }
        else {
          setShowMessage(false)
        }
      }
    }
  }, [form]);

  // const checktime = () => {
  //   const rounds = form?.getFieldValue('rounds');

  //   console.log(rounds, "rounds");
  //   if (rounds && rounds.length > 0) {
  //     const startTimeObj = dayjs?.tz(`${rounds[0]?.start_date} ${rounds[0]?.start_time}`, 'YYYY-MM-DD HH:mm', timeZone);
  //     const currentTimeObj = dayjs().tz(timeZone);

  //     if (startTimeObj.isSame(currentTimeObj, 'day')) {
  //       const timeDifference = startTimeObj.diff(currentTimeObj, 'minute');

  //       if (timeDifference > 0 && timeDifference < 60) {
  //         setShowMessage(true);
  //       } else {
  //         setShowMessage(false);
  //       }
  //     } else {
  //       setShowMessage(false);
  //     }
  //   }
  // }
  const timeaccordingZone = (date1: any, time1: any) => {
    const formattedDate = dayjs(date1).format('YYYY-MM-DD');

    // Extract time components
    const formattedTime = dayjs(time1, 'HH:mm').format('HH:mm');

    // Combine date and time
    const dateTime = `${formattedDate} ${formattedTime}`;

    const localTime = moment.tz(dateTime, timeZone);
    const utcTime = localTime.utc();
    const timestamp = utcTime.unix();
    console.log(utcTime, timestamp, "allDaTE data")
    return timestamp
  }


  const checktime = () => {

    const rounds = form?.getFieldValue('rounds');

    if (rounds && rounds.length > 0) {
      const { start_date, start_time } = rounds[0];

      // Ensure start_date and start_time are valid
      if (start_date && start_time) {
        // Combine date and time into a single string and parse it
        const startTimeStr = `${start_date.format('YYYY-MM-DD')} ${start_time.format('HH:mm')}`;

        try {
          const startTimeObj = dayjs.tz(startTimeStr, 'YYYY-MM-DD HH:mm', timeZone);
          const currentTimeObj = dayjs().tz(timeZone);

          if (startTimeObj.isValid() && currentTimeObj.isValid()) {
            if (startTimeObj.isSame(currentTimeObj, 'day')) {
              const timeDifference = startTimeObj.diff(currentTimeObj, 'minute');

              if (timeDifference > 0 && timeDifference < 60) {
                setShowMessage(true);
              } else {
                setShowMessage(false);
              }
            } else {
              setShowMessage(false);
            }
          } else {
            console.error('Invalid start or current time object.');
            setShowMessage(false);
          }
        } catch (error) {
          console.error('Error parsing date/time:', error);
          setShowMessage(false);
        }
      } else {
        console.error('Start date or start time is missing.');
        setShowMessage(false);
      }
    } else {
      console.error('No rounds data available.');
      setShowMessage(false);
    }
  };
  console.log(showMessage, "message")


  // console.log(showMessage, "showMessage");
  const [state, setState] = useState(null) as any;
  // ************************ Create Contest API Call ************************
  const onFinish = async (formSubmitType: any) => {
    console.log(formSubmitType, "formSubmitType");
    debugger;
    let values = form.getFieldsValue()
    console.log(values, "values?.contest_act");

    setState(values);



    // console.log(typeof form.getFieldValue('contest_act'), "______________________________")

    const fieldsToCheck = {
      title: (value: any) => value,
      cover_media_type: (value: any) => value || "images/",
      cover_media: (value: any) => value?.fileList?.[0]?.name,
      contest_act: (value: any) => value?.fileList?.[0]?.name,
      contest_act_media_type: () => "string",
      contest_be_watched: (value: any) => value,
      contest_link: (value: any) => value,
      vote_type: (value: any) => value,
      cost_per_vote: (value: any) => value ? Number(value) : null,
      number_of_time_vote: (value: any) => Number(value),
      total_contestent: (value: any) => Number(value),
      is_contestent_pic_reveal: (value: any) => value,
      filling_any_info: (value: any) => value,
      full_name: (value: any) => value,
      email: (value: any) => value,
      full_address: (value: any) => value,
      phone_number: (value: any) => Number(value),
      country: (value: any) => value,
      state: (value: any) => value,
      city: (value: any) => value,
      postal_code: (value: any) => value,
      is_winner_prize: (value: any) => value,
      is_voter_prize: (value: any) => value,
      add_info: (value: any) => value,
      country_code: (value: any) => value ? String(value) : undefined,
      // Add other fields here if needed
    };

    let payLoad: any = {};

    Object.entries(fieldsToCheck).forEach(([field, handler]) => {
      const value = values?.[field];
      const processedValue = handler(value);
      if (processedValue !== undefined && processedValue !== null) {
        payLoad[field] = processedValue;
      }
    });
    payLoad['draft_id'] = String(router?.query?._id)
    // Winner Prize
    if (values?.is_winner_prize) {
      let newArray = values?.winner_reward?.map(item => ({
        ...item,
        prize: Number(item.
          prize)
      }));
      payLoad['winner_reward'] = newArray;
      payLoad['winner_reward_type'] = values?.winner_reward_type;
    }


    // Voter Prize
    if (values?.is_voter_prize) {
      let newArray = values?.voter_reward?.map(item => ({
        ...item,
        no_of_voter: Number(item.no_of_voter)
      }));

      payLoad['voter_reward'] = newArray;
    }

    // **************************** Create Round Array ****************************



    let arr = values?.rounds?.map((res: any, index: number) => {
      const indiaTime = dayjs(res?.start_time).tz(Intl.DateTimeFormat().resolvedOptions().timeZone);


      const hour = indiaTime.hour();
      const minute = indiaTime.minute();
      const timeZonetimestart = indiaTime.clone().tz(timeZone).set('hour', hour).set('minute', 0);
      const indiaTime1 = dayjs(res?.end_time).tz(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const hour1 = indiaTime1.hour();
      const timeZoneendTime = indiaTime1.clone().tz(timeZone).set('hour', hour1).set('minute', 0);

      return {
        start_datetime1: timeaccordingZone(res?.start_date, res?.start_time),
        end_datetime1: timeaccordingZone(res?.end_date, res?.end_time),
        start_date: moment().utc().date(dayjs(res?.start_date).date()).startOf('day').valueOf(),
        end_time: timeZoneendTime.utc().valueOf(),
        end_date: moment().utc().date(dayjs(res?.end_date).date()).startOf('day').valueOf(),
        start_time: timeZonetimestart.utc().valueOf(),
        name: values?.name[index],
        next_round_contestent: Number(values?.next_round_contestent[index]),
        round: index + 1
      }
    })

    if (arr?.length && values?.rounds?.length) {
      const allRoundsValid = values.rounds.every(
        (round: any) => round.start_date !== undefined && round.end_date !== undefined
      );

      if (allRoundsValid) {
        payLoad['rounds'] = arr;
      }
    }
    payLoad['time_zone'] = String(timeZone)
    // console.log(payLoad.rounds, "payLoad.rounds");

    // if(payLoad.rounds[0].start_time){}




    // **************************** Create Contestant Array ****************************

    const contestentArray: any[] = [];
    const value = form.getFieldsValue()
    if (value?.contestent?.length) {
      let data = value.contestent.filter((res) => (res.contestent_name !== undefined) && (res.contestent_email !== undefined));

      console.log(value.contestent);

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

    // case 1: if participantsArray and contestentArray has length then: merge contestentArray + participantsArray
    // case 2: if participantsArray has no length : contestentArray
    // case 3: if contestentArray no length : participantsArray
    // case 4: if userEmailsInvite?.contestent has length


    const filteredContestentArray: any = contestentArray.filter(contestant => contestant.is_creator_filling !== false);

    if (participantsArray?.length > 0) {
      if (filteredContestentArray.length > 0) {


        payLoad['contestent'] = participantsArray.concat(filteredContestentArray);
      } else {
        payLoad['contestent'] = participantsArray;
      }
      // payLoad['invite_info'] = userEmailsInvite.invite_info;
    }
    else if (contestentArray.length > 0) {
      payLoad['contestent'] = contestentArray;
    } else if (userEmailsInvite.contestent.length > 0) {
      payLoad['contestent'] = userEmailsInvite.contestent;
      payLoad['invite_info'] = userEmailsInvite.invite_info;
    }
    // console.log(contestentArray, "contestentArray")

    console.log(payLoad?.contestent, "payLoad?.contestent");

    if (formSubmitType !== 'draft') {

      if (values.rounds) {
        console.log(values?.rounds, "roundsVALue");
        if (values.rounds && values.rounds.length > 1) {
          for (let i = 0; i < values.rounds.length - 1; i++) {
            // Combine date and time for current round's end
            const currentEndDateTime = dayjs(values.rounds[i].end_date)
              .hour(dayjs(values.rounds[i].end_time).hour())
              .minute(dayjs(values.rounds[i].end_time).minute());

            // Combine date and time for next round's start
            const nextStartDateTime = dayjs(values.rounds[i + 1].start_date)
              .hour(dayjs(values.rounds[i + 1].start_time).hour())
              .minute(dayjs(values.rounds[i + 1].start_time).minute());

            // Calculate the difference in hours
            const diffInHours = nextStartDateTime.diff(currentEndDateTime, 'hour');

            if (diffInHours < 1) {
              // Show toast message
              Toast.warn('There must be at least a one hour gap between rounds.');
              return; // Return false to indicate invalid rounds gap
            }
          }
        }
      }

      const x = String(Intl.DateTimeFormat().resolvedOptions().timeZone)
      // const selectedDateWithTZ= (x==timeZone)?dayjs(selectedDate).tz(timeZone):dayjs(selectedDate).tz(timeZone).add(1,"day")

      const startDate = dayjs(payLoad?.rounds[0]?.start_date).format('YYYY-MM-DD');
      const startTime = dayjs(payLoad?.rounds[0]?.start_time).tz(timeZone).format('HH:mm');
      const currentDate = dayjs().tz(timeZone).format('YYYY-MM-DD');
      const currentTime = dayjs().tz(timeZone).format('HH:mm');
      debugger

      console.log(startDate, startTime, currentDate, currentTime, "alltime")
      if (startDate === currentDate && startTime <= currentTime) {
        Toast.warn('Time has passed, you could not create the contest for this time.');

        console.log("not created________________");

        return;
      }

      const contestantLength = payLoad.contestent?.length || 0;
      const totalContestents = Number(values?.total_contestent) || 0;


      console.log(payLoad?.contestent, contestantLength, totalContestents, "_____________");



      for (let i = 0; i < payLoad['contestent'].length; i++) {
        if (!Object.keys(payLoad['contestent'][i]).includes('contestent_email')) {
          return Toast.warn("Please select email for every contestant.")
        }
      }

      console.log(payLoad, "payLoad__________");


      if (contestantLength !== totalContestents) {
        Toast.warn("Please fill the form for all contestants.");
        return;
      }


      if (contestantLength > totalContestents) {
        Toast.warn("Maximum limit reached");
        return;
      }

    }

    try {
      setFormLoading(true);
      console.log(payLoad, "draft_______payLoad");
      if (formSubmitType == 'draft') {
        const apiRes = await henceforthApi.Contest.draft(payLoad);
        Toast.success("Contest Drafted Successfully.")
        console.log(apiRes, "apiRes______________");

        setTimeout(() => {
          router.push({
            pathname: `/profile/drafts/page/1`
          })
        }, 2000)
      }
      else {
        const apiRes = await henceforthApi.Contest.create(payLoad);
        Toast.success("Contest created successfully.")

        setTimeout(() => {
          router.push({
            pathname: `/contest/${apiRes?.data?._id}/details`
          })
        }, 2000)
      }
      // setFormLoading(false);
    } catch (error) {
      Toast.error(error)
      setFormLoading(false);
    }
  }




  // ************************ Render Round Name Inputs ************************
  let numberOfInputs = round || 1;

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      // Skip the first render
      setIsFirstRender(false);
      return;
    }

    // Your logic here

    const fieldsToReset = [];
    for (let i = 0; i < numberOfInputs; i++) {
      fieldsToReset.push(
        ['rounds', i, 'start_date'],
        ['rounds', i, 'start_time'],
        ['rounds', i, 'end_date'],
        ['rounds', i, 'end_time']
      );

      form.resetFields(fieldsToReset);
    }
  }, [numberOfInputs, timeZone]);

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
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const totalContentest = getFieldValue('total_contestent');
                  if (!value) {
                    return Promise.reject(new Error(`Please enter the contestants for round ${i + 1}`));
                  }
                  if (totalContentest <= value && i === 0) {
                    return Promise.reject(new Error('Contestants passed in first round should be less than total contestants'));
                  }
                  if (value < 1) {
                    return Promise.reject(new Error('Contestants should be more than 0'));
                  }
                  if (i > 0 && value >= getFieldValue(["next_round_contestent", i - 1])) {
                    return Promise.reject(new Error(`The number of contestants for round ${i + 1} should be less than round ${i}.`));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input size='large'
              onChange={(value: any) => {
                console.log(value.target.value, "values");
                if (i === numberOfInputs - 1) {
                  setLastInputValue(value.target.value);
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

  useEffect(() => {

    renderTimeDateForRound()

  }, [timeZone])

  // ************************ Time and Date Inputs for Round ************************
  const renderTimeDateForRound = () => {

    // Function to disable start date based on previous round's end date and end time
    // debugger
    const disableStartDate = (current, roundIndex) => {
      if (roundIndex > 0) {
        const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);
        const prevRoundEndTime = form.getFieldValue(['rounds', roundIndex - 1, 'end_time']);
        return current && (
          current.isBefore(dayjs(prevRoundEndDate).startOf('day')) ||
          (prevRoundEndTime && current.isBefore(dayjs(prevRoundEndTime).startOf('day'))) ||
          !prevRoundEndDate || !prevRoundEndTime
        );
      }
      return current && current.isBefore(dayjs().subtract(1, 'day'));
    };
    const disableEndDate = (current, roundIndex) => {
      if (roundIndex > 0) {
        const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);
        const prevRoundEndTime = form.getFieldValue(['rounds', roundIndex - 1, 'end_time']);
        return current && (
          current.isBefore(dayjs(prevRoundEndDate).startOf('day')) ||
          (prevRoundEndTime && current.isBefore(dayjs(prevRoundEndTime).startOf('day'))) ||
          !prevRoundEndDate || !prevRoundEndTime
        );
      }
      return current && current.isBefore(dayjs().startOf('day'));
    };


    const disableHoursUntilCurrent = (selectedDate, roundIndex) => {
      const currentHour = dayjs().tz(timeZone).hour();
      const disabledHours = [];
      // Debugging logs

      if (selectedDate) {
        const x = String(Intl.DateTimeFormat().resolvedOptions().timeZone)
        const selectedDateWithTZ = (x == timeZone) ? dayjs(selectedDate).tz(timeZone) : dayjs(selectedDate).tz(timeZone).add(1, "day")

        // const nextDayWithTZ = selectedDateWithTZ.add(1, 'day');
        const todayWithTZ = dayjs().tz(timeZone);

        console.log(selectedDateWithTZ, todayWithTZ, "mayank111")

        console.log(selectedDateWithTZ.isSame(todayWithTZ, 'day'), "mayank")
        if (selectedDateWithTZ.isSame(todayWithTZ, 'day')) {

          for (let hour = 0; hour < currentHour; hour++) {
            disabledHours.push(hour);
          }
        }
      }

      if (roundIndex > 0) {
        const prevRoundEndTime = form.getFieldValue(['rounds', roundIndex - 1, 'end_time']);
        const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);

        if (prevRoundEndDate && prevRoundEndTime) {
          const prevRoundEndDateWithTZ = dayjs(prevRoundEndDate);
          const prevEndHour = dayjs(prevRoundEndTime).hour();

          console.log('Previous Round End Date (with Time Zone):', prevRoundEndDateWithTZ.format());
          console.log('Previous Round End Time (with Time Zone):', prevRoundEndTime ? dayjs(prevRoundEndTime).format() : 'N/A');

          if (selectedDate && selectedDate.isSame(prevRoundEndDateWithTZ, 'day')) {
            for (let hour = 0; hour < prevEndHour; hour++) {
              disabledHours.push(hour);
            }
          }
        }
      }

      console.log('Disabled Hours:', disabledHours);
      return disabledHours;
    };

    // Function to validate time range for each round
    const validateTimeRange = (_, values, roundIndex) => {
      const { start_date, start_time, end_date, end_time } = values;

      if (start_date && start_time && end_date && end_time) {
        const startTime = dayjs.tz(`${start_date.format('YYYY-MM-DD')} ${start_time.format('HH:mm')}`, timeZone);
        const endTime = dayjs.tz(`${end_date.format('YYYY-MM-DD')} ${end_time.format('HH:mm')}`, timeZone);

        if (endTime.isBefore(startTime)) {
          return Promise.reject(new Error('End time must be after start time'));
        }

        if (endTime.isSame(startTime)) {
          return Promise.reject(new Error('End time must be different from start time'));
        }

        if (roundIndex > 0) {
          const prevRoundEndTime = form.getFieldValue(['rounds', roundIndex - 1, 'end_time']);
          const prevRoundEndDate = form.getFieldValue(['rounds', roundIndex - 1, 'end_date']);

          if (prevRoundEndDate && prevRoundEndTime) {
            const prevEndTime = dayjs.tz(`${prevRoundEndDate.format('YYYY-MM-DD')} ${prevRoundEndTime.format('HH:mm')}`, timeZone);

            if (start_date.isSame(prevRoundEndDate, 'day')) {
              if (startTime.isBefore(prevEndTime)) {
                return Promise.reject(new Error('Please enter a valid time slot'));
              }
            }
          }
        }
      }

      return Promise.resolve();
    };

    const funcDate = (datee: any) => {
      const date = new Date(datee);
      return date.getTime();
    }
    // Generating input fields for each round
    let inputs = [];
    for (let i = 0; i < numberOfInputs; i++) {
      inputs.push(
        <Col span={24} sm={12} md={12} lg={12} xl={11} xxl={11} key={i}>
          <label className='fw-bold text-black primary-font-size mb-3'>Round {i + 1}</label>
          <Row gutter={[24, 12]}>
            {/* Start Date */}
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item
                className='w-100 m-0'
                name={['rounds', i, 'start_date']}
                rules={[{ required: true, message: `Please enter the start date for round ${i + 1}` }]}
              >
                <DatePicker
                  disabledDate={(current) => disableStartDate(current, i)}
                  type='text'
                  onChange={checktime}
                  size='large'
                  className='bg-transparent ps-0 w-100'
                  placeholder='Start Date'
                />
              </Form.Item>
            </Col>

            {/* Start Time */}
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item
                className='w-100 m-0'
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.rounds?.[i]?.start_date !== currentValues.rounds?.[i]?.start_date ||
                  prevValues.rounds?.[i - 1]?.end_time !== currentValues.rounds?.[i - 1]?.end_time
                }
              >
                {({ getFieldValue }) => {
                  const selectedDate = getFieldValue(['rounds', i, 'start_date']);
                  const previousRoundEndTime = getFieldValue(['rounds', i - 1, 'end_time']);
                  const previousRoundEndTimeTimestamp = funcDate(getFieldValue(['rounds', i - 1, 'end_time']));
                  const selectedDateTimestamp = funcDate(getFieldValue(['rounds', i, 'end_date']));
                  const previousSelectedDate = funcDate(getFieldValue(['rounds', i - 1, 'start_date']));
                  const previousSelectedEndDate = funcDate(getFieldValue(['rounds', i - 1, 'end_date']));
                  const isDisabled = i > 0 && (!previousRoundEndTime || !selectedDate);
                  return (
                    <Form.Item
                      name={['rounds', i, 'start_time']}
                      rules={[
                        { required: true, message: `Please enter the start time for round ${i + 1}` },
                        { validator: (_, value) => validateTimeRange(_, { start_date: selectedDate, start_time: value, end_time: form.getFieldValue(['rounds', i, 'end_time']) }, i) },
                        {
                          validator(rule, value, callback) {
                            if (selectedDateTimestamp < previousSelectedEndDate ? previousRoundEndTime && previousRoundEndTime > value : "") {
                              return Promise.reject(new Error(`Start time should always be greater than the last end time`));
                            }
                            callback();
                          }
                        }
                      ]}
                    >
                      <TimePicker
                        format='HH'
                        disabled={isDisabled}
                        disabledHours={() => disableHoursUntilCurrent(selectedDate?.tz(timeZone), i)}
                        size='large'
                        hideDisabledOptions
                        className='bg-transparent ps-0 w-100'
                        onChange={checktime}
                        placeholder='Start Time'
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>

            {/* End Date */}
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

            {/* End Time */}
            <Col span={24} md={12} lg={11} xl={12} xxl={12}>
              <Form.Item
                className='w-100 m-0'
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.rounds?.[i]?.end_date !== currentValues.rounds?.[i]?.end_date
                }
              >
                {({ getFieldValue }) => {
                  const selectedDate = getFieldValue(['rounds', i, 'end_date']);
                  const previousRoundEndTime = getFieldValue(['rounds', i - 1, 'end_time']);
                  const isDisabled = i > 0 && !previousRoundEndTime;
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
                        disabled={isDisabled}
                        disabledHours={() => disableHoursUntilCurrent(selectedDate?.tz(timeZone), i)}
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
  // const [fillingTypeForm, setFillingTypeForm] = useState(null);
  React.useEffect(() => {
    const initialContestentValues = Array.from({ length: 1 }, () => ({
      is_creator_filling: true,
      // after_filling: AfterFillingFields.REVIEW,
    }));

    // form.setFieldsValue({
    //   contestent: {
    //     after_filling: AfterFillingFields.REVIEW, // or any other initial value
    //   },
    // });
    // setFillingTypeForm(AfterFillingFields.REVIEW);

    form.setFieldsValue({
      // after_filling: AfterFillingFields.REVIEW,
      // filling_any_info: FormFillingType.SOME,
      // contestent: initialContestentValues,
      // is_contestent_pic_reveal: true,
      // vote_type: VoteType.FREE,
      // // is_winner_prize: false,
      // is_voter_prize: true,
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

  useEffect(() => {
    form.setFieldsValue({
      contestent: Array.from({ length: totalContestent }, () => ({})),
    });
  }, [totalContestent, form]);


  const [contestantForm, setContestantForm] = useState({}) as any
  console.log(contestantForm, "contestentForm")




  return (
    <>
      <Head>
        <title>
          Creating Contest | SEEzone
        </title>
      </Head>
      <section className='py-md-5 py-4'>
        <div className="container">
          <Row>
            <Col span={24}>
              <WrapperElement>
                <SectionTitle title='Complete your form' className='mb-4' />
                <Form scrollToFirstError className='light_theme_form' form={form} layout='vertical' onFinish={showWarningModal} onFinishFailed={(errorInfo: any) => {
                  console.log("Failed:", errorInfo);
                  setError(errorInfo);
                  setOpenErrorMsg(true)
                }}>
                  <FormCommonCard className="mb-5">
                    {/* Contest Title */}
                    <Form.Item name="title" rules={[{
                      required: true,
                      message: 'Please enter the contest title'
                    }]}>
                      <Input
                        type='text' size='large' className='bg-transparent ps-0'
                        placeholder='Title of Your Contest' />
                    </Form.Item>
                    {/* Cover Media */}
                    <div className='mb-3'>
                      <Spin spinning={uploadLoading?.cover_media ? uploadLoading?.cover_media : false} style={{ width: 102 }}>
                        <Form.Item shouldUpdate={(prev: any, curr: any) => prev.cover_media !== curr.cover_media} className='m-0'>
                          {
                            ({ getFieldValue }) => {
                              let file = getFieldValue('cover_media');
                              const fileList = file?.fileList || []
                              return (

                                <Form.Item name="cover_media" className='m-0' rules={[{ required: true, message: 'Please upload cover media' }]}>
                                  <Upload
                                    customRequest={({ onSuccess }: any) =>
                                      onSuccess("ok")
                                    }
                                    // accept='image/*'
                                    accept=".jpg,.jpeg,.png"
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
                      </Spin>
                      <Typography.Paragraph className='mt-2 m-0'>Upload your contest cover media</Typography.Paragraph>
                    </div>

                    {/* Contest Act */}
                    <div className='mb-3'>
                      <Spin spinning={uploadLoading?.contest_act ? uploadLoading?.contest_act : false} style={{ width: 102 }}>
                        <Form.Item shouldUpdate={(prev: any, curr: any) => prev.contest_act !== curr.contest_act} className='m-0'>
                          {
                            ({ getFieldValue }) => {
                              let file = getFieldValue('contest_act');
                              const fileList = file?.fileList || []
                              // console.log(file?.fileList, 'contest_act');
                              return (
                                <>
                                  <Typography.Paragraph className='fw-semibold text-black primary-font-size mb-0'>Upload Your Contest Acts/Performance/Creation/Display/Others [Optional]</Typography.Paragraph>
                                  <Typography.Paragraph className='mb-2 m-0 secondary-font-size'>This field is optional as long as your audience knows where to find and watch/view your contest material</Typography.Paragraph>
                                  <Form.Item name="contest_act" className='m-0'>
                                    <Upload
                                      customRequest={({ onSuccess }: any) =>
                                        onSuccess("ok")
                                      }
                                      // accept="images/*,.jpg,.jpeg,.gif,.png,video/mp4"
                                      accept=".jpg,.jpeg,.png,video/mp4"
                                      showUploadList={{ showPreviewIcon: false }}
                                      listType="picture-card"
                                      fileList={fileList || []}
                                      onChange={(info) => {
                                        if (info?.fileList[0]?.status === "done") {
                                          handleFileUpload('contest_act', info.fileList, true, 'contest_act')
                                        }
                                      }}
                                    >
                                      {fileList.length >= 1 ? null : <UploadButtonIcon />}
                                    </Upload>
                                  </Form.Item>
                                </>
                              )
                            }}
                        </Form.Item>
                      </Spin>

                    </div>

                    {/* Contest Be Watched */}
                    <Form.Item name="contest_be_watched" rules={[{ required: true, message: 'Please select option for contest be watched' }]}>
                      <Select size='large' className='bg-transparent ps-0' placeholder='Where can your contest be watched/Viewed?   i.e., YouTube, Tiktok, url link, etc'>
                        <Select.Option value={ContestPlatform.YOUTUBE}>{ContestPlatform.YOUTUBE}</Select.Option>
                        <Select.Option value={ContestPlatform.FACEBOOK}>{ContestPlatform.FACEBOOK}</Select.Option>
                        <Select.Option value={ContestPlatform.THROWTECH}>{ContestPlatform.THROWTECH}</Select.Option>
                      </Select>
                    </Form.Item>

                    {/* Contest Link */}
                    <Form.Item name="contest_link" rules={[{ required: true, message: 'Please enter contest link' }]}>
                      <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste Link here...' />
                    </Form.Item>
                  </FormCommonCard>

                  <FormCommonCard className="mb-5">
                    {/* Vote Type */}
                    <div>
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
                                <Row>
                                  <Col span={24} md={16} lg={12} xl={10} xxl={8}>
                                    <Form.Item name="cost_per_vote" initialValue={(props?.cost_per_vote) ? (props?.cost_per_vote) : null} rules={[{ required: true, message: 'Please enter cost per vote' }]}>

                                      <Input prefix="$" type='text' size='large' className='bg-transparent ps-0' placeholder='Specify amount here ($)' onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                          e.preventDefault();
                                        }
                                      }} />
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
                        <label className='fw-semibold text-black primary-font-size'>Number of times a person can vote for their favorite contestants/Participants/Act/Creativity</label>
                        <Form.Item className='w-100' name="number_of_time_vote" rules={[{ required: true, message: 'Please choose a count of your choice to vote your favourite contestant' }]}>
                          <Select size='large' className='bg-transparent ps-0' placeholder='Please select'>
                            <Select.Option value="10000000000000000">As Much As They Can</Select.Option>
                            <Select.Option value="1">1</Select.Option>
                            <Select.Option value="2">2</Select.Option>
                            <Select.Option value="3">3</Select.Option>
                            <Select.Option value="4">4</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </FormCommonCard>


                  <FormCommonCard className="mb-5">
                    {/* No of Rounds */}
                    <div>
                      <SectionTitle title='Specify Vote Time Period' className='mb-4 sub-title-font-size fw-bold' />
                    </div>
                    <Form.Item
                      // initialValue={1}
                      label={<label className='fw-semibold text-black primary-font-size'>Please state how many number of rounds in all</label>}
                      initialValue={props?.rounds?.length > 0 ? props?.rounds?.length : null}
                      name="rounds_number"
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value) {
                              return Promise.reject(new Error('Please enter the number of rounds'));
                            }
                            if (value && value <= 0) {
                              return Promise.reject(new Error('Round cannot be zero'));
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
                        placeholder='Please enter rounds'
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

                    <Row>
                      <Form.Item name={'time_zone'} label="Select Timezone">
                        <Select defaultValue={String(Intl.DateTimeFormat().resolvedOptions().timeZone)} showSearch={true} onChange={(e) => { setTimeZone(e) }}>
                          {timezones.map((timezone) => (
                            <Select.Option key={timezone} value={timezone}>
                              {timezone}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Row>
                    <Row gutter={[24, 24]} justify={'space-between'}>
                      {renderTimeDateForRound()}
                    </Row>
                  </FormCommonCard>

                  <FormCommonCard className="mb-5">
                    {/* Total Number Of Contestants */}
                    <div>
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
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (!value) {
                                    return Promise.reject(new Error(`Please enter the number of contestants!`));
                                  }
                                  if (value <= firstRoundContestant) {
                                    return Promise.reject(new Error(`Total number of contestants must be greater than contestants who have passed to the the next round.`));
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}>
                              <Input type='text' size='large' onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }} className='bg-transparent ps-0' placeholder='Please enter number of contestant' onChange={(e: any) => setTotalContestent(e?.target?.value)} />
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
                    <div>
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
                                <Form.Item shouldUpdate={(prev, curr) => prev?.after_filling !== curr?.after_filling}>
                                  {({ getFieldValue }) => {
                                    let x = getFieldValue('after_filling');
                                    console.log(x, 'xxxxxxx');
                                    return (
                                      <>
                                        <Form.Item name="after_filling" rules={[{ required: true, message: 'Please select an option whether you want to submit the form directly or send to the creator for review' }]} label={<label className='fw-bold text-black primary-font-size mb-2'>What Should participants do after filling the fields?</label>}>
                                          <Radio.Group className='mb-2'>
                                            <Radio value={AfterFillingFields.REVIEW} className='text-black'>Send To Me For Review and Submission</Radio>
                                            <Radio value={AfterFillingFields.SUBMIT} className='text-black'>Participant Can Submit Directly</Radio>
                                          </Radio.Group >
                                        </Form.Item>
                                        <Button size='small' htmlType='button' type="default"
                                          onClick={() => showInviteModal('NONE', '', x)}
                                          className='text-black fw-normal text-black mb-4' shape='round'>Invite Your Participants To Fill The Fields</Button>
                                      </>
                                    )
                                  }}
                                </Form.Item>
                              </>
                            }

                            {(val === FormFillingType.SOME && loading) &&
                              <>
                                {/* Some: Who Should Fill the Forms: Participants & Me */}
                                <div>
                                  <Form.Item className="m-0" shouldUpdate={(prev, curr) => prev.contestent !== curr.contestent}>
                                    {({ getFieldValue }) => {
                                      const contestants = getFieldValue('contestent') || [];

                                      return (
                                        <>
                                          <Form.List name="contestent" >
                                            {(fields, { add, remove }) => (

                                              <>
                                                {fields.map((field, index) => {
                                                  const isCreatorFilling = getFieldValue(['contestent', field.name, 'is_creator_filling']);
                                                  console.log(field.name, "field.key_________");

                                                  return (
                                                    <div key={field.key}>
                                                      <Flex className='mt-5 mb-3' justify='space-between' align='center'>
                                                        <label className='fw-bold text-black sub-title-font-size'>Contestant {index + 1}</label>
                                                        {/* {index > 0 && */}
                                                        {/* <Button icon={<TrashFilled />} danger
                                                        onClick={() => {
                                                          remove(field.name);
                                                          deleteParticipant(index)
                                                        }} size='small' htmlType='button' type="primary" className='text-white fw-normal' shape='default'></Button> */}
                                                        {/* } */}
                                                      </Flex>

                                                      <Form.Item initialValue={contestentData[field.name]?.is_creator_filling ? contestentData[field.name]?.is_creator_filling : false} name={[field.name, 'is_creator_filling']} label={<label className='fw-bold text-black primary-font-size mb-2'>Who Should Fill the Forms</label>} rules={[{ required: true, message: 'Please select an option whether creator should fill the form or not' }]} >
                                                        <Radio.Group onChange={(e: any) => { setContestantForm({ ...contestantForm, [field.name]: e.target.value }) }}>
                                                          <Radio value={true} className='text-black'>Me</Radio>
                                                          <Radio value={false} className='text-black'>Participants</Radio>
                                                        </Radio.Group>
                                                      </Form.Item>


                                                      {!isCreatorFilling && (
                                                        <>
                                                          {/* <div className='mb-3 d-flex align-items-center gap-3'>
                                                          <span>{findEmailByIndex(index)}</span>
                                                          {findEmailByIndex(index) &&
                                                            <Button className='border-0' danger icon={<TrashFilled />} type='primary' ghost size='small' htmlType='button' onClick={() => deleteParticipant(index)}></Button>}
                                                        </div> */}

                                                          <Form.Item className="m-0" shouldUpdate={(prev, curr) => prev?.contestent?.after_filling !== curr?.contestent?.after_filling}>
                                                            {({ getFieldValue }) => {
                                                              const val = getFieldValue(['contestent', field.name, 'after_filling']);
                                                              // console.log(val, "valllllllllll");

                                                              if (val) {
                                                                setFillingType(val);
                                                              }
                                                              return (
                                                                <Form.Item initialValue={contestentData[field.name]?.after_filling_fields ? contestentData[field.name]?.after_filling_fields : null} name={[field.name, 'after_filling']} label={<label className='fw-bold text-black primary-font-size mb-2'>What Should participants do after filling the fields?</label>} rules={[{ required: true, message: 'Please select an option whether you want to submit the form directly or send to the creator for review' }]}>
                                                                  <Radio.Group className='mb-0'>
                                                                    <Radio value={AfterFillingFields.REVIEW} className='text-black'>Send To Me For Review and Submission</Radio>
                                                                    <Radio value={AfterFillingFields.SUBMIT} className='text-black'>Participant Can Submit Directly</Radio>
                                                                  </Radio.Group >
                                                                </Form.Item>
                                                              )
                                                            }}
                                                          </Form.Item>
                                                          <Button size='small' htmlType='button' type="default" onClick={() =>
                                                            showInviteModal('PARTICIPANT', index, form.getFieldValue(['contestent', field.name, 'after_filling']))} className='text-black fw-normal text-black' shape='round'>Invite Your Participants To Fill The Fields</Button>
                                                        </>
                                                      )}




                                                      {isCreatorFilling && (
                                                        <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                                                          {/* Full Name */}
                                                          <Form.Item
                                                            initialValue={contestentData[field.name]?.contestent_name ? contestentData[field.name]?.contestent_name : null}
                                                            name={[field.name, 'contestent_name']}
                                                            rules={[
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
                                                            ]}
                                                          >
                                                            <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Name' />
                                                          </Form.Item>

                                                          {/* Email */}
                                                          <Form.Item initialValue={contestentData[field.name]?.contestent_email ? contestentData[field.name]?.contestent_email : null} name={[field.name, 'contestent_email']} rules={[{ whitespace: true, type: "email", required: true, message: 'Please enter the vaild email' }]}>
                                                            <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Email' />
                                                          </Form.Item>
                                                          {/* Age */}
                                                          <Form.Item name={[field.name, 'age']}
                                                            initialValue={contestentData[field.name]?.age ? contestentData[field.name]?.age : null}
                                                            rules={[
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
                                                            ]}
                                                          >
                                                            <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Age' onKeyPress={(e) => {
                                                              if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault();
                                                              }
                                                            }} />
                                                          </Form.Item>
                                                          {/* Location */}
                                                          <Form.Item name={[field.name, 'location']}
                                                            initialValue={contestentData[field.name]?.location ? contestentData[field.name]?.location : null}
                                                            rules={[{ required: true, message: 'Please enter the location' }]}>
                                                            <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Location' />
                                                          </Form.Item>
                                                          {/* About You */}
                                                          <Form.Item name={[field.name, 'about']}
                                                            initialValue={contestentData[field.name]?.about ? contestentData[field.name]?.about : null}
                                                            label={<label>About You [Optional]</label>}>
                                                            <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='About' />
                                                          </Form.Item>

                                                          {/* Upload Material Image */}
                                                          <div className='mt-3'>
                                                            <SectionTitle title='Upload Material' className='sub-title-font-size fw-bold' />
                                                          </div>

                                                          <div>
                                                            <Spin spinning={uploadLoading?.[`contestent${index}material`] ? uploadLoading?.[`contestent${index}material`] : false} style={{ width: 102 }}>
                                                              <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.material !== curr?.contestent?.material} className='m-0'>
                                                                {
                                                                  ({ getFieldValue }) => {
                                                                    const file = getFieldValue(['contestent', field.name, 'material'])
                                                                    console.log(file, "mayankfile")
                                                                    const fileList = file?.fileList || contestentData[field.name]?.material?.fileList || []

                                                                    return (
                                                                      <Form.Item
                                                                        initialValue={contestentData[field.name]?.material}
                                                                        className='mb-2' name={[field.name, 'material']} rules={[{ required: true, message: 'Please upload the image' }]}>
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
                                                                            accept=".jpg,.jpeg,.png"
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
                                                            </Spin>


                                                            <Typography.Paragraph className='mb-3 m-0'>{"[ This could be the Act/Performance/Creation/etc., that voters are to vote on]"}</Typography.Paragraph>
                                                          </div>

                                                          {/* Profile Pic */}
                                                          <div>

                                                            <Spin spinning={uploadLoading?.[`contestent${index}profile_pic`] ? uploadLoading?.[`contestent${index}profile_pic`] : false} style={{ width: 102 }}>
                                                              <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.profile_pic !== curr?.contestent?.profile_pic} className='m-0'>
                                                                {
                                                                  ({ getFieldValue }) => {
                                                                    const file = getFieldValue(['contestent', field.name, 'profile_pic']);
                                                                    const fileList = file?.fileList || contestentData[field.name]?.profile_pic?.fileList || []

                                                                    return (
                                                                      <Form.Item
                                                                        initialValue={contestentData[field.name]?.profile_pic}
                                                                        className='mb-2' name={[field.name, 'profile_pic']} rules={[{ required: true, message: 'Please upload the profile pic' }]}>
                                                                        <>
                                                                          <Upload
                                                                            customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                                                            onChange={(info) => {
                                                                              if (info?.fileList[0]?.status === "done") {
                                                                                handleFileUpload(['contestent', index, 'profile_pic'], info.fileList);
                                                                              }
                                                                            }}
                                                                            accept='.png*,.jpeg,.jpg'
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
                                                            </Spin>

                                                            <Typography.Paragraph className='mb-3 m-0'>Upload Contestant picture</Typography.Paragraph>
                                                          </div>

                                                          {/* Video Intro */}
                                                          <div>
                                                            <Spin spinning={uploadLoading?.[`contestent${index}video_intro`] ? uploadLoading?.[`contestent${index}video_intro`] : false} style={{ width: 102 }}>
                                                              <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.video_intro !== curr?.contestent?.video_intro} className='m-0'>
                                                                {
                                                                  ({ getFieldValue }) => {
                                                                    const file = getFieldValue(['contestent', field.name, 'video_intro']);
                                                                    const fileList = file?.fileList || contestentData[field.name]?.video_intro?.fileList || []

                                                                    return (
                                                                      <Form.Item
                                                                        initialValue={contestentData[field.name]?.video_intro}
                                                                        name={[field.name, 'video_intro']} className='mb-2' label={<label className='text-black primary-font-size'>Video Intro</label>} rules={[{ required: true, message: 'Please upload the video' }]}>
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
                                                            </Spin>
                                                            <Typography.Paragraph className='mb-3 m-0'>{"[Upload a maximum of one minute video intro about you]"}</Typography.Paragraph>
                                                          </div>
                                                          {/* Social Media */}
                                                          <div>
                                                            <label className='text-black primary-font-size'>Enter Social Media Handles (optional)</label>
                                                            <Form.Item>
                                                              <Form.List name={[field.name, 'social_media']} initialValue={contestentData[field.name]?.social_media}>
                                                                {(subFields, subOpt) => (
                                                                  <Fragment>
                                                                    {subFields.map((subField, subIndex) => (
                                                                      <div key={subIndex}>
                                                                        {/* Social Media Handler */}
                                                                        <Form.Item name={[subField.name, 'type']}>
                                                                          <Select size='large' className='bg-transparent ps-0' placeholder='Enter social media Handles'>
                                                                            <Select.Option value="Facebook">Facebook</Select.Option>
                                                                            <Select.Option value="YouTube">YouTube</Select.Option>
                                                                            <Select.Option value="Tiktok">Tiktok</Select.Option>
                                                                            <Select.Option value="URL_Link">URL Link</Select.Option>
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
                                                          <Form.Item initialValue={contestentData[field.name]?.contest_be_watched} name={[field.name, 'contest_be_watched']} rules={[{ required: true, message: 'Please enter the link' }]}>
                                                            <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Paste the link where your contest material can be viewed/watch i.e., YouTube, Tiktok, url link, etc' />
                                                          </Form.Item>

                                                          {/* Contest Link */}
                                                          <Form.Item initialValue={contestentData[field.name]?.contest_link} name={[field.name, 'contest_link']} rules={[{ required: true, message: 'Please enter the contest link' }]}>
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
                                                            <Spin spinning={uploadLoading?.[`contestent${index}contest_act`] ? uploadLoading?.[`contestent${index}contest_act`] : false}>
                                                              <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contestent?.contest_act !== curr?.contestent?.contest_act} className='m-0'>
                                                                {
                                                                  ({ getFieldValue }) => {
                                                                    const file = getFieldValue(['contestent', field.name, 'contest_act']);
                                                                    const fileList = file?.fileList || contestentData[field.name]?.contest_act?.fileList || []
                                                                    return (
                                                                      <Form.Item
                                                                        initialValue={contestentData[field.name]?.contest_act}
                                                                        name={[field.name, 'contest_act']}>
                                                                        <Upload prefixCls='upload-contest-act'
                                                                          fileList={fileList || []}
                                                                          customRequest={({ onSuccess }: any) => onSuccess("ok")}
                                                                          showUploadList={{
                                                                            showPreviewIcon: false
                                                                          }}
                                                                          accept="video/mp4,video/*"
                                                                          onChange={(info) => {
                                                                            if (info?.fileList[0]?.status === "done") {
                                                                              handleFileUpload(['contestent', index, 'contest_act'], info?.fileList);
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
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                                {/* <Form.Item>
                                                <Button onClick={() => add()} size='small' htmlType='button' type="default" className='text-black fw-normal mt-3' shape='round'>+ Add More</Button>
                                              </Form.Item> */}
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

                  </FormCommonCard>

                  {participantsArray.length ?
                    <FormCommonCard className="mb-5">
                      <div>
                        <SectionTitle title='Invited Participants' className='mb-3 sub-title-font-size fw-bold' />
                        {participantsArray.map((res, index) => {
                          const email = findEmailByIndex(index);
                          return (
                            <div key={index} className='mb-3 d-flex align-items-center gap-3'>
                              <span>{res?.contestent_email}</span>
                              {res?.contestent_email && (
                                <Button
                                  icon={<TrashFilled />}
                                  className='text-danger fw-semibold border-0'
                                  size='small'
                                  danger
                                  ghost
                                  htmlType='button'
                                  type='primary'
                                  onClick={() => deleteParticipant(index)}
                                >

                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </FormCommonCard>
                    : ''}


                  {userEmailsInvite?.contestent.length > 0 ?
                    <FormCommonCard className="mb-5">
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
                      </div>
                    </FormCommonCard>
                    : ''}



                  {/* Number of Winners to Be Selected */}
                  {/* <div className='mt-3'>
                    <SectionTitle title='Number of Winners to Be Selected' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="total_winners">
                    <Input type='text' size='large' className='bg-transparent ps-0' placeholder='Enter Number of Winners to Be Selected' />
                  </Form.Item> */}


                  <FormCommonCard className="mb-5">
                    {/* Are There Any Prize For Winners? */}
                    <div>
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
                        let val: boolean = getFieldValue('is_winner_prize');
                        return (
                          <Fragment>
                            {
                              val &&

                              <Fragment>

                                <div className='mt-3'>
                                  <SectionTitle title='Specify Reward Type' className='mb-4 sub-title-font-size fw-bold' />
                                </div>



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
                                                popupMatchSelectWidth={true} size='large' className='bg-transparent ps-0' placeholder='Please select position'>
                                                {
                                                  Array.from({ length: lastInputValue }, (_, index) => (
                                                    <Select.Option
                                                      disabled={selectedOptions1.includes(index + 1)}
                                                      key={index}
                                                      value={index + 1}
                                                    >
                                                      {index !== 0 ? `${index} Runner Up` : "Winner"}
                                                    </Select.Option>
                                                  ))
                                                }
                                              </Select>
                                            </Form.Item>

                                            <Flex className='mb-4'>
                                              <Form.Item className='w-100' name={[field.name, 'prize']} label={<label className='text-black primary-font-size fw-bold'>Specify / Describe Reward
                                                {/* (For) */}
                                              </label>}
                                                rules={[
                                                  ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                      if (!value) {
                                                        return Promise.reject(new Error('Please enter the reward amount'));
                                                      }
                                                      if (value !== undefined && value <= 0) {
                                                        return Promise.reject(new Error('Reward amount must be greater than zero'));
                                                      }
                                                      return Promise.resolve();
                                                    },
                                                  }),
                                                ]}
                                              >
                                                <Input size='large' prefix="$" className='bg-transparent ps-0 w-100' placeholder='Enter Amount ($)' onKeyPress={(e) => {
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
                  </FormCommonCard>

                  <FormCommonCard className="mb-5">
                    {/* Contact Details */}
                    <div>
                      <SectionTitle title='Contact Details' className='mb-2 sub-title-font-size fw-bold' />
                      <Typography.Paragraph className='text-black m-0 mb-3'>We will only show these to your winners at the end of the voting period.</Typography.Paragraph>
                    </div>

                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item name="full_name" rules={[({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value) {
                              return Promise.reject(new Error(`Please enter the full name`));
                            }
                            if (value && !henceforthValidations.nameValidation(getFieldValue('full_name'))) {
                              return Promise.reject(new Error(`Name should conatins alphabets only. for eg - John Doe`));
                            }
                            else {
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
                          <Form.Item className='flex-shrink-0' name="country_code" initialValue={(props?.country_code == undefined) ? null : props?.country_code} rules={[{ required: true, message: 'Please select country code' }]}>
                            <Select placeholder='Country Code' onInputKeyDown={(e: any) => {
                              if (!/[0-9]/.test(e.key) && e.keyCode !== 8) {
                                e.preventDefault();
                              }
                            }} prefixCls='country-code-field' style={{ minWidth: 140, width: "100%" }} showSearch>
                              {
                                countryCode?.map((res) => {
                                  return (
                                    <Select.Option key={res?.dial_code} value={res.dial_code}>{res?.flag} {res?.dial_code}</Select.Option>
                                  )
                                })
                              }
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="phone_number"
                            className='w-100'
                            rules={[
                              { required: true, message: 'Please enter the phone number' },
                              { min: 8, message: 'Phone number must be at least 8 digits' },
                              { max: 15, message: 'Phone number cannot be more than 15 digits' }
                            ]}
                          >
                            <Input
                              size='large'
                              className='bg-transparent ps-0 w-100'
                              placeholder='Phone Number'
                              onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </Form.Item>
                        </Space.Compact>
                      </Col>
                      <Col span={24} lg={24}>
                        <Form.Item name="full_address">
                          <Input size='large' className='bg-transparent ps-0' placeholder='Office Address' ref={(ref) => locationSearchRef.current = ref} />
                        </Form.Item>
                      </Col>
                      <Col span={24} lg={12} xl={8}>
                        <Form.Item name="country">
                          <Input size='large' className='bg-transparent ps-0' placeholder='Country' />
                        </Form.Item>
                      </Col>
                      <Col span={24} lg={12} xl={8}>
                        <Form.Item name="state">
                          <Input size='large' className='bg-transparent ps-0' placeholder='State' />
                        </Form.Item>
                      </Col>
                      <Col span={24} lg={12} xl={8}>
                        <Form.Item name="city">
                          <Input size='large' className='bg-transparent ps-0' placeholder='City' />
                        </Form.Item>
                      </Col>
                      <Col span={24} lg={12} xl={8}>
                        <Form.Item name="postal_code">
                          <Input size='large' className='bg-transparent ps-0' placeholder='Postal Code' />
                        </Form.Item>
                      </Col>
                    </Row>
                  </FormCommonCard>

                  <FormCommonCard className="mb-5">
                    {/* Are you Rewarding Your Voters? */}
                    <div>
                      <SectionTitle title='Are you Rewarding Your Voters?' className='mb-2 sub-title-font-size fw-bold' />
                    </div>

                    <Form.Item className="m-0" name="is_voter_prize" rules={[{ required: true, message: 'Please select an option' }]} shouldUpdate={(prev: any, curr: any) => prev.is_voter_prize !== curr.is_voter_prize}>
                      <Radio.Group className='mt-3' size='large'>
                        <Radio value={true} className='text-black'>Yes</Radio>
                        <Radio value={false} className='text-black'>No</Radio>
                      </Radio.Group>
                    </Form.Item>


                    {/* Specify Reward Type */}

                    <Form.Item shouldUpdate={(prev: any, curr: any) => prev.is_voter_prize !== curr.is_voter_prize}>
                      {({ getFieldValue }) => {
                        let val = getFieldValue('is_voter_prize');
                        return (
                          <Fragment>
                            {val &&
                              <>
                                <div className='mt-3'>
                                  <SectionTitle title='Specify Reward Type' className='mb-4 sub-title-font-size fw-bold' />
                                </div>
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
                                                        <Select.Option disabled={selectedOptions.includes(Number(index + 1))} value={index + 1}>Round {index + 1}</Select.Option>
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
                                                ({ getFieldValue }) => ({
                                                  validator(_, value) {
                                                    if (!value) {
                                                      return Promise.reject(new Error('Please enter the number of voter to be selected'));
                                                    }
                                                    if (value !== undefined && value <= 0) {
                                                      return Promise.reject(new Error('voters cannot be zero'));
                                                    }
                                                    return Promise.resolve();
                                                  },
                                                }),
                                              ]}
                                            >
                                              <Input size='large' className='bg-transparent ps-0 w-100' placeholder='Number of Voters to Be Selected' onKeyPress={(e) => {
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
                              </>
                            }
                          </Fragment>
                        )
                      }
                      }
                    </Form.Item>
                  </FormCommonCard>

                  <FormCommonCard className="mb-5">
                    <SectionTitle title='Additional Info' className='mb-3 sub-title-font-size fw-bold' />
                    {/* add_info */}
                    <Form.Item name="add_info">
                      <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Additional Information [Optional]' />
                    </Form.Item>

                  </FormCommonCard>
                  <FormCommonCard className="mb-5">
                    <div>
                      <SectionTitle title='Consent and Submission' className='mb-4 sub-title-font-size fw-bold' />
                      <Typography.Paragraph className='fw-normal text-black'> I confirm that the information provided is accurate and agree to SEE Ltd.'s terms and conditions for posting auditions. I understand that SEE Ltd. reserves the right to review and approve all audition postings to ensure they meet the platform's standards for quality and safety.</Typography.Paragraph>
                    </div>
                  </FormCommonCard>



                  <Form.Item className='my-4' valuePropName="checked" name={'confirm_check'} rules={[{
                    required: true, validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Please check the checkbox'))
                  }]}>
                    <Checkbox className='text-black' onChange={(e) => { console.log(e?.target?.checked) }}>
                      <em className=''>I confirm and Consent {" "}</em>
                      <Link href="/terms-condition" target='_blank' className='text-black'>
                        <em className='text-decoration-underline text-warning'>(Terms and Conditions)</em>
                      </Link>
                    </Checkbox>
                  </Form.Item>


                  {error?.errorFields &&
                    <CommonModal isMaskable={true} title='Please fill the missing fields' isModalOpen={openErrorMsg}>
                      <div className='text-center'>
                        <p>There have been some errors, kindly revise the information and resubmit.</p>

                        {/* <div style={{maxHeight:450, overflowY:"auto"}}>
                    {error?.errorFields?.flatMap((obj: any,index:number) => <p className='m-0 mb-1 text-danger'>{index+1}. {obj?.errors}</p>)}
                    </div> */}

                        <div className='text-center mt-4'>
                          <Button type='primary' htmlType='button' shape='round' onClick={() => setOpenErrorMsg(false)}>Cancel</Button>
                        </div>
                      </div>
                    </CommonModal>}


                  <CommonModal isMaskable={true} title='Attention' isModalOpen={openWarningModal}>
                    <div className='text-center'>
                      <ul className='list-unstyled mb-5 d-flex flex-column gap-2'>
                        <li className='text-danger'>&#x2022; Please note that you can only edit the form up to a specified deadline i.e before one hour left for contest to start. Make sure to complete all the edits before this deadline. </li>

                        {showMessage && (
                          <li className='text-danger'>
                            &#x2022; The contest will start soon. Kindly review all the details that you have filled in your form because you will not get the time to edit the contest details.
                          </li>
                        )}

                      </ul>
                      <Flex gap={12} justify={'center'}>
                        <Button type='primary' htmlType='button' shape='round' onClick={cancelWarningModal}>Cancel</Button>
                        <Button type='primary' htmlType='button' shape='round' loading={formLoading} onClick={() => onFinish('submit')}>Proceed</Button>
                      </Flex>
                    </div>
                  </CommonModal>

                  <Flex gap={12} justify={screens.md ? 'end' : 'start'}>
                    {/* <Button size='small' htmlType='button' loading={formLoading} className='rounded-pill px-4' type='primary' onClick={() => onFinish('draft')}>Save as Draft</Button> */}
                    <Link href="/"><Button size='small' className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button></Link>
                    <Button size='small' htmlType='submit' className='rounded-pill px-4' type='primary'>Submit</Button>
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
          <Typography.Title className='fw-semibold primary-font-size m-0 mb-3'>Enter any Specific Information </Typography.Title>
          {router.query.type === "NONE" &&
            <>
              <Form scrollToFirstError layout='vertical' className='light_theme_form' onFinish={InviteUser} form={inviteForm}>
                <Form.Item name="invite_info" rules={[{ required: true, message: 'Please enter the invite info' }]}>
                  <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Additional/Important Information Here' />
                </Form.Item>
                <Form.Item className='mb-2' name={'invite_from'} label={<label className='fw-semibold primary-font-size'>Invite from:</label>} rules={[{ required: true, message: 'Please select an option' }]}>
                  <Radio.Group>
                    {/* <Radio value={'Phone'}>Phone Contacts</Radio> */}
                    <Radio value={'Email'}>Email</Radio>
                    {/* <Radio value={'Facebook'}>Facebook</Radio>
                    <Radio value={'WhatsApp'}>WhatsApp</Radio> */}
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="all_contestent_email" className='mb-2' label={<label className='fw-semibold primary-font-size'>Enter Email & Send</label>}>
                  <Select
                    mode="tags"
                    placeholder="Enter Email & Send"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Flex className='mt-3' gap={12} justify={screens.lg ? 'end' : 'start'}>
                  <Button size='small' onClick={cancelInviteModal} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button>
                  <Button size='small' className='rounded-pill px-4 bg-white' htmlType='submit' type='default'>Send</Button>
                </Flex>
              </Form>
            </>
          }

          {/* onFinish={InviteParticipant} */}
          {router.query.type === "PARTICIPANT" &&
            <Form layout='vertical' className='light_theme_form' onFinish={InviteParticipant} form={inviteForm}>
              <>
                <Form.Item name="invite_info" rules={[{ required: true, message: 'Please enter the invite info' }]}>
                  <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Additional/Important Information Here' />
                </Form.Item>
                <Form.Item className='mb-2' name={'invite_from'} label={<label className='fw-semibold primary-font-size'>Invite from:</label>} rules={[{ required: true, message: 'Please select an option' }]}>
                  <Radio.Group>
                    {/* <Radio value={'Phone'}>Phone Contacts</Radio> */}
                    <Radio value={'Email'}>Email</Radio>
                    {/* <Radio value={'Facebook'}>Facebook</Radio> */}
                    {/* <Radio value={'WhatsApp'}>WhatsApp</Radio> */}
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="contestent_email" rules={[{ required: true, type: "email", whitespace: true, message: "Please enter the email" }]} className='mb-2' label={<label className='fw-semibold primary-font-size'>Enter Email & Send</label>}>
                  <Input size='large' className='bg-transparent ps-0' placeholder='Enter Email & Send' />
                </Form.Item>
                <Flex className='mt-3' gap={12} justify={screens.lg ? 'end' : 'start'}>
                  <Button size='small' onClick={cancelInviteModal} className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button>
                  <Button size='small' className='rounded-pill px-4 bg-white' htmlType='submit' type='default'>Send</Button>
                </Flex>
              </>
            </Form>
          }
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


export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const _id = context.query._id as string;
    // console.log(_id, typeof _id);

    // *********************** Get Contest BY Id API Call ***********************
    const apiRes = await henceforthApi.Contest.contestDraftDetail(_id);
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


CompleteDraft.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default CompleteDraft