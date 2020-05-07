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
        console.log("this.state.tabSelectedIndex="+this.props.tabSelectedIndex);
        return(
        <div className="chart-control-panel-wrapper">
        <TabPanel
          items={["Данные", "Форматирование"]}
          loop={true}
          selectedIndex={this.props.tabSelectedIndex}
          onOptionChanged={this.props.tabSelectedIndexChanged}
          itemComponent={(item)=>{
            if (item.index==0){
                return (
                    <div className="chart-control-panel-item">

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

                        </div>
                );
            }else{
                return (
                    <div className="chart-control-panel-item">
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

                        <p></p>

                        <SelectBox items={colors}
                        value={this.props.colorScheme}
                        onValueChanged={this.props.colorsOnValueChanged}
                        itemRender={this.colorRender}
                         fieldRender={this.colorRender}

                         />


                        <p></p>
                        Подписи значений <Switch
                             value={this.props.enableLabel}
                             onValueChanged={this.props.enableLabelOnValueChanged}
                             />

                <Tabs
                        items={this.props.legendDirection}
                        selectedItemKeys={this.props.legendDirectionSelected}
                        onOptionChanged={this.props.legendDirectionOnChange}
                      />
                             </div>
                );
            }
          }}

        />

        </div>);


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

                <SelectBox items={colors}
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
