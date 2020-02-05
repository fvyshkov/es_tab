import React, { Component } from 'react';
import ReactDOM from "react-dom";
import TabView from './TabView.jsx';
import TableView from './TableView.jsx';
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

import ReportDialog from './ReportDialog.jsx';
import { getReport } from './getReport.js';

import CommentPanel from './CommentPanel.jsx';
import {processTree} from './esUtils.js';
import {operList} from './operList.js';
import Reference from './Reference.js';
import TreeReference from './TreeReference.jsx';
import SheetToExcelRptDialog from './SheetToExcelRptDialog.jsx';

/*
import { sendRequest } from './App.js';
import notify from 'devextreme/ui/notify';
import ColorPanel from './ColorPanel.jsx';
*/

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
                        rptDialogVisible: false,
                        filterNodes: [],
                        confirmData: {
                                    sheet_name: "",
                                    flt_dsrc: "",
                                    prim: "",
                                    correctdt : "",
                                    fileIds: "",
                                    fileList:[]
                                  }
                      };
        this.reportDialogParams = [];
        this.operList = new operList();

        this.confirm = this.confirm.bind(this);
        this.beforeOperRun = this.beforeOperRun.bind(this);

    }


    sendLoadAll(){
    }


    getFilterData(){
        return sendRequestPromise('sht_filters/?sht_id='+this.state.sheet_id);
    }

    loadNewSheet(sheet){
        this.setState({sheet_id: sheet.id, sheet_type: sheet.sheet_type, sheet_path: sheet.sheet_path, sheet: sheet});
        this.sendLoadAll(sheet.id, sheet.sheet_type);
        this.loadOperList();
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

                        , 'POST',{});

        }else{
            sendRequestPromise('update_record/?req_id='+params.data.id+'&value='+params.value+'&col_id='+params.column.colDef.ind_id, 'POST',{});
        }
    }

    getColumnsListRequestString(){

        var httpStr = "sht_columns/?";
        if (this.state.sheet_id){
            httpStr +='sht_id='+this.state.sheet_id;
        }

        return httpStr;
    }

    saveViewState(viewState){
        var httpStr = 'sht_state_update/?sht_id='+this.state.sheet_id;
        sendRequestPromise(httpStr,'POST', viewState);
    }

    onInsertCallback(){
        //this.loadNewSheet(2434, 'tree');
        console.log('ins test', this);
        if (this.state.sheet_id){
                sendRequest('insert_record/?sht_id='+this.state.sheet_id+'&skey='+this.getFilterSkey(),
                            this.sendInsertRecord,
                            'POST',
                            {});
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
        console.log('recalc', component, recalcType);
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

        console.log('confirm', this.state.filterNodes);

        for (var filterId in this.state.filterNodes){
            processTree(this.state.filterNodes[filterId]['filter_node_list'],
                        (item) =>
                        {
                               console.log('item', item);
                               if (item.checked){
                                    filterDscr += this.state.filterNodes[filterId].name + ' = ' + item.name+'\n';
                               }
                        },
                        'children'
            );
        }

        console.log('confirm filterDscr', filterDscr);

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
        console.log('beforeOperRun', item);
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

        }else if (item.code==='CONFIRM_ROOT'){
            /////

            this.onConfirmCallBack=runOperCallback;
            this.operItem = item;
            this.confirm();

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
                                            onClick: ()=> this.confirm(),
                                            icon: 'datafield',
                                            getVisible: ()=> { return this.state.sheet_id ? true: false;}
                                          },
                                          {
                                            id: '1_5',
                                            name: 'Отчеты',
                                            onClick: ()=> this.showReportList(),
                                            icon: 'detailslayout',
                                            getVisible: ()=> { return this.state.sheet_id ? true: true;},
                                          items: [
                                          {
                                            id: '1_6',
                                            name: 'Выгрузка данных в ексель',
                                            onClick: ()=> this.showSheetRpt(),
                                            icon: 'detailslayout',
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
        console.log('onFileValueChanged', e);
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
              }
              ];
    }

    showHistoryForCell(params, showAll=false){
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            var viewRender =  <TableViewHistory
                                additionalSheetParams={{
                                                            skey: showAll ? '' : this.getCellSkey(params),
                                                            sht_id: this.state.sheet_id,
                                                            ind_id: params.node.data.ind_id
                                                            }}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(viewRender);
        }
    }


    showDetailForCell(params){
        console.log('showDetailForCell', params);
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            console.log('newLayoutItemID=', newLayoutItemID);
            var detailRender =  <ReTableView
                                additionalSheetParams={{
                                                            parent_id:params.node.data.id,
                                                            ind_id:params.column.colDef.ind_id,
                                                            sht_id: this.state.sheet_id
                                                            }}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender);
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

        console.log('report this.state.sheet_id', this.state.sheet_id);
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


    showConfList(){
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            var detailRender =  <TableViewConf
                                additionalSheetParams={{sht_id: this.state.sheet.id}}
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
                                                        skey: getFilterSkeyByCell(params)}}
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

            /*
                пока все неправильно,
                работать будет только если все аналитики выбраны,
                а тут отсекаем аналитику "показатель",
                потому что с ней пока не работает.
                кроме того, работает только на МП
                */
            skey = getFilterSkeyByCell(params);
            skey += columnData.key;

            console.log('showCommentForCell=', columnData);
            console.log('showCommentForCell(params)', params);

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

            var detailRender =  <TableViewComment
                                additionalSheetParams={additionalParams}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender);
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
        this.operList = new operList(this.state.sheet.proc_id, this.state.sheet.bop_id, this.state.sheet.nstat, this.beforeOperRun);
        this.operList.init();
    }

    onFilterNodesChange(nodes){
        console.log('onFilterNodesChange', nodes);
        this.setState({filterNodes: nodes});

        console.log('onFilterNodesChange', getFilterSkey(nodes));

    }




    onTopMenuClick(){
        console.log('onTopMenuClick');
        if (this.state.sheet.id ){
           // this.loadOperList();
        }
    }


    closeReference(row) {
      console.log('closeReference ', row);

        this.onConfirmCallBack(this.operItem, 'NJRN=>'+row.njrn+',ROOTFL=>0,BPFL=>1');
        this.setState({showRef: false, refCode: ''});
    };

    onSheetRptDialogClose(){
        this.setState({  rptDialogVisible: false});
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



        return (
            <React.Fragment>

            {referComp}

            <SheetToExcelRptDialog
                popupVisible={this.state.rptDialogVisible}
                sheet_id={this.state.sheet_id}
                onDialogClose={this.onSheetRptDialogClose.bind(this)}
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
                    onTopMenuClick={this.onTopMenuClick.bind(this)}
                    additionalToolbarItem={()=>{return(
                                                        <SheetSelectDropDown
                                                            onSelectNewSheet={this.loadNewSheet.bind(this)}
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




