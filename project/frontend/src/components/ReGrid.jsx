import referStore from './sheetReference.js';
import React from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "ag-grid-enterprise";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import TreeReferEditor from "./TreeReferEditor.jsx";
import NumericEditor from "./NumericEditor.jsx";
import { sendRequest } from './App.js';
import FilterPanelInToolPanel from "./FilterPanelInToolPanel.jsx";
import {LicenseManager} from "@ag-grid-enterprise/core";
import TableView from './TableView.jsx';
import ReTableView from './ReTableView.jsx';
import ToolbarView from './ToolbarView.jsx';
import sheetDatasource from './sheetDatasource';
import commentDatasource from './commentDatasource';
import TableViewComment from './TableViewComment.jsx';
import SheetCellTooltip from './SheetCellTooltip.jsx';
import CommentImg from '../images/chat.png';


LicenseManager.setLicenseKey("Evaluation_License_Not_For_Production_29_December_2019__MTU3NzU3NzYwMDAwMA==a3a7a7e770dea1c09a39018caf2c839c");

export default class ReGrid extends React.Component {
  constructor(props) {
    super(props);

    this.immutableStore =[];
    this.savedFocusedCell = {};

    this.state = {
    gridKey:0,
    colorRestrict: 0,
    modules: AllModules,
      columnDefs: [],
      treeData: this.props.treeData,
      frameworkComponents: {
        treeReferEditor: TreeReferEditor,
       // gridCellRenderer:GridCellRenderer,
        numericEditor: NumericEditor,
        filterPanelInToolPanel: FilterPanelInToolPanel,
        sheetCellTooltip: SheetCellTooltip
      },
      sideBar:  {
                toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Столбцы',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                        },
                        ...this.props.addToolPanels
                    ],
                    position: 'left'
                },

         statusBar: {
                statusPanels: [
                  {
                    statusPanel: "agTotalAndFilteredRowCountComponent",
                    align: "left"
                  },
                  {
                    statusPanel: "agTotalRowCountComponent",
                    align: "center"
                  },
                  { statusPanel: "agFilteredRowCountComponent" },
                  { statusPanel: "agSelectedRowCountComponent" },
                  { statusPanel: "agAggregationComponent" }
                ]
              },
      defaultColDef: {
        width: 240,
        resizable: true,
        filter: false
      },
      rowModelType: "serverSide",
      isServerSideGroup: function(dataItem) {
        return dataItem.groupfl==='1';
      },
      getServerSideGroupKey: function(dataItem) {
        return dataItem.node_key;
      },
      getRowNodeId: function (dataItem){
        return dataItem.node_key;
      }

    };

    this.expandedKeys = [];

    this.refreshGrid = this.refreshGrid.bind(this);
    this.render = this.render.bind(this);
    this.processColumnsData = this.processColumnsData.bind(this);
    this.loadSheetInfo = this.loadSheetInfo.bind(this);

    this.processSheetInfo = this.processSheetInfo.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.onGridReady = this.onGridReady.bind(this);
    this.onGridStateChange = this.onGridStateChange.bind(this);
    this.sendDeleteRecord = this.sendDeleteRecord.bind(this);
    this.sendUndoToGrid = this.sendUndoToGrid.bind(this);





