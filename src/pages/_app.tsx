'use client'
import { parseCookies } from 'nookies';
import 'bootstrap/dist/css/bootstrap.css'
import 'src/styles/globals.scss'
import type { AppProps } from 'next/app'
import { NextPage } from 'next';
import NProgress from 'nprogress'
import React, { ReactNode } from 'react';
import Script from 'next/script';
import Head from 'next/head';
import GlobalProvider from 'src/context/Provider';
import { Router, useRouter } from 'next/router';
import { UserInfo } from 'src/interfaces';
import henceforthApi from 'src/utils/henceforthApi';
import { COOKIES_USER_ACCESS_TOKEN } from 'src/context/actionTypes';
import useNetworkStatus from '@/utils/hooks/useNetworkStatus';


type Page<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactNode) => ReactNode;
};
type Props = AppProps & {
  Component: Page;
  user_info: UserInfo;

};

NProgress.configure({ showSpinner: false })
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const MyApp = ({ Component, pageProps, ...props }: Props) => {
  const getLayout = Component.getLayout ?? ((page: ReactNode) => page);
  const router = useRouter();
  React.useEffect(() => {
    typeof document !== undefined
      ? require("bootstrap/dist/js/bootstrap.bundle.min")
      : null;
  }, [router.events]);

  return <GlobalProvider {...props}>
    <Head>
      <title>
      SEEzone
      </title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content="Amplify your contest's reach and excitement by enabling a public vote. Whether your contest is running on TV, YouTube, or any other platform, bring your contestants here for a seamless and engaging voting experience." />
    </Head>
    <Script src="https://apis.google.com/js/platform.js?onload=init" async defer></Script>
    <Script id="my-script" strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`} />
    <Script id="my-script" strategy="lazyOnload">
      {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
                    page_path: window.location.pathname,
                    });
                `}
    </Script>
    <Script async defer src="https://connect.facebook.net/en_US/sdk.js"></Script>
    {getLayout(
      <>
        <Component {...pageProps} />
      </>
    )}
  </GlobalProvider >

}

MyApp.getInitialProps = async (context: any) => {
  try {
    const accessToken = parseCookies(context.ctx)[COOKIES_USER_ACCESS_TOKEN]
    if (accessToken) {
      henceforthApi.setToken(accessToken)
      let apiRes = await henceforthApi.Profile.profile()
      console.log('apiRes', apiRes)
      const user_info = { ...apiRes?.data, access_token: accessToken }
      return { user_info }
    }
    return { user_info: null }
  } catch (error: any) {

    return { user_info: null }
  }

}

export default MyApp
