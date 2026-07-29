import { Modal } from 'antd'
import { ReactNode } from 'react'

interface CommonModalProps {
  title: string,
  isModalOpen: boolean,
  handleOk?: () => void
  handleCancel?: () => void,
  children: ReactNode,
  isMaskable?:boolean
}

const CommonModal = (props: CommonModalProps) => {
  return (
    <Modal maskClosable={props?.isMaskable} centered width={800} title={<span className="text-capitalize">{props?.title?.replaceAll("_", " ")}</span>} open={props?.isModalOpen} onOk={props?.handleOk} onCancel={props?.handleCancel} closable={false} footer={false}>
      {props?.children}
    </Modal>
  )
}

export default CommonModal