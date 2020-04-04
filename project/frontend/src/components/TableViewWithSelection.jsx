import React, { Component , useEffect, useRef} from 'react';
import ReactDOM from "react-dom";
import ReTableView from './ReTableView.jsx';
import SheetSelectDropDown from './SheetSelectDropDown.jsx';
import { sendRequestPromise } from './sendRequestPromise.js';
import notify from 'devextreme/ui/notify';
import {getFilterSkeyByCell, getFilterSkey} from './esUtils.js';

import TableViewComment from './TableViewComment.jsx';
import TableViewConf from './TableViewConf.jsx';
import TableViewHistory from './TableViewHistory.jsx';

import TableViewSchedule from './TableViewSchedule.jsx';
import TableViewFlow from './TableViewFlow.jsx';
import TableViewDetail from './TableViewDetail.jsx';

import ReportDialog from './ReportDialog.jsx';
import { getReport } from './getReport.js';

import CommentPanel from './CommentPanel.jsx';
import {processTree} from './esUtils.js';
import {operList} from './operList.js';
import Reference from './Reference.js';
import TreeReference from './TreeReference.jsx';
import SheetToExcelRptDialog from './SheetToExcelRptDialog.jsx';
import axios from 'axios';
import { confirm } from 'devextreme/ui/dialog';
import SimpleDialog from './SimpleDialog.jsx';
import Refer from './Refer.jsx';



export default class TableViewWithSelection extends Component {

    constructor(props) {
        super(props);
        this.state={
                        sheet_id: 0,
                        sheet_type:'',
                        sheet: {},
                        confirmUndoData:[],
                        showRef: false,
                        confirmPanelVisible: false,
                        loadDMDialogVisible: false,
                        createPaymentsVisible: false,
                        loadDmDates: [],
                        loadUndoData: [],
                        showLoadUndoRef: false,

                        userReportParamsVisible: false,
                        userReportParams: [],
                        rptDialogVisible: false,
                        filterNodes: [],
                        showRptList: false,
                        reportParamReferVisible:false,
                        reportParamReferDscr: {},
                        reportParamReferRefCode : '',
                        userReportCode: "",
                        reportList: [],
                        confirmData: {
                                    sheet_name: "",
                                    flt_dsrc: "",
                                    prim: "",
                                    correctdt : "",
                                    fileIds: "",
                                    fileList:[]
                                  }
                      };

        this.loadDmParams = [];

        this.userReportParams = [];

        this.firstFilterNodesRequest = true;
        this.inputOpenFileRef = React.createRef();

        this.onFileUploadButtonClick = this.onFileUploadButtonClick.bind(this);

        this.reportDialogParams = [];
        this.operList = new operList();

        this.confirm = this.confirm.bind(this);
        this.beforeOperRun = this.beforeOperRun.bind(this);
        this.downloadSheetData = this.downloadSheetData.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.afterOperRun = this.afterOperRun.bind(this);
        this.closeUserReportDialog = this.closeUserReportDialog.bind(this);
        this.reloadNodes = this.reloadNodes.bind(this);

    }


    sendLoadAll(){
    }



    componentDidMount() {

        if (this.props.sheet){
            this.setState({
                            sheet: this.props.sheet,
                            sheet_id: this.props.sheet.id,
                            sheet_type: this.props.sheet.sheet_type });
        }

        console.log('DIDMOUNT this.props.filterNodes', this.props.layoutItemID);

        if (this.props.filterNodes){
            this.setState({filterNodes: this.props.filterNodes});
        }

        if (this.props.onLayoutContentChange && this.props.filterNodes){
            this.props.onLayoutContentChange({
                                                type: 'onFilterNodesChange',
                                                itemId: this.props.layoutItemID,
                                                changeParams: {filterNodes: this.props.filterNodes}
                                             });
        }

        if (this.props.onLayoutContentChange && this.props.sheet){

            this.props.onLayoutContentChange({
                                                type: 'onFilterNodesChange',
                                                itemId: this.props.layoutItemID,
                                                changeParams: {sheet: this.props.sheet}
                                             });
        }
    }

    getFilterData(){


        //this.firstFilterNodesRequest = true;
        if (this.props.filterNodes && this.firstFilterNodesRequest){
            this.firstFilterNodesRequest = false;
            return new Promise((resolve, reject)=>{resolve(this.props.filterNodes);})
            return this.props.filterNodes;

        }else{
            return sendRequestPromise('sht_filters/?sht_id='+this.state.sheet_id+'&stype='+this.state.sheet.stype);
        }
    }

