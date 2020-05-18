import {
        ADD_ARTICLE,
        DATA_REQUESTED,
        DATA_CLEAR,
        ADD_LOADING_GUID,
        API_ERRORED,
        DATA_LOADED,
        SHEET_FILTER_LIST_REQUESTED,
        SHEET_FILTER_LIST_LOADED,
        SHEET_STATE_LOADED } from "../constants/action-types";

const initialState = {
  articles: [{title:'1'}],
  gridData: [],
  counter:0,
  tabViewData: new Map(),
  expandedNodes: new Map(),
  loadingGuids: [],
  filterList: {},//key=viewGUID, value=filterList for this view
  sheetState: {},//key=viewGUID, value=sheetState for this view = {filteList, columnStates, expandedGroupIds}
};

function rootReducer(state = initialState, action) {

    console.log('action.type', action.type);

    if (action.type === "UPDATE_GRID") {
        var gridData = state.gridData;
        gridData[action.params.layoutItemID] = action.params.data;
        return Object.assign({}, state, {
            gridData: gridData,
            layoutItemID: action.params.layoutItemID
        });
    }


    if (action.type === ADD_ARTICLE) {
        return Object.assign({}, state, {
            //articles: state.articles.concat(action.payload)
            tabViewData: state.tabViewData.concat({node_key:'sss777', orgHierarchy:['sss777']})
        });
    }

    if (action.type === SHEET_FILTER_LIST_LOADED) {
        console.log('SHEET_FILTER_LIST_LOADED', action.payload);
        var newState = Object.assign({}, state);
        newState.filterList[action.params.sheet_id] = action.payload;
        return newState;
    }

    if (action.type === DATA_CLEAR) {
        console.log('data_loaded, parent_ke=', action.params);
        var newState = Object.assign({}, state);

        newState.tabViewData.set(action.params.viewGUID, []);
        newState.expandedNodes.set(action.params.viewGUID, []);

        return newState;
    }

    if (action.type === ADD_LOADING_GUID) {
        return Object.assign({}, state, {
            loadingGuids: state.loadingGuids.concat(action.params.viewGUID)
        });
    }

    if (action.type === API_ERRORED) {
        return Object.assign({}, state, {
            loadingGuids: state.loadingGuids.filter(function(e) { return e !== action.params.viewGUID })
        });
    }

    if (action.type === SHEET_STATE_LOADED) {
        console.log(action.type, action);
        var newState = Object.assign({}, state);
        if (action.payload.length>0){
            newState.sheetState[action.params.viewGUID] = action.payload[0];
        }
        return newState;
    }


    if (action.type === DATA_LOADED) {
        console.log('data_loaded, parent_ke=', action.params.parentNodeKey);

        var newState = Object.assign({}, state);

        newState.loadingGuids = newState.loadingGuids.filter(function(e) { return e !== action.params.viewGUID });

        var expandedNodes = [];
        if (newState.expandedNodes.get(action.params.viewGUID)){
            expandedNodes = newState.expandedNodes.get(action.params.viewGUID);
        }

        var tabViewData = [];
        if (newState.tabViewData.get(action.params.viewGUID)){
            tabViewData = newState.tabViewData.get(action.params.viewGUID);
        }

        if (action.params.reload){
            tabViewData = [];
            expandedNodes = [];
        }


        tabViewData = tabViewData.concat(action.payload);

        tabViewData.forEach(el=>{
            if (!el.hie_path){
                el['hie_path'] = [el.node_key];
            }

        });

        if (action.params.parentNodeKey){
            expandedNodes.push(action.params.parentNodeKey);
        }
        console.log('reducer expandedNodes', expandedNodes, action.params.parentNodeKey);
        newState.tabViewData.set(action.params.viewGUID, tabViewData);
        newState.expandedNodes.set(action.params.viewGUID, expandedNodes);

        return newState;
    }

return state;

}

export default rootReducer;