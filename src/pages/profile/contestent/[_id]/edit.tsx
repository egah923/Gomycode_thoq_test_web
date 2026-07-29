import SectionTitle from "@/components/common/SectionTitle";
import WrapperElement from "@/components/common/WrapperElement";
import TrashFilled from "@/components/Icons/TrashFilled";
import UploadIcon from "@/components/Icons/UploadIcon";
import UploadButtonIcon from "@/components/UploadButtonIcon";
import { GlobalContext } from "@/context/Provider";
import RootLayout from "@/layouts/RootLayout";
import henceforthApi from "@/utils/henceforthApi";
import { AfterFillingFields } from "@/utils/henceforthEnums";
import henceforthValidations from "@/utils/henceforthValidations";
import { Button, Flex, Form, Grid, Image, Input, Select, Spin, Typography, Upload } from "antd";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useContext, useEffect, useState } from "react";
import contentImage from "@/assets/images/contest-image.png"
const EditContestentForm = (props) => {

  console.log(props, "_______");


  const screens = Grid.useBreakpoint();
  const router = useRouter();
  const { Toast } = useContext(GlobalContext);
  const [formLoading, setFormLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false as any)
  const [form] = Form.useForm()
  const [videoUrl, setVideoUrl] = useState("");

  // ************************ Set Contestent Form ************************
  useEffect(() => {
    let data = props;
    if (props) {
      form.setFieldsValue({
        ...data,
      })
    }

    // Set Cover Media 
    if (props?.material) {
      form.setFieldsValue({
        material: {
          fileList: [{
            uid: props?.material,
            name: props?.material,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(props?.material),
          }]
        },
      })
    }
    if (props?.profile_pic) {
      form.setFieldsValue({
        profile_pic: {
          fileList: [{
            uid: props?.profile_pic,
            name: props?.profile_pic,
            status: 'done',
            url: henceforthApi.FILES.imageMedium(props?.profile_pic),
          }]
        },
      })
    }
    if (props?.video_intro) {
      const videoFileUrl = henceforthApi.FILES.video(props?.video_intro);
      form.setFieldsValue({
        video_intro: {
          fileList: [{
            uid: props?.video_intro,
            name: props?.video_intro,
            status: 'done',
            url: videoFileUrl,
          }]
        },
      });
      setVideoUrl(videoFileUrl);
    }

    if (props?.contest_act) {
      form.setFieldsValue({
        contest_act: {
          fileList: [{
            uid: props?.contest_act,
            name: props?.contest_act,
            status: 'done',
            url: henceforthApi.FILES.video(props?.contest_act),
          }]
        },
      })
    }
  }, [props])




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


  // ************************ Participant Form Submission API Call ************************
  const onFinish = async (values: any) => {
    console.log(values, "values?.contest_act");


    let payLoad = {
      contest_id: router?.query?._id,
      contestent_name: values?.contestent_name,
      age: values?.age,
      location: values?.location,
      about: values?.about,
      material: values?.material?.fileList[0]?.name,
      profile_pic: values?.profile_pic?.fileList[0]?.name,
      video_intro: values?.video_intro?.fileList[0]?.name,
      social_media: values.social_media?.map((media: any) => ({
        type: media?.type,
        url: media?.url,
      })),
      contest_be_watched: values.contest_be_watched,
      contest_link: values.contest_link,
    }

    // return

    if (values?.contest_act) {
      payLoad["contest_act"] = values?.contest_act?.fileList[0]?.name
    }

    console.log(payLoad);

    try {
      setFormLoading(true);
      const apiRes = await henceforthApi.Contestent.editContestentDetails(payLoad);
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
  return (
    <>
      <Head>
        <title>Edit Contentest | SEEzone</title>
      </Head>
      <section className="py-5">
        <div className="container">
          <WrapperElement>
            <div>
              <SectionTitle title='Edit Details Below and Submit Form for Review' className='fw-bold mb-4 mb-md-5' />
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
                        console.log(fileList, "file________");

                        return (
                          <Form.Item className='mb-2' name={'material'} rules={[{ required: true, message: 'Please upload the image' }]}>
                            <>
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
                            accept=".jpg,.jpeg,.png"
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
                {/* <Spin spinning={uploadLoading?.video_intro ? uploadLoading?.video_intro : false} style={{ width: 102 }}>
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.video_intro !== curr?.video_intro} className='m-0'>
                    {
                      ({ getFieldValue }) => {
                        let file = getFieldValue('video_intro');
                        const fileList = file?.fileList || []

                        console.log(fileList);


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
                                {fileList.length >= 1 ? "" : <UploadButtonIcon />}
                              </Upload>
                            </>
                          </Form.Item>
                        )
                      }}
                  </Form.Item>
                </Spin>

                <video controls src={props?.video_intro ? henceforthApi.FILES.video(props?.video_intro) : ""} className='video-shadow rounded-3' width={'300px'} height={200} poster={props?.contest_act ? henceforthApi.FILES.video(props?.video_intro) : ""}></video> */}

                <Spin spinning={uploadLoading?.video_intro ? uploadLoading?.video_intro : false} style={{ width: 102 }}>
                  <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.video_intro !== curr?.video_intro} className='m-0'>
                    {
                      ({ getFieldValue }) => {
                        let file = getFieldValue('video_intro');
                        const fileList = file?.fileList || []

                        console.log(fileList);

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
                                fileList={fileList}
                                onChange={(info) => {
                                  if (info?.fileList[0]?.status === "done") {
                                    handleFileUpload('video_intro', info.fileList, true, "video")
                                  }
                                }}
                              >
                                {fileList.length >= 1 ? "" : <UploadButtonIcon />}
                              </Upload>
                            </>
                          </Form.Item>
                        )
                      }}
                  </Form.Item>
                  {/* <video controls src={videoUrl} className='video-shadow rounded-3' width={'300px'} height={200} poster={props?.contest_act ? henceforthApi.FILES.video(props?.video_intro) : ""}></video> */}
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


              {/* <Spin spinning={uploadLoading?.contest_act ? uploadLoading?.contest_act : false} style={{ width: 102 }}>
                <Form.Item shouldUpdate={(prev: any, curr: any) => prev?.contest_act !== curr?.contest_act} className='m-0'>
                  {
                    ({ getFieldValue }) => {
                      let file = getFieldValue('contest_act');
                      const fileList = file?.fileList || []

                      console.log(fileList);

                      return (
                        <Form.Item name={'contest_act'} className='mb-2' label={<label className='text-black primary-font-size'>Contest Act</label>} rules={[{ required: true, message: 'Please upload the video' }]}>
                          <>
                            <Upload
                              customRequest={({ onSuccess }: any) => onSuccess("ok")}
                              accept="video/mp4,video/*"
                              listType="picture-card"
                              showUploadList={{
                                showPreviewIcon: false
                              }}
                              fileList={fileList}
                              onChange={(info) => {
                                if (info?.fileList[0]?.status === "done") {
                                  handleFileUpload('contest_act', info.fileList, true, "video")
                                }
                              }}
                            >
                              {fileList.length >= 1 ? "" : <UploadButtonIcon />}
                            </Upload>
                          </>
                        </Form.Item>
                      )
                    }}
                </Form.Item>
                </Spin> */}

                {/* <Flex gap={8} align='start' className='w-100 position-relative'>
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
                </Flex> */}


                {/* {props?.contest_act &&
                  <Image
                    width={'100%'}
                    height={250}
                    className="object-fit-cover"
                    preview={{
                      destroyOnClose: true,
                      imageRender: () => (
                        <video
                          muted
                          width="50%"
                          controls
                          src={props?.contest_act ? henceforthApi.FILES.video(props?.contest_act) : ""}
                        />
                      ),
                      toolbarRender: () => null,
                    }}
                    src={contentImage.src}
                  />} */}





                <Flex className='mt-4' align='center' wrap={screens.md ? 'nowrap' : 'wrap'} gap={12} justify={screens.md ? 'end' : 'start'}>
                  {/* <Button size='small' loading={formLoading} disabled={props?.after_filling_fields === AfterFillingFields.SUBMIT} className={`rounded-pill px-4 ${screens.sm ? '' : 'w-100'}`} type='primary' htmlType='submit'>Send Back For Review & Submission</Button>
                <Link href={'/profile/contest-joined?status=PENDING&pagination=1&limit=10'} className={screens.sm ? '' : 'w-100'}>
                  <Button size='small' className={`rounded-pill px-4 border-black bg-transparent text-black ${screens.sm ? '' : 'w-100'}`} type='default'>Cancel</Button>
                </Link> */}
                  <Button size='small' loading={formLoading} className={`rounded-pill px-4 ${screens.sm ? '' : 'w-100'}`} type='primary' htmlType='submit'>Update</Button>
                </Flex>

                {/* after_filling_fields */}
            </Form>
          </WrapperElement>
        </div>
      </section>
    </>
  )


}


export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const _id = context.query._id as string;
    console.log(_id, typeof _id);

    // *********************** Get Contest BY Id API Call ***********************
    const apiRes = await henceforthApi.Contestent.getContestentDetails(_id);
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




EditContestentForm.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default EditContestentForm