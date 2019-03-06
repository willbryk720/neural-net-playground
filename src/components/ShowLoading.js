import React, { Component } from "react";

import { Button } from "semantic-ui-react";
import CircularLoading from "./common/CircularLoading";

function ShowLoading(props) {
  const { loading } = props;
  return <div>{loading && <CircularLoading />}</div>;
}

export default ShowLoading;
