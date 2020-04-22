import React from 'react';
import DataGrid, { Column, Selection, Scrolling, Sorting} from 'devextreme-react/data-grid';
import {getRefData, getRefDscr} from './refdata.js';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';


class Reference extends React.Component {
    constructor(props) {
      super(props);
      this.data = this.props.data;//getRefData(this.props.refCode);
      this.onRefHidden = this.onRefHidden.bind(this);
      this.onSelectionChanged = this.onSelectionChanged.bind(this);
      this.onOk = this.onOk.bind(this);
      this.row = null;

      this.selectedRows = [];
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
        this.selectedRows = sel.selectedRowsData;
    }

    onDeleteItem(){
        this.props.onDeleteItem(this.selectedRows);
    }

    onOk(e) {
        this.props.onRefHidden(this.row);
    }

    onRowDblClick(e){
        this.onOk();
    }

    render () {
      console.log('ref render ' + this.props.refCode);
      this.data = this.props.data;//getRefData(this.props.refCode);
      let refdscr = this.props.refdscr;//getRefDscr(this.props.refCode)
      if (!this.row && this.data.length>0){
        this.row = this.data[0];
      }
      let columns = refdscr ? refdscr.columns : [];

      var toolbarAdd = this.props.toolbarAdd ? this.props.toolbarAdd.map(button=>{
        return <Button
                    text={button.text}
                    icon= {button.icon}
                    hint= {button.hint}
                    type = "normal"
                    onClick= {()=>button.onClick(this.selectedRows)}
                />
      }): null;


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
            <DataGrid
              id="gridContainer"
              dataSource={this.data}
              keyExpr={this.props.keyField}
              defaultSelectedRowKeys={[1]}
              showBorders={true}
              height={250}
              noDataText={"Нет данных"}
              onSelectionChanged={this.onSelectionChanged}
              onRowDblClick={this.onRowDblClick.bind(this)}


            >
              <Selection mode="multiple" showCheckBoxesMode="none" />
              {columns.map((column) =>
                    <Column key={column.field}
                    dataField={column.field}
                    caption={column.caption}
                    dataType={column.dataType}
                     />)}
              <Sorting mode="none" />
              <Scrolling mode="virtual" />
            </DataGrid>
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
              {this.props.onDeleteItem ? (
                <Button
                    text = ""
                    icon="clear"
                    hint="Удалить выбранные записи"
                    type = "normal"
                    onClick={this.onDeleteItem.bind(this)}
                />
                ) : null
              }
              {toolbarAdd}

            </div>
      </Popup>
      );
    };
};

export default Reference;
