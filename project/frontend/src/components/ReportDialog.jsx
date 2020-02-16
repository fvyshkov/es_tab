import React from 'react';
import ColorBox from 'devextreme-react/color-box';
import { Popup } from 'devextreme-react/popup';
import { sendRequest } from './App.js';
import 'devextreme-react/text-area';
import Form, { Item } from 'devextreme-react/form';
import { FileUploader } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
import { getReport } from './getReport.js';


export default class ReportDialog extends React.Component {
    constructor() {
        super();
        this.state = {
            labelLocation: 'left',
            readOnly: false,
            showColon: true,
            //minColWidth: 300,
            colCount: 1,
            width: 200
        };

        this.formData = {};

        this.toolbarItems =   [
                                {
                                    widget: "dxButton",
                                    location: "after",

                                    toolbar: "bottom",


                                    options: {
                                        text: "Отчет",
                                        onClick: ()=> {
                                                            //а то render опять перепишет this.formData
                                                            var localFormData = Object.assign({}, this.formData);
                                                            this.props.onDialogClose();

                                                            var repParams = {};

                                                            for (var i = 0; i < this.props.dialogParams.length; i++){

                                                                var paramValue = '';
                                                                var param = this.props.dialogParams[i];
                                                                if (param.editorType==="dxCheckBox"){
                                                                    paramValue = localFormData[param.dataField] ? "1": "0";
                                                                }else{
                                                                    paramValue = localFormData[param.dataField];
                                                                }
                                                                repParams[param.dataField] = {type:"S", value: paramValue};

                                                            }

                                                            getReport(this.props.reportCode, repParams);
                                                       }
                                    }
                                },
                                {
                                    widget: "dxButton",
                                    location: "after",

                                    toolbar: "bottom",


                                    options: {
                                        text: "Отмена",
                                        onClick: ()=> this.props.onDialogClose()
                                    }
                                }
                            ];
    }

     hidePopup(){
        this.props.onDialogClose();
    }

  render() {
    const {
      labelLocation,
      readOnly,
      showColon,
      minColWidth,
      colCount,
      company,
      width
    } = this.state;




    var itemList = this.props.dialogParams.map((param)=>{
        if (param.visible){
            return (<Item
                key={param.dataField}
                dataField={param.dataField}
                label={{ text:param.label}}
                editorType={param.editorType}
            />);
        }
    });

    this.formData = {};

    this.props.dialogParams.forEach(param=>{
        this.formData[param.dataField] = param.value;
    });


    return (
            <div id="form-demo">
            <Popup
                  visible={this.props.popupVisible}

                  onHiding={this.hidePopup.bind(this)}
                  dragEnabled={true}
                  closeOnOutsideClick={true}
                  showTitle={true}
                  title={this.props.reportTitle}

                  toolbarItems={this.toolbarItems}
                  resizeEnabled={true}
                  width={350}
                  height={300}
                 >

                <div className="widget-container">
                    <Form
                        onContentReady={null}
                        colCount={1}
                        id="form11"
                        formData={this.formData}>
                        {itemList}
                    </Form>
                </div>
            </Popup>
            </div>
    );
  }


}

