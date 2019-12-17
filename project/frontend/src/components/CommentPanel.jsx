import React from 'react';
import ColorBox from 'devextreme-react/color-box';
import { Popup } from 'devextreme-react/popup';
import { sendRequest } from './App.js';
import 'devextreme-react/text-area';
import Form, { Item } from 'devextreme-react/form';
import { FileUploader } from 'devextreme-react';

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
          width={600}
          height={600}
          toolbarItems={this.toolbarItems}
         >


        <div className="form-container">
          <Form
            onContentReady={null}
            colCount={2}
            id="form"
            formData={this.employee}>

            <Item itemType="group" caption="Лист планирования" >
                <Item dataField="Книга" label={{text:"", visible: false}} editorOptions={{ disabled: true }} />
                <Item dataField="Аналитики" label={{ text:"Аналитики", location:"top", showColon:false}} editorType="dxTextArea" editorOptions={{ height: 90,  disabled: true }} />
                <Item dataField="Текст комментария" label={{text:"", location:"top", showColon:false}}  editorType="dxTextArea" editorOptions={{ height: 90 }} />
            </Item>
            <Item itemType="group" caption=" Файлы" >
                  <FileUploader
                    multiple={true}
                    uploadMode="useButtons"
                    uploadUrl="https://js.devexpress.com/Content/Services/upload.aspx"
                  />

            </Item>

          </Form>
        </div>


      </Popup>
      </React.Fragment>
    );
  }
}


