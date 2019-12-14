import React, { Component } from 'react';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import { sendRequest } from './App.js';
import { DropDownBox, TreeView } from 'devextreme-react';



export default class SheetSelectDropDown extends Component {



    constructor(props) {
        super(props);

        this.state={
                    sheetList:[],
                    rootValue: '0'
                   };


        this.dropDownBoxRef = React.createRef();

        this.componentDidMount = this.componentDidMount.bind(this);
        this.treeViewRender = this.treeViewRender.bind(this);
        this.treeView_itemSelectionChanged = this.treeView_itemSelectionChanged.bind(this);
        this.loadSheetList = this.loadSheetList.bind(this);
        this.onLoadSheetSuccess = this.onLoadSheetSuccess.bind(this);
        this.onOpened = this.onOpened.bind(this);

    }

    onOpened(component){
        this.dropDownBox = component;
    }

    render(){
        return (
            <DropDownBox
                ref={this.dropDownBoxRef}
                elementAttr={{"id": "sheet_select_dropdown"}}
                dataSource={this.state.sheetList}
                value={this.state.treeBoxValue}
                valueExpr={'id'}
                keyExpr={'id'}
                rootValue={this.state.rootValue}
                displayExpr={'label'}
                virtualModeEnabled={true}
                dataStructure={'plain'}
                parentIdExpr ={'parent_id'}
                placeholder={'Выбор листа для отображения'}
                contentRender={this.treeViewRender}
                onOpened={this.onOpened}
                width={"100%"}

            />

         );
   }

    componentDidMount() {
        this.loadSheetList();
    }

    onLoadSheetSuccess(respObj, compInstance){
        this.setState({sheetList:respObj});
    }

    loadSheetList(){
        sendRequest('sheet_list/', this.onLoadSheetSuccess);
    }

   treeViewRender() {
        return (
            <div className="SheetTree">
                <TreeView
                    dataSource={this.state.sheetList}
                    keyExpr={'id'}
                    selectionMode={'single'}
                    virtualModeEnabled={false}
                    dataStructure={'plain'}
                    parentIdExpr ={'parent_id'}
                    valueExpr={'id'}
                    rootValue={this.state.rootValue}
                    displayExpr={'label'}
                    itemsExpr={'children'}
                    selectByClick={true}
                    onItemSelectionChanged={this.treeView_itemSelectionChanged}
                    searchEnabled={true}
                    searchExpr = {["label"]}
                    width={400}
                />
            </div>
        );
  }

    treeView_itemSelectionChanged(e) {

        this.setState({
            treeBoxValue: e.itemData.id
            });
        this.dropDownBoxRef.current.instance.close();
        this.props.onSelectNewSheet(e.itemData.id, e.itemData.sheet_type);

    }



}
