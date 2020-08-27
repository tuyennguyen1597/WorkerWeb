//applyMiddleware: declare the middleware
//createStore: (reducer, preloadState, storeEnhancer-applyMiddleware)
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
//used as middleware to check whether
//what is dispatched is a function or object
import thunk from 'redux-thunk';
import rootReducer from './reducers'; //default index.js

const initialState = {};

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store
