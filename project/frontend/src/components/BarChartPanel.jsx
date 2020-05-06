import React, { Component } from "react";
import DropdownHOC from "./DropdownHOC.jsx";
import { sendRequest } from './App.js';
import {MyResponsiveBar} from './MyResponsiveBar.jsx';
import CheckBox from 'devextreme-react/check-box';
import List from 'devextreme-react/list';
import { RadioGroup } from 'devextreme-react';

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

export class BarChartPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
                       xFieldName:"country",
                       preparedData:[],
                       measures:[],
                       categories:[],
                       groupMode:"grouped",
                       selectedMeasures:[]
                     };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.prepareData = this.prepareData.bind(this);
        this.changeField = this.changeField.bind(this);
    }


    changeField(){


    }

    componentDidMount(){
        this.prepareData();
    }

    prepareData(xFieldName){

        var preparedData = [];
        var measures = [];
        var categories = [];

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
                return el[xFieldName] == element[xFieldName];
            });

            if (currentPreparedIndex==-1){
                var newElement = {};
                newElement[xFieldName] = element[xFieldName];
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
            console.log("preparedData[currentPreparedIndex]", preparedData[currentPreparedIndex]);

            /*measures.forEach(measure=>{

            });*/
        });


        this.setState({
                preparedData: preparedData,
                measures:measures,
                categories: categories,
                xFieldName: xFieldName});



    }

    onChangeCategory(e){
        this.prepareData(e.value);
    }

    onChangeGroupMode(e){
        this.setState({
            groupMode: e.value
        });

        //this.setState({groupMode: event.target.value});
    }

    onSelectedMeasuresChange(args){
        console.log(args);
        if(args.name === 'selectedItems') {
            this.setState({
                selectedMeasures: args.value
            });
        }
    }

    render() {

        var options = this.state.categories.map(field=>{
            return (<option key={field} value={field}>{field}</option>);
        });

        //console.log("opt", this.state.categories);


        console.log("data", this.state.preparedData);
        console.log("measures", this.state.measures);
        console.log("indexBy", this.state.xFieldName);

        return (
            <div className="chart-wrapper">

                <MyResponsiveBar
                    data={this.state.preparedData}
                    keys={this.state.selectedMeasures}
                    indexBy={this.state.xFieldName}
                    groupMode={this.state.groupMode}
                />
                <p>
                <RadioGroup
                    items={this.state.categories}
                    value={this.state.xFieldName}
                    onValueChanged={this.onChangeCategory.bind(this)}
                 />

                 <RadioGroup
                    items={["grouped", "stacked"]}
                    value={this.state.groupMode}
                    onValueChanged={this.onChangeGroupMode.bind(this)}
                 />

                <select onChange={this.onChangeCategory.bind(this)} value={this.state.xFieldName}>
                  {options}
                </select>
                </p>

                <select onChange={this.onChangeGroupMode.bind(this)} value={this.state.groupMode}>
                  <option key="stacked" value="stacked">stacked</option>
                  <option key="grouped" value="grouped">grouped</option>
                </select>

                <List
                    items={this.state.measures}
                    height={200}
                    allowItemDeleting={false}
                    showSelectionControls={true}
                    selectionMode="multiple"
                    selectedItems={this.state.selectedMeasures}
                    onOptionChanged={this.onSelectedMeasuresChange.bind(this)}>
                  </List>


            </div>
        );
  }
}