    loadNewSheet(sheet){
        this.setState({sheet_id: sheet.id, sheet_type: sheet.sheet_type, sheet_path: sheet.sheet_path, sheet: sheet});
        this.sendLoadAll(sheet.id, sheet.sheet_type);
        this.loadOperList();

        if (this.props.onLayoutContentChange){
            this.props.onLayoutContentChange({
                                                type: 'loadNewSheet',
                                                itemId: this.props.layoutItemID,
                                                changeParams: {sheet: sheet}
                                             });
        }
    }

    getViewUserPreferences(){
        return sendRequestPromise('sht_state/?sht_id='+ this.state.sheet_id);
    }

    onCellValueChanged(params){


        if (this.state.sheet_type==='tree'){
            sendRequestPromise('update_tree_record/?sht_id='+this.state.sheet_id+
                                '&skey='+getFilterSkeyByCell(params)+
                                '&cell_skey='+params.data.node_key +','+ params.colDef.field +
                            '&ind_id='+params.data.ind_id + '&value='+params.value

                        , 'POST',{})
            .then(()=>this.reloadNodes(true));

        }else{
            this.setState({isLoaded:0});
            sendRequestPromise('update_record/?req_id='+params.data.id+'&value='+params.value+'&col_id='+params.column.colDef.ind_id, 'POST',{})
                .then((data)=>{
                    var rowNode = this.gridApi.getRowNode(params.data.id);
                    var data_test = data[0];
                    var columns = data[0]['column_data'];
                    for (var i=0; i< columns.length; i++){
                        console.log('column', columns[i])
                        data_test[columns[i]['key']] = columns[i]['sql_value']
                    }
                    rowNode.setData(data_test);

                    this.setState({isLoaded:1});
                });
        }
    }

    getColumnsListRequestString(){
        var httpStr = "sht_columns/?";
        if (this.state.sheet.id){
            httpStr +='sht_id='+this.state.sheet.id;
        }
        var skey = getFilterSkey(this.state.filterNodes);
        if (skey){
            httpStr += '&skey='+ getFilterSkey(this.state.filterNodes);
        }

        return httpStr;
    }

    saveViewState(viewState){
        var httpStr = 'sht_state_update/?sht_id='+this.state.sheet_id;
        sendRequestPromise(httpStr,'POST', viewState);
    }

    onInsertCallback(){
        if (this.state.sheet_id){
            this.setState({isLoaded:0});

            sendRequestPromise('insert_record/?sht_id='+this.state.sheet_id+'&skey='+ getFilterSkey(this.state.filterNodes),'POST',{})
                .then((newRows)=>{

                    this.gridApi.updateRowData({ add: newRows });

                    var rowNode = this.gridApi.getRowNode(newRows[0].id);
                    var data_test = newRows[0];
                    var columns = newRows[0]['column_data'];
                    for (var i=0; i< columns.length; i++){
                        console.log('column', columns[i])
                        data_test[columns[i]['key']] = columns[i]['sql_value']
                    }
                    rowNode.setData(data_test);

                    this.setState({isLoaded:1});

                });
        }
    }

    getDataRequestString(){
        var httpStr = 'sht_nodes/?dummy=1';
        if (this.state.sheet_id){
            httpStr += '&sht_id=' + this.state.sheet_id;
        }
        return httpStr;
    }

    recalc(component, recalcType){
        var httpStr = 'recalc_sheet/?sht_id='+this.state.sheet.id;
        if (recalcType==='old'){
            httpStr += '&skey='+ getFilterSkey(this.state.filterNodes);
        }else if(recalcType==='selected'){
            alert('Пересчет выделенного диапазона не реализован');
        }
        sendRequestPromise(httpStr)
            .then(()=>notify('Пересчет успешно завершен','success'))
            .catch(()=>notify('ОШИБКА ПЕРЕСЧЕТА', 'error'));
    }

    confirm(){
        var filterDscr='';


        for (var filterId in this.state.filterNodes){
            processTree(this.state.filterNodes[filterId]['filter_node_list'],
                        (item) =>
                        {
                               if (item.checked){
                                    filterDscr += this.state.filterNodes[filterId].name + ' = ' + item.name+'\n';
                               }
                        },
                        'children'
            );
        }

        this.setState({confirmData: {
                                    sheet_name: this.state.sheet_path,
                                    flt_dscr: filterDscr,
                                    prim: "",
                                    correctdt : "",
                                    fileList:[],
                                    fileIds :"",

                                  }
                                 });

        this.setState({confirmPanelVisible: true});
    }

