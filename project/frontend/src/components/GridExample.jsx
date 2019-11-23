import referStore from './sheetReference.js';
import React from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "ag-grid-enterprise";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import GridCellRenderer from "./GridCellRenderer.jsx";
import TreeReferEditor from "./TreeReferEditor.jsx";
import NumericEditor from "./NumericEditor.jsx";

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
        numericEditor: NumericEditor
      },
      sideBar:  {
    toolPanels: [
        {
            id: 'columns',
            labelDefault: 'Столбцы',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
        }
    ],
    defaultToolPanel: []
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
      },

      processChartOptions: function(params) {
        var opts = params.options;
        opts.title = { text: "Medals by Age" };
        opts.legend.position = "bottom";
        opts.seriesDefaults.tooltip.renderer = function(params) {
          var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : "";
          var title = params.title ? '<div class="title"' + titleStyle + ">" + params.title + "</div>" : "";
          var value = params.datum[params.yKey].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
          return title + '<div class="content" style="text-align: center">' + value + "</div>";
        };
        if (opts.xAxis) {
          opts.xAxis.label.rotation = 0;
        }
        if (opts.yAxis) {
          opts.yAxis.label.rotation = 0;
        }
        return opts;
      }
    };
    this.refreshGrid = this.refreshGrid.bind(this);
    this.render = this.render.bind(this);



  }


