import { ADD_ARTICLE } from "../constants/action-types";

const initialState = {
  articles: [{title:'1'}],
  tabViewData: {},
  expandedNodes: []
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
        /*
        action.params={
                        parentNodeKey
                        reload
                        viewGUID
                        }
        */
        var newState = Object.assign({}, state, {
            tabViewData[action.params.viewGUID]: action.params.reload ? action.payload : state.tabViewData.concat(action.payload),
            expandedNodes[action.params.viewGUID]: action.params.parentNodeKey ? state.expandedNodes.concat(action.params.parentNodeKey) : state.expandedNodes
        });

        return newState;
    }

return state;

}

export default rootReducer;