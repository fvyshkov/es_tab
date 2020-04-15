import React from 'react';
import ColorBox from 'devextreme-react/color-box';
import { Popup } from 'devextreme-react/popup';
import { sendRequest } from './App.js';
import 'devextreme-react/text-area';
import Form, { Item } from 'devextreme-react/form';
import { FileUploader } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
import RefTextBox from './RefTextBox.js';
import Refer from './Refer.jsx';
import Reference from './Reference.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import CommentPanel from './CommentPanel.jsx';
import TestPopup from './TestPopup.jsx';
import { Button } from 'devextreme-react/button';


export default class SimpleDialog extends React.Component {
    constructor() {
        super();
        this.refdscr = {};
        this.state = {
            labelLocation: 'left',
            readOnly: false,
            showColon: true,
            popupVisible: false,
            referVisible: false,
            testPopupVisible: false,
            referFieldName: "",
            formData: {},
            //refdscr: {},
            refCode: '',
            //minColWidth: 300,
            colCount: 1
        };

        this.formData = {};


        this.componentDidMount = this.componentDidMount.bind(this);

        this.renderRef = this.renderRef.bind(this);
        this.setVal = this.setVal.bind(this);
        this.onRefButtonClick = this.onRefButtonClick.bind(this);
        this.closeReference = this.closeReference.bind(this);

        this.toolbarItems =   [
                                {
                                    widget: "dxButton",
                                    location: "after",

                                    toolbar: "bottom",


                                    options: {
                                        text: "OK",
                                        onClick: ()=> {
                                                            //а то render опять перепишет this.formData
                                                            var localFormData = Object.assign({}, this.state.formData);
                                                            this.props.onDialogClose();

                                                            var dialogParams = {};

                                                            for (var i = 0; i < this.props.dialogParams.length; i++){

                                                                var paramValue = '';
                                                                var param = this.props.dialogParams[i];
                                                                if (param.editorType==="dxCheckBox"){
                                                                    paramValue = localFormData[param.dataField] ? "1": "0";
                                                                }else{
                                                                    paramValue = localFormData[param.dataField];
                                                                }
                                                                dialogParams[param.dataField] = {type:"S", value: paramValue};

                                                            }

                                                            this.props.onDialogConfirm(dialogParams);
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

    closeReference(row) {
        if (row) {
            const currentDialogParam = this.props.dialogParams.filter(param=> param.dataField == this.state.referFieldName);
            if (currentDialogParam.length>0){
                this.state.formData[this.state.referFieldName] = row[currentDialogParam[0].parentfield];
            }
        }
        this.setState({referVisible: false, refCode: ''});
      }

     hidePopup(){
        this.props.onDialogClose();
    }

    componentDidMount(){

        this.state.formData = {};

        this.props.dialogParams.forEach(param=>{
            this.state.formData[param.dataField] = param.value;
        });

        if (this.props.width){
            this.setState({width: this.props.width});
        }
    }

    setVal(e, f) {
        this.setState(prevState => ({formData:{...prevState.formData}}), ()=>(this.state.formData[f]=e.value));
    }

    renderRef (data) {
        return (
            <RefTextBox
                value={this.state.formData[data.dataField]}
                onValueChanged={(e)=>this.setVal(e, data.dataField)}
                refdscr={this.refdscr}
                onRefButtonClick={this.onRefButtonClick}
                refCode={data.editorOptions.refCode}
                keyvalues={data.editorOptions.keyvalues}
                fieldName={data.dataField}
            />
        )
    }

    onRefButtonClick(refcode, keyvalues, fieldName) {
        var dialog = this;
        sendRequestPromise("get_ref_dscr/?ref_code="+refcode)
            .then((data)=>{

                if (data.length>0){
                    this.refdscr = data[0];
                    this.refCode = refcode;
                    this.keyvalues = keyvalues;


                    this.setState({referVisible: true, referFieldName:fieldName});
                }

            });
    }

    //onRefButtonClick

    onOk(){
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
                render={param.refCode ? this.renderRef : null}
                editorOptions={{refCode:param.refCode, keyvalues: param.keyvalues }}
            />);
        }
    });

    var referComp = this.state.referVisible ?
            <Refer
            popupVisible={this.state.referVisible}
            refCode={this.refCode}
            onRefHidden={this.closeReference}
            refdscr={this.refdscr}
            keyvalues={this.keyvalues}
            /> : null;


    return (
        <React.Fragment>

            {referComp}


            <CommentPanel
            popupVisible={this.referVisible}
            refCode={this.refCode}
            onRefHidden={this.closeReference}
            refdscr={this.refdscr}
            />



            <div id="form-demo">


            <Popup
                  visible={this.props.popupVisible}

                  onHiding={this.hidePopup.bind(this)}
                  dragEnabled={true}
                  closeOnOutsideClick={true}
                  showTitle={true}
                  title={this.props.title}

                  toolbarItems={this.toolbarItems}
                  resizeEnabled={true}
                  width={this.props.width? this.props.width: 350}
                  height={this.props.height? this.props.height: 350}
                 >




                <div className="widget-container">
                    <Form
                        onContentReady={null}
                        colCount={1}
                        formData={this.state.formData}>
                        {itemList}

                    </Form>

                </div>
            </Popup>
            </div>
        </React.Fragment>
    );
  }


}

