import axios from "axios";

import {} from "./types";

// // Get topic and all associated links
// export const getTopicAndLinks = (
//   x
// ) => dispatch => {

//   dispatch(setGetTopicLoading(slug, relativeUrl, name));

//   axios
//     .get(`/api/topics/${slug}`, { params: filters })
//     .then(res => {
//       dispatch({
//         type: GET_TOPIC,
//         payload: res.data
//       });
//     })
//     .catch(err => {
//       dispatch({
//         type: GOT_ERROR,
//         payload: {
//           errorType: "getTopic",
//           errorId: relativeUrl,
//           slug: slug,
//           errorMsg:
//             err.response && err.response.data
//               ? err.response.data.errorMsg
//               : "Failed to reach server."
//         }
//       });
//     });
// };

export const setGetTopicLoading = (slug, relativeUrl, name) => {
  return {
    type: GET_TOPIC_LOADING,
    slug: slug,
    relativeUrl: relativeUrl,
    name: name
  };
};
