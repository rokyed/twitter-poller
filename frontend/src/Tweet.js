import React from "react";

const Tweet = ({ tweet }) => {
  return (<div className={`ui message`}>
    <span>{tweet.text}</span>
  </div>);
};

export default Tweet;
