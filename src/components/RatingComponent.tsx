import { Flex } from 'antd'
import StarFilled from './Icons/StarFilled'
import StarEmpty from './Icons/StarEmpty'
interface RatingComponentProps {
  filledStarcount: number
  feedback_count: number
}
const RatingComponent = (props: RatingComponentProps) => {

  console.log(props, "props____________________________________");

  return (
    <Flex gap={6}>
      <Flex>
        {
          [...Array(props?.filledStarcount)].map((_, index) => <span className='me-1'><StarFilled key={index} /></span>)
        }
        {
          [...Array(5 - props?.filledStarcount)].map((_, index) => <span className='me-1'><StarEmpty key={index} /></span>)
        }
      </Flex>
      <span className='secondary-font-size fw-medium'>({props?.feedback_count})</span>
    </Flex>
  )
}

export default RatingComponent