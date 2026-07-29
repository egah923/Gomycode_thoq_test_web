import { Fragment } from "react";

const GetFinalistPosition = ({ position }) => {
  function getTitleByPosition(position) {
    switch (position) {
      case 1:
        return "Winner";
      case 2:
        return "1st Runner Up";
      case 3:
        return "2nd Runner Up";
      case 4:
        return "3rd Runner Up";
      default:
        return `${position - 1}th Runner Up`;
    }
  }

  const title = getTitleByPosition(position);

  return (
    <Fragment>
      {title}
    </Fragment>
  );
}

export default GetFinalistPosition;