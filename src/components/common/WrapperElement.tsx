import { ReactNode } from 'react'

interface WrapperElementProps {
  children: ReactNode,
  className?: string,
  noPadding?: any
}

const WrapperElement = ({ children, className, noPadding }: WrapperElementProps) => {
  return (
    <div className={`${noPadding ? '' : "px-md-5"}   ${className ? className : ''}`}>
      {children}
    </div>
  )
}

export default WrapperElement