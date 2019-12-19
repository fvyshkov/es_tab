import React from 'react';
import ColorBox from 'devextreme-react/color-box';
import { Popup } from 'devextreme-react/popup';
import { sendRequest } from './App.js';
import 'devextreme-react/text-area';
import Form, { Item } from 'devextreme-react/form';
import { FileUploader } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';


export default class CommentPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
                    popupVisible: this.props.popupVisible
                };

     this.toolbarItems =   [
                                {
                                    widget: "dxButton",
                                    location: "after",
                                    options: {
                                        icon: "save",
                                        onClick: this.props.saveData
                                    }
                                }
                            ];
  }




    hidePopup(){
        this.props.sendItemPanelClose();
    }






  render() {
    return (
      <React.Fragment>
      <Popup
          visible={this.props.popupVisible}
          onHiding={this.hidePopup.bind(this)}
          dragEnabled={true}
          closeOnOutsideClick={true}
          showTitle={true}
          title="Комментарий по значению"


          toolbarItems={this.toolbarItems}
          resizeEnabled={true}
         >


        <div className="form-container">
          <Form
            onContentReady={null}
            colCount={2}
            id="form"
            formData={this.props.commentData}>

            <Item itemType="group" caption="Лист планирования" >
                <Item dataField="sheet_name" label={{text:"", visible: false}} editorOptions={{ disabled: true }} />
                <Item dataField="flt_dsrc" label={{ text:"Аналитики", location:"top", showColon:false}} editorType="dxTextArea" editorOptions={{ height: 90,  disabled: true }} />
            </Item>
            <Item itemType="group" caption="Файлы" >
                      <FileUploader
                        multiple={true}
                        uploadMode="useButtons"
                        uploadUrl="/upload_file/"
                        value={this.props.commentData.fileList}
                        onValueChanged={this.props.onFileValueChanged}
                      />

            </Item>
            <Item itemType="group" caption="Комментарий" colSpan={2} >
                <Item dataField="prim" label={{visible:false , location:"top", showColon:false}}  editorType="dxTextArea" editorOptions={{ height: 90 }} />
            </Item>


          </Form>
        </div>


      </Popup>
      </React.Fragment>
    );
  }
}


