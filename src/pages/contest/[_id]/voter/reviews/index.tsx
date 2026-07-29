
import { Avatar, Col, Flex, Grid, Rate, Row, Typography } from 'antd';
import React, { ReactNode, useState } from 'react'
import profile from "@/assets/images/profile.png"
import WrapperElement from '@/components/common/WrapperElement';
import SectionTitle from '@/components/common/SectionTitle';
import { useRouter } from 'next/router';
import StarFilled from '@/components/Icons/StarFilled';
import StarGradient from '@/components/Icons/StarGradient';
import RootLayout from '@/layouts/RootLayout';
import { GetServerSideProps } from 'next';
import henceforthApi from '@/utils/henceforthApi';
import ReviewComponents from '@/components/ReviewComponents';
import NumberFormatter from '@/components/common/NumberFormatter';

const ViewVotersReviews = (props: any) => {
  console.log(props, "props");

const screens = Grid.useBreakpoint()


  return (
    <section className='py-md-5 py-4'>
      <div className="container">
        <WrapperElement>
          {/* ****************** Contest Info ****************** */}
          <Row justify={'space-between'}>
            <Col span={24}>
              <div className='d-flex flex-column gap-3'>
                {/* Contest Info */}
                <Flex className='mb-3' gap={8} align='center' wrap={screens.md ? 'nowrap' : 'wrap'}>
                  <Flex gap={12} align='center' >
                    <Avatar src={profile.src} size={40} shape='circle'></Avatar>
                    <Typography.Text className='text-decoration-underline fw-medium text-black text-capitalize'>{props?.full_name}</Typography.Text>
                    <div className='d-inline-flex gap-1 flex-nowrap'>
                      <Rate count={5} value={props?.average_rating} allowHalf disabled />
                    </div>
                  </Flex>
                    <p className='text-lg-end text-center secondary-font-size text-black fw-medium m-0'><NumberFormatter props={props?.total_reviews} /> Reviews</p>
                </Flex>
              </div>
            </Col>
          </Row>
        </WrapperElement>


        <>
          <WrapperElement className='mb-3'>
            <Row>
              <Col span={24}>
                <div>
                  <ul className='list-unstyled d-flex gap-2 flex-column m-0'>
                    <li className='d-flex justify-content-between'>
                      <Typography.Paragraph className='fw-semibold text-black'>Number of Total Votes:</Typography.Paragraph>
                      <Typography.Paragraph className='fw-normal text-black'>{props?.total_votes
                      }</Typography.Paragraph>
                    </li>
                    <li className='d-flex justify-content-between'>
                      <Typography.Paragraph className='fw-semibold text-black'>Contests Created</Typography.Paragraph>
                      <Typography.Paragraph className='fw-normal text-black'>{props?.is_creator ? "yes" : "No"}</Typography.Paragraph>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
          </WrapperElement>

          {props?.add_info ?
            <WrapperElement className='mt-md-4'>
              <div className='mb-3'>
                <SectionTitle title='Description' className='fw-bold' />
              </div>
              <Typography.Paragraph className='text-black primary-font-size'>{props?.add_info}</Typography.Paragraph>
            </WrapperElement>
            : ''}

          <WrapperElement className='mt-md-4'>
            <ReviewComponents data={props} hasSearch />
          </WrapperElement>

        </>
      </div>

    </section >
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

ViewVotersReviews.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);

export default ViewVotersReviews