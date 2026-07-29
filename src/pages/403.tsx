
import { Button, Col, Row, Typography } from "antd"
import Link from "next/link"

const AccessDeniedSvg = () => <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1107_4099)">
        <path d="M75 149.95C116.421 149.95 150 116.394 150 74.9996C150 33.6054 116.421 0.0488281 75 0.0488281C33.5786 0.0488281 0 33.6054 0 74.9996C0 116.394 33.5786 149.95 75 149.95Z" fill="#EF4444" />
        <path d="M51.2123 39.6051L39.6133 51.2041L98.792 110.383L110.391 98.7838L51.2123 39.6051Z" fill="white" />
        <path d="M98.7881 39.6006L39.6094 98.7793L51.2084 110.378L110.387 51.1996L98.7881 39.6006Z" fill="white" />
    </g>
    <defs>
        <clipPath id="clip0_1107_4099">
            <rect width="150" height="150" fill="white" />
        </clipPath>
    </defs>
</svg>

const AccessDenied = () => {

    return <section className="error-page vh-100">
        <div className="container-fluid h-100">
            <Row justify="center" className="h-100">
                <Col className="gutter-row" span={12}>
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="text-center">
                            <AccessDeniedSvg />
                            <div className="text-center mt-4">
                                <Typography.Title level={3} className="m-0 mb-2 fw-bold">Access Denied</Typography.Title>
                                <p className="mb-1 m-0">You do not have permission to view this page.</p>
                                <p className="mb-3 m-0">Please check your credentials and try again.</p>
                                <Link href="/"><Button type="primary" size={'large'}>Back To Home</Button></Link>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    </section>
}

export default AccessDenied