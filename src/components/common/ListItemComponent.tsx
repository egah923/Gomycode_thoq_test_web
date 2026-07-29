import { Typography } from 'antd'
interface ListItemComponentProps {
  title: string;
  description: string;
}
interface ListItemProps {
  list: ListItemComponentProps[];
}
const ListItemComponent = ({ list }: ListItemProps) => {
  return (
    <ul className='list-unstyled d-flex gap-2 flex-column m-0'>
      {list.map((item, index) => (
        <li className='d-flex justify-content-between flex-column flex-md-row gap-2' key={index}>
          <Typography.Paragraph className='fw-semibold text-black m-0 flex-shrink-0'>{item.title}</Typography.Paragraph>
          <Typography.Paragraph className='fw-normal text-black text-md-end'>{item.description}</Typography.Paragraph>
        </li>
      ))}
    </ul>

  )
}



export default ListItemComponent