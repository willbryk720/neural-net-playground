import React, { Component } from "react";

import { Button } from "semantic-ui-react";
import CircularLoading from "./common/CircularLoading";

function ShowLoading(props) {
  const { isCurrentlyTraining } = props;
  return <div>{isCurrentlyTraining && <CircularLoading />}</div>;
}

export default ShowLoading;
