import { Badge } from 'antd';
import React from 'react';
const NumberFormatter = ({ props }: any) => {
    const formatNumber = (num:number) => {
        if (num >= 1e9) {
            const rounded = (num / 1e9).toFixed(1);
            return `${rounded}B`;
        } else if (num >= 1e6) {
            const rounded = (num / 1e6).toFixed(1);
            return `${rounded}M`;
        } else if (num >= 1000) {
            const rounded = Math.round(num / 100) / 10;
            return `${rounded}K`;
        } else {
            return String(num);
        }
    };
  
    return <span>{formatNumber(props)}</span>;
};
export default NumberFormatter;