    beforeOperRun(item, runOperCallback){
        if (item.code==='CONFIRM'){
            this.onConfirmCallBack=runOperCallback;
            this.operItem = item;
            this.confirm();
        }else if (item.code==='CONFIRM_UNDO'){
            /////

            this.onConfirmCallBack=runOperCallback;
            this.operItem = item;
            sendRequestPromise('conf_opers/?proc_id='+this.state.sheet.proc_id+'&rootfl=0')
                .then((data)=>{this.setState({confirmUndoData: data, showRef: true})});

        }else if (item.code==='CONFIRM_UNDO'){
            /////

            this.onConfirmCallBack=runOperCallback;
            this.operItem = item;
            sendRequestPromise('conf_opers/?proc_id='+this.state.sheet.proc_id+'&rootfl=0')
                .then((data)=>{this.setState({confirmUndoData: data, showRef: true})});

        }else if (item.code==='LOAD_DM_UNDO'){
            /////

            this.operItem = item;
            this.operList.operServerCallback = runOperCallback;

            sendRequestPromise('get_dm_dops/?sht_id='+this.state.sheet.id)
                .then((data)=>{
                    console.log('loadUndoData=>', data);
                    this.setState({loadUndoData: data, showLoadUndoRef: true})
                });

        }else if (item.code==='LOAD_DM'){
            /////
            //this.onConfirmCallBack=runOperCallback;
            this.operItem = item;
            this.operList.operServerCallback = runOperCallback;
            var dop = new Date();
            dop = new Date(dop.getFullYear(), dop.getMonth() + 1, 0);
            /*
            var dopString = dop.getDate().toString().padStart(2,'0')  + '.' +
                                (dop.getMonth()+1).toString().padStart(2,'0') + '.' +
                                dop.getFullYear();
            */
            this.loadDmParams =  [{dataField:"DOP", editorType: "dxDateBox" , label:"Дата загрузки", value: dop,  visible: true}];
            this.setState({loadDMDialogVisible:true})


        }else if (item.code==='CONFIRM_ROOT_UNDO'){
            /////

            this.onConfirmCallBack=runOperCallback;
            this.operItem = item;
            sendRequestPromise('conf_opers/?proc_id='+this.state.sheet.proc_id+'&rootfl=1')
                .then((data)=>{this.setState({confirmUndoData: data, showRef: true})});

        }else{
            runOperCallback(item,'');
        }

    }

    showSheetRptList(){
        sendRequestPromise('get_reports/')
            .then(response=> {this.setState({reportList: response, showRptList: true})});
    }

    runLoadDM(params){
        console.log('runLoadDM() loadDmParams', params);
        var dop = params.DOP.value;
        var dopString = dop.getDate().toString().padStart(2,'0')  + '.' +
                                (dop.getMonth()+1).toString().padStart(2,'0') + '.' +
                                dop.getFullYear();

        this.operList.operServerCallback(this.operItem,'DOP=>'+dopString);
    }


    runUserReport(params){
        console.log('runUserReport', this.state.userReportCode, params);
        getReport(this.state.userReportCode, params);


        //this.operList.operServerCallback(this.operItem,'DOP=>'+dopString);
    }

    downloadSheetData(){
        var repParams = {};

        repParams['SHT_ID'] = {type:"S", value: this.state.sheet.id};
        repParams['SKEY'] = {type:"S", value: getFilterSkey(this.state.filterNodes)};
        //repParams['DOP'] = {type:"S", value: ""};
        repParams['COL_LIMIT'] = {type:"S", value: "0"};


        if (this.state.sheet.stype ==='DM' || this.state.sheet.stype === 'MULT_DM' || this.state.sheet.stype === 'R'){
            getReport('C_ES_DM_EXP_RPT', repParams);
        }else if (this.state.sheet.stype === 'TURN'){
            rParams.AddItem('P_SHT_ID', this.props.sheet_id);
            getReport('C_ES_TURN_EXP_RPT', repParams);
        }else if (this.state.sheet.stype === 'P'){
            console.log('TODO');
        }else{
            console.log('this type of list is not supported');
        }
    }

    createPayments(){
        sendRequestPromise('get_dm_dops/?sht_id='+this.state.sheet.id)
            .then (dates=>{this.setState({loadDmDates: dates, createPaymentsVisible: true});});

    }

