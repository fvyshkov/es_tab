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
                    <List
                        items={this.props.measureItems}
                        height={300}
                        allowItemDeleting={false}
                        showSelectionControls={true}
                        selectionMode="multiple"
                        selectedItems={this.props.measureSelectedItems}
                        onOptionChanged={this.props.measureOnOptionChanged}
                        />

                        </div>
                );
            }else{
                console.log("this.props.chartParams", this.props.chartParams);
                return (

                    <ChartFormFields
                        onFieldDataChanged={(params)=>{
                            console.log('ChartFormFields', params);
                            this.props.onChangeChartParams(params);

                        }}
                        chartParams={this.props.chartParams}
                    />

                );
                //
                return (

                <ScrollView id="scrollview"
                      showScrollbar={"onScroll"}
                      >
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

                             <p></p>
                        Легенда <Switch
                             value={this.props.legendEnabled}
                             onValueChanged={this.props.legendEnabledOnChanged}
                             />
                            <p></p>Положение
                               <SelectBox
                                items={["top-left",
                                        "top",
                                        "top-right",
                                        "left",
                                        "center",
                                        "right",
                                        "bottom-left",
                                        "bottom",
                                        "bottom-right"

                                        ]}
                                value={this.props.legendPosition}
                                onValueChanged={this.props.legendPositionOnChanged}
                                 />

                             <p></p>Смещение по X
                              <Slider
                                min={-200}
                                max={200}
                                value={this.props.legendXOffset}
                                onValueChanged={this.props.legendXOffsetOnChanged}
                                step={1}
                                tooltip={{ enabled: true }}
                                 />

                              <p></p>Смещение по Y
                              <Slider
                                min={-200}
                                max={200}
                                value={this.props.legendYOffset}
                                onValueChanged={this.props.legendYOffsetOnChanged}
                                step={1}
                                tooltip={{ enabled: true }}
                                 />

                <p></p>
                Ориентация
                <Tabs
                        items={this.props.legendDirection}
                        selectedItemKeys={this.props.legendDirectionSelected}
                        onOptionChanged={this.props.legendDirectionOnChange}
                      />


                    </div>
                </ScrollView>

                );
            }
          }}

        />

        </div>);



  }
}
