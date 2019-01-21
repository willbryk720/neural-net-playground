/*
This is for creating errors and notifying user about them.
There's a component responsible only for consuming errors from errorList
*/

import { GOT_ERROR, CONSUMED_ERROR } from "../actions/types";

const initialState = { errorList: [] };

export default function(state = initialState, action) {
  switch (action.type) {
    case GOT_ERROR:
      return {
        ...state,
        errorList: [action.payload, ...state.errorList]
      };
    case CONSUMED_ERROR:
      const { errorType, errorId } = action.payload;
      return {
        ...state,
        errorList: state.errorList.filter(
          error => error.errorType !== errorType || error.errorId !== errorId
        )
      };
    default:
      return state;
  }
}
