import { combineReducers } from 'redux'
import familyReducer from './familyReducer';
import eventReducer from './eventReducer';
import userReducer from './userReducer';

rootReducer = combineReducers({ familyReducer, eventReducer, userReducer });

export default rootReducer;
