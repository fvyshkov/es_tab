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
import {getFilterSkeyByCell, getFilterSkey} from './esUtils.js';




export default class ReTableView extends Component {
    constructor(props) {
        super(props);
        this.state={
                        rowData: [],
                        colorPanelVisible: false,
                        selectedFilterNodes: {},
                        filterNodes: {},
                        gridKey: 0,
                        forceGridReload: false,
                        columnStates: [],
                        expandedGroupIds : [],
                        isLoaded: 0
                      };

        if (props.addToolPanels){
            this.state.addToolPanels = props.addToolPanels;
        }else{
            this.state.addToolPanels = [];
        }

        this.reportDialogParams = [];
        this.isFirstLoadData = true;


        this.onToolbarPreferencesClick = this.onToolbarPreferencesClick.bind(this);
        this.onFilterPanelChange = this.onFilterPanelChange.bind(this);
        this.onToolbarRefreshClick = this.onToolbarRefreshClick.bind(this);
        this.getFilterSkey = this.getFilterSkey.bind(this);
        this.onColorPanelClose = this.onColorPanelClose.bind(this);
        this.onLoadFilterNodes = this.onLoadFilterNodes.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.loadData = this.loadData.bind(this);
        this.afterFirstLoadData = this.afterFirstLoadData.bind(this);

        this.tableData = new TableData(()=>{}, this.props.getRowNodeId);

    }


    onSendInsertRecord(newRows, api){
        console.log("reTableView onSendInsertRecord", newRows);
        if (newRows && newRows.length>0){
            api.updateRowData({ add: newRows });
            var rowNode = api.getRowNode(newRows[0].node_key);
            var data_test = newRows[0];
            var columns = newRows[0]['column_data'];
            for (var i=0; i< columns.length; i++){
                data_test[columns[i]['key']] = columns[i]['sql_value']
            }
            rowNode.setData(data_test);
        }
    }

    onSendExpandRecursive(node_key){
        var api = this.getGridApi();
        if (!this.tableData.loadedNodes.includes(node_key)){
            this.loadData(api.getRowNode(node_key), false, true)
                .then(()=>this.expandLoadedNodesRecursive(api.getRowNode(node_key)));
        }
    }

    expandLoadedNodesRecursive( node){
        node.gridApi.setRowNodeExpanded(node, true);
        node.gridApi.forEachNode((nodeIterator)=>{
            if (nodeIterator.parent && nodeIterator.parent.id == node.id && !nodeIterator.expanded){
                this.expandLoadedNodesRecursive(nodeIterator);
            }
        });

    }


    componentDidMount(){
        if (this.props.sendLoadAll){
            this.props.sendLoadAll(this.loadAll.bind(this));
        }

        if (this.props.sendExpandRecursive){
            this.props.sendExpandRecursive(this.onSendExpandRecursive.bind(this));
        }


        if (this.props.sendRefresh){
            this.props.sendRefresh(this.onToolbarRefreshClick.bind(this));
        }



        if (this.props.sendNewFilterNodes){
            this.props.sendNewFilterNodes(this.onLoadFilterNodes.bind(this));
        }

        if (this.props.sendInsertRecord){
            this.props.sendInsertRecord(this.onSendInsertRecord.bind(this));
        }



        if (this.props.filterNodes){
            this.setState({filterNodes: this.props.filterNodes});
        }

        if (this.props.sheet){
            this.setState({sheet_id: this.props.sheet.id});
        }

        if (this.props.onLayoutContentChange && this.props.sheet){
            this.props.onLayoutContentChange({
                                                type: 'loadNewSheet',
                                                itemId: this.props.layoutItemID,
                                                changeParams: {sheet: this.props.sheet}
                                             });
        }
    }

    sendRefreshGrid(){

    }

    onToolbarPreferencesClick(){
        this.setState({colorPanelVisible:true});
    }

    loadData(parentNode, reload = false, recursive = false){
        //при изменении пропса-массива приходится вручную изменить key грида, чтобы он перерендерился
        if (reload){
            this.setState({ gridKey: this.state.gridKey+1, rowData: null});
        }

        this.tableData.setRequestString(()=>{

            let httpStr = this.props.getDataRequestString();

            var skey = this.getFilterSkey();
            if (skey){
                httpStr += '&skey=' + this.getFilterSkey();
            }

            httpStr += '&recursive=' + (recursive ? "1" : "0");


            httpStr = this.addAdditionalSheetParams(httpStr);

            return httpStr;
        });

        if(!parentNode){
            this.setState({loading:true});
        }

        if (reload){
            this.setDummyRow();
        }

        return this.tableData.loadData(parentNode, reload)
            .then((data)=>{
                this.setState({rowData: data});
                data.forEach(row=>{
                    if (row.groupfl==='1' && this.nodesForExpand.includes(row.node_key)){
                        this.nodesForExpand.shift();
                        this.sendExpandNode(row.node_key);
                    }
                });
            })
            .then(()=> {
                this.sendRefreshData();
            })
            .then(()=>{
                this.setState({loading:false});
                this.setState({isLoaded:1});
            })
            .then(()=>{
                if (this.isFirstLoadData){
                    this.afterFirstLoadData();
                }
            });
    }

