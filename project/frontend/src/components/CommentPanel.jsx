import React from 'react';
import ColorBox from 'devextreme-react/color-box';
import { Popup } from 'devextreme-react/popup';
import { sendRequest } from './App.js';

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
        this.props.sendCommentPanelClose();
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
          height={500}
          toolbarItems={this.toolbarItems}
         >


        <div className="form-container">
          <Form
            onContentReady={this.validateForm}
            colCount={2}
            id="form"
            formData={this.employee}>

<Item itemType="group" caption="System Information" >
            <Item dataField="FirstName" editorOptions={{ disabled: true }} />
            <Item dataField="Position" editorType="dxSelectBox" editorOptions={{ items: this.positions, value: '' }} validationRules={this.validationRules.position} />
            <Item dataField="LastName" editorOptions={{ disabled: true }} />
            </Item>
<Item itemType="group" caption=" Файлы" >
123123123
</Item>
<Item itemType="group" caption="Комментарий" >
            <Item dataField="HireDate" editorType="dxDateBox" editorOptions={{ width: '100%', value: null }} validationRules={this.validationRules.hireDate} />
            <Item dataField="BirthDate" editorType="dxDateBox" editorOptions={{ width: '100%', disabled: true }} />
            <Item dataField="Address" />
            <Item dataField="Notes" colSpan={2} editorType="dxTextArea" editorOptions={{ height: 90 }} />
            <Item dataField="Phone" editorOptions={{ mask: '+1 (X00) 000-0000', maskRules: this.rules }} />
            <Item dataField="Email" />
</Item>
          </Form>
        </div>


      </Popup>
      </React.Fragment>
    );
  }
}


