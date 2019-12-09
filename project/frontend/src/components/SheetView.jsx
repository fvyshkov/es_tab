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



class SheetView extends Component {
    constructor(props) {
        super(props);
        this.state={
                        sheet_id: 0,
                        colorPanelVisible: false,
                        selectedFilterNodes: {},
                        filterNodes: {},
                        forceGridReload: false,
                        columnStates: {},
                        expandedGroupIds : []
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

        if (this.state.sheet_type==='tree'){
            this.setState({forceGridReload: true});
        }
    }

    loadNewSheet(prm_sheet_id, prm_sheet_type){
        if (this.state.sheet_id){
            this.sendBeforeCloseToGrid();
            this.saveSheetState();
        }

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

        sendRequest('sht_state/?sht_id='+ this.state.sheet_id, this.processSheetState.bind(this));
        this.setState({filterNodes: newFilterNodes});


    }

    processSheetState(sheetState){
        if (sheetState.length>0){
            if (sheetState[0].filternodes){
                var selectedNodes = sheetState[0].filternodes;
                var markedNodes = markSelectedFilterNodes(this.state.filterNodes[this.state.sheet_id], selectedNodes);
                this.state.filterNodes[this.state.sheet_id] = markedNodes;
                this.setState({filterNodes: this.state.filterNodes});
            }

            if (sheetState[0].columnstates){
                this.state.columnStates[this.state.sheet_id] = sheetState[0].columnstates;
                this.setState({columnStates: this.state.columnStates});
            }

            this.setState({expandedGroupIds: sheetState[0].expandedgroupids});


        }
        this.sendRefreshGrid();
    }

    saveSheetState(){
        if (this.state.sheet_id){
            var sheetState = {};
            sheetState['filterNodes'] = getSelectedFilterNodes(this.state.filterNodes[this.state.sheet_id]);
            sheetState['columnStates'] = this.state.columnStates[this.state.sheet_id];
            sheetState['expandedGroupIds'] = this.state.expandedGroupIds;

            var httpStr = 'sht_state_update/?sht_id='+this.state.sheet_id;
            sendRequest(httpStr,()=>{},'POST', sheetState);
        }
    }


    onFilterPanelChange(selectedNodes, allNodes, filterID){
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
        if (this.state.sheet_id){
            this.sendBeforeCloseToGrid();
            this.saveSheetState();

        }

        if (this.props.onToolbarCloseClick){
            this.props.onToolbarCloseClick(this.props.layoutItemID);
        }
    }

    onColorPanelClose(){
        this.setState({colorPanelVisible:false});
    }

    resetForceGridReload(){
        this.setState({forceGridReload:false});

    }

    onToolbarSaveClick(){
        notify('save');
    }


    onGridStateChange( sheetColumnStates){
        if (this.state.sheet_id){
            var newColumnStates = this.state.columnStates;
            newColumnStates[this.state.sheet_id] = sheetColumnStates;
            this.setState({columnStates: newColumnStates});
        }
    }

    onGridExpandedChange(sheetExpandedGroupIds){
        if (this.state.sheet_id){
            this.setState({expandedGroupIds : sheetExpandedGroupIds});
        }
    }

    sendBeforeCloseToGrid(){

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
                            onSaveCallback={this.onToolbarSaveClick.bind(this)}
                            onSelectNewSheet={this.loadNewSheet}
                            sheetSelection={true}
                            />


                            <GridExample
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                sendBeforeCloseToGrid={click => this.sendBeforeCloseToGrid = click}
                                skey={this.getFilterSkey}
                                sheet_id = {this.state.sheet_id}
                                sheet_type = {this.state.sheet_type}
                                treeData = {this.state.sheet_type==='tree'? true:false}
                                onFilterPanelChange={this.onFilterPanelChange}
                                selectedFilterNodes={this.state.selectedFilterNodes}
                                filterNodes={this.state.filterNodes[this.state.sheet_id]}
                                columnStates={this.state.columnStates[this.state.sheet_id]}
                                expandedGroupIds={this.state.expandedGroupIds}
                                addElementToLayout={this.props.addElementToLayout}
                                onToolbarCloseClick={this.props.onToolbarCloseClick}
                                getNewLayoutItemID={this.props.getNewLayoutItemID}
                                forceGridReload={this.state.forceGridReload}
                                resetForceGridReload={this.resetForceGridReload.bind(this)}
                                onGridStateChange={this.onGridStateChange.bind(this)}
                                onGridExpandedChange={this.onGridExpandedChange.bind(this)}
                                />




            </React.Fragment>
        );

    }

}

function getSelectedFilterNodes(nodes){
    var selected = {}
    for (var filterId in nodes) {

        selected[filterId] = [];
        if (Object.prototype.hasOwnProperty.call(nodes, filterId)) {
            if (nodes[filterId]['filter_node_list']){
                selected[filterId] = getSelectedArrayInSingleTree(nodes[filterId]['filter_node_list']);
            }
        }
    }
    console.log('selected', selected);
    return selected;
}

function getSelectedArrayInSingleTree(singleTreeArray){
    var selectedIds = [];

    processTree(singleTreeArray, (item)=>{
                                            if (item.checked){
                                                selectedIds.push({id:item.id});
                                            }
                                         });

    return selectedIds;
}

function processTree(treeList, callbackForItem){
    for (var i=0; i < treeList.length; i++ ){
        callbackForItem(treeList[i]);
        if (treeList[i]['children']){
            processTree(treeList[i]['children'], callbackForItem);
        }
    }
}

function markSelectedFilterNodes(nodes, selected){

    var marked = Object.assign({}, nodes);

    for (var filterId in marked) {
        if (Object.prototype.hasOwnProperty.call(nodes, filterId)) {
            if (marked[filterId]['filter_node_list']){
                if (selected[filterId]){
                    processTree(marked[filterId]['filter_node_list'],
                             (item) =>{
                                            if (selected[filterId].find(element => element.id === item.id)){
                                                item['checked'] = true;
                                            }else{
                                                item['checked'] = false;
                                            }
                                      }
                            );
                }
            }
        }
    }
    return marked;
}



export default SheetView;