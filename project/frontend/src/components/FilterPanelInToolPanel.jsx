import React, {Component} from 'react';
import FilterPanel from "./FilterPanel.jsx";

export default class FilterPanelInToolPanel extends Component {

    constructor(props) {
        super(props);

        this.state = {numMedals: 10, numGold: 0, numSilver: 0, numBronze: 0};

        console.log('this.props.agGridReact.props', this.props.agGridReact.props);
        this.onFilterPanelChange = this.props.agGridReact.props.onFilterPanelChange;


        this.props.api.addEventListener('modelUpdated', this.updatePanel.bind(this));
    }

    loadNewSheetToFilterPanel(){

    }

    render() {
        const totalStyle = {paddingBottom: '15px'};
        //onFilterPanelChange={this.props.onFilterPanelChange}

        console.log('panel', this.state.sheet_id);
        return (
                    <div class="Panel">
                            <FilterPanel
                                sheet_id={this.state.sheet_id}
                                sendRefreshPanel={click => this.loadNewSheetToFilterPanel = click}
                                onFilterPanelChange={this.onFilterPanelChange}
                            />
                    </div>

        );
    }

    updatePanel() {
        console.log('updatePanel', this.props.agGridReact.props.sheet_id);
        if (this.props.agGridReact.props.sheet_id && this.props.agGridReact.props.sheet_id.length>0){
            this.setState({sheet_id: this.props.agGridReact.props.sheet_id[0]});
        }
        this.loadNewSheetToFilterPanel();
    }

}