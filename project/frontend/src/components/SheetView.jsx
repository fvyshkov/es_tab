import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SheetToolbar from "./SheetToolbar.jsx";
import GridExample from './GridExample.jsx';
import notify from 'devextreme/ui/notify';
import ColorPanel from './ColorPanel.jsx';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-community/dist/styles/ag-theme-dark.css';
import 'ag-grid-community/dist/styles/ag-theme-fresh.css';
import 'ag-grid-community/dist/styles/ag-theme-blue.css';
import 'ag-grid-community/dist/styles/ag-theme-bootstrap.css';

import "./index.css";



class SheetView extends Component {
    constructor(props) {
        super(props);
        this.state={
                        colorPanelVisible: false,
                        selectedFilterNodes: {}
                      };

        this.onToolbarPreferencesClick = this.onToolbarPreferencesClick.bind(this);
        this.loadNewSheet = this.loadNewSheet.bind(this);
        this.onFilterPanelChange = this.onFilterPanelChange.bind(this);
        this.onToolbarRefreshClick = this.onToolbarRefreshClick.bind(this);
        this.getFilterSkey = this.getFilterSkey.bind(this);
        this.onColorPanelClose = this.onColorPanelClose.bind(this);



    }

    loadNewSheetToFilterPanel(){

    }

    sendRefreshGrid(){

    }

    onToolbarPreferencesClick(){
        this.setState({colorPanelVisible:true});
    }

    loadNewSheet(prm_sheet_id, prm_sheet_type){
        this.setState({sheet_id: 0, sheet_type: ''});
        console.log('SheetView.loadNewSheet, sheet_ID=', prm_sheet_id);
        this.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});
        this.loadNewSheetToFilterPanel();
        this.sendRefreshGrid();
    }


    onFilterPanelChange(selectedNodes, filterID){
        this.state.selectedFilterNodes[filterID] = selectedNodes;
        this.setState({selectedFilterNodes : this.state.selectedFilterNodes});
        console.log('SheetView.onFilterPanelChange', this.state.selectedFilterNodes);
    }

    getFilterSkey(){
        var skey = '';
        for (var filterID in this.state.selectedFilterNodes) {
            if (Object.prototype.hasOwnProperty.call(this.state.selectedFilterNodes, filterID)) {
                var selectedNodesForOneFilter = this.state.selectedFilterNodes[filterID];
                if (selectedNodesForOneFilter.length===0){
                    skey = skey+'FLT_ID_'+filterID+'=>0,';
                }else{
                    skey = skey+'FLT_ID_'+filterID+'=>'+ selectedNodesForOneFilter[0].id +',';
                }
            }
        }
        return skey;
    }

    onToolbarRefreshClick(){
        this.sendRefreshGrid();
    }

    onColorPanelClose(){
        this.setState({colorPanelVisible:false});
    }

    render(){
        return (
            <React.Fragment>

                <ColorPanel
                    popupVisible={this.state.colorPanelVisible}
                    sendColorPanelClose={this.onColorPanelClose}
                    sheet_id={this.state.sheet_id}
                />
                <div className = {'ag-theme-balham'}>
                    <div className='Wrapper'>
                        <SheetToolbar
                            onPreferencesCallback={this.onToolbarPreferencesClick}
                            onRefreshCallback={this.onToolbarRefreshClick}
                            onSelectNewSheet={this.loadNewSheet}
                            />

                        <div  className="Grid">
                            <GridExample
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                skey={this.getFilterSkey}
                                sheet_id = {this.state.sheet_id}
                                sheet_type = {this.state.sheet_type}
                                treeData = {this.state.sheet_type==='tree'? true:false}
                                onFilterPanelChange={this.onFilterPanelChange}
                                selectedFilterNodes={this.state.selectedFilterNodes}
                                />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );

    }

}


export default SheetView;