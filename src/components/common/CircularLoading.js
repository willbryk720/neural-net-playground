import React from "react";

import { Loader } from "semantic-ui-react";

const CircularLoading = ({ size }) => {
  return <Loader active inline size={size || null} />;
};

export default CircularLoading;
