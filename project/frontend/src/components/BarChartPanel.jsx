import React, { Component } from "react";
import DropdownHOC from "./DropdownHOC.jsx";
import { sendRequest } from './App.js';
import {MyResponsiveBar} from './MyResponsiveBar.jsx';
import {MyBar} from './MyBar.jsx';
import DXBar from './DXBar.jsx';
import AMChart from './AMChart.jsx';
import {ChartControlPanel} from './ChartControlPanel.jsx';
import { Drawer, RadioGroup, Toolbar, SelectBox } from 'devextreme-react';
import CheckBox from 'devextreme-react/check-box';
import { Button } from 'devextreme-react/button';
import List from 'devextreme-react/list';
import SimpleDialog from './SimpleDialog.jsx';
import { Switch } from 'devextreme-react/switch';
import { Item } from 'devextreme-react/toolbar';
import * as d3 from 'd3';

import Img_pie from '../images/chart_types/pie.png';
import Img_line from '../images/chart_types/line.png';
import Img_dots from '../images/chart_types/dots.png';
import Img_area from '../images/chart_types/area.png';
import Img_bar from '../images/chart_types/bar.png';
import { Popup } from 'devextreme-react/popup';
import {ChartFormFields} from './ChartFormFields.jsx';
import { connect } from "react-redux";


export const chartTypes =[
{code:"Pie", name:"Круговая", img: Img_pie},
{code:"Bar", name:"Столбцы", img: Img_bar},
{code:"Line", name:"Линейная", img: Img_line},
{code:"Area", name:"Область", img: Img_area},
{code:"Dots", name:"Точки", img: Img_dots}
];

const colorMaps = {
 "accent" :d3.schemeAccent,
 "category10":d3.schemeCategory10,
 "dark2":d3.schemeDark2,
 "pastel1":d3.schemePastel1,
 "set1":d3.schemeSet1,
 "set2":d3.schemeSet2
}

const COLUMN_CATEGORY_NAME = "Столбец";

const ChartComponents=[
MyResponsiveBar,
MyBar,
DXBar,
AMChart
]
const legendDirection = [
                                  {
                                    id: "row",
                                    text: 'Строка',
                                    content:""
                                  },
                                  {
                                    id: "column",
                                    text: 'Столбец',
                                    content: 'Comment tab content'
                                  }                                ]


const defaultChartParms = {
    smoothLine:0,
    chartType:"Bar",
    fillOpacity: .8,
    showLinearTrend: false,
    additionalAxis: false,
    strokeDasharray: false,
    stacked: false,
    invertedAxis: false,
    showPercent: false,
    strokeWidth: 1,
    strokeDasharray:"",
    doubleChart: false,
    race:false,
    minGridDistance: 30,
    labelRotation: 0,
    chartTitle: "",
    showLegend: ""
}

export const strokeDasharrayList=[
    "",
    "2,4",
    "8,4",
    "8,4,2,4",
];

