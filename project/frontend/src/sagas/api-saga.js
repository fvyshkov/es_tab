import { takeEvery, call, put } from "redux-saga/effects";
import "babel-polyfill";
import {
        ADD_ARTICLE,
        DATA_REQUESTED,
        DATA_CLEAR,
        ADD_LOADING_GUID,
        DATA_LOADED,
        SHEET_FILTER_LIST_REQUESTED,
        SHEET_FILTER_LIST_LOADED,
        SHEET_FILTER_LIST_ERROR,
        SHEET_STATE_REQUESTED,
        SHEET_STATE_LOADED} from "../constants/action-types";

export default function* watcherSaga() {
  yield takeEvery(DATA_REQUESTED, workerSaga);
  yield takeEvery(SHEET_FILTER_LIST_REQUESTED, filterListRequestSaga);
  yield takeEvery(SHEET_STATE_REQUESTED, sheetStateRequestSaga);
}


function* workerSaga(action) {
  try
  {
    const payload = yield call(getData, action.params);
    yield put({ type: DATA_LOADED, params: action.params, payload });
  } catch (e) {
    console.log('ERROR', e);
    yield put({ type: API_ERRORED, payload: e });
  }
}

function* filterListRequestSaga(action) {
  {
    const filterPayload = yield call(getFilterList, action.params);
   // const sheetStatePayload = yield call(getStateList, action.params);
    yield put({ type: SHEET_FILTER_LIST_LOADED, params: action.params, filterPayload, sheetStatePayload });
  }
}

function* sheetStateRequestSaga(action) {
  {
    const payload = yield call(getSheetState, action.params);
    yield put({ type: SHEET_STATE_LOADED, params: action.params, payload });
  }
}




function getFilterList(params) {
    return fetch(window.location.origin + '/sht_filters/?sht_id='+ params.sheet_id)
        .then(response =>response.json());
}

function getSheetState(params) {
    return fetch(window.location.origin + '/sht_state/?sht_id='+ params.sheet_id)
        .then(response =>response.json());
}

function getData(params) {
    return fetch(window.location.origin + '/'+ params.requestString)
        .then(response =>response.json());
}

