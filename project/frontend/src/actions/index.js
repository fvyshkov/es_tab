import {
        ADD_ARTICLE,
        DATA_REQUESTED,
        DATA_CLEAR,
        ADD_LOADING_GUID,
        SHEET_FILTER_LIST_REQUESTED,
        SHEET_FILTER_LIST_LOADED,
        SHEET_STATE_REQUESTED,
        SHEET_STATE_LOADED} from "../constants/action-types";


export function addArticle(payload) {
  return { type: ADD_ARTICLE, payload };
}

export function getData(params) {
    return { type: DATA_REQUESTED, params: params};
}


export function clearData(params) {
    return { type: DATA_CLEAR, params: params};
}


export function addLoading(params) {
    return { type: ADD_LOADING_GUID, params: params};
}

export function getSheetFilterList(params) {
    return { type: SHEET_FILTER_LIST_REQUESTED, params: params};
}


export function getSheetState(params) {
    return { type: SHEET_STATE_REQUESTED, params: params};
}