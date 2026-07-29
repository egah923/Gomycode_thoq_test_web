import SectionTitle from '@/components/common/SectionTitle';
import WrapperElement from '@/components/common/WrapperElement';
import RootLayout from '@/layouts/RootLayout';
import { Typography } from 'antd';
import Head from 'next/head';
import React, { ReactNode } from 'react'

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | SEEzone</title>
      </Head>
      <section className='content-page py-4 py-md-5'>
        <div className='container text-black'>
          <WrapperElement>
            <div className='text-center'>
              <SectionTitle title='Privacy Policy' className='title-font-size mb-4 fw-bold' />
            </div>
            <Typography.Title level={2} className='sub-title-font-size'>1. Introduction</Typography.Title>
            <Typography.Paragraph>Welcome to SEE Ltd.! These Terms and Conditions govern your use of our website and services, including SEEzone, Talent Profiles, and all other features offered by SEE Ltd. By accessing or using our platform, you agree to be bound by these terms and all applicable laws and regulations.</Typography.Paragraph>

            <Typography.Title level={2} className='sub-title-font-size'>2. User Accounts</Typography.Title>
            <Typography.Title level={3} className='primary-font-size'>Registration Requirements: </Typography.Title>
            <Typography.Paragraph>Users must be at least 18 years old or have parental permission to create an account.</Typography.Paragraph>
            <Typography.Title level={3} className='primary-font-size'>Account Responsibilities: </Typography.Title>
            <Typography.Paragraph>Users are responsible for maintaining the confidentiality of their account and password and for all activities that occur under their account.</Typography.Paragraph>


            <Typography.Title level={2} className='sub-title-font-size'>3. Content</Typography.Title>
            <Typography.Title level={3} className='primary-font-size'>Intellectual Property Rights: </Typography.Title>
            <Typography.Paragraph>All content displayed on SEE Ltd. is owned by us or our content providers. This content includes, but is not limited to, text, graphics, logos, images, and software.</Typography.Paragraph>
            <Typography.Title level={3} className='primary-font-size'>User-Generated Content: </Typography.Title>
            <Typography.Paragraph>Users may post content as long as it does not infringe on intellectual property rights, violate privacy rights, or promote illegal activities.</Typography.Paragraph>

            <Typography.Title level={2} className='sub-title-font-size'>4. Prohibited Use</Typography.Title>
            <ul className='p-0 list-unstyled'>
              <li>You may not use SEE Ltd. to:</li>
              <li>Transmit or upload any harmful material including viruses or malicious code.</li>
              <li>Engage in any activity that interferes with or disrupts the platform.</li>
              <li>Conduct any unlawful activity or solicit the performance of any illegal activity.</li>
            </ul>

            <Typography.Title level={2} className='sub-title-font-size'>5. Subscription and Payment</Typography.Title>

            <Typography.Paragraph className='m-0'><b>Fees:</b> SEE Ltd. may charge fees for premium content and services. Fees are subject to change with prior notice.</Typography.Paragraph>
            <Typography.Paragraph><b>Refunds:</b> Conditions for subscription cancellations and refunds are detailed in the Refund Policy section.</Typography.Paragraph>


            <Typography.Title level={2} className='sub-title-font-size'>6. Privacy Policy</Typography.Title>
            <Typography.Paragraph>Our Privacy Policy describes how we handle the information you provide to us when you use our services. You agree to the collection and use of this information in accordance with our Privacy Policy.</Typography.Paragraph>


            <Typography.Title level={2} className='sub-title-font-size'>7. Termination</Typography.Title>
            <Typography.Paragraph>SEE Ltd. may terminate or suspend access to our services immediately, without prior notice or liability, for any breach of these Terms.</Typography.Paragraph>


            <Typography.Title level={2} className='sub-title-font-size'>8. Changes to Terms</Typography.Title>
            <Typography.Paragraph>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.</Typography.Paragraph>

            <Typography.Title level={2} className='sub-title-font-size'>9. Disclaimer of Warranties</Typography.Title>
            <Typography.Paragraph>Our services are provided "as is." SEE Ltd. makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</Typography.Paragraph>

            <Typography.Title level={2} className='sub-title-font-size'>10. Limitation of Liability</Typography.Title>
            <Typography.Paragraph>In no event shall SEE Ltd., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the platform.</Typography.Paragraph>

            <Typography.Title level={2} className='sub-title-font-size'>11. Governing Law</Typography.Title>
            <Typography.Paragraph>These terms are governed by and construed in accordance with the laws of [Jurisdiction], and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</Typography.Paragraph>

            <Typography.Title level={2} className='sub-title-font-size'>12. Contact Us</Typography.Title>
            <Typography.Paragraph>If you have any questions about these Terms, please contact us at <a className='text-primary' href="tel:support@splendideempire.com">support@splendideempire.com</a>.</Typography.Paragraph>
          </WrapperElement>
        </div>
      </section>
    </>
  )
}


PrivacyPolicy.getLayout = (page: ReactNode) => (
  <RootLayout>
    {page}
  </RootLayout>
);


export default PrivacyPolicy