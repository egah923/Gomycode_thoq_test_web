import React, { useContext } from 'react'
import profile from "@/assets/images/profile.png"
import { Button, Col, Flex, Grid, Row, Typography } from 'antd';
import Link from 'next/link';
import { GlobalContext } from '@/context/Provider';
import henceforthApi from '@/utils/henceforthApi';
import { destroyCookie } from 'nookies';
import { COOKIES_USER_ACCESS_TOKEN } from '@/context/actionTypes';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ProfileLayout = (props: any) => {
  const router = useRouter();

  const screens = Grid.useBreakpoint();
  const { Toast, userInfo, setUserInfo } = useContext(GlobalContext);


  const logOut = async () => {
    try {
      // setLoading(true)
      const apiRes = await henceforthApi.Auth.logout();
      // Toast.success(apiRes.message)

      destroyCookie(null, COOKIES_USER_ACCESS_TOKEN, {
        maxAge: 0,
        path: "/",
      });

      setUserInfo(null as any)
      router.replace({
        pathname: '/auth/signin'
      })
    } catch (error) {
      Toast.error(error)
      // setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>
          Profile | SEEzone
        </title>
      </Head>
      <section className='profile-wrapper py-3 bg-light position-relative'>
        <div className="container">
          <Row>
            <Col span={24}>
              <div className='position-absolute profile-image start-0 end-0 mx-auto d-inline-block text-center'>
                <img src={userInfo?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${userInfo?.profile_pic}` : profile.src}
                  width={150} height={150} className='rounded-circle object-fit-cover border bg-light' alt="profile img" onError={(e) => { e.currentTarget.src = profile.src }} />
              </div>
              <div>
                <Flex className='mt-md-4 mt-5 pt-5 pt-md-0' gap={12} justify={screens.md ? 'end' : 'center'}>
                  <Link href="/profile/edit"><Button size='small' className='rounded-pill px-4 shadow-sm' type='primary'>Edit Profile</Button></Link>
                  <Button size='small' className='rounded-pill px-4 text-white fw-semibold' type='primary' onClick={logOut} danger>Logout</Button>
                </Flex>
              </div>
              <div className='text-center mt-md-5 mt-4'>
                <Typography.Title className='title-font-size fw-normal text-black m-0 mb-2 text-capitalize'>{userInfo?.name}</Typography.Title>
                {userInfo?.user_name &&
                  <Typography.Title className='primary-font-size fw-normal text-black m-0'>
                    {userInfo?.user_name}
                  </Typography.Title>}
              </div>
            </Col>
          </Row>

          {props.children}
        </div>
      </section>
    </>
  )
}

export default ProfileLayout