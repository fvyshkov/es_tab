import React, { Component } from 'react';
import Form, { Item } from 'devextreme-react/form';


export class ChartFormFields extends Component {
    constructor(props) {
        super(props);
        this.state = {
                        formData:{
                            seriesName: props.seriesName,
                            ...props.chartParams
                            /*
                            chartType: this.props.chartParams.chartType,
                            smoothLine: this.props.chartParams.smoothLine
                            */
                            },
                        key:0
                     };
        //for (this.props.cha)
    }


    render() {
        const chartTypeList = ["Bar", "Line", "Area", "Dots", "Pie"] ;
        console.log(" form render ", this.props.chartParams.chartType);

        var itemList = this.formParams? this.formParams.map((param)=>{
                console.log("itemDatafield", param.dataField);
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
                            visible={this.props.seriesName? true:false}
                          />
                           <Item
                            dataField="chartType"
                            label={{text:"Тип диаграммы"}}
                            editorType= "dxSelectBox"
                            visible={true}
                            editorOptions={ {
                                items: chartTypeList,
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
                            value={ this.state.additionalAxis }
                            visible={ this.state.formData.chartType!="Pie" }

                          />

                          <Item
                            dataField="stacked"
                            label={{text:"С накоплением"}}
                            editorType= "dxCheckBox"
                            value={ this.state.stacked }
                            visible={ this.state.formData.chartType!="Pie" }

                          />



                        </Form>
                </div>
            </React.Fragment>
        );
    }
}
