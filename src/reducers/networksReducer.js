import {} from "../actions/types";

const initialState = {
  networks: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    // case GET_NETWORKS: {
    //   return {
    //     ...state
    //   };
    // }

    default:
      return state;
  }
}
