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
        if (this.props.agGridReact.props.sheet_id){
            this.state.sheet_id = this.props.agGridReact.props.sheet_id;
        }
        this.loadNewSheetToFilterPanel();
    }

}


function mapStateToProps (state, ownProps){

    var ownSheetState = state.sheetState[ownProps.agGridReact.props.viewGUID];

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