    this.columnsLoaded = false;




  }


    componentDidMount() {
        if (this.props.sendRefreshGrid){
            this.props.sendRefreshGrid(this.refreshGrid);
        }

        if (this.props.sendBeforeCloseToGrid){
            this.props.sendBeforeCloseToGrid(this.onSendBeforeCloseToGrid.bind(this));
        }

        if(this.props.sendInsertRecord){
            this.props.sendInsertRecord(this.sendInsertRecord.bind(this));
        }

        if(this.props.sendUndoToGrid){
            this.props.sendUndoToGrid(this.sendUndoToGrid.bind(this));
        }


        if(this.props.sendDeleteRecord){
            this.props.sendDeleteRecord(this.sendDeleteRecord.bind(this));
        }


    }

    sendUndoToGrid(){
        console.log('this.gridApi', this.gridApi);
        this.gridApi.undoCellEditing();
    }

    onSendBeforeCloseToGrid(){
        this.onGridExpandedChange();
    }



    refreshGrid(){
        setTimeout(function(api){api.purgeServerSideCache()},0, this.gridApi);
        this.loadColumns();
    }

    processColumnsData(columnList){
        for (var i=0; i < columnList.length; i++){
            if (columnList[i].refer_data){
                referStore.setData(columnList[i].key, JSON.stringify(columnList[i].refer_data));
            }
        }


        //все эти преобразования лучше перенести в средний слой
        var columns = columnList.map(function prs(currentValue){

            var columnCellEditor = null;
            if (currentValue.ent_id)
                columnCellEditor = "treeReferEditor";

            var cellChartDataType = "category";
            if (currentValue.atr_type==="N")
                cellChartDataType = "series";


            return {
                            field:currentValue.key,
                            headerName:currentValue.name,

                            showRowGroup: (currentValue.rowgroupfl===1),
                            cellRenderer: (currentValue.rowgroupfl===1) ? 'agGroupCellRenderer' : gridCellRenderer ,

                            autoHeight: true,
                            ent_id:currentValue.ent_id,
                            ind_id:currentValue.ind_id,
                            ind_id_hi: currentValue.ind_id_hi,
                            atr_type:currentValue.atr_type,
                            chartDataType : cellChartDataType,
                            filter:false,
                            cellEditor: columnCellEditor,
                            tooltipComponentParams: (params)=>{return {columnData: getColumnData(params)};},
                            tooltipComponent: "sheetCellTooltip",
                            tooltipValueGetter: function(params) {
                                                    var columnData =  getColumnData(params);
                                                    if (columnData && columnData.commentfl===1){
                                                        return { value: params.value }
                                                    }else{
                                                        return;
                                                    };
                                                  },
                            editable:function(params) {
                                                        var columnData = getColumnData(params);
                                                        return  (columnData && columnData.editfl===1);
                                                     },
                            cellStyle:  (params) => {
                                                        if (! params.data || ! params.data.column_data){
                                                            return;
                                                        }
                                                        var columnData = getColumnData(params);
                                                        var style = {color: 'black', backgroundColor: 'white'};
                                                        if (!columnData){
                                                            return style;
                                                        }
                                                        style = {color: columnData['font.color'], backgroundColor: columnData['brush.color']};


                                                        if (columnData['font.bold']==='1'){
                                                            style['font-weight'] = 'bold';
                                                        }
                                                        if (columnData['font.italic']==='1'){
                                                            style['font-style'] = 'italic';
                                                        }
                                                        if (columnData['border.color']){ 
                                                            style['border-style'] = 'solid'; 
                                                            style['border-width'] = 'thin'; 
                                                            style['border-color'] = columnData['border.color'] 
                                                        }

                                                        return style;

                                                    }
                            }
            }
        );

        columns = groupColumns(columns);
        this.setState({columnDefs: columns});
        this.loadSheetInfo();
        this.columnsLoaded = true;
    }

    loadSheetInfo(){
        console.log('loadSheetInfo', this.props.sheet_id, this.state.sheet_id);
        sendRequest('sht_info/?sht_id='+this.props.sheet_id, this.processSheetInfo);
    }

    processSheetInfo(infoList){
        this.setState({
                            gridKey: 0,
                            sheetInfo: infoList[0]
                             });

        //заставляем грид перерендериться
        //без этого "загадочного" действия в FilterToolPanel почему-то не попадают новые пропсы
        this.setState({gridKey: 1});

    }


    loadColumns(){

        var httpStr = this.props.getColumnsListRequestString();
        sendRequest(httpStr, this.processColumnsData);
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


    getSheetID(){
        return this.props.sheet_id;
    }

    serverSideDatasource(gridComponent) {
        if (this.props.getDatasource){
            return this.props.getDatasource(gridComponent);
        }else{
            return sheetDatasource(gridComponent);
        }
   }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    console.log('GRID this.props.onGetGridApi', this.props.onGetGridApi);
    this.props.onGetGridApi(this.gridApi);

    var datasource = this.serverSideDatasource(this);
    this.gridApi.setServerSideDatasource(datasource);
     if (this.props.additionalSheetParams && !this.columnsLoaded){
         this.loadColumns();
     }

     if (this.props.columnStates){
            this.gridColumnApi.setColumnState(this.props.columnStates);
            this.gridApi.refreshHeader();
     }

  }

  onGridStateChange(){
    if (this.props.onGridStateChange){
        this.props.onGridStateChange(this.gridColumnApi.getColumnState())
    }
  }

  onGridExpandedChange(){

    if (this.props.onGridExpandedChange){
        this.props.onGridExpandedChange(this.expandedKeys)
    }
  }

  onColumnResized(){

  }

    onRowGroupOpened(e){
        if (e.node.expanded){
            this.expandedKeys.push(e.node.key);
        }else{
            if (this.expandedKeys.indexOf(e.node.key) > -1){
                this.expandedKeys.splice(this.expandedKeys.indexOf(e.node.key),1);
            }
        }
    }

    onCellValueChanged(params){
        console.log('onCellValueChanged', params, this.props.sheet_type);

        if (this.props.sheet_type==='tree'){
            console.log('change val tree', this.props.skey(), params.data.node_key, params.colDef.field);
            sendRequest('update_tree_record/?sht_id='+this.props.sheet_id+'&skey='+this.props.skey() + '&cell_skey='+params.data.node_key +','+ params.colDef.field +
                            '&ind_id='+params.data.ind_id + '&value='+params.value

                        , ()=> {},'POST',{});

        }else{
            sendRequest('update_record/?req_id='+params.data.id+'&value='+params.value+'&col_id='+params.column.colDef.ind_id, ()=> {},'POST',{});
        }
    }


    sendInsertRecord(){
        this.savedFocusedCell = this.gridApi.getFocusedCell();
        console.log('sendInsertRecord');
        this.gridApi.purgeServerSideCache();
    }

    onCellFocused(params){
        if (this.props.onCellFocused){
            this.props.onCellFocused(params);
        }
    }

    sendDeleteRecord(){
       this.savedFocusedCell = this.gridApi.getFocusedCell();
       var req_id = this.gridApi.getDisplayedRowAtIndex(this.savedFocusedCell.rowIndex).data.id;
       this.savedFocusedCell.rowIndex -= 1;
       sendRequest('delete_record/?req_id='+req_id,
                        ()=> {},
                        'POST',
                        {});
       this.gridApi.purgeServerSideCache();

    }

  render() {
    console.log('render regrid this.props.filterNodes', this.props.filterNodes);
            return (
                <React.Fragment>

                    <div className ="ag-theme-balham NonDraggableAreaClassName ToolbarViewContent" key={this.state.gridKey} id="myGrid123">
                        <AgGridReact
                            modules={AllModules}
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            autoGroupColumnDef={this.state.autoGroupColumnDef}
                            rowModelType={this.state.rowModelType}
                            treeData={true}
                            groupSuppressAutoColumn={true}
                            animateRows={true}
                            isServerSideGroup={this.state.isServerSideGroup}
                            getServerSideGroupKey={this.state.getServerSideGroupKey}
                            onGridReady={this.onGridReady}
                            floatingFilter={false}
                            sideBar={this.state.sideBar}
                            frameworkComponents={this.state.frameworkComponents}
                            onModelUpdated={this.onModelUpdated}
                            onRowDataChanged={this.onRowDataChanged}
                            onRowDataUpdated={this.onRowDataUpdated}
                            processChartOptions={this.state.processChartOptions}
                            onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                            enableRangeSelection={true}
                            enableCharts={true}
                            sheet_id={this.props.sheet_id}
                            onFilterPanelChange={this.props.onFilterPanelChange}
                            selectedFilterNodes={this.props.selectedFilterNodes}
                            filterNodes={this.props.filterNodes}
                            statusBar={this.state.statusBar}
                            getContextMenuItems={this.getContextMenuItems.bind(this)}
                            createChartContainer={this.createChartContainer.bind(this)}
                            onColumnResized={this.onGridStateChange.bind(this)}
                            onColumnMoved={this.onGridStateChange.bind(this)}
                            onColumnPinned={this.onGridStateChange.bind(this)}
                            onColumnVisible={this.onGridStateChange.bind(this)}
                            onRowGroupOpened={this.onRowGroupOpened.bind(this)}
                            getRowNodeId={this.state.getRowNodeId}
                            onCellValueChanged={this.onCellValueChanged.bind(this)}
                            deltaRowDataMode={true}
                            undoRedoCellEditing={true}
                            undoRedoCellEditingLimit={100}
                            enableCellChangeFlash={true}
                            onCellFocused={this.onCellFocused.bind(this)}
                          />

                      </div>

                  </React.Fragment>

            );
  }

    createChartContainer(chartRef) {
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            this.props.addElementToLayout(<ToolbarView
                                                layoutItemID={newLayoutItemID}
                                                addElementToLayout={this.props.addElementToLayout}
                                                onToolbarCloseClick={this.props.onToolbarCloseClick}
                                                getNewLayoutItemID={this.props.getNewLayoutItemID}
                                            />);
            document.querySelector("#content_"+newLayoutItemID).appendChild(chartRef.chartElement);
        }
    }

    getCommentDatasource(grid){
        return commentDatasource(grid);
    }





    getContextMenuItems(params) {

        var result = [
            ...this.props.getContextMenuItems(params),
            "separator",
            "expandAll",
            "copyWithHeadersCopy",
            "export",
            "chartRange"

        ];
        return result;
      }


  onFirstDataRendered(params) {

  }

}


