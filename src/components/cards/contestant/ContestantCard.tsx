import VoteUpArrow from '@/components/Icons/VoteUpArrow';
import { Button, Flex } from 'antd';
import contestantImage from "@/assets/images/contestant-image.png"
import { ContestStatus, VoteType } from '@/utils/henceforthEnums';
import henceforthApi from '@/utils/henceforthApi';
import { useContext, useState } from 'react';
import { GlobalContext } from '@/context/Provider';
import { useRouter } from 'next/router';

interface ContestantCardProps {
  user_id?: string,
  profile_pic: string;
  image: string;
  getKey: any;
  name: string;
  contestent_name: string;
  contestent_email: string;
  total_votes: string;
  result?: string;
  isRunnerUp?: boolean;
  showText?: boolean
  isVoting?: boolean;
  showModal?: any;
  status: string
  current_round?: number,
  is_contestent_pic_reveal: boolean,
  disabled: boolean,
  vote_type: string,
  contest_id: string,
  round_id: string,
  _id: string,
  setId: any,
  showVotedText?: boolean,
  updateVoteCount: (id: string) => void;
  number_of_time_vote?: any
  total_voted: any
  voted_contestent_id: any
}



const ContestantCard = (props: ContestantCardProps) => {
  const [formLoading, setFormLoading] = useState(false)
  console.log(props, "props___________");
  const router = useRouter()

  const { Toast } = useContext(GlobalContext)

  const CastVoteFree = async (_id: string) => {
    let payload = {
      contest_id: props?.contest_id,
      round_id: props?.round_id,
      contestent_id: _id
    };

    try {
      setFormLoading(true)
      const apiRes = await henceforthApi.Contest.payment(payload);
      // console.log(apiRes);
      Toast.success("Your Vote is successfully casted")
      props.updateVoteCount(_id);
      setFormLoading(false)
      router.replace({
        pathname: `/contest/${props?.contest_id}/details`,
      })

    } catch (error) {
      setFormLoading(false)
      console.log(error);
      Toast.error(error)
    }
  }


  console.log(props.status, "props inside");

  return (
    <>
      <div className='contestant-card'>
        <div className='contestant-card__image'>
          {props?.is_contestent_pic_reveal ?
            <img src={props?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.profile_pic}` : contestantImage.src} height={260} className='w-100 object-fit-cover border bg-light' alt="contestant image" onError={(e) => { e.currentTarget.src = contestantImage.src }} />
            :
            <img src={`${henceforthApi.API_FILE_ROOT_ORIGINAL}${props?.profile_pic ? props?.profile_pic : props?.image}`} height={260} className='w-100 object-fit-cover border bg-light' alt="contestant image" onError={(e) => { e.currentTarget.src = contestantImage.src }} />
          }
        </div>
        <div className='contestant-card__content py-3'>
          <Flex justify='space-between' align='flex-start' wrap="wrap">
            <ul className='list-unstyled d-flex flex-column gap-1 m-0 mb-2'>
              <li className='fw-bold text-black primary-font-size text-capitalize'>{props?.contestent_name ? props?.contestent_name : props?.name}</li>
              <li className='fw-medium text-black secondary-font-size'>{props?.contestent_email}</li>

              {props?.isVoting ? <>
                <li className='fw-normal text-black secondary-font-size'><span>Number of votes that can be casted:</span>{" "}<span className='text-black fw-semibold'>{props?.number_of_time_vote > 100 ? "As Much As They Can" : props?.number_of_time_vote}</span></li>
              </> : ''}

              {props?.status === ContestStatus.COMPLETED && <li className='fw-normal text-black secondary-font-size'><span>Number of votes casted:</span>{" "}<span className='text-black fw-semibold'>{props?.total_votes} Votes</span></li>}

              {props?.isRunnerUp &&
                <li className='fw-medium text-black base-font-size'>{props?.result}</li>}
              {/* <li> {((props?.status === ContestStatus.ONGOING) && (props?.showVotedText)) && */}
              {(props?.showText && props?.isVoting) &&
                <p className='text-warning fw-medium'>Vote casted.</p>}
              {/* }</li> */}
            </ul>


            {props?.isVoting &&
              <>
                {
                  props?.vote_type === VoteType.FREE ?
                    <Button type='default' disabled={props?.disabled} onClick={() => CastVoteFree(props?._id)} className='px-4 d-flex justify-content-center align-items-center gap-1 text-black flex-shrink-0' shape='round'>
                      <VoteUpArrow />
                      <span className='fw-semibold'>VOTE</span>
                    </Button>
                    :
                    <Button type='default' disabled={props?.disabled} onClick={() => { props?.setId(props?._id); props?.getKey(props?._id) }} className='px-4 d-flex justify-content-center align-items-center gap-1 text-black flex-shrink-0' shape='round'>
                      <VoteUpArrow />
                      {/* props?.showModal() */}
                      <span className='fw-semibold'>VOTE</span>
                    </Button>
                }
              </>
            }
          </Flex>
        </div>
      </div >
    </>
  )
}

export default ContestantCard