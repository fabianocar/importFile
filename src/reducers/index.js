import { combineReducers } from 'redux';
import uploadReducer from './uploadReducer';

const rootReducer = combineReducers({
  upload: uploadReducer,
});

export default rootReducer;
