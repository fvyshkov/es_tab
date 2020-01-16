import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SheetToolbar from "./SheetToolbar.jsx";
import ReGrid from './ReGrid.jsx';
import TableViewComment from './TableViewComment.jsx';
import TableViewSchedule from './TableViewSchedule.jsx';
import TableViewFlow from './TableViewFlow.jsx';
import notify from 'devextreme/ui/notify';
import ColorPanel from './ColorPanel.jsx';
import { sendRequest } from './App.js';
import { sendRequestPromise } from './sendRequestPromise.js';





export default class ReTableView extends Component {
    constructor(props) {
        super(props);
        this.state={
                        sheet_id: 0,
                        colorPanelVisible: false,
                        selectedFilterNodes: {},
                        filterNodes: {},
                        forceGridReload: false,
                        columnStates: {},
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

        this.onToolbarPreferencesClick = this.onToolbarPreferencesClick.bind(this);
        this.onFilterPanelChange = this.onFilterPanelChange.bind(this);
        this.onToolbarRefreshClick = this.onToolbarRefreshClick.bind(this);
        this.getFilterSkey = this.getFilterSkey.bind(this);
        this.onColorPanelClose = this.onColorPanelClose.bind(this);
        this.onLoadFilterNodes = this.onLoadFilterNodes.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);



    }



    componentDidMount(){
        if (this.props.sendLoadAll){
            this.props.sendLoadAll(this.loadAll.bind(this));
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

        this.setState({colorPanelVisible:true});

        if (this.state.sheet_type==='tree'){
            this.setState({forceGridReload: true});
        }
    }


    loadAll(params){
        this.props.beforeLoadAll(params);
        this.props.loadAll(params);
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
            .then(()=>{return sendRequestPromise('sht_state/?sht_id='+ tabView.state.sheet_id)})
            //обрабатываем пришедшие данные
            .then(viewState=>{tabView.processViewState(viewState);})
            //шлем указание гриду - там загрузятся столцы и данные
            .then(()=>{tabView.sendRefreshGrid()});

    }

    onLoadFilterNodes(filterNodesList){
        var newFilterNodes = this.state.filterNodes;
        var sheet_id = this.state.sheet_id;
        newFilterNodes = {};

        filterNodesList.forEach(function(filter){
            newFilterNodes[filter.flt_id] = filter;
        });

        this.setState({filterNodes: newFilterNodes});

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
        if (this.state.sheet_id){
            var sheetState = {};
            sheetState['filterNodes'] = getSelectedFilterNodes(this.state.filterNodes);
            sheetState['columnStates'] = this.state.columnStates;
            sheetState['expandedGroupIds'] = this.state.expandedGroupIds;

            var httpStr = 'sht_state_update/?sht_id='+this.state.sheet_id;
            sendRequest(httpStr,()=>{},'POST', sheetState);
        }
    }


    onFilterPanelChange(selectedNodes, allNodes, filterID){
        this.state.filterNodes[filterID].filter_node_list = allNodes;
        this.setState({filterNodes : this.state.filterNodes});
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
            var skey = this.getFilterSkey();
            if  (skey){
                httpStr += '&skey='+skey;
            }
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


    getContextMenuItems(params){


        return  [{
                name: 'Детализация <b>[' + params.column.colDef.headerName+']</b>',
                action: this.showDetailForCell.bind(this, params)
              },
              {
                name: 'Комментарии по значению',
                action: this.showCommentForCell.bind(this, params)
              },
              {
                name: 'Графики',
                action: this.showScheduleForRow.bind(this, params)
              },
              {
                name: 'Потоки платежей',
                subMenu:[
                    {
                    name: 'По выбранной записи',
                    action: this.showFlowForRow.bind(this, params)
                    },
                    {
                    name: 'Все потоки (по выбранным значениям аналитик)',
                    action: this.showFlowForSkey.bind(this, params)
                    }
                ]
              }
              ];
    }

    showDetailForCell(params){
        console.log('showDetailForCell', params);
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            console.log('newLayoutItemID=', newLayoutItemID);
            var detailRender =  <ReTableView
                                sheet_id = {this.state.sheet_id}
                                sheet_type = {this.state.sheet_type}
                                additionalSheetParams={{parent_id:params.node.data.id, ind_id:params.column.colDef.ind_id}}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender);
        }
    }

