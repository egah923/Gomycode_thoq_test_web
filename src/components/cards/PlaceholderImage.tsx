import React from 'react'
import { Col, Row, Typography } from 'antd'
import NoContestFound from './NoContestFound';

// interface PlaceholderImageProps {
//   description: string;
// }

const PlaceholderImage = ({ description, ...props }: any) => {
  return (
    <Row justify={'center'}>
      <Col span={24} xs={24} {...props}>
        {/* <div className="text-center mx-auto py-4 py-md-5"> */}
        <div className="text-center mx-auto pt-4 pt-md-5">
          <NoContestFound />
          <Typography.Paragraph className='mt-2 fw-medium text-black'>{description}</Typography.Paragraph>
        </div>
      </Col>
    </Row>
  )
}

export default PlaceholderImage