function gridCellRenderer(params){
    var displayValue;
    if (params.colDef.ent_id){
        displayValue = getReferValueById(params.colDef.field, params.value);
    }else if (params.colDef.atr_type==="N" ){
        var num = parseFloat(Math.round(parseFloat(params.value) * 100) / 100).toFixed(2);
        var parts = num.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        displayValue = parts.join(".");
    }else{
        displayValue = params.value;
    }

    if (!displayValue){
        displayValue = '';
    }

    var element = document.createElement("span");

    var columnData = getColumnData(params);

    if (columnData && columnData.filelistfl===1){
        var fileList = JSON.parse(params.value);
        var eList = document.createElement("ul");
        if (fileList && fileList.length>0){
            fileList.forEach(function(fileItem){
                var eListItem = document.createElement("li");
                eListItem.innerHTML = fileItem.filename+' <a href="/get_file/?file_id='+fileItem.id+'"> <i class="dx-icon-download"></i></a>';
                eList.appendChild(eListItem);

            });
        }

        return eList;
    }


    if (columnData && columnData.commentfl===1){
        var imageElement = document.createElement("img");
        imageElement.setAttribute("width" , "16px");
        imageElement.setAttribute("height" , "16px");

        imageElement.src = CommentImg;
        element.appendChild(imageElement);
    }

    element.appendChild(document.createTextNode(displayValue));
    return element;

}

function getReferValueById(field, item_id){
    var referData = JSON.parse(referStore.getData(field));
    for (var i=0; i< referData.length; i++){
        if(referData[i].id === item_id){
            return referData[i].name;
        }
    }
    return null;
}


function groupColumns(columns){
    var resultColumns = [];
    for (var i=0; i < columns.length; i++){
        var current_column = columns[i];
        if (!current_column.ind_id_hi ){
            resultColumns.push(current_column);
        }else{
             for (var j =0; j < resultColumns.length; j++){
                if (resultColumns[j].ind_id === current_column.ind_id_hi){
                        if (!('children' in resultColumns[j])){
                            resultColumns[j]['children'] =[];
                        }
                        resultColumns[j].children.push(current_column);
                 }
             }
        }
    }
    return resultColumns;
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


