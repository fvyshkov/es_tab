import React, {Component} from 'react';
import FilterPanel from "./FilterPanel.jsx";

export default class FilterPanelInToolPanel extends Component {

    constructor(props) {
        super(props);
        this.state={};
        this.onFilterPanelChange = this.props.agGridReact.props.onFilterPanelChange;
        this.props.api.addEventListener('modelUpdated', this.updatePanel.bind(this));
    }

    loadNewSheetToFilterPanel(){
    }

    render() {
        console.log('this.props.agGridReact.props.selectedFilterNodes=', this.props.agGridReact.props.selectedFilterNodes);
        return (
            <FilterPanel
                sheet_id={this.state.sheet_id}
                sendRefreshPanel={click => this.loadNewSheetToFilterPanel = click}
                onFilterPanelChange={this.onFilterPanelChange}
                selectedFilterNodes={this.props.agGridReact.props.selectedFilterNodes}
            />
        );
    }

    updatePanel() {

        if (this.props.agGridReact.props.sheet_id){
            this.setState({sheet_id: this.props.agGridReact.props.sheet_id});
        }
        this.loadNewSheetToFilterPanel();
    }

}