import React, {Component} from 'react';
import FilterPanel from "./FilterPanel.jsx";

export default class FilterPanelInToolPanel extends Component {

    constructor(props) {
        super(props);
        this.state={};

        this.onFilterPanelChange = this.props.agGridReact.props.onFilterPanelChange;
        console.log('FilterPanel this.props.api', this.props.api);

        this.props.api.addEventListener('rowDataChanged', this.updatePanel.bind(this));
    }

    loadNewSheetToFilterPanel(){
    }

    render() {
        console.log('FN', this.props.agGridReact.props);
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