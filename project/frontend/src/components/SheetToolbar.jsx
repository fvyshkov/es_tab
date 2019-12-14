import React, { Component } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import notify from 'devextreme/ui/notify';
import { sendRequest } from './App.js';
import { DropDownBox, TreeView } from 'devextreme-react';
import ColorPanel from './ColorPanel.jsx';
import './index.css';


class SheetToolbar extends Component {

    constructor(props) {
        super(props);

        this.state={
                    colorPanelVisible:false,
                   };

    }


    refreshButtonOptions = {
        icon: 'refresh',
        onClick: (e) => {
            this.props.onRefreshCallback();
        }
    }

    insertButtonOptions = {
        icon: 'plus',
        onClick: (e) => {
            console.log('insertButtonOptions.onClick');
            this.props.onInsertCallback();
        }
    }

    deleteButtonOptions = {
        icon: 'minus',
        onClick: (e) => {
            this.props.onDeleteCallback();
        }
    }


    closeButtonOptions = {
        icon: 'close',
        onClick: (e) => {
            this.props.onCloseCallback();
        }
    }

    saveButtonOptions = {
        icon: 'save',
        onClick: () => {
            this.props.onSaveCallback();
        }
    }

    colorButtonOptions = {
        icon: 'palette',
        onClick: () => {
            this.props.onPreferencesCallback();
        }
    }



    render(){
        return (
            <React.Fragment>
                <Toolbar>
                    <Item location={'before'}
                    widget={'dxButton'}
                    options={
                            {icon: 'plus',
                            onClick: (e) => {this.props.onInsertCallback();}}
                    }/>
                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.deleteButtonOptions} />

                    <Item location={'before'}
                    widget={'dxButton'}
                    options={{
                                icon: 'undo',
                                onClick: () => {
                                    this.props.onUndoCallback();
                                }
                            }} />

                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.refreshButtonOptions} />
                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.colorButtonOptions} />
                    <Item location={'before'}
                    cssClass={'ToolbarAdditionalItem'}
                    render={this.props.additionalToolbarItem} />
                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.closeButtonOptions} />
                </Toolbar>
            </React.Fragment>
        );
    }

}

export default SheetToolbar;