    showScheduleForRow(params){
        console.log('showDetailForCell req_id', params.node.data.id);
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            console.log('newLayoutItemID=', newLayoutItemID);
            var detailRender =  <TableViewSchedule
                                additionalSheetParams={{sht_id: this.state.sheet_id, req_id:params.node.data.id, dop: params.node.data.dop}}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender);
        }
    }

    showFlowForRow(params){
        this.showFlow(params, true);
    }

    showFlowForSkey(params){
        this.showFlow(params, false);
    }

    showFlow(params, oneRow){
        console.log('showFlowForRow req_id', params.node.data.id);
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            console.log('newLayoutItemID=', newLayoutItemID);

            var dopString = '';

            if (params.node.data.dop){
                var dop = new Date(params.node.data.dop);
                var dopString = dop.getDate().toString().padStart(2,'0')  + '.' +
                                (dop.getMonth()+1).toString().padStart(2,'0') + '.' +
                                dop.getFullYear();

            }

            var detailRender =  <TableViewFlow
                                additionalSheetParams={{
                                                        sht_id: this.state.sheet_id,
                                                        req_id: oneRow ? params.node.data.id : '',
                                                        dop: dopString,
                                                        skey: this.getFilterSkey()}}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender);
        }
    }

    showCommentForCell(params){
        console.log('showCommentForCell new ', params);
        var columnData = getColumnData(params);
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();

            var skey='';
            if (this.state.sheet_type === 'tree'){
                skey = this.getFilterSkey();
                /*
                пока все неправильно,
                работать будет только если все аналитики выбраны,
                а тут отсекаем аналитику "показатель",
                потому что с ней пока не работает
                if (params.node.key){
                    skey += params.node.key;
                }
                */
                skey += columnData.key;
            }else{

            }
            console.log('showCommentForCell=', columnData);
            console.log('showCommentForCell(params)', params);

            var additionalParams = {
                                    viewType: 'CommentView',
                                    ind_id: columnData.ind_id,
                                    skey: skey,
                                    sheet_path: 'sheetInfoDummy',//this.state.sheetInfo.sheet_path,
                                    flt_dscr: columnData['flt_dscr']
                                   };

            if (columnData.req_id){
                additionalParams['req_id'] = columnData.req_id;
            }
            console.log('comments sht_id=', this.props.sheet_id);
            var detailRender =  <TableViewComment
                                additionalSheetParams={additionalParams}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender);
        }
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
                            onSelectNewSheet={this.loadAll.bind(this)}
                            sheetSelection={false}
                            additionalToolbarItem={this.props.additionalToolbarItem}
                            />



                            <ReGrid

                            getContextMenuItems={this.getContextMenuItems.bind(this)}
                                getColumnsListRequestString={this.getColumnsListRequestString.bind(this)}
                                sendRefreshGrid={click => this.sendRefreshGrid = click}
                                sendBeforeCloseToGrid={click => this.sendBeforeCloseToGrid = click}
                                sendUndoToGrid={click => this.sendUndoToGrid = click}
                                skey={this.getFilterSkey}
                                sheet_id = {this.state.sheet_id}
                                sheet_type = {this.state.sheet_type}
                                treeData = {this.state.sheet_type==='tree'? true:false}
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


function getColumnData(params){
    var columnDataList = [];
    var colDefField = '';

    if (params.node && params.node.data &&  params.node.data.column_data){
        columnDataList = params.node.data.column_data;
        colDefField = params.column.colDef.field;
    }else if(params.rowIndex){
        columnDataList = params.api.getDisplayedRowAtIndex(params.rowIndex).data.column_data;
        colDefField = params.colDef.field;
    }else if (params.data && params.colDef) {
        columnDataList = params.data.column_data;
        colDefField = params.colDef.field;
    }


    for(var i=0; i< columnDataList.length; i++){
        if (columnDataList[i].key===colDefField){
            return columnDataList[i];
        }
    }

    return null;
}



