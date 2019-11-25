import React, { Component } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import notify from 'devextreme/ui/notify';
import { sendGetRequest } from './App.js';
import { DropDownBox, TreeView } from 'devextreme-react';


class SheetToolbar extends Component {



    constructor(props) {
        super(props);

        this.state={
                    sheetList:[]
                   };


        this.dropDownBoxRef = React.createRef();

        this.sheetSelectRender = this.sheetSelectRender.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.treeViewRender = this.treeViewRender.bind(this);
        this.treeView_itemSelectionChanged = this.treeView_itemSelectionChanged.bind(this);
        this.sheetSelectRender = this.sheetSelectRender.bind(this);
        this.loadSheetList = this.loadSheetList.bind(this);
        this.onLoadSheetSuccess = this.onLoadSheetSuccess.bind(this);
        this.onOpened = this.onOpened.bind(this);






    }




    onOpened(component){
        console.log('onOpened');
        this.dropDownBox = component;
    }
    sheetSelectRender(){
        return (
            <DropDownBox
                ref={this.dropDownBoxRef}
                dataSource={this.state.sheetList}
                value={this.state.treeBoxValue}
                valueExpr={'id'}
                keyExpr={'id'}
                rootValue={0}
                displayExpr={'label'}
                virtualModeEnabled={true}
                dataStructure={'plain'}
                parentIdExpr ={'parent_id'}
                placeholder={'Выбор листа для отображения'}
                contentRender={this.treeViewRender}
                onOpened={this.onOpened}
                width={500}

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
        sendGetRequest('sheet_list/', this.onLoadSheetSuccess);
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
                    rootValue={'0'}
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
            treeBoxValue: e.component.getSelectedNodesKeys()
            });
        this.dropDownBoxRef.current.instance.close();
        this.props.onSelectNewSheet(e.component.getSelectedNodesKeys(),e.itemData.sheet_type);

    }


    refreshButtonOptions = {
        icon: 'refresh',
        onClick: (e) => {
                        this.props.onRefreshCallback();
                        }
    }

    saveButtonOptions = {
        icon: 'save',
        onClick: () => {
            this.props.onSaveCallback();
            notify('Save button has been clicked!');
        }
    }

    render(){
        return (

       <Toolbar>
            <Item location={'before'}
            locateInMenu={'never'}
            render={this.sheetSelectRender} />
            <Item location={'after'}
            widget={'dxButton'}
            options={this.saveButtonOptions} />
            <Item location={'after'}
            widget={'dxButton'}
            options={this.refreshButtonOptions} />
        </Toolbar>

         );
    }

}

export default SheetToolbar;
