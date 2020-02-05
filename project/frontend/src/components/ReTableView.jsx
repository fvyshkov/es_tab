import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SheetToolbar from "./SheetToolbar.jsx";
import ReGrid from './ReGrid.jsx';
import TableViewComment from './TableViewComment.jsx';
import TableViewSchedule from './TableViewSchedule.jsx';
import TableViewFlow from './TableViewFlow.jsx';
import notify from 'devextreme/ui/notify';
import ColorPanel from './ColorPanel.jsx';
import ReportDialog from './ReportDialog.jsx';
import { sendRequest } from './App.js';
import { getReport } from './getReport.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import {TableData} from './tableData.js';




export default class ReTableView extends Component {
    constructor(props) {
        super(props);
        this.state={
                        rowData: [],
                        colorPanelVisible: false,
                        selectedFilterNodes: {},
                        filterNodes: {},
                        forceGridReload: false,
                        columnStates: [],
                        expandedGroupIds : [],
                        addToolPanels: [
                                {
                                id: "sheetFilters",
                                labelDefault: "Аналитики",
                                labelKey: "sheetFilters",
                                iconKey: "filter",
                                toolPanel: "filterPanelInToolPanel"
                                }
                            ]
                      };

        this.reportDialogParams = [];


        this.onToolbarPreferencesClick = this.onToolbarPreferencesClick.bind(this);
        this.onFilterPanelChange = this.onFilterPanelChange.bind(this);
        this.onToolbarRefreshClick = this.onToolbarRefreshClick.bind(this);
        this.getFilterSkey = this.getFilterSkey.bind(this);
        this.onColorPanelClose = this.onColorPanelClose.bind(this);
        this.onLoadFilterNodes = this.onLoadFilterNodes.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.loadData = this.loadData.bind(this);

        this.tableData = new TableData(()=>{}, this.props.getRowNodeId);

    }



    componentDidMount(){
        console.log('RETABLE MOUNT');
        if (this.props.sendLoadAll){
            this.props.sendLoadAll(this.loadAll.bind(this));
        }
    }

    sendRefreshGrid(){

    }

    onToolbarPreferencesClick(){
        this.setState({colorPanelVisible:true});
    }

    loadData(parentNode, reload = false){
        this.tableData.setRequestString(()=>{

            let httpStr = this.props.getDataRequestString();

            var skey = this.getFilterSkey();
            if (skey){
                httpStr += '&skey=' + this.getFilterSkey();
            }

            httpStr = this.addAdditionalSheetParams(httpStr);

            return httpStr;
        });

        if(!parentNode){
            this.setState({loading:true});
        }
        var rowData;
        return this.tableData.loadData(parentNode, reload)
            .then((data)=>{
                console.log('loadData', data);
                this.setState({rowData: data});
                console.log('rowData.length', this.state.rowData.length);

            })
            .then(()=> this.sendRefreshData())
            .then(()=>{this.setState({loading:false})});
        //console.log('loadData', rowData);
    }

