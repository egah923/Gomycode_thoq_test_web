import SectionTitle from '@/components/common/SectionTitle';
import WrapperElement from '@/components/common/WrapperElement';
import { GlobalContext } from '@/context/Provider';
import RootLayout from '@/layouts/RootLayout';
import henceforthApi from '@/utils/henceforthApi';
import { Button, Col, Flex, Form, Grid, Input, Row, Select, Typography } from 'antd';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode, useContext, useState } from 'react'

const AddRandomizer = (props: any) => {
  const { Toast } = useContext(GlobalContext);
  const router = useRouter()
  const screens = Grid.useBreakpoint();
  const [loading, setLoading] = useState(false)
  console.log(props, "props");



  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      let payload = {
        contest_id: props?._id,
        round_ids: values?.round_ids,
        reward_description: values?.reward_description,
        number_of_voter: Number(values?.number_of_voter)
      }

      const apiRes = await henceforthApi.Contest.randomizerContest(payload)
      console.log(apiRes.message);

      router.push({
        pathname: `/contest/${props?._id}/details`,
      })
    } catch (error) {
      Toast.error(error)
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero-section py-5">
        <div className="container">
          <Row justify={'center'}>
            <Col span={24} md={17}>
              <div className="text-center">
                <Typography.Title level={1} className="fw-medium m-0 mb-4 fw-bold text-black text-shadow">Welcome!</Typography.Title>
                <div className="mb-4">
                  <Typography.Paragraph className="mb-0 mb-3 fw-normal text-shadow-sm text-black">If you've hosted your contest or event voting through the SEE Voting Place and need to reward your voters, the Smart Randomizer is your go-to solution for fair and transparent selection.</Typography.Paragraph>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section className="hero-section py-5">
        <div className="container">
          <WrapperElement>
            <Row>
              <Col span={24}>
                <div>
                  <Typography.Paragraph className="mb-0 mb-3 fw-semibold text-black">
                    Please fill in the details below
                  </Typography.Paragraph>
                </div>
              </Col>
            </Row>
          </WrapperElement>

          <Row>
            <Col span={24}>
              <WrapperElement>
                <Form layout='vertical' className='light_theme_form' onFinish={onFinish} onFinishFailed={(errorInfo: any) => console.log("Failed:", errorInfo)}>
                  <div>
                    <SectionTitle title='Select Your Organized Voting Event' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="round_ids">
                    <Select size='large' className='bg-transparent ps-0' placeholder='Select Round' mode='multiple'>
                      {
                        props?.rounds?.map((res,index) => <Select.Option key={res?._id} value={res?._id} className="text-capitalize">Round {index+1}</Select.Option>)
                      }
                    </Select>
                  </Form.Item>
                  <div>
                    <SectionTitle title='Specify Reward Type' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="reward_description">
                    <Input.TextArea rows={4} size='large' className='bg-transparent ps-0' placeholder='Enter reward description here...' />
                  </Form.Item>
                  <Typography.Paragraph italic className='text-black m-0 mb-4'>Note: The SEE platform has zero tolerance for defaulting on or falsely mentioning rewards. It is mandatory that all your selected winners receive their prizes. Any confirmed case of non-compliance could lead to the termination of your SEE account and possible penalties.</Typography.Paragraph>

                  <div className='mt-5'>
                    <SectionTitle title='Number of Voters to Be Selected' className='mb-4 sub-title-font-size fw-bold' />
                  </div>
                  <Form.Item name="number_of_voter">
                    <Input size='large' className='bg-transparent ps-0' placeholder='Number of Voters to Be Selected' />
                  </Form.Item>
                  <Typography.Paragraph italic className='text-black m-0 mb-4'>Proceed with your selections to ensure a fair and rewarding experience for your voters.</Typography.Paragraph>

                  <Flex gap={12} justify={screens.md ? 'end' : 'start'}>
                    <Link href={`/contest/${props?._id}/details`}>
                      <Button size='small' className='rounded-pill px-4 border-black bg-transparent text-black' type='default'>Cancel</Button>
                    </Link>
                    <Button size='small' className='rounded-pill px-4' loading={loading} disabled={loading} type='primary' htmlType='submit'>Proceed</Button>
                  </Flex>
                </Form>
              </WrapperElement>
            </Col>
          </Row>
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
    const apiRes = await henceforthApi.Contest.details(_id);
    const contestDetail = apiRes?.data;
    console.log(apiRes, "Detail_");
    return { props: contestDetail };
  } catch (error) {
    console.error('Error fetching store detail:', error);
    return {
      props: {
        storeDetail: null,
        error: 'Failed to fetch store detail'
      }
    };
  }
};

AddRandomizer.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default AddRandomizer