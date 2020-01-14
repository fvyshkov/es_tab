import React, {Component} from 'react';
import FilterPanel from "./FilterPanel.jsx";
import { connect } from "react-redux";
import { addArticle, getData, clearData, addLoading, getSheetFilterList } from "../actions/index";

class FilterPanelInToolPanel extends Component {

    constructor(props) {
        super(props);
        this.state={};

        this.onFilterPanelChange = this.props.agGridReact.props.onFilterPanelChange;

        this.props.api.addEventListener('modelUpdated', this.updatePanel.bind(this));
    }

    loadNewSheetToFilterPanel(){
    }

    render() {
        //console.log('FilterPanelInToolPanel props', this.props.agGridReact.props);
        //filterNodes={this.props.filterList}
        return (
            <FilterPanel
                sheet_id={this.state.sheet_id}
                sendRefreshPanel={click => this.loadNewSheetToFilterPanel = click}
                onFilterPanelChange={this.onFilterPanelChange}
                selectedFilterNodes={this.props.agGridReact.props.selectedFilterNodes}
                filterNodes={this.props.agGridReact.props.filterNodes}
            />
        );
    }

    updatePanel() {
        console.log('updateFilterPanel' , this.props);//.agGridReact.props.filterNodes);
        if (this.props.agGridReact.props.sheet_id){
            this.state.sheet_id = this.props.agGridReact.props.sheet_id;
        }
        this.loadNewSheetToFilterPanel();
    }

}


function mapStateToProps (state, ownProps){
    console.log('FilterPanelInToolPanel mapStateToProps viewGUID=', ownProps.agGridReact.props.viewGUID, state.sheetState[ownProps.agGridReact.props.viewGUID] );

    var ownSheetState = state.sheetState[ownProps.agGridReact.props.viewGUID];

    //return { articles: state.articles, gridData: data, loading: state.loadingGuids.includes(ownProps.layoutItemID)};
    //return {filterList:state.filterList[ownProps.agGridReact.props.sheet_id]};
    if (ownSheetState && ownSheetState.filter){
        return {filterList: ownSheetState.filter};
    }else{
        return {filterList: []};
    }
};


function mapDispatchToProps(dispatch) {
    return {
        /*
        addArticle: article => dispatch(addArticle(article)),
        getData: params => dispatch(getData(params)),
        clearData: params => dispatch(clearData(params)),
        addLoading: params => dispatch(addLoading(params)),
        getSheetFilterList: params => dispatch(getSheetFilterList(params)),
        */
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterPanelInToolPanel);
