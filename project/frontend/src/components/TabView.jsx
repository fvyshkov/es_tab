import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SheetToolbar from "./SheetToolbar.jsx";
import Grid from './Grid.jsx';
import notify from 'devextreme/ui/notify';
import ColorPanel from './ColorPanel.jsx';
import { sendRequest } from './App.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import { connect } from "react-redux";
import { addArticle, getData } from "../actions/index";
import { AgGridReact } from "@ag-grid-community/react";
import {AllModules} from "@ag-grid-enterprise/all-modules";
import '@ag-grid-community/client-side-row-model';

/*
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
*/

class TabView extends Component {
    constructor(props) {
        super(props);

        //const uuidv1 = require('uuid/v1');

        this.dataModelDescription = new DataModelDescription();
        this.state={
                        viewGUID: this.props.layoutItemID,
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
        this.componentDidMount = this.componentDidMount.bind(this);
        this.testGetPromise = this.testGetPromise.bind(this);
        this.test = this.test.bind(this);
        this.processSheetState = this.processSheetState.bind(this);
        this.setTestFieldAsync = this.setTestFieldAsync.bind(this);
        this.processNodeExpanding = this.processNodeExpanding.bind(this);
        this.getTabData = this.getTabData.bind(this);





    }


    testArticlesList(){
        //this.props.getData({sht_id:100, text:'test text'});
        this.props.addArticle({ title:'777' });
    }

    test(){
        console.log('TableView test');
        this.setState({test:'test'});
        return 1;
    }

    componentDidMount(){
        if (this.props.sendLoadNewSheet){
            this.props.sendLoadNewSheet(this.loadNewSheet);
        }
        if (this.props.sheet_id && this.props.sheet_type){
            this.setState({sheet_id: this.props.sheet_id, sheet_type: this.props.sheet_type});
        }
    }

    loadNewSheetToFilterPanel(){

    }

    sendRefreshGrid(){

    }

    onToolbarPreferencesClick(){
        this.testArticlesList();

        this.setState({colorPanelVisible:true});

        if (this.state.sheet_type==='tree'){
            this.setState({forceGridReload: true});
        }
    }

    httpGet(url) {

      return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function() {
          if (this.status == 200) {
            resolve(this.response);
          } else {
            var error = new Error(this.statusText);
            error.code = this.status;
            reject(error);
          }
        };

        xhr.onerror = function() {
          reject(new Error("Network Error"));
        };

        xhr.send();
      });

    }



    testGetPromise(){

        return new Promise(
                (resolve, reject) => {

                      setTimeout(() => {
                                        console.log('ON testGetPromise');
                                        resolve("result");

                                        }, 4000);

                }
        );
    }

