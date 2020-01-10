import { ADD_ARTICLE, DATA_CLEAR, DATA_LOADED, ADD_LOADING_GUID, API_ERRORED } from "../constants/action-types";

const initialState = {
  articles: [{title:'1'}],
  tabViewData: new Map(),
  expandedNodes: new Map(),
  loadingGuids: []
};

function rootReducer(state = initialState, action) {

    console.log('action.type', action.type);

    if (action.type === ADD_ARTICLE) {
        return Object.assign({}, state, {
            //articles: state.articles.concat(action.payload)
            tabViewData: state.tabViewData.concat({node_key:'sss777', orgHierarchy:['sss777']})
        });
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