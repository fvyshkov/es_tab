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
                       chartSeriesSetupPanel: false,
                       seriesName:"",
                       seriesData:[],
                       measuresProperties:{},
                       transposeData: false,
                       scrollbarX: true,
                       scrollbarY: true,
                       seriesTypeSelected:"Bar"

                     };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.prepareData = this.prepareData.bind(this);
        this.changeField = this.changeField.bind(this);
        this.seriesSetup = this.seriesSetup.bind(this);

        this.testCount = 0;
    }


    changeField(){


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

    prepareData(selectedCategory){

        var preparedData = [];
        var measures = [];
        var categories = [];

        this.props.data.forEach(element=>{

            for (var key in element){
                if (key!="value" && key!= "measure"){
                    if (!categories.find(el=>{return el==key})){
                        categories.push(key);
                    }
                }
            }
        });

        console.log("measures=", measures);
        console.log("categories=", categories);
        var selectedCategoryInner = selectedCategory? selectedCategory: categories[0];


        this.props.data.forEach(element=>{
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

        //var selectedCategoryForData = this.state.transposeData ? COLUMN_CATEGORY_NAME : selectedCategoryInner;


        this.props.data.forEach(element=>{

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
    }

    onChangeCategory(e){
        this.prepareData(e.value);
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
        console.log("seriesSetup1=", seriesName);
        const seriesType = ["Bar", "Line", "Area", "Dots"] ;
        this.seriesData = [
                         {
                            dataField:"seriesName",
                            label:"Наименование серии",
                            value: seriesName,
                            visible: true
                         },

                        {
                            dataField:"additionalAxis",
                            label:"Вспомогательная ось",
                            value: seriesName in this.state.measuresProperties && this.state.measuresProperties[seriesName].additionalAxis=="1"? true: false,
                            editorType: "dxCheckBox",

                            visible: true
                        },
                        {
                            dataField:"showLinearTrend",
                            label:" Линейный тренд",
                            value: seriesName in this.state.measuresProperties && this.state.measuresProperties[seriesName].showLinearTrend=="1"? true: false,
                            editorType: "dxCheckBox",

                            visible: true
                        },

                        {
                            dataField:"seriesType",
                            label:"Тип диаграммы",
                            editorType: "dxSelectBox",
                            editorOptions: {
                                items: seriesType,
                                onValueChanged: (e) => {
                                    console.log("seriesType onValueChanged", e.component.option('value'));

                                    this.setState({
                                        seriesTypeSelected: e.component.option('value')
                                    });
                                    this.seriesSetup();
                                }
                            },
                            value: seriesName in this.state.measuresProperties ? this.state.measuresProperties[seriesName].seriesType: "Bar",
                            visible: true
                        },
                        {
                            dataField:"smoothLine",
                            label:"Сглаживание",
                            editorType: "dxSlider",
                            editorOptions: { min:0, max:1, step:.1},
                            value: seriesName in this.state.measuresProperties ? this.state.measuresProperties[seriesName].smoothLine:0,
                            visible: this.state.seriesTypeSelected =="Line" || this.state.seriesTypeSelected == "Area"
                         },

                         {
                            dataField:"fillOpacity",
                            label:"Плотность заливки",
                            editorType: "dxSlider",
                            editorOptions: { min:0, max:1, step:.1},
                            value: seriesName in this.state.measuresProperties ? this.state.measuresProperties[seriesName].fillOpacity:.8,
                            visible: this.state.seriesTypeSelected == "Bar" || this.state.seriesTypeSelected == "Area"
                         },




                        ];

        this.setState({seriesData : this.state.seriesData});


        this.setState({chartSeriesSetupPanelVisible: true});
    }


    transposeDataOnChange(args){
        this.setState({transposeData: args.value});
        this.prepareData(this.state.selectedCategory);
    }

    render() {

        var colorFuncton = d3.scaleOrdinal(this.state.colorScheme in colorMaps ?
                                        colorMaps[this.state.colorScheme]
                                        :
                                        colorMaps["accent"]);

        var options = this.state.categories.map(field=>{
            return (<option key={field} value={field}>{field}</option>);
        });

        console.log("this.preparedData", this.state.preparedData);

        const ChartComponent = ChartComponents[this.props.chartComponentIndex? this.props.chartComponentIndex:0];

        var contentElement = document.querySelector("#chart_content_"+this.props.layoutItemID);

        var seriesSetupDialog =this.state.chartSeriesSetupPanelVisible ? <SimpleDialog
                    dialogParams={this.seriesData}
                    popupVisible={true}
                    title={"Серия данных"}
                    onDialogClose={()=>{this.setState({chartSeriesSetupPanelVisible:false});}}
                    onDialogConfirm={(params)=>{

                        for(var param in params){
                            if (param != "seriesName"){
                                if (!this.state.measuresProperties[params.seriesName.value]){
                                    this.state.measuresProperties[params.seriesName.value] = {};
                                }
                                this.state.measuresProperties[params.seriesName.value][param] = params[param].value;
                            }
                        }
                        this.setState({measuresProperties: this.state.measuresProperties});
                        console.log("this.state.measuresProperties", this.state.measuresProperties);
                        this.setState({chartSeriesSetupPanelVisible:false});
                    }}
                    width={400}
                    height={400}
                />:null;
        return (
            <React.Fragment>
                {seriesSetupDialog}

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


                <div id={'content_'+this.props.layoutItemID} class="ag-theme-balham ToolbarViewContent NonDraggableAreaClassName">

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
                                            console.log("selectedIndex="+args.value);
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


                    />);
                    }}
          closeOnOutsideClick={this.onOutsideClick}
          data={this.props.data}
          >
          <div id={"chart_content_"+this.props.layoutItemID} className="chart-wrapper">
                <ChartComponent
                    id="chart777"
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
                />
          </div>
        </Drawer>



            </div>

                </div>





            </React.Fragment>
        );
  }
}
