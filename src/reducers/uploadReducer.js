import {
    UPLOAD_EXCEL_REQUEST,
    UPLOAD_EXCEL_SUCCESS,
    UPLOAD_EXCEL_FAIL,
  } from '../actions/uploadActions';
  
  const initialState = {
    loading: false,
    success: false,
    error: null,
  };
  
  const uploadReducer = (state = initialState, action) => {
    switch (action.type) {
      case UPLOAD_EXCEL_REQUEST:
        return { loading: true, success: false, error: null };
      case UPLOAD_EXCEL_SUCCESS:
        return { loading: false, success: true, error: null };
      case UPLOAD_EXCEL_FAIL:
        return { loading: false, success: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default uploadReducer;
  