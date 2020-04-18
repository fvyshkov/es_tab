import referStore from './sheetReference.js';
import React from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "ag-grid-enterprise";
import { AllModules } from "@ag-grid-enterprise/all-modules";
import TreeReferEditor from "./TreeReferEditor.jsx";
import NumericEditor from "./NumericEditor.jsx";
import { sendRequest } from './App.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import FilterPanelInToolPanel from "./FilterPanelInToolPanel.jsx";
import {LicenseManager} from "@ag-grid-enterprise/core";
import ReTableView from './ReTableView.jsx';
import ToolbarView from './ToolbarView.jsx';
import sheetDatasource from './sheetDatasource';
import commentDatasource from './commentDatasource';
import TableViewComment from './TableViewComment.jsx';
import SheetCellTooltip from './SheetCellTooltip.jsx';
import CommentImg from '../images/chat.png';
import {Spinner} from './spin.js';
import {someChartModel, someChartModel2} from './testData.js';

LicenseManager.setLicenseKey("Evaluation_License_Not_For_Production_29_December_2019__MTU3NzU3NzYwMDAwMA==a3a7a7e770dea1c09a39018caf2c839c");

export default class ReGrid extends React.Component {
    constructor(props) {
        super(props);

        this.gridReadyFlag = false;

        this.immutableStore =[];
        this.savedFocusedCell = {};
        //this.gridReadySend = false;

        this.chartsMap = {};
        this.chartProcessingIndex = 0;

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
                            {
                                id: "filters",
                                labelDefault: "Фильтры",
                                labelKey: "filters",
                                iconKey: "filter",
                                toolPanel: "agFiltersToolPanel"
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
            filter: true,
            sortable: true
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
        this.componentDidMount = this.componentDidMount.bind(this);
        this.onGridReady = this.onGridReady.bind(this);
        this.onGridStateChange = this.onGridStateChange.bind(this);
        this.sendDeleteRecord = this.sendDeleteRecord.bind(this);
        this.sendUndoToGrid = this.sendUndoToGrid.bind(this);
        this.onLayoutBeforeSave = this.onLayoutBeforeSave.bind(this);

        this.columnsLoaded = false;

    }

    specialEquality(s1, s2){
        var s1Copy = s1;
        var s2Copy = s2;
        if (s1Copy.endsWith("_1")){
            s1Copy = s1Copy.slice(0,-2);
        }
        if (s2Copy.endsWith("_1")){
            s2Copy = s2Copy.slice(0,-2);
        }

        return (s2Copy == s1Copy);
    }

    refreshData(){
        if (this.savedFilterModel){
            this.gridApi.setFilterModel(this.savedFilterModel);
        }else if (this.props.columnFilterModel){
            this.gridApi.setFilterModel(this.props.columnFilterModel);
        }



        if (this.savedColumnState){
            var columns = this.gridColumnApi.getColumnState();

            columns.forEach((column)=>{
                var isCurrentColFoundInSaved = false;
                this.savedColumnState.forEach((savedColumn)=>{
                    if(this.specialEquality(savedColumn.colId , column.colId)){
                        //если нашлось соответствие, ничего не нужно делать
                        isCurrentColFoundInSaved = true;
                        savedColumn.colId = column.colId;
                    }

                });

                if(!isCurrentColFoundInSaved){
                    this.savedColumnState.unshift(Object.assign({}, column));
                }
            });

            this.savedColumnState = this.savedColumnState.filter((savedColumn)=>{
                var foundInReal = columns.find(realColumn=> realColumn.colId == savedColumn.colId);
                return foundInReal ? true: false;
            });

            this.gridColumnApi.setColumnState(this.savedColumnState);
        } else if (this.props.columnState){
            this.gridColumnApi.setColumnState(this.props.columnState);
        }

        this.gridApi.setRowData(this.props.rowData);
    }

    loadCharts(charts){
    }

    onLayoutBeforeSave(){
        console.log('onLayoutBeforeSave chartModels BEFORE', this.gridApi.getChartModels());
        if (this.props.doBeforeSaveLayout){



            var chartModels  =   this.gridApi.getChartModels();
            console.log('onLayoutBeforeSave chartModels', chartModels);
            var chartParams = chartModels.map((model)=>{
                var layouts = this.props.getLayoutForSave();
                var chartLayoutId = this.chartsMap[model.chartId];
                var layoutsFiltered = layouts.filter((layout)=>{
                    return layout.itemId == chartLayoutId;
                });

                var layout = null;

                if (layoutsFiltered.length==1){
                    layout = layoutsFiltered[0].layout;
                }

                return {
                        chartModel: model,
                        layout: layout,
                        parentLayoutId: this.props.layoutItemID,
                        chartLayoutId: chartLayoutId
                       };
            });
            var expandedGroupIds = [];

            this.gridApi.forEachNode((node, index)=>{
                if (node.expanded) {
                    expandedGroupIds.push(node.data.node_key);
                }
            });
            this.props.doBeforeSaveLayout(this.props.layoutItemID, chartParams, expandedGroupIds, this.gridApi.getFilterModel(), this.gridColumnApi.getColumnState());
        }
    }

    onSendSaveFilter(){
        this.savedFilterModel = JSON.parse(JSON.stringify(this.gridApi.getFilterModel())) ;
        this.savedColumnState = JSON.parse(JSON.stringify(this.gridColumnApi.getColumnState())) ;
        return this.savedFilterModel;
    }

    getGridApi(){
        return this.gridApi;
    }

    componentDidMount() {
        if (this.props.sendRefreshGrid){
            this.props.sendRefreshGrid(this.refreshGrid);
        }

        if (this.props.getGridApi){
            this.props.getGridApi(this.getGridApi.bind(this));
        }

        if (this.props.sendSaveFilter){
            this.props.sendSaveFilter(this.onSendSaveFilter.bind(this));
        }

        if (this.props.sendLayoutBeforeSave){
            this.props.sendLayoutBeforeSave(this.onLayoutBeforeSave.bind(this));
        }


        if (this.props.sendLoadChartsToGrid){
            this.props.sendLoadChartsToGrid(this.сreateCharts.bind(this));
        }

         if (this.props.sendRefreshData){
            this.props.sendRefreshData(this.refreshData.bind(this));
        }

        if (this.props.sendBeforeCloseToGrid){
            this.props.sendBeforeCloseToGrid(this.onSendBeforeCloseToGrid.bind(this));
        }

        if(this.props.sendInsertRecord){
            this.props.sendInsertRecord(this.sendInsertRecord.bind(this));
        }

        if(this.props.sendExpandNode){
            this.props.sendExpandNode(this.sendExpandNode.bind(this));
        }

        if(this.props.sendUndoToGrid){
            this.props.sendUndoToGrid(this.sendUndoToGrid.bind(this));
        }


        if(this.props.sendDeleteRecord){
            this.props.sendDeleteRecord(this.sendDeleteRecord.bind(this));
        }

        if(this.props.sendDeleteRecord){
            this.props.sendDeleteRecord(this.sendDeleteRecord.bind(this));
        }




    }

    sendUndoToGrid(){
        this.gridApi.undoCellEditing();
    }

    onSendBeforeCloseToGrid(){
        this.onGridExpandedChange();
    }




    refreshGrid(){
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
            //var columnFilter = "agTextColumnFilter";
            var columnFilter = true;

            if (currentValue.atr_type==="N"){
                cellChartDataType = "series";
                columnFilter = "agNumberColumnFilter";
            }


            return {
                            field:currentValue.key,
                            headerName:currentValue.name,
                            detailfl: currentValue.detailfl,
                            showRowGroup: (currentValue.rowgroupfl===1),
                            cellRenderer: (currentValue.rowgroupfl===1) ? 'agGroupCellRenderer' : gridCellRenderer ,
                            cellRendererParams: {
                                                innerRenderer: function(params) {
                                                    if (params.data.node_key.includes('dummy')){
                                                        return getSpinner();
                                                    }else{
                                                        return params.data.name;
                                                    }
                                                },
                                                suppressCount: true
                                            },

                            autoHeight: true,
                            ent_id:currentValue.ent_id,
                            ind_id:currentValue.ind_id,
                            ind_id_hi: currentValue.ind_id_hi,
                            atr_type:currentValue.atr_type,
                            chartDataType : cellChartDataType,
                            filter:columnFilter,
                            suppressKeyboardEvent: suppressCtrlArrow,
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

                                                        var fontColor = '#000000';//black
                                                        var backgroundColor = '#ffffff';//white

                                                        if (columnData){
                                                            fontColor = columnData['font.color'];
                                                            backgroundColor = columnData['brush.color'];
                                                            if (!backgroundColor){
                                                               backgroundColor = '#ffffff';//white
                                                            }

                                                            if (params.node.rowIndex % 2 === 1) {
                                                                var rgbColor = hexToRGB(backgroundColor, .6, -30);
                                                                backgroundColor = rgbColor;
                                                            }else{
                                                                backgroundColor = hexToRGB(backgroundColor, .6);
                                                            }
                                                        }

                                                        var style = {color: fontColor, backgroundColor: backgroundColor};


                                                        if (columnData && columnData['font.bold']==='1'){
                                                            style['font-weight'] = 'bold';
                                                        }else{
                                                            style['font-weight'] = 'normal';
                                                        }

                                                        if (columnData && columnData['font.italic']==='1'){
                                                            style['font-style'] = 'italic';
                                                        }else{
                                                            style['font-style'] = 'normal';
                                                        }

                                                        if (columnData && columnData['border.color']){ 
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
        //заставляем грид перерендериться
        //без этого "загадочного" действия в FilterToolPanel почему-то не попадают новые пропсы
        //this.setState({gridKey: this.state.gridKey+1});

        this.columnsLoaded = true;
    }



    loadColumns(){

        var httpStr = this.props.getColumnsListRequestString();
        sendRequestPromise(httpStr)
            .then(data=> this.processColumnsData(data));
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
        this.props.onGetGridApiLow(this.gridApi);
        if (this.props.additionalSheetParams && !this.columnsLoaded){
            this.loadColumns();
        }

        //console.log('!!! gridReadySend', this.gridReadySend);
        if (this.props.onGridReady && ! this.gridReadySend){
            this.gridReadySend = true;
            this.props.onGridReady(this.gridApi);

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

    onExpandOrCollapseAll(e1,e2){
        console.log("onExpandOrCollapseAll", e1,e2);
    }

    onRowGroupOpened(e){

        this.props.processNodeExpanding(e);

        if (e.node.expanded){
            this.expandedKeys.push(e.node.key);
        }else{
            if (this.expandedKeys.indexOf(e.node.key) > -1){
                this.expandedKeys.splice(this.expandedKeys.indexOf(e.node.key),1);
            }
        }
    }

    onCellValueChanged(params){
        if (this.props.onCellValueChanged) {
            this.props.onCellValueChanged(params);
        }

    }

    sendExpandNode(nodeId){
        this.gridApi.setRowNodeExpanded(this.gridApi.getRowNode(nodeId), true);
    }

    sendInsertRecord(){
        this.savedFocusedCell = this.gridApi.getFocusedCell();
        this.gridApi.purgeServerSideCache();
    }

    onCellFocused(params){
        if (this.props.onCellFocused){
            this.props.onCellFocused(params);
        }
    }


    сreateCharts(charts){
        var chartTitle = this.getDefaultChartTitle();
        charts.forEach((value, index, array)=>{
            var chartModel = value.chartModel;
            var options = chartModel.chartOptions;
            var createRangeChartParams = {
              chartContainer: document.querySelector("#myChart"),
              cellRange: chartModel.cellRange,
              chartType: chartModel.chartType,
              chartPalette: chartModel.chartPalette,
              processChartOptions: function() {
                if (chartTitle){
                    if (!options.title.text){
                        options.title.text = chartTitle;
                        options.title.enabled = true;
                    }
                }
                return options;
              }
            };

            //не нашел способа передать layout в createChartContainer
            //потому использована переменная класса...
            this.predefinedLayoutForChart = value.layout;
            try{
                var currentChartRef = this.gridApi.createRangeChart(createRangeChartParams);
                console.log('create saved chart', this.gridApi.getChartModels());
            }finally{
                this.predefinedLayoutForChart = null;
            }
        });

    }

    processChartOptions(params){
        //console.log('processChartOptions', params);
        if (!params.options.title.text){
            params.options.title.text = this.getDefaultChartTitle();
            if (params.options.title.text){
                params.options.title.enabled = true;
            }
        }
        return params.options;
    }

    sendDeleteRecord(){
        console.log("regrid sendDeleteRecord");
        this.gridApi.updateRowData({ remove: [this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).data] });
    }

    getDefaultChartTitle(){
        if (this.props.getChartTitle){
            return this.props.getChartTitle();
        }else{
            return null;
        }
    }

    getRowClass(params) {
        if (params.node.rowIndex % 2 === 0) {
            return 'myShadedEffect';
        }
    }



  render() {

        if (this.gridApi && this.props.loading){
            this.gridApi.showLoadingOverlay();
        }

        if (this.gridApi && !this.props.loading ){
            this.gridApi.hideOverlay();
        }
        return (
                <React.Fragment>
                    <div className ="ag-theme-balham NonDraggableAreaClassName ToolbarViewContent" key={this.props.gridKey} id="myGrid123">
                        <AgGridReact
                            modules={AllModules}
                            getRowClass={this.getRowClass}
                            cacheBlockSize={1000}
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            getDataPath={(data)=>{return data.hie_path;}}
                            rowData={this.props.rowData}
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
                            processChartOptions={this.processChartOptions.bind(this)}
                            onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                            enableRangeSelection={true}
                            enableCharts={true}
                            gridOptions={{context: { getFilterSkey: this.props.getFilterSkey }}}
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
                            onExpandOrCollapseAll={this.onExpandOrCollapseAll.bind(this)}
                            getRowNodeId={this.props.getRowNodeId}
                            onCellValueChanged={this.onCellValueChanged.bind(this)}
                            deltaRowDataMode={true}
                            undoRedoCellEditing={true}
                            undoRedoCellEditingLimit={100}
                            enableCellChangeFlash={true}
                            onCellKeyDown={this.onCellKeyDown.bind(this)}
                            onCellFocused={this.onCellFocused.bind(this)}
                            localeText={{
                                                // for filter panel
                                                page: 'daPage',
                                                more: 'daMore',
                                                to: 'daTo',
                                                of: 'из',
                                                next: 'daNexten',
                                                last: 'daLasten',
                                                first: 'daFirsten',
                                                previous: 'daPreviousen',
                                                loadingOoo: 'Загрузка данных...',

                                                // for set filter
                                                selectAll: 'Выбрать все',
                                                searchOoo: 'Поиск...',
                                                blanks: 'Пусто',


                                                noRowsToShow: 'Нет записей',

                                                // for number filter and text filter
                                             //   filterOoo: 'daFilter...',
                                                applyFilter: 'Применить фильтр...',
                                                equals: 'равно',
                                                notEqual: 'не равно',

                                                // for number filter
                                                lessThan: 'меньше',
                                                greaterThan: 'больше',
                                                lessThanOrEqual: 'меньше или равно',
                                                greaterThanOrEqual: 'больше или равно',
                                                inRange: 'между',

                                                // for text filter
                                                contains: 'содержит',
                                                notContains: 'не содержит',
                                                startsWith: 'начинается с',
                                                endsWith: 'заканчивается на',

                                                // filter conditions
                                                andCondition: 'И',
                                                orCondition: 'ИЛИ',

                                                // enterprise menu aggregation and status bar
                                                 sum: 'Сумма',
                                                    min: 'Минимум',
                                                    max: 'Максимум',
                                                    none: 'Пусто',
                                                    count: 'Количество',
                                                    average: 'Среднее',
                                                    filteredRows: 'Фильтрация',
                                                    selectedRows: 'Выбрано',
                                                    totalRows: 'Всего строк',
                                                    totalAndFilteredRows: 'Строк'
                                            }}

                          />

                      </div>

                  </React.Fragment>

            );
  }

    createChartContainer(chartRef) {
        //console.log('createChartContainer', chartRef.__agComponent);

        if (this.props.addElementToLayout){
            var newLayoutItemID = this.props.getNewLayoutItemID();

            var layout = null;

            if (this.predefinedLayoutForChart){
                layout = this.predefinedLayoutForChart;
            }
            //layoutItemID={newLayoutItemID}
            if (this.props.onAddChart){
                this.props.onAddChart({layoutItemID: newLayoutItemID, chartId: chartRef.chartElement.__agComponent.model.chartId});
            }

            this.chartsMap[chartRef.chartElement.__agComponent.model.chartId] = newLayoutItemID;

            this.props.addElementToLayout(<ToolbarView
                                                layoutItemID={newLayoutItemID}
                                                addElementToLayout={this.props.addElementToLayout}
                                                onToolbarCloseClick={this.props.onToolbarCloseClick}
                                                getNewLayoutItemID={this.props.getNewLayoutItemID}
                                            />,
                                            layout
                                            );
            document.querySelector("#content_"+newLayoutItemID).appendChild(chartRef.chartElement);
        }
    }

    getCommentDatasource(grid){
        return commentDatasource(grid);
    }



    onCellKeyDown = e => {

        if (e.event.ctrlKey && e.event.key=="ArrowRight" && this.props.onSendExpandRecursive){
            this.props.onSendExpandRecursive(e.node.id);
        }else if (e.event.ctrlKey && e.event.key=="ArrowLeft"){
            this.gridApi.setRowNodeExpanded( this.gridApi.getRowNode(e.node.id), false);
        }
    }




    getContextMenuItems(params) {

        var result = [
            ...this.props.getContextMenuItems(params),
            "separator",
            //"expandAll",
            "copyWithHeadersCopy",
            "export",
            "chartRange"

        ];
        return result;
      }


  onFirstDataRendered(params) {

  }

}

function getSpinner(){
    var element = document.createElement("span");
    var spinner =  new Spinner({scale: .4, speed: 1.3}).spin(element);
    return element;
}

function gridCellRenderer(params){
    var displayValue;

    if (params.colDef.atr_type==="N" && !isNaN(params.value)){
        if (params.value){
            var num = parseFloat(Math.round(parseFloat(params.value) * 100) / 100).toFixed(2);
            var parts = num.split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            displayValue = parts.join(".");
        }else{
            displayValue = '';
        }
    }else{
        displayValue = params.value;
    }

    if (!displayValue){
        displayValue = '';
    }





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

    const node_key = params.data.node_key;
    if ( (typeof node_key)=="string" && node_key.includes('dummy')) {
        return getSpinner();
    }



    var element = document.createElement("div");


    if (columnData && columnData.commentfl===1){
        var imageElement = document.createElement("img");
        imageElement.setAttribute("width" , "16px");
        imageElement.setAttribute("height" , "16px");
        imageElement.setAttribute("class" , "image-in-cell");

        imageElement.src = CommentImg;
        element.appendChild(imageElement);
    }

    if (columnData && columnData.ent_id && columnData.editfl==1){
        var buttonElement = document.createElement("div");
        buttonElement.innerHTML = '<span class="cell-button-span"><i class="dx-icon-clear"></i></span>';
        var eButton = buttonElement.querySelector('.dx-icon-clear');
        var eventListener = function(clickEventParams) {
            params.setValue('');
        };
        eButton.addEventListener('click', eventListener);
        element.appendChild(buttonElement);
    }


    element.setAttribute("class" , "cell-wrapper");
    var innerElementForCell = document.createElement("div");
    if (params.colDef.atr_type==="N" ){
        innerElementForCell.setAttribute("class" , "number-cell");
    }else{
        innerElementForCell.setAttribute("class" , "text-cell");
        if (params.colDef.ent_id){
            innerElementForCell.setAttribute("refer" , "1");
        }
    }
    innerElementForCell.appendChild(document.createTextNode(displayValue));
    element.appendChild(innerElementForCell);


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
    }else if(params.rowIndex != undefined){
        columnDataList = params.api.getDisplayedRowAtIndex(params.rowIndex).data.column_data;
        colDefField = params.colDef.field;
    }else if (params.data && params.colDef) {
        columnDataList = params.data.column_data;
        colDefField = params.colDef.field;
    }

    if (columnDataList) {
        for(var i=0; i< columnDataList.length; i++){
            if (columnDataList[i].key===colDefField){
                return columnDataList[i];
            }
        }
    }

    return null;
}


function hexToRGB(hex, alpha, delta=0) {
    var r = parseInt(hex.slice(1, 3), 16) + delta,
        g = parseInt(hex.slice(3, 5), 16) + delta,
        b = parseInt(hex.slice(5, 7), 16) + delta;

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

function suppressCtrlArrow(params){
    var event = params.event;
    //подавляем ctrl+-> для первой колонки (группирующей)
    //потому что на это сочетание повесим раскрытие узла с рекурсией
    var suppress = params.column.colDef.showRowGroup &&
            event.ctrlKey  && event.key == "ArrowRight";

    return suppress;

}

