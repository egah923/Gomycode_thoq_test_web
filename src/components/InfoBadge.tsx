import { Tag } from 'antd'
interface InfoBadgeProps {
  title?: string,
  stats?: string,
  className?: string,
}

const InfoBadge = (props: InfoBadgeProps) => {
  return (
    <Tag color='#d9d9d9' className={`py-2 px-3 text-black fw-medium rounded-pill border-black ${props?.className}`}>{props?.title}  {props?.stats}</Tag>
  )
}

export default InfoBadge

