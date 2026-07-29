import { Col, Grid, Row, Typography } from 'antd'
import React from 'react'

import footer_logo from "@/assets/logo/footer-logo.png"
import Link from 'next/link'

const Email = () =>
  <svg width="32" height="32" viewBox="0 0 33 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32.0966 20.9441C32.0966 25.3013 28.5983 28.8308 24.2411 28.8464H24.2255H8.74878C4.40718 28.8464 0.862061 25.3326 0.862061 20.9754V20.9597C0.862061 20.9597 0.871431 14.0476 0.883925 10.5712C0.885486 9.91839 1.63511 9.55295 2.1458 9.959C5.85646 12.9028 12.4922 18.2705 12.575 18.3407C13.6838 19.2294 15.0894 19.7307 16.5262 19.7307C17.963 19.7307 19.3685 19.2294 20.4773 18.3236C20.5601 18.2689 27.0475 13.0621 30.8144 10.0699C31.3266 9.66227 32.0794 10.0277 32.081 10.6789C32.0966 14.1288 32.0966 20.9441 32.0966 20.9441Z" fill="#3D3D3D" />
    <path d="M31.278 4.90846C29.9256 2.35973 27.2644 0.732422 24.3346 0.732422H8.74856C5.81876 0.732422 3.15758 2.35973 1.80512 4.90846C1.50215 5.47848 1.64583 6.18907 2.15026 6.59199L13.7461 15.867C14.5582 16.523 15.5421 16.8494 16.526 16.8494C16.5322 16.8494 16.5369 16.8494 16.5416 16.8494C16.5463 16.8494 16.5525 16.8494 16.5572 16.8494C17.5411 16.8494 18.525 16.523 19.3371 15.867L30.9329 6.59199C31.4373 6.18907 31.581 5.47848 31.278 4.90846Z" fill="black" />
  </svg>

const Map = () =>
  <svg width="32" height="32" viewBox="0 0 33 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.74124 2.47033C13.6157 -0.361948 19.6073 -0.312445 24.4361 2.60001C29.2173 5.57178 32.1233 10.8755 32.0964 16.5808C31.9849 22.2488 28.8689 27.5766 24.9739 31.6953C22.7259 34.0832 20.211 36.1947 17.4807 37.9866C17.1995 38.1492 16.8915 38.2581 16.5719 38.3078C16.2642 38.2947 15.9647 38.2038 15.7001 38.0433C11.5318 35.3507 7.87496 31.9138 4.90544 27.8978C2.42063 24.5454 1.00894 20.4953 0.862061 16.2974L0.873185 15.6868C1.07607 10.2073 4.04083 5.20146 8.74124 2.47033ZM18.5035 11.6131C16.5219 10.7708 14.2372 11.2284 12.7163 12.7723C11.1953 14.3161 10.7381 16.6417 11.558 18.6631C12.378 20.6846 14.3134 22.0031 16.4606 22.0031C17.8673 22.0132 19.2195 21.4498 20.2159 20.4384C21.2123 19.4269 21.7702 18.0515 21.7652 16.6186C21.7727 14.4315 20.485 12.4554 18.5035 11.6131Z" fill="black" />
    <path d="M16.4789 45.0001C22.6398 45.0001 27.6341 44.0013 27.6341 42.7691C27.6341 41.537 22.6398 40.5381 16.4789 40.5381C10.3181 40.5381 5.32373 41.537 5.32373 42.7691C5.32373 44.0013 10.3181 45.0001 16.4789 45.0001Z" fill="#3D3D3D" />
  </svg>