/*
    sendNewSheetRequest(prm_sheet_id, prm_sheet_type){
        return new Promise(
                (resolve, reject) => {

                    if (this.state.sheet_id){
                        this.sendBeforeCloseToGrid();
                        this.saveSheetState();
                    }

                    this.dataModelDescription.setParams({sht_id:prm_sheet_id});

                    this.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});
                    if (!this.state.filterNodes[prm_sheet_id]){
                        sendRequest('sht_filters/?sht_id='+prm_sheet_id, this.onLoadFilterNodes);
                    }else{
                        this.sendRefreshGrid();
                    }

                }
        );


    }
    */

    setTestFieldAsync(value){
        setTimeout(()=>{this.setState({testField:value});}, 2000);

    }

    getTestField(){
        return this.state.testField;
    }

    loadNewSheet(prm_sheet_id, prm_sheet_type){
        console.log('viewGUID', this.state.viewGUID);


        var tabView = this;
        return new Promise(function(resolve, reject) {
            //console.log('loadNewSheet 1');
            tabView.dataModelDescription.setParams({sht_id:prm_sheet_id});
            //console.log('loadNewSheet 2');
            tabView.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});
            //console.log('loadNewSheet 3');
            sendRequestPromise('sht_filters/?sht_id='+prm_sheet_id)
                .then(respObj=>{
                                    tabView.onLoadFilterNodesSync(respObj);
                                })
                .then(()=>{return sendRequestPromise('sht_state/?sht_id='+ tabView.state.sheet_id)})
                .then(respObj=>{tabView.processSheetState(respObj);})
                .then(()=>{console.log('sendRefresh');tabView.sendRefreshGrid()})
                //в redux-версии здесь должно быть  зачитывание данных и загрузка колонок
                .then(

                        //()=>  tabView.props.getData({requestString:'sht_nodes/?dummy=1&sht_id=2434&skey=FLT_ID_5619=>39595,&group_keys='})
                         () => tabView.getTabData(null, true)
                    )

                .then(()=>resolve('success'));
        });

        return ;
        if (this.state.sheet_id){
            this.sendBeforeCloseToGrid();
            this.saveSheetState();
        }

        this.dataModelDescription.setParams({sht_id:prm_sheet_id});

        this.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});
        if (!this.state.filterNodes[prm_sheet_id]){
            sendRequest('sht_filters/?sht_id='+prm_sheet_id, this.onLoadFilterNodes);
        }else{
            this.sendRefreshGrid();
        }
    }

    getTabData(parentNode, reload = false){
        let httpStr = 'sht_nodes/?dummy=1';
        if (this.state.sheet_id){
            httpStr += '&sht_id=' + this.state.sheet_id;
        }
        httpStr += '&skey=' + this.getFilterSkey();

        var parentNodeKey;

        if (parentNode && parentNode.data){
            parentNodeKey = parentNode.data.node_key;
            httpStr += '&flt_id=' + parentNode.data.flt_id + '&flt_item_id=' + parentNode.data.flt_item_id;
        }

        if (parentNode && parentNode.data && parentNode.data.hie_path){
            var pathToExpandedNode = '';
            parentNode.data.hie_path.forEach(el=>{pathToExpandedNode += el+','});
            httpStr += '&group_keys='+pathToExpandedNode;
        }


        this.props.getData({
                                requestString: httpStr,
                                parentNodeKey: parentNodeKey,
                                reload: reload,
                                viewGUID: this.state.viewGUID
                            });



    }

    onLoadFilterNodes(filterNodesList){
        var newFilterNodes = this.state.filterNodes;
        var sheet_id = this.state.sheet_id;
        newFilterNodes[sheet_id] = {};

        filterNodesList.forEach(function(filter){
            newFilterNodes[sheet_id][filter.flt_id] = filter;
        });

        this.setState({filterNodes: newFilterNodes});

        sendRequest('sht_state/?sht_id='+ this.state.sheet_id, this.processSheetState.bind(this));



    }

    onLoadFilterNodesSync(filterNodesList){
        var newFilterNodes = this.state.filterNodes;
        var sheet_id = this.state.sheet_id;
        newFilterNodes[sheet_id] = {};
        filterNodesList.forEach(function(filter){
            newFilterNodes[sheet_id][filter.flt_id] = filter;
        });
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
            sendRequestPromise(httpStr, 'POST', sheetState);
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
        this.getTabData(null, true);
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

        }else{
            if (this.state.sheet_id){
                sendRequest('insert_record/?sht_id='+this.state.sheet_id+'&skey='+this.getFilterSkey(),
                            this.sendInsertRecord,
                            'POST',
                            {});
            }
        }

    }


    sendUndoToGrid(){
    }

    onUndoClick(){
        console.log('this.props', this.props);
        this.sendUndoToGrid();
    }

    onCellFocused(params){
        if (this.props.onCellFocused){
            this.props.onCellFocused(params);
        }
    }

    onGetGridApi(params){
        //console.log('TableView this.props.onGetGridApi', this.props.onGetGridApi);
        if (this.props.onGetGridApi){
            this.props.onGetGridApi(params);
        }
        this.gripApi = params;
    }

    getDataModelDescription(){
        var sheetParams={sht_id:this.state.sheet_id, sheet_type: this.state.sheet_type};
        var dataModelDescription = new DataModelDescription(sheetParams);
        return dataModelDescription;
    }

    processNodeExpanding(params){

        this.getTabData(params);
        return;
        console.log('processNodeExpanding node', params);
        var pathToExpandedNode = '';
        params.data.hie_path.forEach(el=>{pathToExpandedNode += el+','});
        console.log('pathToExpandedNode', pathToExpandedNode);

        var httpStr = 'sht_nodes/?dummy=1&sht_id=2434&skey=FLT_ID_5619=>39595,&group_keys='+pathToExpandedNode;
        httpStr +=  '&flt_id=' + params.data.flt_id + '&flt_item_id=' + params.data.flt_item_id;
         console.log('processNodeExpanding httpStr=', httpStr);
        var tabView = this;
        this.props.getData({
                                requestString: httpStr,
                                parentNodeKey: params.data.node_key

                            });
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
                            onSelectNewSheet={this.loadNewSheet}
                            test={this.test}
                            sheetSelection={false}
                            additionalToolbarItem={this.props.additionalToolbarItem}
                            />
 <div>
               <Grid
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                sendBeforeCloseToGrid={click => this.sendBeforeCloseToGrid = click}
                                sendUndoToGrid={click => this.sendUndoToGrid = click}
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
                                sendInsertRecord={click => this.sendInsertRecord = click}
                                sendDeleteRecord={click => this.sendDeleteRecord = click}
                                additionalSheetParams={this.props.additionalSheetParams}
                                getDatasource={this.props.getDatasource}
                                onCellFocused={this.onCellFocused.bind(this)}
                                onGetGridApi={this.onGetGridApi.bind(this)}
                                dataModelDescription={this.dataModelDescription}
                                gridRowData={this.props.gridData}
                                processNodeExpanding={this.processNodeExpanding.bind(this)}
                                />
</div>



            </React.Fragment>
        );

    }

}

