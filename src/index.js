import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "semantic-ui-css/semantic.min.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

// redux persist stuff
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web and AsyncStorage for react-native
import { PersistGate } from "redux-persist/integration/react";

const persistConfig = {
  key: "root",
  storage,
  // whitelist: ["auth", "topics"]
  whitelist: []
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const initialState = {};
const middleware = [thunk];

// const store =
//   process.env.NODE_ENV !== "development"
//     ? createStore(
//         persistedReducer,
//         initialState,
//         compose(applyMiddleware(...middleware))
//       )
//     : createStore(
//         persistedReducer,
//         initialState,
//         compose(
//           applyMiddleware(...middleware),
//           window.__REDUX_DEVTOOLS_EXTENSION__ &&
//             window.__REDUX_DEVTOOLS_EXTENSION__()
//         )
//       );
const store = createStore(persistedReducer, initialState, compose(applyMiddleware(...middleware)));

let persistor = persistStore(store);

console.log("PUBLIC URL: ", process.env.PUBLIC_URL);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.querySelector("#root")
);

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
