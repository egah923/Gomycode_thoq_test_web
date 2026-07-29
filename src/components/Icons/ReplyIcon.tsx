import { IconProps } from '@/interfaces'

const ReplyIcon = ({ width = 23, height = 23 }: IconProps) => {
  return (
    <svg width={width} height={height} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.06391 3.08496L3.28516 8.86371V9.88146L9.06391 15.6602L10.0817 14.6439L5.47159 10.0338H8.17841C12.2221 10.0338 14.7981 10.9035 16.3793 12.5193C17.9635 14.1365 18.7009 16.655 18.7009 20.312V20.8151H20.1384V20.312C20.1384 16.5083 19.3808 13.527 17.4072 11.513C15.4306 9.49477 12.386 8.59634 8.17841 8.59634H5.58659L10.0817 4.10271L9.06391 3.08496Z" fill="#251C0C" />
    </svg>

  )
}

export default ReplyIcon