import { ADD_ARTICLE } from "../constants/action-types";

const initialState = {
  articles: [{title:'1'}],
  tabViewData: new Map(),
  expandedNodes: new Map()
};

function rootReducer(state = initialState, action) {

    console.log('action.type', action.type);

    if (action.type === ADD_ARTICLE) {
        return Object.assign({}, state, {
            //articles: state.articles.concat(action.payload)
            tabViewData: state.tabViewData.concat({node_key:'sss777', orgHierarchy:['sss777']})
        });
    }

    if (action.type === "DATA_LOADED") {
        console.log('data_loaded, parent_ke=', action.params.parentNodeKey);

        var newState = Object.assign({}, state);

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