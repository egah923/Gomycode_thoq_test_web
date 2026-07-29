import { Divider, Typography } from 'antd'

interface SectionTitleProps {
  title: string | any;
  hasBordered?: boolean;
  className?: string;
  isNotTextTransform?: boolean;
}
const SectionTitle = (props: SectionTitleProps) => {
  return (
    <>
      <Typography.Title level={4} className={`${!props?.isNotTextTransform ? "text-capitalize" : ""} sub-title-font-size m-0 ${props?.className ? props?.className : "fw-bold"}`}>{props?.title}</Typography.Title>
      {props?.hasBordered &&
        <div className='col-12 col-md-7 col-lg-7 col-xl-7 col-xxl-7'>
          <Divider className='border border-black my-1' />
        </div>}
    </>
  )
}

export default SectionTitle