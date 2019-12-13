import referStore from './sheetReference.js';
import React from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "ag-grid-enterprise";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import GridCellRenderer from "./GridCellRenderer.jsx";
import TreeReferEditor from "./TreeReferEditor.jsx";
import NumericEditor from "./NumericEditor.jsx";
import { sendRequest } from './App.js';
import FilterPanelInToolPanel from "./FilterPanelInToolPanel.jsx";
import {LicenseManager} from "@ag-grid-enterprise/core";
import SheetDetailView from './SheetDetailView.jsx';
import ToolbarView from './ToolbarView.jsx';

LicenseManager.setLicenseKey("Evaluation_License_Not_For_Production_29_December_2019__MTU3NzU3NzYwMDAwMA==a3a7a7e770dea1c09a39018caf2c839c");

class GridExample extends React.Component {
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
        gridCellRenderer:GridCellRenderer,
        numericEditor: NumericEditor,
        filterPanelInToolPanel: FilterPanelInToolPanel
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
                        {
                            id: "sheetFilters",
                            labelDefault: "Аналитики",
                            labelKey: "sheetFilters",
                            iconKey: "sheetFilters",
                            toolPanel: "filterPanelInToolPanel"
                          }
                    ],
                    //defaultToolPanel: "sheetFilters",
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
      autoGroupColumnDef: {},
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

    this.getAutoGroupColumnDef = this.getAutoGroupColumnDef.bind(this);
    this.processSheetInfo = this.processSheetInfo.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.onGridReady = this.onGridReady.bind(this);
    this.onGridStateChange = this.onGridStateChange.bind(this);
    this.sendDeleteRecord = this.sendDeleteRecord.bind(this);
    this.sendUndoToGrid = this.sendUndoToGrid.bind(this);





    this.columnsLoaded = false;




  }

    getAutoGroupColumnDef(){
        return (
            {
                headerName:"Показатель",
                cellRendererParams: {
                    innerRenderer: function(params) {
                        return params.data.name;
                    }
                },
                pinned: 'left',
                cellStyle: {color: 'black',
                                backgroundColor: this.state.colorRestrict,
                                borderStyle:'solid',
                                borderWidth:'thin',
                                borderColor:'black'
                                }
            });
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
        this.gridApi.purgeServerSideCache([]);
        this.loadColumns();
    }




    processColumnsData(columnList){
        for (var i=0; i < columnList.length; i++){
            if (columnList[i].refer_data){
                referStore.setData(columnList[i].key, JSON.stringify(columnList[i].refer_data));
            }
        }

        function getColumnData(params){
            for(var i=0; i< params.data.column_data.length; i++){
                if (params.data.column_data[i].key===params.colDef.field){
                    return params.data.column_data[i];
                }
            }
            return null;
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
                            ent_id:currentValue.ent_id,
                            ind_id:currentValue.ind_id,
                            ind_id_hi: currentValue.ind_id_hi,
                            atr_type:currentValue.atr_type,
                            chartDataType : cellChartDataType,
                            filter:false,
                            cellEditor: columnCellEditor,
                            cellRenderer: gridCellRenderer,
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
                                                        if (columnData){
                                                            style = {color: columnData['font.color'], backgroundColor: columnData['brush.color']};
                                                        }

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
        sendRequest('sht_info/?sht_id='+this.props.sheet_id, this.processSheetInfo);
    }

    processSheetInfo(infoList){
        //необходимо сбросить ключ, чтобы после установки autoGroupColumnDef снова выставить
        //и тем самым принудительно перерендерить грид (иначе autoGroupColumnDef не обновляется)
        if (this.props.forceGridReload){
            this.setState({gridKey:0});
        }

        if (this.props.resetForceGridReload){
            this.props.resetForceGridReload();
        }
        //if (infoList.length>0)
        this.state.colorRestrict = infoList[0].color_restrict_hex;
        this.setState({
                            colorRestrict:infoList[0].color_restrict_hex,
                            colorHand:infoList[0].color_hand_hex,
                            colorTotal:infoList[0].color_total_hex,
                            colorFilter:infoList[0].color_filter_hex,
                            colorCons:infoList[0].color_cons_hex,
                            colorConf:infoList[0].color_conf_hex,
                            colorConfPart:infoList[0].color_conf_part_hex,
                            autoGroupColumnDef:this.getAutoGroupColumnDef(),
                            treeData: this.props.sheet_type==='tree' ? true: false
                             });


        this.setState({gridKey: this.props.sheet_id});

    }


    loadColumns(){
        var httpStr = "sht_columns/?";
        if (this.props.sheet_id){
            httpStr +='sht_id='+this.props.sheet_id;
        }
        var skey = this.props.skey();
        if  (skey){
            httpStr += '&skey='+skey;
        }

        httpStr = this.addAdditionalSheetParams(httpStr);
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

  serverSideDatasource = (gridComponent) => {

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

                                                            console.log('gridComponent.savedFocusedCell', gridComponent.savedFocusedCell);

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

            }
        }
   }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

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
                ///ниже вычитаем высоту тулбара - от этого необходимо избавиться! перенеся и используя эту константу в CSS --calc(100% - 36px)
            return (
                <React.Fragment>

                    <div className ="ag-theme-balham NonDraggableAreaClassName" style={ {height: 'calc(100% - 36px)', width: '100%', position: 'absolute'} } key={this.state.gridKey} id="myGrid123">
                        <AgGridReact
                            modules={AllModules}
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            autoGroupColumnDef={this.state.autoGroupColumnDef}
                            rowModelType={this.state.rowModelType}
                            treeData={this.state.treeData}
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

    getContextMenuItems(params) {
        var result = [
          {
            name: 'Детализация <b>[' + params.column.colDef.headerName+']</b>',
            action: this.showDetailForCell.bind(this, params)
          },
            "separator",
            "expandAll",
            "copyWithHeadersCopy",
            "export",
            "chartRange"

        ];
        return result;
      }


    showDetailForCell(params){
        console.log('showDetailForCell', params);
        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();
            console.log('newLayoutItemID=', newLayoutItemID);
            var detailRender =  <SheetDetailView
                                sheet_id = {this.props.sheet_id}
                                sheet_type = {this.props.sheet_type}
                                additionalSheetParams={{parent_id:params.node.data.id, ind_id:params.column.colDef.ind_id}}
                                onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                                layoutItemID={newLayoutItemID}
                                />;

            this.props.addElementToLayout(detailRender);
        }
    }

  onFirstDataRendered(params) {

  }

}


function gridCellRenderer(params){
    if (params.colDef.ent_id){
        return getReferValueById(params.colDef.field, params.value);
    }else if (params.colDef.atr_type==="N" ){
        var num = parseFloat(Math.round(parseFloat(params.value) * 100) / 100).toFixed(2);
        var parts = num.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }else{
        return params.value;
    }
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





export default GridExample;