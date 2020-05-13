import React, { Component } from 'react';
import Form, { Item } from 'devextreme-react/form';


export class ChartFormFields extends Component {
    constructor(props) {
        super(props);
        this.state = {
                        seriesType: this.props.seriesType,
                        formData:{
                            seriesName: this.props.seriesName,
                            seriesType: this.props.chartParams.chartType
                            },
                        key:0
                     };

    }


    render() {
        const seriesTypeList = ["Bar", "Line", "Area", "Dots", "Pie"] ;
        console.log("render form ", this.props.seriesName);
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
                            value= {this.props.seriesName}
                            visible={this.props.seriesName? true:false}
                          />
                           <Item
                            dataField="seriesType"
                            label={{text:"Тип диаграммы"}}
                            editorType= "dxSelectBox"
                            value= {this.state.seriesType}
                            visible={true}
                            editorOptions={ {
                                items: seriesTypeList,
                                onValueChanged: (e) => {
                                    this.setState({
                                        seriesType: e.component.option('value'),
                                    });
                                }
                            }
                            }
                          />

                        <Item
                            dataField="smoothLine"
                            label={{text:"Сглаживание"}}
                            editorType= "dxSlider"
                            editorOptions={ { min:0, max:1, step:.1}}
                            value={ this.state.smoothLine }
                            visible={ ["Line", "Area"].includes(this.state.seriesType)}

                          />

                            <Item
                            dataField="fillOpacity"
                            label={{text:"Плотность заливки"}}
                            editorType= "dxSlider"
                            editorOptions={ { min:0, max:1, step:.1}}
                            value={ this.state.fillOpacity}
                            visible={ ["Bar", "Area", "Pie"].includes(this.state.seriesType)}

                          />

                          <Item
                            dataField="showLinearTrend"
                            label={{text:"Линейный тренд"}}
                            editorType= "dxCheckBox"
                            value={ this.state.showLinearTrend }
                            visible={ this.state.seriesType!="Pie" }

                          />

                          <Item
                            dataField="additionalAxis"
                            label={{text:"Вспомогательная ось"}}
                            editorType= "dxCheckBox"
                            value={ this.state.additionalAxis }
                            visible={ this.state.seriesType!="Pie" }

                          />



                        </Form>
                </div>
            </React.Fragment>
        );
    }
}