currencyFormatter(params) {
  return "\xA3" + this.formatNumber(params.value);
}
 formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}


  refreshRows(){
    this.gridApi.resetRowHeights();
    this.gridApi.doLayout()
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

  onModelUpdated = params => {
  }

  onRowDataChanged = params => {
  }

  onRowDataUpdated = params => {
  }



  loadColumns(){
    const httpRequest = new XMLHttpRequest();
    var respObj

    var httpStr = "http://127.0.0.1:8000/sht_columns/?";

    if (this.props.sheet_id){
        httpStr +='sht_id='+this.props.sheet_id;
    }

    var skey = this.props.skey();
    if  (skey){
        httpStr += '&skey='+skey;
    }

    httpRequest.open("GET",httpStr,true);

    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          respObj = JSON.parse(httpRequest.responseText);

          for (var i=0; i < respObj.length; i++){
            //console.log('resp[i]',respObj[i]);
            if (respObj[i].refer_data){
                //console.log('gor smth for key=', respObj[i].key, respObj[i].refer_data);
                referStore.setData(respObj[i].key, JSON.stringify(respObj[i].refer_data));
            }
          }

          var columns = respObj.map(function prs(currentValue){

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
                                                   for(var i=0; i< params.data.column_data.length; i++){
                                                                    if (params.data.column_data[i].key===params.colDef.field){
                                                                        console.log('key',params.data.column_data[i].key,'edit',params.data.column_data[i].editfl);
                                                                        if (params.data.column_data[i].editfl===1 ){
                                                                            return true;
                                                                        }else{
                                                                            return false;
                                                                        }

                                                                    }
                                                                }
                                                },

                                cellStyle:  (params) => {
                                                            if (! params.data.column_data){
                                                                return;
                                                             }
                                                            for(var i=0; i< params.data.column_data.length; i++){
                                                                if (params.data.column_data[i].key===params.colDef.field){
                                                                    if (params.data.column_data[i].editfl===0 || params.data.groupfl==='1'){
                                                                        return {color: 'black', backgroundColor: disableCellColor};
                                                                    }else{
                                                                        return {color: 'black', backgroundColor: enableCellColor};
                                                                    }

                                                                }
                                                            }
                                                        }
                                }
                             }
                            );
            columns = groupColumns(columns);
          this.setState({columnDefs:columns});
      }
    };
    httpRequest.send();

  }

  serverSideDatasource = (gridComponent) => {

        return {

            getRows(params,testFunction){

                let httpStr = 'http://127.0.0.1:8000/sht_nodes/?dummy=1';


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

                fetch(httpStr,{
                    method:"GET"
                    })
                        .then(res => res.json())
                        .then(rowData => {
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
                        })
                        .catch(error => console.error("Error:", error));
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


  };
  render() {

//    localStorage.setItem('refer_data_',this.);


//console.log('RENDER this.state.treeData =',this.state.columnDefs);
    //UserStore.add({id:'1',value:1111});



    //var columns = this.gridColumnApi.getColumn("FLT_ID_7533");

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
                    getContextMenuItems={this.getContextMenuItems}
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

                  />
                  </React.Fragment>

            );
         }

         //getContextMenuItems={this.getContextMenuItems}
  }


  onFirstDataRendered(params) {

  }

   getContextMenuItems(params) {
    var result = [
      {
        name: "Alert " + params.value,
        action: function() {
          window.alert("Alerting about " + params.value);
        },
        cssClasses: ["redFont", "bold"]
      },
      {
        name: "Always Disabled",
        disabled: true,
        tooltip: "Very long tooltip, did I mention that I am very long, well I am! Long!  Very Long!"
      },
      {
        name: "Country",
        subMenu: [
          {
            name: "Ireland",
            action: function() {
              console.log("Ireland was pressed");
            },
            icon: createFlagImg("ie")
          },
          {
            name: "UK",
            action: function() {
              console.log("UK was pressed");
            },
            icon: createFlagImg("gb")
          },
          {
            name: "France",
            action: function() {
              console.log("France was pressed");
            },
            icon: createFlagImg("fr")
          }
        ]
      },
      {
        name: "Person",
        subMenu: [
          {
            name: "Niall",
            action: function() {
              console.log("Niall was pressed");
            }
          },
          {
            name: "Sean",
            action: function() {
              console.log("Sean was pressed");
            }
          },
          {
            name: "John",
            action: function() {
              console.log("John was pressed");
            }
          },
          {
            name: "Alberto",
            action: function() {
              console.log("Alberto was pressed");
            }
          },
          {
            name: "Tony",
            action: function() {
              console.log("Tony was pressed");
            }
          },
          {
            name: "Andrew",
            action: function() {
              console.log("Andrew was pressed");
            }
          },
          {
            name: "Kev",
            action: function() {
              console.log("Kev was pressed");
            }
          },
          {
            name: "Will",
            action: function() {
              console.log("Will was pressed");
            }
          },
          {
            name: "Armaan",
            action: function() {
              console.log("Armaan was pressed");
            }
          }
        ]
      },
      "separator",
      {
        name: "Windows",
        shortcut: "Alt + W",
        action: function() {
          console.log("Windows Item Selected");
        },
        icon: '<img src="../images/skills/windows.png"/>'
      },
      {
        name: "Mac",
        shortcut: "Alt + M",
        action: function() {
          console.log("Mac Item Selected");
        },
        icon: '<img src="../images/skills/mac.png"/>'
      },
      "separator",
      {
        name: "Checked",
        checked: true,
        action: function() {
          console.log("Checked Selected");
        },
        icon: '<img src="../images/skills/mac.png"/>'
      },
      "copy",
      "separator",
      "chartRange"
    ];
    return result;
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
    //console.log('localStorage =',localStorage);
    var referData = JSON.parse( referStore.getData(field));
    //console.log(referData);
    //return 7;

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
        //console.log('current_column.ind_id_hi=', current_column.ind_id_hi);
        if (!current_column.ind_id_hi ){
            resultColumns.push(current_column);
        }else{

            //var parentColumn = {};
             //console.log('resultColumns=', resultColumns);
             for (var j =0; j < resultColumns.length; j++){
               // console.log('current_column.resultColumns[j]=', resultColumns[j]);
                //console.log('loop!=', j , resultColumns[j].ind_id, 'again _hi=', current_column.ind_id_hi);
                if (resultColumns[j].ind_id === current_column.ind_id_hi){
                        //console.log('find!=', resultColumns[j]);
                        if (!('children' in resultColumns[j])){
                            resultColumns[j]['children'] =[];
                        }
                        resultColumns[j].children.push(current_column);
                        //console.log('RC!=', resultColumns);
                 }
             }
              //  console.log('parentcol', parentColumn);
             //parentColumn = resultColumns.find((col) => col.ind_id === current_column.ind_id_hi);



        }

    }

    return resultColumns;

}





function createFlagImg(flag) {
  return '<img border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' + flag + '.png"/>';
}


export default GridExample;