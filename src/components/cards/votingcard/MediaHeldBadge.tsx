
import { Tag } from 'antd'

const MediaHeldBadge = (props:any) => {
  return (
    <Tag color='#00000040' className='px-3 py-1 rounded-pill text-start'>
      {props.media_type}
    </Tag>
  )
}

export default MediaHeldBadge