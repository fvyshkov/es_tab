import React, { Component } from "react";
import DropdownHOC from "./DropdownHOC.jsx";
import { sendRequest } from './App.js';
import {MyResponsiveBar} from './MyResponsiveBar.jsx';


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
                       keys:[],
                       fields:[],
                       key:0
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
        var keys = [];
        var fields = [];
        myData.forEach(element=>{
            var currentPreparedIndex = preparedData.findIndex(el=> {
                return el[xFieldName] == element[xFieldName];
            });

            if (currentPreparedIndex==-1){
                var newElement = {};
                newElement[xFieldName] = element[xFieldName];
                preparedData.push(newElement);
                currentPreparedIndex = preparedData.length-1;
            }
            for (var key in element){
                if (key!=xFieldName && key!="value"){
                    preparedData[currentPreparedIndex][element[key]] = element["value"];
                    if (!keys.find(el=>{return el==element[key]})){
                        keys.push(element[key]);
                    }
                }

                if (!fields.find(el=>{return el==key}) && key!="value"){
                        fields.push(key);
                }


            }
        });
        this.setState({
                preparedData: preparedData,
                keys:keys,
                fields: fields,
                xFieldName: xFieldName});



    }

    onChangeField(){


        this.prepareData(event.target.value);


    }

    render() {

        var options = this.state.fields.map(field=>{
            return (<option key={field} value={field}>{field}</option>);
        });

        //console.log("opt", this.state.fields);


        console.log("data", this.state.preparedData);
        console.log("keys", this.state.keys);
        console.log("indexBy", this.state.xFieldName);

        return (
            <div style={{height:500, width: 800}} key={this.state.key}>

                <MyResponsiveBar
                    data={this.state.preparedData}
                    keys={this.state.keys}
                    indexBy={this.state.xFieldName}
                />
                <select onChange={this.onChangeField.bind(this)} value={this.state.xFieldName}>
                  {options}
                </select>
                <button onClick={this.changeField.bind(this)}> Activate Lasers</button>
                {this.state.xFieldName}


            </div>
        );
  }
}
