import React from 'react';
//import DataGrid, { Column, Selection, Scrolling, Sorting} from 'devextreme-react/data-grid';
import {getRefData, getRefDscr} from './refdata.js';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import TreeList, { Column, ColumnChooser, HeaderFilter, SearchPanel, Selection, Lookup } from 'devextreme-react/tree-list';


export default class TreeReference extends React.Component {
    constructor(props) {
      super(props);
      this.data = this.props.data;//getRefData(this.props.refCode);
      this.onRefHidden = this.onRefHidden.bind(this);
      this.onSelectionChanged = this.onSelectionChanged.bind(this);
      this.onOk = this.onOk.bind(this);
      this.row = null
    };

    componentDidMount() {
      console.log('ref mount');
    }

    componentWillUnmount() {
      console.log('ref unmount');
    }

    onRefHidden() {
      console.log('ref hidden');
      this.props.onRefHidden();
    }

    onSelectionChanged(sel) {
      console.log('SelectionChanged');
      const data = sel.selectedRowsData[0];
      this.row = data;
    }

    onOk(e) {
      console.log('ok pressed')
      this.props.onRefHidden(this.row, this.props.refCode);
    }

    render () {
      console.log('ref render 0');
      console.log('ref render ' + this.props.refCode);
      this.data = this.props.data;//getRefData(this.props.refCode);
      let refdscr = this.props.refdscr;//getRefDscr(this.props.refCode)
      let columns = refdscr ? refdscr.columns : [];



      return(
      <Popup
        visible={true}
        closeOnOutsideClick={true}
        showTitle={true}
        title={refdscr.title}
        width={500}
        height={370}
        onHidden={this.onRefHidden}
        resizeEnabled={true}
      >
            <TreeList
              id="gridContainer"
              dataSource={this.data}
              keyExpr={this.props.keyField}
              defaultSelectedRowKeys={[1]}
              showBorders={true}
              height={250}
              onSelectionChanged={this.onSelectionChanged}
            >
              <Selection mode="single" />
              {columns.map((column) => <Column key={column.field} dataField={column.field} caption={column.caption} />)}
            </TreeList>
            <div>
              <Button
                text = "Выбрать"
                type = "default"
                onClick = {this.onOk}
              />
              <Button
                text = "Закрыть"
                type = "success"
              />
            </div>
      </Popup>
      );
    };
};


