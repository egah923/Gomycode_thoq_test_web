import { Fragment } from 'react'
import PlaceholderImage from '../PlaceholderImage'
import ContestantTableRow from './ContestantTableRow'



const ContestantTable = (props: any) => {
  // console.log(props, "props");

  return (
    <div className='shadow px-md-5 px-4 py-3 py-md-4 bg-light'>
      <div className="table-responsive">
        <table className='table mb-0 align-middle'>
          <thead>
            <tr>
              <th>Name</th>
              <th className='text-end'>{props?.SecondtheadType}</th>
            </tr>
          </thead>
          <tbody>
            {props?.res?.length ?
              <Fragment>
                {Array.isArray(props?.res) && props?.res?.map((data: any) => {
                  // console.log(data);
                  return (
                    <ContestantTableRow {...data} isVoterRewards={props?.isVoterRewards} />
                  )
                })}
              </Fragment>
              :
              <tr>
                <td colSpan={2}>
                  <PlaceholderImage sm={12} md={10} lg={8} xl={6} xxl={5} description={'No Data Found'} />
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ContestantTable