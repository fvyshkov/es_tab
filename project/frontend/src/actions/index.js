
//redux tutorial
import { ADD_ARTICLE, DATA_REQUESTED, DATA_CLEAR, ADD_LOADING_GUID } from "../constants/action-types";


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