    getMenuItems(){

        var operMenuList = this.operList.getOperMenuList();



        var items = [{
                                            id: '1_1',
                                            name: 'Пересчет',
                                            icon: 'smalliconslayout',
                                            items: [{
                                                    name: 'Пересчет устаревших значений по выбранным аналитикам',
                                                    icon : 'filter',
                                                    onClick: ()=> this.recalc(this, 'old'),
                                                    getDisabled: ()=> { return this.state.sheet_id ? false: true;}


                                                  },
                                                  {
                                                    id: '1_1_3',
                                                    name: 'Полный пересчет листа',
                                                    icon : 'repeat',
                                                    onClick: ()=> this.recalc(this,'full')
                                                  }]
                                          },
                                          {
                                            id: '1_2',
                                            name: 'История утверждения',
                                            onClick: ()=> this.showConfList(),
                                            icon: 'check'
                                          },
                                          {
                                            id: '1_5',
                                            name: 'Сформировать потоки по графикам',
                                            onClick: ()=> this.createPayments(),
                                            icon: 'datafield',
                                            getVisible: ()=> { return this.state.sheet.stype == 'MULT_DM'
                                                                       ||
                                                                       this.state.sheet.stype == 'DM' ;
                                                                }
                                          },
                                          {
                                            id: '1_7',
                                            name: 'Пользовательские отчеты',
                                            onClick: ()=> this.showSheetRptList(),
                                            icon: 'chart',
                                            getVisible: ()=> { return this.state.sheet_id ? true: true;}

                                          },
                                          {
                                            id: '1_5',
                                            name: 'Данные листа',
                                            icon: 'detailslayout',
                                            getVisible: ()=> { return this.state.sheet_id ? true: true;},
                                                  items: [
                                                              {
                                                                id: '1_5_1',
                                                                name: 'Выгрузка данных в excel',
                                                                onClick: ()=> this.showSheetRpt(),
                                                                icon: 'detailslayout',
                                                                getVisible: ()=> { return this.state.sheet_id ? true: true;}

                                                              },
                                                              {
                                                                id: '1_5_3',
                                                                name: 'Генерация формы для сбора данных',
                                                                onClick: ()=> this.downloadSheetData(),
                                                                icon: 'download',
                                                                getVisible: ()=> { return this.state.sheet_id ? true: true;}

                                                              },
                                                              {
                                                                id: '1_5_4',
                                                                name: 'Импорт данных',
                                                                onClick: ()=> this.onFileUploadButtonClick(),
                                                                icon: 'upload',
                                                                getVisible: ()=> { return this.state.sheet_id ? true: true;}

                                                              }
                                                  ]
                                          }


                                          ];

        return items.concat(operMenuList);
    }

    showSheetRpt(){


        this.setState({rptDialogVisible: true});

    }


    onFileValueChanged(e){
        this.state.confirmData.fileList = e.previousValue;
        this.setState({confirmData: this.state.confirmData});


    }

    onFileUploaded(e){

        var responseObject = JSON.parse(e.request.response);
        if (responseObject.length===1){
            this.state.confirmData.fileIds += responseObject[0]['file_id'] + ',';
            this.setState({confirmData: this.state.confirmData});
        }

    }


    getContextMenuItems(params){

        console.log("params.column.colDef", params.column.colDef);

        var menuItems = [];

        if (params.column.colDef.detailfl==1){
            menuItems.push({
                name: 'Детализация <b>[' + params.column.colDef.headerName+']</b>',
                action: this.showDetailForCell.bind(this, params)
              });
        }

        menuItems = menuItems.concat(
            [

                ,
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
              },
              {
                name: 'История изменения значений',
                subMenu:[
                    {
                    name: 'По выбранной записи',
                    action: this.showHistoryForCell.bind(this, params)
                    },
                    {
                    name: 'Все значения',
                    action: this.showHistoryForCell.bind(this, params, true)
                    }
                ]
              },
              "separator",
              {
                name: 'Отчет по расчету значения',
                action: this.showCalcReport.bind(this, params)
              },
               {
                name: 'Пересчет значения',
                action: this.recalcCell.bind(this, params)
              }
              ]);

