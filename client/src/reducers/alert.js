import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

/**
 * the initialState is an object including id, msg, and alertType
 */
const initialState = [];
export default function( state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_ALERT:
            //action.payload is an initialState object 
            //that contains id, msg, alertType
            return [...state, payload];
        case REMOVE_ALERT:
            return state.filter(alert => alert.id !== payload);
        default:
            return state;
    }
}
