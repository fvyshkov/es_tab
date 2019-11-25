import referStore from './sheetReference.js';
import React from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "ag-grid-enterprise";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import GridCellRenderer from "./GridCellRenderer.jsx";
import TreeReferEditor from "./TreeReferEditor.jsx";
import NumericEditor from "./NumericEditor.jsx";
import { sendGetRequest } from './App.js';
import FilterPanelInToolPanel from "./FilterPanelInToolPanel.jsx";

const enableCellColor = 'palegreen';
const disableCellColor = 'lightsalmon';

const treeAutoGroupColumnDef = {
    headerName:"Показатель",
    cellRendererParams: {
        innerRenderer: function(params) {
            return params.data.name;
        }
    },
    pinned: 'left',
    cellStyle: {color: 'black', backgroundColor: disableCellColor}
}


class GridExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
                    defaultToolPanel: ["sheetFilters"],
                    position: 'left'
                },
      defaultColDef: {
        width: 240,
        resizable: true,
        filter: false
      },
      autoGroupColumnDef: treeAutoGroupColumnDef,
      rowModelType: "serverSide",
      isServerSideGroup: function(dataItem) {
        return dataItem.groupfl==='1';
      },
      getServerSideGroupKey: function(dataItem) {
        return dataItem.node_key;
      }

    };
    this.refreshGrid = this.refreshGrid.bind(this);
    this.render = this.render.bind(this);
    this.processColumnsData = this.processColumnsData.bind(this);


  }

    componentDidMount() {
        if (this.props.sheet_type==='tree') {
            this.setState({autoGroupColumnDef: treeAutoGroupColumnDef, treeData:true});
        }else{
            this.setState({autoGroupColumnDef: {}, treeData:false});
        }
        this.props.sendRefreshGrid(this.refreshGrid);
    }

  refreshGrid(e){


       if (this.props.sheet_type==='tree') {
            this.setState({autoGroupColumnDef: treeAutoGroupColumnDef, treeData:true});
       }else{
            this.setState({autoGroupColumnDef: null, treeData:false});

       }

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
                                                        if (! params.data.column_data){
                                                            return;
                                                        }
                                                        var columnData = getColumnData(params);
                                                        if (!columnData || columnData.editfl===0 || params.data.groupfl==='1'){
                                                            return {color: 'black', backgroundColor: disableCellColor};
                                                        }else{
                                                            return {color: 'black', backgroundColor: enableCellColor};
                                                        }
                                                    }
                            }
            }
        );

        columns = groupColumns(columns);
        this.setState({columnDefs:columns});
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
        sendGetRequest(httpStr, this.processColumnsData);
    }

  serverSideDatasource = (gridComponent) => {

        return {

            getRows(params,testFunction){

                let httpStr = 'sht_nodes/?dummy=1';
                if (gridComponent.props.sheet_id){
                    httpStr = httpStr.concat('&sht_id=', gridComponent.props.sheet_id[0]);
                }
                httpStr = httpStr.concat( '&skey=',gridComponent.props.skey());
                if (params.parentNode.data){
                   httpStr = httpStr.concat( '&flt_id=',params.parentNode.data.flt_id,'&flt_item_id=',params.parentNode.data.flt_item_id);
                }
                if (params.request.groupKeys){
                    httpStr = httpStr.concat( '&group_keys=',params.request.groupKeys);
                }

                sendGetRequest(httpStr, (rowData) =>{
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
                                                        }else{
                                                            params.successCallback([{columnNameField:"No results found"}], 1);
                                                        }
                                                    }
                            );

            }
        }
   }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

       if (this.props.sheet_type==='tree') {
            this.setState({autoGroupColumnDef: treeAutoGroupColumnDef, treeData:true});
       }else{
            this.setState({autoGroupColumnDef: null, treeData:false});

       }

    this.loadColumns();

    var datasource = this.serverSideDatasource(this);
    params.api.setServerSideDatasource(datasource);


  }

  render() {

        if (this.state.treeData){
            return (
                <React.Fragment>
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
                  />
                  </React.Fragment>

            );
        }else{

        return (
                <React.Fragment>
                    <p hidden>This paragraph should be hidden.</p>
                    <AgGridReact
                    modules={AllModules}
                    columnDefs={this.state.columnDefs}
                    defaultColDef={this.state.defaultColDef}
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
                    enableRangeSelection={true}
                    enableCharts={true}
                    sheet_id={this.props.sheet_id}
                    onFilterPanelChange={this.props.onFilterPanelChange}

                    />
                  </React.Fragment>

            );
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