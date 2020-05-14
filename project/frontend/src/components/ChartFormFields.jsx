import React, { Component } from 'react';
import Form, { Item } from 'devextreme-react/form';
import {chartTypes, strokeDasharrayList} from './BarChartPanel.jsx';
import { Template } from 'devextreme-react/core/template';
import { TextBox } from 'devextreme-react';

const selectBoxItemRender = function(data) {
         return (

                <div className="custom-item">
                  <img width="30" height="30" src={data && data.img} />
                  <TextBox className="product-name"
                    defaultValue={data && data.name}
                    readOnly={true} />
                </div>

         );
    }

export class ChartFormFields extends Component {
    constructor(props) {
        super(props);
        this.state = {
                        formData:{
                            ...props.chartParams
                            },
                        key:0
                     };
    }



    componentDidMount(){
        if (this.props.sendDataRequest){
            this.props.sendDataRequest(this.sendData.bind(this));
        }
    }

    sendData(){
        if (this.props.sendData){
            this.props.sendData(this.state.formData);
        }
    }

    chartTypeRender(item){
        console.log("chartTypeRender", item);
        return (<h1>{item? item.name: null}</h1>);
    }

    render() {

        var itemList = this.formParams? this.formParams.map((param)=>{
                return (<Item
                    key={param.dataField}
                    dataField={param.dataField}
                    label={{ text:param.label}}
                    editorType={param.editorType}
                    render={param.refCode ? this.renderRef : null}
                    editorOptions={{refCode:param.refCode, keyvalues: param.keyvalues, ...param.editorOptions }}
                    visible={param.visible}
                />);
        }):[];

        var chartTypesFiltered = chartTypes;

        if (this.props.chartParams.seriesName){
            if (this.props.chartParams.chartType=="Pie"){
                chartTypesFiltered = chartTypesFiltered.filter((chartTypeItem)=>{
                    return chartTypeItem.code=="Pie"
                });
            }else{
                chartTypesFiltered = chartTypesFiltered.filter((chartTypeItem)=>{
                    return chartTypeItem.code!="Pie"
                });

            }
        }

        return (
            <React.Fragment>

                    <div className="widget-container">
                        <Form
                            key={this.state.key}
                            labelLocation="top"
                            onContentReady={null}
                            colCount={1}
                            formData={this.state.formData}
                            onFieldDataChanged={this.props.onFieldDataChanged}
                            >

                           <Item
                            dataField="seriesName"
                            label={{text:"Наименование серии"}}
                            visible={this.props.chartParams.seriesName? true:false}
                          />
                           <Item
                            dataField="chartType"
                            label={{text:"Тип диаграммы"}}
                            editorType= "dxSelectBox"
                            visible={true}
                            editorOptions={ {
                                items: chartTypesFiltered,
                                itemTemplate: "myItemTemplate" ,
                                fieldTemplate: "myItemTemplate" ,
                                valueExpr:"code",
                                onValueChanged: (e) => {
                                    this.setState({
                                        chartType: e.component.option('value'),
                                    });
                                }
                            }
                            }
                          />

                        <Item
                            dataField="smoothLine"
                            label={{text:"Сглаживание"}}
                            editorType= "dxSlider"
                            editorOptions={ { min:0, max:.5, step:.05}}
                            visible={ ["Line", "Area"].includes(this.state.formData.chartType)}

                          />

                          <Item
                            dataField="strokeWidth"
                            label={{text:"Толщина линии"}}
                            editorType= "dxSlider"
                            editorOptions={ { min:1, max:10, step:1}}
                            visible={ ["Line", "Area", "Bar"].includes(this.state.formData.chartType)}

                          />

                          <Item
                            dataField="strokeDasharray"
                            label={{text:"Стиль линии"}}
                            editorType= "dxSelectBox"
                            editorOptions={ {
                                items: strokeDasharrayList
                            }
                            }
                            visible={ ["Line", "Area"].includes(this.state.formData.chartType)}
                          />

                            <Item
                            dataField="fillOpacity"
                            label={{text:"Плотность заливки"}}
                            editorType= "dxSlider"
                            editorOptions={ { min:0, max:1, step:.1}}
                            visible={ ["Bar", "Area", "Pie"].includes(this.state.formData.chartType)}

                          />

                          <Item
                            dataField="showLinearTrend"
                            label={{text:"Линейный тренд"}}
                            editorType= "dxCheckBox"
                            visible={ this.state.formData.chartType!="Pie" }

                          />

                          <Item
                            dataField="additionalAxis"
                            label={{text:"Вспомогательная ось"}}
                            editorType= "dxCheckBox"
                            visible={ this.state.formData.chartType!="Pie" }

                          />

                          <Item
                            dataField="stacked"
                            label={{text:"С накоплением"}}
                            editorType= "dxCheckBox"
                            visible={ this.state.formData.chartType!="Pie" }

                          />

                         <Item
                            dataField="showPercent"
                            label={{text:" Номинированные значения"}}
                            editorType= "dxCheckBox"
                            visible={ this.state.formData.chartType!="Pie" }

                          />

                          <Item
                            dataField="invertedAxis"
                            label={{text:"Значения по горизонтали"}}
                            editorType= "dxCheckBox"
                            visible={ this.state.formData.chartType!="Pie" }

                          />



                            <Template name='myItemTemplate' render={selectBoxItemRender} />

                        </Form>
                </div>
            </React.Fragment>
        );
    }


}
