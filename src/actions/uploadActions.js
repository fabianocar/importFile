import axios from 'axios';

export const UPLOAD_EXCEL_REQUEST = 'UPLOAD_EXCEL_REQUEST';
export const UPLOAD_EXCEL_SUCCESS = 'UPLOAD_EXCEL_SUCCESS';
export const UPLOAD_EXCEL_FAIL = 'UPLOAD_EXCEL_FAIL';

export const uploadExcel = (payload) => async (dispatch) => {
  dispatch({ type: UPLOAD_EXCEL_REQUEST });
  try {
    const { data } = await axios.post('/tema/api/beneficiaries/parceiro/map', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    dispatch({ type: UPLOAD_EXCEL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPLOAD_EXCEL_FAIL,
      payload:
        error.response && error.response.data
          ? error.response.data
          : error.message,
    });
  }
};