const Phone = () =>
  <svg width="32" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.2565 5.66185C19.513 5.5245 18.8302 5.99898 18.6886 6.72475C18.5471 7.45052 19.023 8.15912 19.7463 8.30115C21.924 8.72569 23.6055 10.4113 24.0317 12.5965V12.598C24.153 13.227 24.7067 13.6843 25.3445 13.6843C25.43 13.6843 25.5156 13.6765 25.6027 13.6609C26.326 13.5158 26.802 12.8087 26.6604 12.0814C26.0242 8.81777 23.5121 6.29709 20.2565 5.66185Z" fill="#727272" />
    <path d="M20.1566 0.221858C19.8082 0.171912 19.4582 0.274925 19.1798 0.496558C18.8936 0.721312 18.7147 1.04596 18.6758 1.40962C18.5934 2.14476 19.1238 2.80966 19.858 2.89238C24.921 3.45739 28.8564 7.40151 29.4257 12.4803C29.5019 13.1608 30.0727 13.6743 30.754 13.6743C30.8054 13.6743 30.8552 13.6712 30.9065 13.665C31.2627 13.626 31.58 13.4496 31.804 13.1687C32.0264 12.8877 32.1275 12.5381 32.0871 12.1807C31.3778 5.84384 26.4734 0.925776 20.1566 0.221858Z" fill="#3D3D3D" />
    <path fillRule="evenodd" clipRule="evenodd" d="M14.9685 17.3441C21.1989 23.5728 22.6124 16.3669 26.5793 20.331C30.4038 24.1544 32.6019 24.9204 27.7563 29.7646C27.1494 30.2523 23.2931 36.1206 9.74069 22.5721C-3.81337 9.02186 2.05156 5.16162 2.53947 4.55485C7.39673 -0.302721 8.14955 1.90816 11.974 5.73152C15.941 9.69736 8.73805 11.1154 14.9685 17.3441Z" fill="black" />
  </svg>


const TheFooter = () => {
  const screens = Grid.useBreakpoint();
  return (
    <footer>
      <div className="container">
        <Row className='pb-4' justify={'space-between'} gutter={[{ md: 24 }, { xs: 24, sm: 24, md: 32 }]}>
          <Col xs={24} sm={12} md={12} lg={6} xl={8} xxl={6}>
            <h6 className='sub-title-font-size fw-bold text-black mb-3 mb-md-4 mb-lg-5'>Contact</h6>
            <ul className='list-unstyled d-flex flex-column gap-4 gap-lg-5 mb-0'>
              <li className='text-black d-flex gap-3 fw-medium'>
                <Phone />
                <span>619-393-4981 ext. 101</span>
              </li>
              <li className='text-black d-flex gap-3 fw-medium'>
                <Email />
                <span>contact@seetv.com</span>
              </li>
              <li className='text-black d-flex gap-3 fw-medium'>
                <Map />
                <span>
                  501 West Broadway,
                  Suite 800, San Diego, CA
                  92101
                </span>
              </li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={12} lg={5} xl={6} xxl={5}>
            <h6 className='sub-title-font-size fw-bold text-black mb-3 mb-md-4 mb-lg-5'>Links</h6>
            <ul className='list-unstyled d-flex flex-column gap-3 mb-0'>
              <li className='text-black'>
                <Link href={'/terms-condition'} className='text-black'>Terms and Conditions</Link>
              </li>
              <li className='text-black'>
                <Link href={'/privacy-policy'} className='text-black'>Privacy Policy</Link>
              </li>
            </ul>
          </Col>
          <Col xs={24} sm={24} md={24} lg={11} xl={10} xxl={9}>
            <div className='text-center text-lg-start'>
              <img src={footer_logo.src} className='img-fluid' alt="logo" />
              <Typography.Paragraph className={`mt-3 mb-0 text-black ${screens.md ? 'primary-font-size' : ''}`}>SEE is a pioneering digital platform designed to revolutionize the entertainment industry by providing a comprehensive suite of tools for managing auditions, shows, events, and interactive voting sessions. Our platform serves as a central hub where talent meets opportunity, and audiences engage with content in dynamic and meaningful ways.</Typography.Paragraph>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24} className='text-center py-3'>
            <Typography.Paragraph className='m-0 text-black'>SEEzone 2024 &copy; All Right Reserved</Typography.Paragraph>
          </Col>
        </Row>
      </div>
    </footer>
  )
}

export default TheFooter