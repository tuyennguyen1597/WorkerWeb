//helper function turns an object 
//whose values are different reducing functions
//into a single reducing function you can pass to createStore.
import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';

export default combineReducers({
    alert,
    auth,
    profile
});