export class BarChartPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
                       selectedCategory:"",
                       preparedData:[],
                       measures:[],
                       categories:[],
                       groupMode:"grouped",
                       layout: "vertical",
                       selectedMeasures:[],
                       enableLabel: true,
                       colorScheme: "set1",
                       isControlOpened: true,
                       tabSelectedIndex: 0,
                       legendDirectionSelected: [legendDirection[1]],
                       legendXOffset:77,//чтобы легенда по умолчанию имела шанс поместиться
                       legendYOffset:0,
                       legendEnabled:true,
                       legendPosition:"right",
                       chartSeriesSetupPanelVisible: false,
                       seriesName:"",
                       seriesData:[],
                       measuresProperties:{},
                       transposeData: false,
                       scrollbarX: true,
                       scrollbarY: true,
                       seriesTypeSelected:"Bar",
                       chartType:props.chartType,
                       chartParams: props.chartParams ? props.chartParams : {},
                       stateLoadedFromLayout: false,
                       ranges: props.ranges
                     };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.prepareData = this.prepareData.bind(this);
        this.changeField = this.changeField.bind(this);
        this.seriesSetup = this.seriesSetup.bind(this);

        this.setDefaultChartParams();

        this.testCount = 0;
    }

    setDefaultChartParams(){
        for (var key in defaultChartParms){
            if (!this.state.chartParams[key]){
                this.state.chartParams[key] = defaultChartParms[key];
            }
        }
        this.setState({smoothLine: this.state.chartParams});
    }

    changeField(){


    }

    componentDidUpdate(oldProps){
        if (JSON.stringify(oldProps.data)!=JSON.stringify(this.props.data)){
            this.prepareData(this.state.selectedCategory);
        }

        if (this.props.chartPanelState &&
                oldProps.data.length==0 &&
                this.props.data.length>0 &&
                !this.state.stateLoadedFromLayout
                ){
            this.setState({stateLoadedFromLayout: true, ...this.props.chartPanelState});
        }

        this.sendStateToLayout();

    }

    sendStateToLayout(){
        if (this.props.onLayoutContentChange){
            this.props.onLayoutContentChange({
                                                type: 'chartUpdated',
                                                itemId: this.props.layoutItemID,
                                                changeParams: {chartPanelState: this.state}
                                             });
        }
    }

    componentDidMount(){
        this.prepareData();

        var measuresClone = this.state.measures.slice();
        console.log("this.state.categories[0]", this.state.categories, measuresClone);

        if (this.state.categories.length>0){

            console.log("this.state.categories[0]", this.state.categories[0], measuresClone);


            this.setState({
                selectedMeasures: this.state.measures.slice()
            });

        }

    }

    filterDataByRanges(data, ranges){

        if (!ranges){
            return [];
        }

        var resultData = [];

        function columnNameInRanges(columnName, ranges){
            return ranges.find(range=>{

                var col = range.columns.find(column=>{
                    return column.name == columnName;
                });
                return col ? true:false;
            })? true:false;
        }

        data.forEach(dataRow=>{

            var rangeContainedRow = ranges.find(range=>{
                    return dataRow.rowIndex >= range.startRow && dataRow.rowIndex <= range.endRow
                });



            if (rangeContainedRow){

                if (columnNameInRanges(dataRow.measure, ranges)){
                    var resultRow = {rowIndex:dataRow.rowIndex, value: dataRow.value};
                    for(var fieldName in dataRow){
                        if (columnNameInRanges(fieldName, ranges)){
                            resultRow[fieldName] = dataRow[fieldName];
                        }
                    }
                    resultData.push(dataRow);
                }
            }



        });

        return resultData;

    }

    prepareData(selectedCategory){

        var preparedData = [];
        var measures = [];
        var categories = [];

        var data = this.filterDataByRanges(this.props.data, this.state.ranges);

        data.forEach(element=>{

            for (var key in element){
                if (key!="value" && key!= "measure" && key !="rowIndex"){
                    if (!categories.find(el=>{return el==key})){
                        categories.push(key);
                    }
                }
            }
        });

        var selectedCategoryInner = selectedCategory? selectedCategory: categories[0];


        data.forEach(element=>{
            if (!this.state.transposeData){
                if (!measures.find(el=>{return el==element['measure']})){
                    measures.push(element['measure']);
                }
            }else{
                if (!measures.find(el=>{return el==element[selectedCategoryInner]})){
                    measures.push(element[selectedCategoryInner]);
                }

            }

        });

        data.forEach(element=>{

            if (!this.state.transposeData){
                var currentPreparedIndex = preparedData.findIndex(el=> {
                    return el[selectedCategoryInner] == element[selectedCategoryInner];
                });

                if (currentPreparedIndex==-1){
                    var newElement = {};
                    newElement[selectedCategoryInner] = element[selectedCategoryInner];
                    preparedData.push(newElement);
                    currentPreparedIndex = preparedData.length-1;
                }


                if (!isNaN(element['value'])){
                    if (preparedData[currentPreparedIndex][element['measure']]){
                        preparedData[currentPreparedIndex][element['measure']] += parseFloat(element['value']);
                    }else{
                        preparedData[currentPreparedIndex][element['measure']] = parseFloat(element['value']);
                    }
                }
            }else{

                var currentPreparedIndex = preparedData.findIndex(el=> {
                    return el[COLUMN_CATEGORY_NAME] == element['measure'];
                });

                if (currentPreparedIndex==-1){
                    var newElement = {};
                    newElement[COLUMN_CATEGORY_NAME] = element['measure'];
                    preparedData.push(newElement);
                    currentPreparedIndex = preparedData.length-1;
                }


                if (!isNaN(element['value'])){
                    if (preparedData[currentPreparedIndex][element[selectedCategoryInner]]){
                        preparedData[currentPreparedIndex][element[selectedCategoryInner]] += parseFloat(element['value']);
                    }else{
                        preparedData[currentPreparedIndex][element[selectedCategoryInner]] = parseFloat(element['value']);
                    }
                }
            }
        });

        this.state.preparedData = preparedData.slice();
        this.state.measures = measures.slice();
        this.state.categories = categories.slice();
        this.state.selectedCategory = selectedCategoryInner;


        this.setState({
                preparedData: preparedData,
                measures:measures.slice(),//measures,
                categories: categories,
                selectedCategory: this.state.selectedCategory});

        this.sendStateToLayout();

    }

    onChangeCategory(e){
        this.prepareData(e.value);
    }

    onChangeChartParams(params){


        if (Object.keys(this.state.chartParams).includes(params.dataField) &&
                params.value != this.state.chartParams[params.dataField])
        {
           this.state.chartParams[params.dataField] = params.value;
            this.setState({chartParams: this.state.chartParams});
        }
    }

    onChangeGroupMode(e){
        this.setState({groupMode: e.value});
    }

    onChangeLayout(e){
        console.log("eee=", e.value);
        this.setState({layout: e.value});
    }

    onChangeEnableLabel(e){
        this.setState({enableLabel: e.value});
    }

    onColorChanged(e){
        this.setState({colorScheme: e.value});
    }

    onSelectedMeasuresChange(args){




        if(args.name === 'selectedItems' && JSON.stringify(args.value)!=JSON.stringify(this.state.selectedMeasures)) {
            this.setState({selectedMeasures: args.value});
        }
    }

    seriesSetup(seriesName){
        if (seriesName in this.state.measuresProperties){
            this.seriesData = this.state.measuresProperties[seriesName];
        } else{
            this.seriesData = Object.assign({}, this.state.chartParams);
        }
        if (!this.seriesData.fillColor){
            var colorFuncton = this.getColorFunction();
            var colorIndex = this.state.measures.indexOf(seriesName);
            for (var i=0;i<=colorIndex; i++){
                this.seriesData.fillColor = colorFuncton(i);
            }

        }
        this.seriesData.seriesName = seriesName;
        this.setState({chartSeriesSetupPanelVisible: true});
    }

    onChangeSeriesParams(params){
        console.log("onChangeSeriesParams", params);
    }

    transposeDataOnChange(args){
        this.setState({transposeData: args.value});
        this.prepareData(this.state.selectedCategory);
    }

    saveSeriesParamsData(params){
        this.state.measuresProperties[params.seriesName] = params;
        this.setState({measuresProperties: this.state.measuresProperties});
    }

    getColorFunction(){
        return d3.scaleOrdinal(this.state.colorScheme in colorMaps ?
                                        colorMaps[this.state.colorScheme]
                                        :
                                        colorMaps["accent"]);
    }

    render() {

        var colorFuncton = this.getColorFunction();
        var options = this.state.categories.map(field=>{
            return (<option key={field} value={field}>{field}</option>);
        });

        console.log("this.preparedData", this.state.preparedData);

        const ChartComponent = ChartComponents[this.props.chartComponentIndex? this.props.chartComponentIndex:0];

        var contentElement = document.querySelector("#chart_content_"+this.props.layoutItemID);

        var seriesParamsDialog = this.state.chartSeriesSetupPanelVisible ?

             <Popup
                  visible={true}
                  onHiding={()=>{this.setState({chartSeriesSetupPanelVisible:false});}}
                  dragEnabled={true}
                  closeOnOutsideClick={true}
                  showTitle={true}
                  title={"Серия данных"}
                  resizeEnabled={true}
                  width={400}
                  height={700}
                  toolbarItems={
                  [
                                {
                                    widget: "dxButton",
                                    location: "after",
                                    toolbar: "bottom",
                                    options: {
                                        text: "OK",
                                        onClick: (params)=> {
                                                            this.sendSeriesParamsDataRequest();
                                                            this.setState({chartSeriesSetupPanelVisible:false});
                                                       }
                                    }
                                },
                                {
                                    widget: "dxButton",
                                    location: "after",
                                    toolbar: "bottom",
                                    options: {
                                        text: "Отмена",
                                        onClick: ()=> this.setState({chartSeriesSetupPanelVisible:false})
                                    }
                                }
                            ]
                  }
                 >
                 <ChartFormFields
                        seriesName={this.seriesName}
                        sendData={this.saveSeriesParamsData.bind(this)}
                        sendDataRequest={click => this.sendSeriesParamsDataRequest = click}
                        onFieldDataChanged={(params)=>{
                            console.log("onFieldDataChanged", params);
                        }}
                        chartParams={this.seriesData}
                    />
                 </Popup> :null;


        return (
            <React.Fragment>
                {seriesParamsDialog}

                <Toolbar>
                    {this.props.additionalToolbarItems}
                    <Item location={'after'}
                    widget={'dxButton'}
                    options={{
                                icon: 'menu',
                                onClick: (e) => {this.setState({isControlOpened: !this.state.isControlOpened});}
                            }} />
                    <Item location={'after'}
                    widget={'dxButton'}
                    options={{
                                icon: 'close',
                                onClick: (e) => {
                                                this.props.onToolbarCloseClick(this.props.layoutItemID);
                                                }
                            }} />
                </Toolbar>


                <div id={'content_'+this.props.layoutItemID} className="ag-theme-balham ToolbarViewContent NonDraggableAreaClassName">

                     <div className="chart-wrapper">

            <Drawer
          opened={this.state.isControlOpened}
          openedStateMode={'shrink'}
          position={'right'}
          revealMode={'slide'}
          component={()=> {
                    return (<ChartControlPanel
                        data={this.props.data}
                        categoryOnValueChanged={this.onChangeCategory.bind(this)}
                        categoryItems={this.state.categories}
                        categoryValue={this.state.selectedCategory}

                        measureItems={this.state.measures}
                        measureSelectedItems={this.state.selectedMeasures}
                        measureOnOptionChanged={this.onSelectedMeasuresChange.bind(this)}
                        groupGroupMode={this.state.groupMode}

                        groupOnChangeGroupMode={this.onChangeGroupMode.bind(this)}
                        layoutOnChangeLayout={this.onChangeLayout.bind(this)}
                        layout={this.state.layout}
                        colorScheme={this.state.colorScheme}
                        colorsOnValueChanged={this.onColorChanged.bind(this)}
                        enableLabel={this.state.enableLabel}
                        enableLabelOnValueChanged={this.onChangeEnableLabel.bind(this)}

                        transposeData={this.state.transposeData}
                        transposeDataOnChange={this.transposeDataOnChange.bind(this)}
                        tabSelectedIndex={this.state.tabSelectedIndex}
                        tabSelectedIndexChanged={
                            (args)=>{
                                        if(args.name == 'selectedIndex') {
                                            if (args.value!=this.state.tabSelectedIndex){
                                                this.setState({tabSelectedIndex: args.value});
                                            }
                                        }
                                    }
                        }

                        legendDirection={legendDirection}
                        legendDirectionSelected={this.state.legendDirectionSelected}
                        legendDirectionOnChange={
                            (args)=>{

                                        if(args.name == 'selectedItems' && JSON.stringify(args.value)!=JSON.stringify(this.state.legendDirectionSelected)) {
                                            this.setState({legendDirectionSelected: args.value});
                                        }
                                    }
                        }

                        legendXOffset={this.state.legendXOffset}
                        legendXOffsetOnChanged={
                             (args)=>{this.setState({legendXOffset: args.value});}
                        }

                        legendPosition={this.state.legendPosition}
                        legendPositionOnChanged={
                             (args)=>{this.setState({legendPosition: args.value});}
                        }

                        legendYOffset={this.state.legendYOffset}
                        legendYOffsetOnChanged={
                                    (args)=>{this.setState({legendYOffset: args.value});}
                        }

                        legendEnabled={this.state.legendEnabled}
                        legendEnabledOnChanged={
                        (args)=>{
                                    this.setState({legendEnabled: args.value});
                                }
                        }

                        chartParams={this.state.chartParams}
                        onChangeChartParams={this.onChangeChartParams.bind(this)}
                    />);
                    }}
                    closeOnOutsideClick={this.onOutsideClick}

          >
          <div id={"chart_content_"+this.props.layoutItemID} className="chart-wrapper">
                <ChartComponent
                    id="chart777"
                    chartId={this.props.chartId}
                    data={this.state.preparedData}
                    layoutItemID={this.props.layoutItemID}
                    keys={this.state.selectedMeasures}
                    indexBy={this.state.transposeData ? COLUMN_CATEGORY_NAME: this.state.selectedCategory}
                    groupMode={this.state.groupMode}
                    layout={this.state.layout}
                    enableLabel={this.state.enableLabel}
                    legendEnabled={this.state.legendEnabled}
                    colors={{scheme:this.state.colorScheme}}
                    legendDirection={this.state.legendDirectionSelected && this.state.legendDirectionSelected.length>0 && this.state.legendDirectionSelected[0].id}
                    legendXOffset={this.state.legendXOffset}
                    legendYOffset={this.state.legendYOffset}
                    legendPosition={this.state.legendPosition}
                    getColor={colorFuncton}
                    seriesSetup={this.seriesSetup.bind(this)}
                    parentWidth={contentElement? contentElement.offsetWidth:0}
                    parentHeight={contentElement?contentElement.offsetHeight:0}
                    measuresProperties={this.state.measuresProperties}
                    scrollbarX={this.state.scrollbarX}
                    scrollbarY={this.state.scrollbarY}
                    chartParams={this.state.chartParams}
                />
          </div>
        </Drawer>



            </div>

                </div>





            </React.Fragment>
        );
  }
}



/*

function mapStateToProps(state) {
    console.log("BarChartPanel mapStateToProps")
    return {

    };
}

*/

const mapStateToProps = (state, ownProps) => {

    console.log("BAR mapStateToProps", state, ownProps.parentLayoutItemID);

    if (state.gridData[ownProps.parentLayoutItemID]){
        return {
            data: state.gridData[ownProps.parentLayoutItemID]
        };
    }else{
        return {
            data: []
        };
    }

};

export default connect(mapStateToProps)(BarChartPanel);