    setDummyRow(){
        const dummy_key="dummy_0";
        this.setState({rowData: [{node_key: dummy_key, hie_path: [dummy_key], name: "DUMMY"}]});
    }

    afterFirstLoadData(){
        if (this.props.chartsData){
            this.sendLoadChartsToGrid(this.props.chartsData);
        }
        this.isFirstLoadData = false;
    }




    loadAll(prm_sheet_id, prm_sheet_type){
        this.setState({isLoaded:0});

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
                this.setDummyRow();
            })
            .then(()=>{
                            if (tabView.props.getFilterData){
                                return tabView.props.getFilterData();
                            }else{
                                    return [];
                            }
                      })
            //обрабатываем пришедшие данные
            .then(filterNodesList=>{
                                        tabView.onLoadFilterNodes(filterNodesList);
                                    })
            //запрашиваем состояние колонок, списки открытых нод
            .then(()=>{

                            if (tabView.props.getViewUserPreferences){
                                return tabView.props.getViewUserPreferences();
                            }else{
                                    return [];
                            }
                      })
            //обрабатываем пришедшие данные
            .then(viewState=>{
                tabView.processViewState(viewState);
                })
            .then(()=>{
                        this.loadData({},true);
                      })
            //шлем указание гриду - там загрузятся столбцы
            .then(()=>{tabView.sendRefreshGrid()})
            .then(()=>{this.setState({isLoaded:1})});

    }

    onLoadFilterNodes(filterNodesList){
        var newFilterNodes = this.state.filterNodes;
        newFilterNodes = {};

        filterNodesList.forEach(function(filter){
            newFilterNodes[filter.flt_id] = filter;
        });

        this.setState({filterNodes: newFilterNodes});
        //при изменении пропса-массива приходится вручную изменить key грида, чтобы он перерендерился
        this.setState({gridKey: this.state.gridKey+1});

        if (this.props.onFilterNodesChange){
            this.props.onFilterNodesChange(this.state.filterNodes);
        }
    }

    processViewState(viewState){
        if (viewState.length>0){
            this.setState({columnStates: viewState[0].columnstates,
                           expandedGroupIds: viewState[0].expandedgroupids
                          });

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

        this.sendSaveFilter();
        this.gripApi.setRowData([]);
        this.setState({isLoaded:0});
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
        }
    }

    sendDeleteRecord(){

    }

    onInsertCallback(){
        if (this.props.onInsertCallback){
            this.props.onInsertCallback();
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

    onGetGridApiLow(params){
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
        console.log();
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


    onGridReady(gridApi){
        if (this.props.expandedGroupIds){
            this.nodesForExpand = this.props.expandedGroupIds.slice();
        }else{
            this.nodesForExpand = [];
        }
        this.gridApi = gridApi;
        this.setState({gridKey: this.state.gridKey+1});
        this.loadData({}, true);

    }

    sendLoadChartsToGrid(){
    }

    onSaveColors(){
        this.setState({colorPanelVisible: false});
    }

    render(){

        return (
            <React.Fragment>

                <div class="isLoaded" isLoaded={this.state.isLoaded} />

                <ColorPanel
                    popupVisible={this.state.colorPanelVisible}
                    sendColorPanelClose={this.onColorPanelClose}
                    sheet_id={this.state.sheet_id}
                    onSaveColors={this.onSaveColors.bind(this)}
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
                                gridKey={this.state.gridKey}
                                getContextMenuItems={this.props.getContextMenuItems}
                                getColumnsListRequestString={this.getColumnsListRequestString.bind(this)}
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                sendLoadChartsToGrid={click => this.sendLoadChartsToGrid = click}
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
                                onGetGridApiLow={this.onGetGridApiLow.bind(this)}
                                addToolPanels={this.state.addToolPanels}
                                onCellValueChanged={this.props.onCellValueChanged}
                                processNodeExpanding={this.processNodeExpanding.bind(this)}
                                sendRefreshData={click => this.sendRefreshData = click}
                                loading={this.state.loading}
                                getRowNodeId={this.props.getRowNodeId}
                                onGridReady={this.onGridReady.bind(this)}
                                getChartTitle={this.props.getChartTitle}
                                sendExpandNode={click => this.sendExpandNode = click}
                                sendSaveFilter={click => this.sendSaveFilter = click}
                                getGridApi={click => this.getGridApi = click}
                                onSendExpandRecursive={this.onSendExpandRecursive.bind(this)}
                                {...this.props}
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






