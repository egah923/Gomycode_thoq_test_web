import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
const dateFormat = dayjs
dateFormat.extend(relativeTime)
export default dateFormat