              return menuItems;
    }


    showHistoryForCell(params, showAll=false){
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();

            const formParams = {additionalSheetParams:{
                                                            skey: showAll ? '' : this.getCellSkey(params),
                                                            sht_id: this.state.sheet_id,
                                                            ind_id: params.node.data.ind_id
                                                            }};

            var viewRender =  <TableViewHistory
                                additionalSheetParams={formParams.additionalSheetParams}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(viewRender, null, "TableViewHistory", formParams);
        }
    }

    updateParentCallback(req_id){
        console.log("updateParentCallback!!!", req_id);
        this.setState({isLoaded:0});

        sendRequestPromise('update_record/?req_id='+req_id, 'POST',{})
                .then((data)=>{
                    var rowNode = this.gridApi.getRowNode(req_id);
                    console.log();
                    var data_test = data[0];
                    var columns = data[0]['column_data'];
                    for (var i=0; i< columns.length; i++){
                        console.log('column', columns[i])
                        data_test[columns[i]['key']] = columns[i]['sql_value']
                    }

                    rowNode.setData(data_test);

                    this.setState({isLoaded:1});

                });
    }


    showDetailForCell(params){
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();

            const formParams = {additionalSheetParams:{
                                                            parent_id:params.node.data.id,
                                                            ind_id:params.column.colDef.ind_id,
                                                            sht_id: this.state.sheet_id
                                                            }};

            var detailRender =  <TableViewDetail
                                additionalSheetParams={formParams.additionalSheetParams}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                getRowNodeId={(data)=>{console.log("getRowNodeId data", data); return data.node_key;}}
                                getDataRequestString={this.getDataRequestString.bind(this)}
                                updateParentCallback={this.updateParentCallback.bind(this)}
                                />;

            this.props.addElementToLayout(detailRender, null, "TableViewDetail", formParams);
        }
    }


    getCellSkey(params){

        //временное упрощение - будет работать правильно только если все аналитики выбираны на закладке "аналитики"
        //и только на МП (о табличных листах, не говоря уже о прочих датасетах подумаем позже)
        var skey = getFilterSkeyByCell(params);
        skey += params.column.colId + ',' + params.node.data.node_key;
        return skey;
    }

    showCalcReport(params){

        this.reportDialogParams = [
            //то что должен установить пользователь
            {dataField:"SHOW_PF", label:"Потоки платежей", editorType:"dxCheckBox", value:false, visible: true},
            {dataField:"SHOW_DTL", label:"Детализация", editorType:"dxCheckBox", value:false, visible: true},
            {dataField:"SHOW_DM", label:"Данные витрин", editorType:"dxCheckBox", value:false, visible: true},
            //прочие параметры отчета
            {dataField:"P_IND_ID", value: params.node.data.ind_id, visible: false},
            {dataField:"P_SKEY", value: this.getCellSkey(params), visible: false},
            {dataField:"P_SHT_ID", value: this.state.sheet_id, visible: false},
        ];
        this.reportCode = 'C_ES_CALC_STEPS';
        this.reportTitle="Отчет по расчету значения";
        this.setState({reportDialogVisible:true});

    }

    recalcCell(params){
        sendRequestPromise('recalc_cell/?sht_id='+this.state.sheet.id+'&skey='+this.getCellSkey(params))
            .then(()=>{this.reloadNodes(false);});
    }

    reloadNodes(reloadAllCells=false){
        console.log("reloadNodes");

        var nodeIds = [];
        this.gridApi.forEachNode((node, index)=>{
            nodeIds.push(node.data);
        });
        var oldRowData = [];//this.state.rowData.slice();
        //console.log("rowData", rowData);

        sendRequestPromise('reload_nodes/?sht_id='+this.state.sheet.id+'&sht_skey='+getFilterSkey(this.state.filterNodes),
                            'POST', nodeIds)
            .then((data)=>{
                data.forEach(node=>{
                    oldRowData.push(this.gridApi.getRowNode(node.node_key).data);
                    if (node['column_data']){
                        for (var i=0; i< node['column_data'].length; i++){
                            //console.log("1", node['column_data'][i]['key'], node['column_data'][i]['sql_value']);
                            node[node['column_data'][i]['key']] = node['column_data'][i]['sql_value']
                        }
                    }
                });
                console.log("oldRowData", oldRowData);
                var changedRows = [];
                var changedColumns = [];
                data.forEach((node, index)=>{
                    var oldNode = oldRowData.filter(row=>{return (row.node_key==node.node_key);})[0];
                    if (index==0){
                        console.log("node new", node);
                        console.log("node old", oldNode);
                    }

                    if (node['column_data']){
                        for (var i=0; i< node['column_data'].length; i++){
                            var newCell = node['column_data'][i];
                            var oldCell = oldNode['column_data'][i];
                            if (newCell['sql_value'] != oldCell['sql_value'] ||
                                newCell['brush.color'] != oldCell['brush.color'] ||
                                newCell['font.color'] != oldCell['font.color'] ||
                                newCell['border.color'] != oldCell['border.color'] ||
                                newCell['font.italic'] != oldCell['font.italic'] ||
                                newCell['font.bold'] != oldCell['font.bold']
                                ){
                                console.log("cell for refresh! ", newCell.key, node.node_key);
                                changedColumns.push(newCell.key);
                                changedRows.push(node.node_key);

                            }

                        }
                    }
                });
                this.setState({rowData:data});
                this.gridApi.setRowData(data);
                var changedRowNodes = [];

                changedRows.forEach(row=>{
                    changedRowNodes.push(this.gridApi.getRowNode(row));

                });

                this.gridApi.refreshCells({ force: true, columns: changedColumns, rowNodes: changedRowNodes});

            });
    }

    refreshOpenedNodes(){
        console.log("refreshOpenNodes");
    }

    showScheduleForRow(params){
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();

            const formParams = {additionalSheetParams:{sht_id: this.state.sheet_id, req_id:params.node.data.id, dop: params.node.data.dop}};
            var detailRender =  <TableViewSchedule
                                additionalSheetParams={formParams.additionalSheetParams}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender, null, "TableViewSchedule", formParams);
        }
    }


    showConfList(){
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();


            var detailRender =  <TableViewConf
                                additionalSheetParams={{sht_id: this.state.sheet.id}}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender, null, "TableViewConf", {additionalSheetParams:{sht_id: this.state.sheet.id}});
        }
    }

    showFlowForRow(params){
        this.showFlow(params, true);
    }

    showFlowForSkey(params){
        this.showFlow(params, false);
    }

    showFlow(params, oneRow){
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();

            var dopString = '';

            if (params.node.data.dop){
                var dop = new Date(params.node.data.dop);
                var dopString = dop.getDate().toString().padStart(2,'0')  + '.' +
                                (dop.getMonth()+1).toString().padStart(2,'0') + '.' +
                                dop.getFullYear();

            }


            var formParams = {additionalSheetParams:{
                                                        sht_id: this.state.sheet_id,
                                                        req_id: oneRow ? params.node.data.id : '',
                                                        dop: dopString,
                                                        skey: getFilterSkeyByCell(params)}
                                 };

            var detailRender =  <TableViewFlow
                                additionalSheetParams={formParams.additionalSheetParams}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender, null, "TableViewFlow", formParams);
        }
    }

    showCommentForCell(params){

        var columnData = getColumnData(params);
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();

            var skey='';

            /*
                пока все неправильно,
                работать будет только если все аналитики выбраны,
                а тут отсекаем аналитику "показатель",
                потому что с ней пока не работает.
                кроме того, работает только на МП
                */
            skey = getFilterSkeyByCell(params);
            skey += columnData.key;


            var additionalParams = {
                                    viewType: 'CommentView',
                                    ind_id: columnData.ind_id,
                                    skey: skey,
                                    sheet_path: this.state.sheet_path,
                                    flt_dscr: columnData['flt_dscr']
                                   };

            if (columnData.req_id){
                additionalParams['req_id'] = columnData.req_id;
            }

            var formParams = {additionalSheetParams:{additionalParams}};

            var detailRender =  <TableViewComment
                                additionalSheetParams={additionalParams}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender, null, "TableViewComment", formParams);
        }
    }

    onConfirmPanelClose(){
        this.setState({confirmPanelVisible: false});
    }

    saveConfirm(){
        var operParams;
        operParams = 'PRIM=>'+this.state.confirmData.prim;
        operParams += ',FILE_IDS=>'+this.state.confirmData.fileIds;
        operParams += ',SHT_ID=>'+this.state.sheet.id;
        operParams += ',VER_ID=>'+this.state.sheet.ver_id;
        operParams += ',YEAR=>'+this.state.sheet.year;
        operParams += ',BPFL=>1';

        var skey = getFilterSkey(this.state.filterNodes);
        operParams += ',SKEY=>'+skey;

        this.onConfirmCallBack(this.operItem, operParams);
        this.setState({confirmPanelVisible: false});


    }

    loadOperList(){
        if (this.state.sheet_id){
            this.operList = new operList(
                                            this.state.sheet.proc_id,
                                            this.state.sheet.bop_id,
                                            this.state.sheet.nstat,
                                            this.beforeOperRun,
                                            this.afterOperRun
                                        );
            this.operList.init();
        }
    }

    afterOperRun(){
        console.log('afterOperRun callback');
        //перегрузим фильтры не трогая ничего больше
        sendRequestPromise('sht_filters/?sht_id='+this.state.sheet.id+'&stype='+this.state.sheet.stype)
            .then((data)=>{
                //this.setState({filterNodes: data})
                console.log('afterOperRun', data);
                this.sendNewFilterNodes(data);
            });

    }

    onChartsLayoutChange(){

    }

    onFilterNodesChange(nodes){
        this.setState({filterNodes: nodes});



        if (this.props.onLayoutContentChange){
            this.props.onLayoutContentChange({
                                                type: 'onFilterNodesChange',
                                                itemId: this.props.layoutItemID,
                                                changeParams: {filterNodes: nodes}
                                             });
        }



    }




    onTopMenuClick(){
        console.log('onTopMenuClick');
        if (this.state.sheet.id ){
           // this.loadOperList();
        }
    }


    closeReference(row) {

        this.onConfirmCallBack(this.operItem, 'NJRN=>'+row.njrn+',ROOTFL=>0,BPFL=>1');
        this.setState({showRef: false, refCode: ''});
    };

    onSheetRptDialogClose(){
        this.setState({  rptDialogVisible: false});
    }

    closeRptListReference(row){
        this.setState({showRptList: false});

        if (row && row.id){
            var repParams= {};

            sendRequestPromise('get_report_params/?rpt_code='+row.code)
                .then((params)=>{
                    if (params.length==0){
                        repParams['SHT_ID'] = {type:"S", value: this.state.sheet_id.toString()};
                        getReport(row.code, repParams);
                    }else{
                        //var rptDialogParams = params.map((param)=>{
                        var rptDialogParams = params.map((param)=>{
                            return {
                                        dataField: param.name,
                                        //editorType: "dxDateBox" ,
                                        label: param.captionr,
                                        keyvalues: param.keyvalues,
                                        value: "",
                                        refCode: param.refname,
                                        parentfield: param.parentfield.toLowerCase(),
                                        visible: true
                                    }
                        });

                        console.log("rptDialogParams", rptDialogParams);
                        console.log("closeRptListReference this", this);

                        this.setState({
                            userReportCode: row.code,
                            userReportParams: rptDialogParams,
                            userReportParamsVisible: true

                        });

                    }
                });


        }
    }


    onFileUploadButtonClick () {
        this.inputOpenFileRef.current.click();
    };


    sendLayoutBeforeSave(){

    }

    onChangeFile(event){
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];

        var delExistingRecords = '';

        let result = confirm("<i>Удалить имеющиеся записи перед импортом?</i>", "Импорт данных");
        result.then((dialogResult) => {
            delExistingRecords = dialogResult ? "1" : "0";



            var httpStr = window.location.origin;
            httpStr += '/import_sheet_data/?sht_id='+this.state.sheet_id;
            httpStr += '&skey='+getFilterSkey(this.state.filterNodes);
            httpStr += '&del_existed='+delExistingRecords;

            axios.post( httpStr, file, {})
                .then(()=>notify('Импорт успешно завершен','success'));

        });


    }

    sendNewFilterNodes(){

    }


    closeUserReportDialog(){
        console.log("1");
        this.setState({userReportParamsVisible:false});
        console.log("2");
    }


    onGetGridApi(gridApi){
        this.gridApi = gridApi;
        console.log('tableViewWithSelection onGetGridApi', this.gridApi);
    }


    onDeleteCallback(){
        var dataForDelete = this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).data;
        var req_id = dataForDelete.id;
        //var dataForDelete = [this.gridApi.getDisplayedRowAtIndex(this.savedFocusedCell.rowIndex).data];
        //console.log("dataForDelete req_id", req_id);
        sendRequestPromise('delete_record/?req_id='+req_id,'POST',{})
            .then(()=>{this.sendDeleteRecord()});
    }

    showReportParamRefer(refdscr, refcode){
        console.log("1 showReportParamRefer", refdscr);
        this.setState({userReportParamsVisible:false});

        console.log("2 showReportParamRefer", refdscr);
        this.setState({reportParamReferVisible:true, reportParamReferDscr: refdscr, reportParamReferRefCode : refcode});
    }

    render(){


        var referComp = this.state.showRef ? <Reference
                data={this.state.confirmUndoData}
                 onRefHidden={this.closeReference.bind(this)}
                 keyField={'njrn'}
                refdscr={{
                        title: 'Отмена утверждения',
                        columns: [
                          {caption: 'Дата и время', field: 'execdt'},
                          {caption: 'Пользователь', field: 'usr'},
                          {caption: 'Утверждение', field: 'dscr'}
                        ]
                      }}
            /> : null;

        console.log('RENDER this.state.loadUndoData=', this.state.loadUndoData);

        var referLoadUndoComp = this.state.showLoadUndoRef ? <Reference
                data={this.state.loadUndoData}
                 onRefHidden={(params)=>{
                            this.operList.operServerCallback(this.operItem, 'DOP=>'+ params.dop);
                            this.setState({showLoadUndoRef: false, refCode: ''});
                    }}
                keyField={'dop_key'}
                refdscr={{
                        title: 'Отмена загрузки данных',
                        columns: [
                          {caption: 'Дата загрузки', field: 'dop'}
                        ]
                      }}
            /> : null;

            console.log('2 RENDER this.state.loadUndoData=', this.state.loadUndoData);

            var referRptListComp = this.state.showRptList ? <Reference
                data={this.state.reportList}
                 onRefHidden={this.closeRptListReference.bind(this)}
                 keyField={'id'}
                refdscr={{
                        title: 'Пользовательские отчеты',
                        columns: [
                          {caption: 'Код', field: 'code'},
                          {caption: 'Наименование', field: 'longname'}
                        ]
                      }}
            /> : null;


            var referPaymentsCreateComp = this.state.createPaymentsVisible ? <Reference
                data={this.state.loadDmDates}
                  onRefHidden={(params)=>{
                            console.log('paymentsCreate TODO', params.dop);
                            sendRequestPromise('create_payments/?sht_id='+this.state.sheet.id+
                                            '&dop='+params.dop+
                                            '&skey='+getFilterSkey(this.state.filterNodes))
                                .then(()=>notify('Потоки успешно сформированы','success'))
                                .catch((error)=>notify('Ошибка при формировании потоков '+error, 'error'));
                            this.setState({createPaymentsVisible: false, refCode: ''});
                    }}
                keyField={'dop_key'}
                refdscr={{
                        title: 'Сформировать потоки по дате',
                        columns: [
                          {caption: 'Дата загрузки', field: 'dop'}
                        ]
                      }}
            /> : null;


//this.setState({reportParamReferVisible:true, reportParamReferDscr: refdscr, reportParamReferRefCode : refcode});
            let reportParamReferComp = this.state.reportParamReferVisible ?
                    (<Refer
                    refCode={this.state.reportParamReferRefCode}
                    onRefHidden={this.closeReportParamReference}
                    refdscr={this.state.reportParamReferDscr}
                    />) : null;

                console.log('10 RENDER this.state.loadUndoData=', this.state.loadUndoData);


        return (
            <React.Fragment>
            {referComp}
            {referRptListComp}
            {referLoadUndoComp}
            {referPaymentsCreateComp}
            {reportParamReferComp}


            <input type='file' id='file' ref={this.inputOpenFileRef} style={{display: 'none'}} onChange={this.onChangeFile.bind(this)}/>

            <SheetToExcelRptDialog
                popupVisible={this.state.rptDialogVisible}
                sheet_id={this.state.sheet_id}
                onDialogClose={this.onSheetRptDialogClose.bind(this)}
            />

            <SimpleDialog
                    dialogParams={this.loadDmParams}
                    popupVisible={this.state.loadDMDialogVisible}
                    title={"Загрузка данных на дату"}
                    onDialogClose={()=>{this.setState({loadDMDialogVisible:false});}}
                    onDialogConfirm={this.runLoadDM.bind(this)}
                    width={400}
                    height={200}

                />

            <SimpleDialog
                    dialogParams={this.state.userReportParams}
                    popupVisible={this.state.userReportParamsVisible}
                    title={"Параметры отчета"}
                    onDialogClose={this.closeUserReportDialog.bind(this)}
                    onDialogConfirm={this.runUserReport.bind(this)}
                    showRefer={this.showReportParamRefer.bind(this)}
                    width={600}
                    height={400}
                />

            <CommentPanel
                    title={"Утверждение"}
                    popupVisible={this.state.confirmPanelVisible}
                    sendItemPanelClose={this.onConfirmPanelClose.bind(this)}
                    commentData={this.state.confirmData}
                    saveData={this.saveConfirm.bind(this)}
                    onFileValueChanged={this.onFileValueChanged.bind(this)}
                    onFileUploaded={this.onFileUploaded.bind(this)}
                />

            <ReportDialog
                    dialogParams={this.reportDialogParams}
                    reportCode={this.reportCode}
                    popupVisible={this.state.reportDialogVisible}
                    reportTitle={this.reportTitle}
                    onDialogClose={()=>{this.setState({reportDialogVisible:false});}}

                />

                <ReTableView
                    sendLoadAll={click => this.sendLoadAll = click}
                    sendGetFilterSkey={click => this.sendGetFilterSkey = click}
                    getContextMenuItems={this.getContextMenuItems.bind(this)}
                    onInsertCallback={this.onInsertCallback.bind(this)}
                    getFilterData={this.getFilterData.bind(this)}
                    additionalSheetParams={{sht_id: this.state.sheet_id, sheet_type: this.state.sheet_type}}
                    getViewUserPreferences={this.getViewUserPreferences.bind(this)}
                    getColumnsListRequestString={this.getColumnsListRequestString.bind(this)}
                    saveViewState={this.saveViewState.bind(this)}
                    onCellValueChanged={this.onCellValueChanged.bind(this)}
                    getDataRequestString={this.getDataRequestString.bind(this)}
                    getRowNodeId={(data)=>{return data.node_key;}}
                    getMenuItems={this.getMenuItems.bind(this)}
                    onFilterNodesChange={this.onFilterNodesChange.bind(this)}
                    sendNewFilterNodes={click => this.sendNewFilterNodes = click}
                    onTopMenuClick={this.onTopMenuClick.bind(this)}
                    getChartTitle={()=>{return this.state.sheet.label;}}
                    sendLayoutBeforeSave={click => this.sendLayoutBeforeSave = click}
                    onDeleteCallback={this.onDeleteCallback.bind(this)}
                    onGetGridApi={this.onGetGridApi.bind(this)}
                    sendDeleteRecord={click => this.sendDeleteRecord = click}
                    additionalToolbarItem={()=>{return(
                                                        <SheetSelectDropDown
                                                            onSelectNewSheet={this.loadNewSheet.bind(this)}
                                                            sheet={this.props.sheet}
                                                            />
                                                        );
                                                }
                                          }
                    {...this.props}
                />
            </React.Fragment>
        );
    }

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