/*


 <Grid
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                sendBeforeCloseToGrid={click => this.sendBeforeCloseToGrid = click}
                                sendUndoToGrid={click => this.sendUndoToGrid = click}
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
                                sendInsertRecord={click => this.sendInsertRecord = click}
                                sendDeleteRecord={click => this.sendDeleteRecord = click}
                                additionalSheetParams={this.props.additionalSheetParams}
                                getDatasource={this.props.getDatasource}
                                onCellFocused={this.onCellFocused.bind(this)}
                                onGetGridApi={this.onGetGridApi.bind(this)}
                                dataModelDescription={this.dataModelDescription}
                                gridRowData={this.props.gridData}
                                processNodeExpanding={this.processNodeExpanding.bind(this)}
                                />

*/

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



class DataModelDescription{

    constructor(queryParams){
        this.queryParams = queryParams;
    }

    addParamsToString(str, params){
        var result = str;
        if (params){
            for (var paramName in params){
                if (Object.prototype.hasOwnProperty.call(params, paramName)){
                    result += '&'+paramName+'='+params[paramName];
                }
            }

        }
        return result;
    }

    setParams(params){
        this.queryParams = params;
    }

    loadColumnsHttpRequestStr(){
        var httpStr = "sht_columns/?";
        httpStr = this.addParamsToString(httpStr, this.queryParams);
        return httpStr;
    }

    testFunction(){
        return 'check_value';
    }


