import axios from 'axios';
import { setAlert } from './alert';

import { GET_PROFILE, PROFILE_ERROR } from './types';

//Get current user profile
export const getCurrentProfile = () => async dispatch => {
  try {
    const res = await axios.get('/api/profiles/me');

    dispatch({
      type: GET_PROFILE,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Create or update profile
//formData the object is submitted to
//history - has push parameter to redirect to client site route
//edit to know the state (update, create,..)
export const createProfile = (formData, history, edit = false) => async dispatch => {
  try {
    const config = {
      header: {
        'Content-Type': 'application/json'
      }
    }

    const res = await axios.post('/api/profiles', formData, config);

    dispatch({
      type: GET_PROFILE,
      payload: res.data
    });

    dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

    if (!edit) {
      history.push('/dashboard')
    }
  } catch (err) {
    console.error(err.response);
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status}
    });
  }
}
