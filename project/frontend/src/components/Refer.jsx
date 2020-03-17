import React from 'react';
import RefGrid from './RefGrid.jsx';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
//import service from './refdata.js';

export default class Refer extends React.Component {
    constructor(props) {
      super(props);
      this.onRefHidden = this.onRefHidden.bind(this);
      this.onSelectionChanged = this.onSelectionChanged.bind(this);
      this.onOk = this.onOk.bind(this);
      this.row = null;
     // this.refdscr = this.props.refdscr;//service.getRefDscr(this.props.refCode);
    };

    onRefHidden() {
      this.props.onRefHidden();
    }

    onSelectionChanged(data) {
      this.row = data;
    }

    onOk(e) {
      this.props.onRefHidden(this.row);
    }

    render () {
      return(
      <Popup
        visible={this.props.popupVisible}
        closeOnOutsideClick={true}
        showTitle={true}
        title={this.props.refdscr.title}
        width={600}
        height={370}
        onHidden={this.onRefHidden}
        resizeEnabled={true}
      >
        <RefGrid
          refCode = {this.props.refCode}
          keyvalues={this.props.keyvalues}
          refdscr={this.props.refdscr}
          selectionChanged = {this.onSelectionChanged}
        />
        <div>
          <Button
            text = "Выбрать"
            type = "default"
            onClick = {this.onOk}
          />
          <Button
            text = "Закрыть"
            type = "success"
            onClick = {this.onRefHidden}
          />
        </div>
      </Popup>
      );
    };
};


