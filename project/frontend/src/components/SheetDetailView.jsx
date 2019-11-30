import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SheetToolbar from "./SheetToolbar.jsx";
import GridExample from './GridExample.jsx';
import notify from 'devextreme/ui/notify';
import ColorPanel from './ColorPanel.jsx';
import { sendRequest } from './App.js';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-community/dist/styles/ag-theme-dark.css';
import 'ag-grid-community/dist/styles/ag-theme-fresh.css';
import 'ag-grid-community/dist/styles/ag-theme-blue.css';
import 'ag-grid-community/dist/styles/ag-theme-bootstrap.css';

import "./index.css";



export default class SheetDetailView extends Component {
    constructor(props) {
        super(props);
        this.state={
                        colorPanelVisible: false,
                        selectedFilterNodes: {},
                        filterNodes: {}
                      };

        this.onToolbarPreferencesClick = this.onToolbarPreferencesClick.bind(this);
        this.loadNewSheet = this.loadNewSheet.bind(this);
        this.onFilterPanelChange = this.onFilterPanelChange.bind(this);
        this.onToolbarRefreshClick = this.onToolbarRefreshClick.bind(this);
        this.getFilterSkey = this.getFilterSkey.bind(this);
        this.onColorPanelClose = this.onColorPanelClose.bind(this);
        this.onLoadFilterNodes = this.onLoadFilterNodes.bind(this);




    }

    loadNewSheetToFilterPanel(){

    }

    sendRefreshGrid(){

    }

    onToolbarPreferencesClick(){
        this.setState({colorPanelVisible:true});
    }

    loadNewSheet(prm_sheet_id, prm_sheet_type){
        this.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});
        if (!this.state.filterNodes[prm_sheet_id]){
            sendRequest('sht_filters/?sht_id='+prm_sheet_id, this.onLoadFilterNodes);
        }else{
            this.sendRefreshGrid();
        }
    }

    onLoadFilterNodes(filterNodesList){
        var newFilterNodes = this.state.filterNodes;
        var sheet_id = this.state.sheet_id;
        newFilterNodes[sheet_id] = {};

        filterNodesList.forEach(function(filter){
            newFilterNodes[sheet_id][filter.flt_id] = filter;
        });

        this.setState({filterNodes: newFilterNodes});

        this.sendRefreshGrid();
    }


    onFilterPanelChange(selectedNodes, allNodes, filterID){
        //this.state.selectedFilterNodes[filterID] = selectedNodes;
        this.state.filterNodes[this.state.sheet_id][filterID].filter_node_list = allNodes;
        this.setState({filterNodes : this.state.filterNodes});
    }

    getFilterSkey(){
        var skey = '';
        for (var filterID in this.state.filterNodes[this.state.sheet_id]){
            if (Object.prototype.hasOwnProperty.call(this.state.filterNodes[this.state.sheet_id], filterID)) {
                var filterNodeList = this.state.filterNodes[this.state.sheet_id][filterID].filter_node_list;
                var itemID = this.getCheckedFilterNodeId(filterNodeList);
                if (itemID !='0'){
                    skey = skey+ 'FLT_ID_'+filterID+'=>'+itemID+',';
                }
            }
        }
        return skey;
    }

    getCheckedFilterNodeId(nodeList){
        for (var i=0; i<nodeList.length; i++){
            if (nodeList[i]['checked']){
                return nodeList[i]['id'];
            }
            if (nodeList[i]['children']){
                var nestedResult = this.getCheckedFilterNodeId(nodeList[i]['children']);
                if (nestedResult != '0'){
                   return nestedResult;
                }
            }
        }
        return '0';
    }

    onToolbarRefreshClick(){
        this.sendRefreshGrid();
    }


    onToolbarCloseClick(){
        if (this.props.onToolbarCloseClick){
            console.log('SheetView this.props.layoutItemID', this.props.layoutItemID);
            this.props.onToolbarCloseClick(this.props.layoutItemID);
        }
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


                        <SheetToolbar
                            onPreferencesCallback={this.onToolbarPreferencesClick}
                            onRefreshCallback={this.onToolbarRefreshClick}
                            onCloseCallback={this.onToolbarCloseClick.bind(this)}
                            onSelectNewSheet={this.loadNewSheet}
                            sheetSelection={false}
                            />

                           <GridExample
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                skey={()=>{return '';}}
                                sheet_id = {this.props.sheet_id}
                                sheet_type = {this.props.sheet_type}
                                treeData = {false}
                                onFilterPanelChange={this.onFilterPanelChange}
                                selectedFilterNodes={this.state.selectedFilterNodes}
                                additionalSheetParams={this.props.additionalSheetParams}
                                />




            </React.Fragment>
        );

    }

}