    getDatasource(gridComponent) {


        return {


            getRows(params,testFunction){
                let httpStr = 'sht_nodes/?dummy=1';
                if (gridComponent.props.sheet_id){
                    httpStr = httpStr.concat('&sht_id=', gridComponent.props.sheet_id);
                }
                httpStr = httpStr.concat( '&skey=',gridComponent.props.skey());
                if (params.parentNode.data){
                   httpStr = httpStr.concat( '&flt_id=',params.parentNode.data.flt_id,'&flt_item_id=',params.parentNode.data.flt_item_id);
                }
                if (params.request.groupKeys){
                    httpStr = httpStr.concat( '&group_keys=',params.request.groupKeys);
                }

                httpStr = gridComponent.addAdditionalSheetParams(httpStr);
                console.log('sheetDatasource (sendRequestPromise)');
                sendRequestPromise(httpStr)
                    .then((rowData) =>{
                                                        if (rowData.length >0) {
                                                            let lastRow = () => {
                                                                return rowData.length;
                                                            };

                                                            for (var i = 0; i < rowData.length; i++) {
                                                                var colData =  rowData[i].column_data;
                                                                for (var colIndex=0; colIndex<colData.length; colIndex++){
                                                                    rowData[i][colData[colIndex].key] = colData[colIndex].sql_value;
                                                                }
                                                            }
                                                            params.successCallback(rowData, lastRow());

                                                            if (gridComponent.savedFocusedCell){
                                                                gridComponent.gridApi.ensureIndexVisible(gridComponent.savedFocusedCell.rowIndex);
                                                                gridComponent.gridApi.ensureColumnVisible(gridComponent.savedFocusedCell.column);
                                                                gridComponent.gridApi.setFocusedCell(gridComponent.savedFocusedCell.rowIndex, gridComponent.savedFocusedCell.column);
                                                             }


                                                            rowData.forEach(function(row) {
                                                                if (gridComponent.props.expandedGroupIds &&
                                                                    gridComponent.props.expandedGroupIds.indexOf(row.node_key) > -1) {
                                                                    if (gridComponent.gridApi.getRowNode(row.node_key)){
                                                                        gridComponent.gridApi.getRowNode(row.node_key).setExpanded(true);
                                                                    }

                                                                }


                                                            });
                                                        }else{
                                                            params.successCallback([], 0);
                                                        }
                                                    });
                /*
                sendRequest(httpStr, (rowData) =>{
                                                        if (rowData.length >0) {
                                                            let lastRow = () => {
                                                                return rowData.length;
                                                            };

                                                            for (var i = 0; i < rowData.length; i++) {
                                                                var colData =  rowData[i].column_data;
                                                                for (var colIndex=0; colIndex<colData.length; colIndex++){
                                                                    rowData[i][colData[colIndex].key] = colData[colIndex].sql_value;
                                                                }
                                                            }
                                                            params.successCallback(rowData, lastRow());

                                                            if (gridComponent.savedFocusedCell){
                                                                gridComponent.gridApi.ensureIndexVisible(gridComponent.savedFocusedCell.rowIndex);
                                                                gridComponent.gridApi.ensureColumnVisible(gridComponent.savedFocusedCell.column);
                                                                gridComponent.gridApi.setFocusedCell(gridComponent.savedFocusedCell.rowIndex, gridComponent.savedFocusedCell.column);
                                                             }


                                                            rowData.forEach(function(row) {
                                                                if (gridComponent.props.expandedGroupIds &&
                                                                    gridComponent.props.expandedGroupIds.indexOf(row.node_key) > -1) {
                                                                    if (gridComponent.gridApi.getRowNode(row.node_key)){
                                                                        gridComponent.gridApi.getRowNode(row.node_key).setExpanded(true);
                                                                    }

                                                                }


                                                            });
                                                        }else{
                                                            params.successCallback([], 0);
                                                        }
                                                    }
                            );
                            */

            }
        }
   }



}

function mapStateToProps (state, ownProps){
    console.log('tabView mapStateToProps state.expandedNodes', ownProps.layoutItemID, state.expandedNodes );

    var clonedStateData = [];
    if (state.tabViewData.get(ownProps.layoutItemID)){
        clonedStateData = JSON.parse(JSON.stringify(state.tabViewData.get(ownProps.layoutItemID)));
     }else{
        return {};
     }

    var expandedNodes =[];

    if (state.expandedNodes.get(ownProps.layoutItemID)){
        expandedNodes = state.expandedNodes.get(ownProps.layoutItemID);
    }

    console.log('MAP expandedNodes', expandedNodes );

    var data=[];

    clonedStateData.forEach(
        (row)=>{
            data.push(row);


            if (row.column_data){
                var colData =  row.column_data;
                for (var colIndex=0; colIndex<colData.length; colIndex++){
                    data[data.length-1][colData[colIndex].key] = colData[colIndex].sql_value;
                }
            }


            if (row.groupfl==='1' && !expandedNodes.includes(row.node_key)){
                data.push({});
                var dummy_hie_path = row.hie_path.slice();
                dummy_hie_path.push(row.node_key+' dummy child');
                data[data.length-1]['hie_path'] = dummy_hie_path;
                data[data.length-1]['node_key'] = row.node_key+'_dummy_child';
            }



        }
    );

    console.log('mapStateToProps data', data);
    return { articles: state.articles, gridData: data};
};


function mapDispatchToProps(dispatch) {
    return {
        addArticle: article => dispatch(addArticle(article)),
        getData: params => dispatch(getData(params))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabView);
