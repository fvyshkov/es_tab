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
import TabPanel from 'devextreme-react/tab-panel';
import Tabs from 'devextreme-react/tabs';
import { Slider } from 'devextreme-react/slider';
import ScrollView from 'devextreme-react/scroll-view';
import {ChartFormFields} from './ChartFormFields.jsx';

const colorsMap={
    "nivo" : Img_nivo,
    "accent" : Img_accent,
    "category10" : Img_category10,
    "dark2" : Img_dark2,
    "pastel1" : Img_pastel1,
    "set1" : Img_set1,
    "set2" : Img_set2
}

const colors = [ "accent", "category10", "dark2", "pastel1", "set1", "set2", "nivo"]



export class ChartControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
                        tabSelectedIndex: 0
                     };


    }



    colorRender(item){
        return (<div className="test">
                    <img
                        className="color-scheme-img"
                        src={colorsMap[item]} />
                </div>);
    }

    render() {
        console.log("this.state.legendDirectionSelected="+this.props.legendDirectionSelected);


        return(
        <div className="chart-control-panel-wrapper">
        <TabPanel
          items={["Данные", "Форматирование"]}
          loop={true}
          selectedIndex={this.props.tabSelectedIndex}
          onOptionChanged={this.props.tabSelectedIndexChanged}
          height="100%"
          itemComponent={(item)=>{
            if (item.index==0){
                return (
                    <div className="chart-control-panel-item">

                    Транспонировать <Switch
                             value={this.props.transposeData}
                             onValueChanged={this.props.transposeDataOnChange}
                             />
                         <p></p>

                    <RadioGroup
                        items={this.props.categoryItems}
                        value={this.props.categoryValue}
                        onValueChanged={this.props.categoryOnValueChanged}
                     />
                     <p></p>
                    <List
                        items={this.props.measureItems}
                        height={300}
                        allowItemDeleting={false}
                        showSelectionControls={true}
                        selectionMode={'all'}
                        selectedItems={this.props.measureSelectedItems}
                        onOptionChanged={this.props.measureOnOptionChanged}
                        />

                        </div>
                );
            }else{
                return (
                    <ChartFormFields
                        onFieldDataChanged={(params)=>{
                            this.props.onChangeChartParams(params);

                        }}
                        chartParams={this.props.chartParams}
                    />

                );

            }
          }}

        />

        </div>);



  }
}
