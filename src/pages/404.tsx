
import { Button, Col, Row, Typography } from "antd"
import Link from "next/link"

const ErrorSvg = () => <svg width="889" height="308" viewBox="0 0 889 308" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.16" d="M444.455 307.209C689.922 307.209 888.911 298.478 888.911 287.708C888.911 276.938 689.922 268.207 444.455 268.207C198.989 268.207 0 276.938 0 287.708C0 298.478 198.989 307.209 444.455 307.209Z" fill="#BCBEC0" />
    <path d="M175.388 230.506H45.5938V186.023L179.431 6.06836H250.191V173.892H290.22V230.506H250.191V288.741H175.388V230.506ZM186.306 173.892V93.0144L126.869 173.892H186.306Z" fill="#D1D3D4" />
    <path d="M363.415 277.215C343.733 265.488 328.57 248.57 317.924 226.462C307.273 204.36 301.953 178.072 301.953 147.604C301.953 117.135 307.208 90.8533 317.722 68.7456C328.237 46.6439 343.258 29.6609 362.81 17.7906C382.349 5.93218 405.469 0 432.157 0C458.845 0 481.952 5.93218 501.504 17.7966C521.043 29.6609 536.076 46.6499 546.585 68.7516C557.1 90.8592 562.354 117.147 562.354 147.61C562.354 178.072 557.029 204.366 546.383 226.468C535.732 248.576 520.568 265.493 500.892 277.221C481.21 288.949 458.298 294.81 432.151 294.81C406.003 294.81 383.085 288.949 363.415 277.221V277.215ZM474.204 206.647C484.173 192.633 489.166 173.221 489.166 148.411C489.166 123.602 484.244 103.591 474.406 89.1668C464.562 74.7491 450.479 67.5343 432.151 67.5343C413.823 67.5343 399.733 74.7491 389.895 89.1668C380.052 103.591 375.135 123.341 375.135 148.411C375.135 173.482 380.117 192.633 390.097 206.647C400.066 220.667 414.084 227.674 432.151 227.674C450.218 227.674 464.224 220.667 474.204 206.647Z" fill="#D1D3D4" />
    <path d="M703.872 230.506H574.078V186.023L707.915 6.06836H778.675V173.892H818.704V230.506H778.675V288.741H703.872V230.506ZM714.791 173.892V93.0144L655.353 173.892H714.791Z" fill="#D1D3D4" />
</svg>

const ErrorPage = () => {

    return <section className="error-page vh-100">
        <div className="container-fluid h-100">
            <Row justify="center" className="h-100">
                <Col className="gutter-row" span={12}>
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="text-center">
                            <ErrorSvg />
                            <div className="text-center mt-4">
                                <Typography.Title level={3} className="m-0 mb-2 fw-bold">Sorry, There&apos;s Nothing Here...</Typography.Title>
                                <p className="mb-3 m-0">Uh no, we can&apos;t seem to find the page you&apos;re looking for.</p>
                                <Link href="/"><Button type="primary" size={'large'}>Back to Home</Button></Link>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    </section>
}

export default ErrorPage