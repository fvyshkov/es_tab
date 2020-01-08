import { takeEvery, call, put } from "redux-saga/effects";
import "babel-polyfill";
import { ADD_ARTICLE, DATA_REQUESTED, API_ERRORED, DATA_LOADED } from "../constants/action-types";

export default function* watcherSaga() {
  yield takeEvery(DATA_REQUESTED, workerSaga);
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

function getData(params) {
    return fetch(window.location.origin + '/'+ params.requestString)
        .then(response =>response.json());
}