    loadAll(prm_sheet_id, prm_sheet_type){

        if (this.state.sheet_id){
            this.sendBeforeCloseToGrid();
            this.saveSheetState();
        }

       this.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});

        var tabView = this;
            //запрашиваем фильтры
        let emptyPromise = new Promise((resolve, reject)=>{resolve('success');});

        emptyPromise
            .then(()=>{
                            if (tabView.props.getFilterData){
                                return tabView.props.getFilterData();
                            }else{
                                    return [];
                            }
                      })
            //обрабатываем пришедшие данные
            .then(filterNodesList=>{tabView.onLoadFilterNodes(filterNodesList);})
            //запрашиваем состояние колонок, списки открытых нод
            .then(()=>{
                            if (tabView.props.getViewUserPreferences){
                                return tabView.props.getViewUserPreferences();
                            }else{
                                    return [];
                            }
                      })
            //обрабатываем пришедшие данные
            .then(viewState=>{tabView.processViewState(viewState);})
            .then(()=>this.loadData({},true))
            //шлем указание гриду - там загрузятся столцы
            .then(()=>{tabView.sendRefreshGrid()});

    }

    onLoadFilterNodes(filterNodesList){
        var newFilterNodes = this.state.filterNodes;
        newFilterNodes = {};

        filterNodesList.forEach(function(filter){
            newFilterNodes[filter.flt_id] = filter;
        });

        this.setState({filterNodes: newFilterNodes});

        if (this.props.onFilterNodesChange){
            this.props.onFilterNodesChange(this.state.filterNodes);
        }
    }



    processViewState(viewState){
        console.log('OLD processSheetState', viewState);
        if (viewState.length>0){
            if (viewState[0].filternodes){
                var selectedNodes = viewState[0].filternodes;
                var markedNodes = markSelectedFilterNodes(this.state.filterNodes, selectedNodes);
                this.setState({filterNodes: markedNodes});
            }




            this.setState({columnStates: viewState[0].columnstates});

            this.setState({expandedGroupIds: viewState[0].expandedgroupids});


        }
    }

    saveSheetState(){
        if (this.props.saveViewState){
            var viewState = {};
            viewState['filterNodes'] = getSelectedFilterNodes(this.state.filterNodes);
            viewState['columnStates'] = this.state.columnStates;
            viewState['expandedGroupIds'] = this.state.expandedGroupIds;

            this.props.saveViewState(viewState);
        }
    }


    onFilterPanelChange(selectedNodes, allNodes, filterID){
        console.log('onFilterPanelChange selectedNodes', selectedNodes);
        this.state.filterNodes[filterID].filter_node_list = allNodes;
        this.setState({filterNodes : this.state.filterNodes});

        if (this.props.onFilterNodesChange){
            this.props.onFilterNodesChange(this.state.filterNodes);
        }
    }

    getFilterSkey(){
        var skey = '';
        for (var filterID in this.state.filterNodes){
            if (Object.prototype.hasOwnProperty.call(this.state.filterNodes, filterID)) {
                var filterNodeList = this.state.filterNodes[filterID].filter_node_list;
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
         this.gripApi.setRowData([]);
         this.loadData({}, true);
         this.sendRefreshGrid();
        //

    }


    onToolbarCloseClick(){
        this.saveSheetState();
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
        var newColumnStates = this.state.columnStates;
        newColumnStates = sheetColumnStates;
        this.setState({columnStates: newColumnStates});
    }

    onGridExpandedChange(sheetExpandedGroupIds){
        this.setState({expandedGroupIds : sheetExpandedGroupIds});
    }

    sendBeforeCloseToGrid(){
    }

    sendInsertRecord(){
    }

    onDeleteCallback(){
        if (this.props.onDeleteCallback){
            this.props.onDeleteCallback();
        }else{
            this.sendDeleteRecord();
        }
    }

    sendDeleteRecord(){

    }

    onInsertCallback(){
        console.log('onInsertCallback');
        if (this.props.onInsertCallback){
            console.log('onInsertCallback 2');
            this.props.onInsertCallback(this);
        }

    }


    sendUndoToGrid(){
    }

    onUndoClick(){
        this.sendUndoToGrid();
    }

    onCellFocused(params){
        if (this.props.onCellFocused){
            this.props.onCellFocused(params);
        }
    }

    onGetGridApi(params){
        console.log('TableView this.props.onGetGridApi', this.props.onGetGridApi);
        if (this.props.onGetGridApi){
            this.props.onGetGridApi(params);
        }
        this.gripApi = params;
    }

    getColumnsListRequestString(){

        var httpStr;
        if (this.props.getColumnsListRequestString){
            httpStr = this.props.getColumnsListRequestString();
        }else{
            httpStr = "sht_columns/?";
            if (this.state.sheet_id){
                httpStr +='sht_id='+this.state.sheet_id;
            }

        }

         var skey = this.getFilterSkey();
         if  (skey){
            httpStr += '&skey='+skey;
         }

        httpStr = this.addAdditionalSheetParams(httpStr);
        return httpStr;
    }

    addAdditionalSheetParams(str){
        var httpStr = str;
        if (this.props.additionalSheetParams){
            for (var paramName in this.props.additionalSheetParams){
                if (Object.prototype.hasOwnProperty.call(this.props.additionalSheetParams, paramName)){
                    httpStr += '&'+paramName+'='+this.props.additionalSheetParams[paramName];
                }
            }

        }
        return httpStr;
    }



    processNodeExpanding(parentNode){
        if (parentNode.node.expanded && !this.tableData.loadedNodes.includes(parentNode.node.data.node_key)){
            this.loadData(parentNode);
        }
    }

    sendRefreshData(){
    }


    onGridReady(){
        this.loadData({}, true);
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
                            onInsertCallback={this.onInsertCallback.bind(this)}
                            onDeleteCallback={this.onDeleteCallback.bind(this)}
                            onUndoCallback={this.onUndoClick.bind(this)}

                            sheetSelection={false}
                            additionalToolbarItem={this.props.additionalToolbarItem}
                            getMenuItems={this.props.getMenuItems}
                            menuItemClick={(params)=>{console.log('menuItemClick', params);}}

                            onTopMenuClick={this.props.onTopMenuClick}
                            />



                            <ReGrid
                                rowData={this.state.rowData}
                                getContextMenuItems={this.props.getContextMenuItems}
                                getColumnsListRequestString={this.getColumnsListRequestString.bind(this)}
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                sendBeforeCloseToGrid={click => this.sendBeforeCloseToGrid = click}
                                sendUndoToGrid={click => this.sendUndoToGrid = click}
                                skey={this.getFilterSkey}
                                getFilterSkey={this.getFilterSkey}
                                onFilterPanelChange={this.onFilterPanelChange}
                                selectedFilterNodes={this.state.selectedFilterNodes}
                                filterNodes={this.state.filterNodes}
                                columnStates={this.state.columnStates}
                                expandedGroupIds={this.state.expandedGroupIds}
                                addElementToLayout={this.props.addElementToLayout}
                                onToolbarCloseClick={this.props.onToolbarCloseClick}
                                getNewLayoutItemID={this.props.getNewLayoutItemID}
                                forceGridReload={this.state.forceGridReload}
                                resetForceGridReload={this.resetForceGridReload.bind(this)}
                                onGridStateChange={this.onGridStateChange.bind(this)}
                                onGridExpandedChange={this.onGridExpandedChange.bind(this)}
                                sendInsertRecord={click => this.sendInsertRecord = click}
                                sendDeleteRecord={click => this.sendDeleteRecord = click}
                                additionalSheetParams={this.props.additionalSheetParams}
                                getDatasource={this.props.getDatasource}
                                onCellFocused={this.onCellFocused.bind(this)}
                                onGetGridApi={this.onGetGridApi.bind(this)}
                                addToolPanels={this.state.addToolPanels}
                                onCellValueChanged={this.props.onCellValueChanged}
                                processNodeExpanding={this.processNodeExpanding.bind(this)}
                                sendRefreshData={click => this.sendRefreshData = click}
                                loading={this.state.loading}
                                getRowNodeId={this.props.getRowNodeId}
                                onGridReady={this.onGridReady.bind(this)}
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






