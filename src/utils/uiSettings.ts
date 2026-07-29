import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// import moment from 'moment';


// Function to get the system's timezone
// const getSystemTimezone = () => {
//   return moment.tz.guess();
// };

// const systemTimezone = getSystemTimezone();
// console.log(systemTimezone, "systemTimezone");

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const sliceStr = (str: string, count: number) => {
    return str.length > count ? `${str.slice(0, count)}....${str.slice(str.length - count, str.length)}` : str
}



function capitalize(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ******************* Format Date *******************
// const formatDate = (date: number) => {
//     if (date) {
//         let formattedDate = dayjs(date).format('DD MMMM YYYY');
//         return formattedDate;
//     } else {
//         return  'N/A';
//     }
// };

// const formatTime = (time: number) => {
//     if (time) {
//         let formattedTime = dayjs(time).format('hh:mm A');
//         return formattedTime;
//     } else {
//         return  'N/A';
//     }
// };

// Function to format date
const formatDate = (date: number) => {
    if (date) {
        let formattedDate = dayjs(date).tz(dayjs.tz.guess()).format('DD MMMM YYYY');

        console.log(formattedDate);
        
        return formattedDate;
    } else {
        return 'N/A';
    }
};

const formatTime = (time: number) => {
    if (time) {
        let formattedTime = dayjs(time).utc().tz(dayjs.tz.guess()).format('hh:mm A');
        console.log(formattedTime);
        return formattedTime;
        
    } else {
        return 'N/A';
    }
};




const uiSettings = {
    sliceStr,
    formatDate,
    capitalize,
    formatTime
}
export default uiSettings



