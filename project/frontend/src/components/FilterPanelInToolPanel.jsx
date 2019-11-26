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
        return (
            <FilterPanel
                sheet_id={this.state.sheet_id}
                sendRefreshPanel={click => this.loadNewSheetToFilterPanel = click}
                onFilterPanelChange={this.onFilterPanelChange}
            />
        );
    }

    updatePanel() {
        if (this.props.agGridReact.props.sheet_id && this.props.agGridReact.props.sheet_id.length>0){
            this.setState({sheet_id: this.props.agGridReact.props.sheet_id[0]});
        }
        this.loadNewSheetToFilterPanel();
    }

}