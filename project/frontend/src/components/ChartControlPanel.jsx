import React, { Component } from "react";
import DropdownHOC from "./DropdownHOC.jsx";
import { sendRequest } from './App.js';
import {MyResponsiveBar} from './MyResponsiveBar.jsx';
import CheckBox from 'devextreme-react/check-box';
import List from 'devextreme-react/list';
import { RadioGroup, SelectBox } from 'devextreme-react';
import { Switch } from 'devextreme-react/switch';
import Img_nivo from '../images/colors/Nivo.png';
import Img_accent from '../images/colors/Accent.png';
import Img_category10 from '../images/colors/category10.png';
import Img_dark2 from '../images/colors/Dark2.png';
import Img_pastel1 from '../images/colors/Pastel1.png';
import Img_set1 from '../images/colors/Set1.png';
import Img_set2 from '../images/colors/Set2.png';


const colorsMap={
    "nivo" : Img_nivo,
    "accent" : Img_accent,
    "category10" : Img_category10,
    "dark2" : Img_dark2,
    "pastel1" : Img_pastel1,
    "set1" : Img_set1,
    "set2" : Img_set2
}

const colors = ["nivo", "accent", "category10", "dark2", "pastel1", "set1", "set2"]

const myData =   [
    {"country":"AD", "food":"hot dog", "value": 105},
    {"country":"AD", "food":"burger", "value": 147},
    {"country":"AD", "food":"sandwich", "value": 36},

    {"country":"AE", "food":"hot dog", "value": 140},
    {"country":"AE", "food":"burger", "value": 34},
    {"country":"AE", "food":"sandwich", "value": 154},

    {"country":"AF", "food":"hot dog", "value": 10},
    {"country":"AF", "food":"burger", "value": 57},
    {"country":"AF", "food":"sandwich", "value": 199}
    ];

export class ChartControlPanel extends Component {
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
                       colorScheme: "nivo"
                     };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.prepareData = this.prepareData.bind(this);
        this.changeField = this.changeField.bind(this);
    }


    changeField(){


    }

    componentDidMount(){
        //this.prepareData();

        var measuresClone = this.state.measures.slice();
        console.log("this.state.categories[0]", this.state.categories, measuresClone);

        if (this.state.categories.length>0){

            console.log("this.state.categories[0]", this.state.categories[0], measuresClone);


            this.setState({
                selectedCategory: this.state.categories[0],
                selectedMeasures: this.state.selectedMeasures.slice()
            });


        }


    }

    prepareData(selectedCategory){

        var preparedData = [];
        var measures = [];
        var categories = [];
        //console.log("this.props", this.props);
        //return;

        this.props.data.forEach(element=>{
            if (!measures.find(el=>{return el==element['measure']})){
                measures.push(element['measure']);
            }

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


        this.props.data.forEach(element=>{
            var currentPreparedIndex = preparedData.findIndex(el=> {
                return el[selectedCategory] == element[selectedCategory];
            });

            if (currentPreparedIndex==-1){
                var newElement = {};
                newElement[selectedCategory] = element[selectedCategory];
                preparedData.push(newElement);
                currentPreparedIndex = preparedData.length-1;
            }

            console.log("element", element);
            if (!isNaN(element['value'])){
                if (preparedData[currentPreparedIndex][element['measure']]){
                    preparedData[currentPreparedIndex][element['measure']] += parseFloat(element['value']);
                }else{
                    preparedData[currentPreparedIndex][element['measure']] = parseFloat(element['value']);
                }
            }
        });


        this.setState({
                preparedData: preparedData,
                measures:measures.slice(),//measures,
                categories: categories,
                selectedCategory: selectedCategory});


        console.log("0 categories, measures", categories, measures);
        console.log("1 categories, measures", this.state.categories, this.state.measures);
    }

    onChangeCategory(e){
        //this.prepareData(e.value);
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
        console.log(args);
        if(args.name === 'selectedItems') {
            this.setState({
                selectedMeasures: args.value
            });
        }
    }

    colorRender(item){
        return (<div className="test">
                    <img
                        className="color-scheme-img"
                        src={colorsMap[item]} />
                </div>);
    }

    render() {

        var options = this.state.categories.map(field=>{
            return (<option key={field} value={field}>{field}</option>);
        });

        console.log("data", this.state.preparedData);
        console.log("measures", this.state.measures);
        console.log("indexBy", this.state.selectedCategory);
        console.log("layout", this.state.layout);
        //layout={this.state.layout}

        return (
            <div className="chart-control-panel-wrapper">

                <RadioGroup
                    items={this.props.categoryItems}
                    value={this.props.categoryValue}
                    onValueChanged={this.props.categoryOnValueChanged}
                 />
                <List
                    items={this.props.measureItems}
                    height={120}
                    allowItemDeleting={false}
                    showSelectionControls={true}
                    selectionMode="multiple"
                    selectedItems={this.props.measureSelectedItems}
                    onOptionChanged={this.props.measureOnOptionChanged}
                    />
                <RadioGroup
                    layout={"horizontal"}
                    items={["grouped","stacked"]}
                    value={this.props.groupGroupMode}
                    onValueChanged={this.props.groupOnChangeGroupMode}


                />

                <RadioGroup
                    layout={"horizontal"}
                    items={["horizontal", "vertical"]}
                    value={this.props.layout}
                    onValueChanged={this.props.layoutOnChangeLayout}
                />

                <SelectBox items={this.props.colors}
                value={this.props.colorScheme}
                onValueChanged={this.props.colorsOnValueChanged}
                itemRender={this.colorRender}
                 fieldRender={this.colorRender}

                 />



                Подписи значений <Switch
                     value={this.props.enableLabel}
                     onValueChanged={this.props.enableLabelOnValueChanged}
                     />

            </div>
        );
  }
}
