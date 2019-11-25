import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SheetToolbar from "./SheetToolbar.jsx";
import FilterPanel from "./FilterPanel.jsx";
import GridExample from './GridExample.jsx';
import notify from 'devextreme/ui/notify';

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
        this.state={};
        this.selectedFilterNodes = [];
        this.onToolbarSaveClick = this.onToolbarSaveClick.bind(this);
        this.loadNewSheet = this.loadNewSheet.bind(this);
        this.onFilterPanelChange = this.onFilterPanelChange.bind(this);
        this.onToolbarRefreshClick = this.onToolbarRefreshClick.bind(this);
        this.getFilterSkey = this.getFilterSkey.bind(this);




    }

    loadNewSheetToFilterPanel(){

    }

    sendRefreshGrid(){

    }

    onToolbarSaveClick(){
        this.loadNewSheetToFilterPanel();
    }

    loadNewSheet(sheet_id, sheet_type){
        this.setState({sheet_id:sheet_id, sheet_type:sheet_type});
        this.loadNewSheetToFilterPanel();
        this.sendRefreshGrid();
    }


    onFilterPanelChange(selectedNodes, filterID){
        this.selectedFilterNodes[filterID] = selectedNodes;
    }

    getFilterSkey(){
        var skey = '';
        for (var filterID in this.selectedFilterNodes) {
            var selectedNodesForOneFilter = this.selectedFilterNodes[filterID];
            if (selectedNodesForOneFilter.length===0){
                skey = skey+'FLT_ID_'+filterID+'=>0,';
            }else{
                skey = skey+'FLT_ID_'+filterID+'=>'+ selectedNodesForOneFilter[0].id +',';
            }
        };
        return skey;
    }

    onToolbarRefreshClick(){
        //notify('refresh');
        this.sendRefreshGrid();

    }

    render(){
        console.log('render TOP level');
        return (
            <React.Fragment>
                <div className = {'ag-theme-balham'}>
                    <div class='Wrapper'>
                        <SheetToolbar
                            onSaveCallback={this.onToolbarSaveClick}
                            onRefreshCallback={this.onToolbarRefreshClick}
                            onSelectNewSheet={this.loadNewSheet}
                            />

                        <div class="Panel">
                            <FilterPanel
                                sheet_id={this.state.sheet_id}
                                sendRefreshPanel={click => this.loadNewSheetToFilterPanel = click}
                                onFilterPanelChange={this.onFilterPanelChange}
                            />
                        </div>

                        <div  class="Grid">
                            <GridExample
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                skey={this.getFilterSkey}
                                sheet_id = {this.state.sheet_id}
                                sheet_type = {this.state.sheet_type}
                                treeData = {this.state.sheet_type==='tree'? true:false}
                                onFilterPanelChange={this.onFilterPanelChange}
                                />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );

    }

}


export default SheetView;