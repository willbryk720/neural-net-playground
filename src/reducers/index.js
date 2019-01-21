import { combineReducers } from "redux";

import errorReducer from "./errorReducer";
import networksReducer from "./networksReducer";

export default combineReducers({
  errors: errorReducer,
  networks: networksReducer
});
