
import logo from "@/assets/logo/logo.png"
import { Col, Row, Typography } from "antd";
import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
    title: string
    description?: string
    contact_medium?: string
    children: ReactNode,
    pageTitle: string
}

const AuthLayout = (props: AuthLayoutProps) => {
    return (
        <>
            <Head>
                <title>
                    {props?.pageTitle}  | SEEzone
                </title>
            </Head>

            <section className="auth-layout-wrapper min-vh-100 d-flex align-items-center justify-content-center mt-5 mt-xl-0 py-5">
                <div className="container">
                    <Row className='w-100' justify={'center'}>
                        <Col span={24} sm={24} md={20} lg={16} xl={12} xxl={10}>
                            <div className='auth-common-card-wrapper'>
                                {/* Logo */}
                                <div className="auth-logo-wrapper text-center mb-3">
                                    <Link href={'/?status=ONGOING&pagination=1&limit=9'}>
                                        <img className='img-fluid' src={logo.src} width={141} height={50} alt="Logo" />
                                    </Link>
                                </div>
                                <Typography.Title level={4} className='text-white text-center m-0 mb-3'>{props?.title}</Typography.Title>
                                <div className="mb-4">
                                    <p className="text-white-50 text-center m-0 mb-1">{props?.description}</p>
                                    <p className="text-white-50 text-center m-0">{props?.contact_medium}</p>
                                </div>
                                {props.children}
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    )
}
export default AuthLayout;