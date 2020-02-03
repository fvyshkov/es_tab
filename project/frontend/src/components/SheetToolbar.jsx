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
import {processTree} from './esUtils.js';

import { Menu, SelectBox, CheckBox } from 'devextreme-react';


export default class SheetToolbar extends Component {

    constructor(props) {
        super(props);

        this.state={
                    colorPanelVisible:false,
                   };

        this.showFirstSubmenuModes = [{
                                  name: 'onHover',
                                  delay: { show: 0, hide: 500 }
                                }, {
                                  name: 'onClick',
                                  delay: { show: 0, hide: 300 }
                                }];

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
            //console.log('insertButtonOptions.onClick');
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


    menuItemClick(params){
        //console.log('menuItemClick(params)', params);
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
                    render={()=>{
                                var menuItems =[];
                                if (this.props.getMenuItems){

                                    menuItems = this.props.getMenuItems();
                                    console.log('this.props.getMenuItems', this.props.getMenuItems);
                                }

                                processTree(menuItems, (item)=>{
                                    if (item.getDisabled){
                                        console.log('item.getDisabled!=', item.getDisabled());
                                        item['disabled'] = item.getDisabled();
                                    }

                                    if (item.getVisible){
                                       item['visible'] = item.getVisible();
                                    }

                                });

                                if (menuItems.length>0){
                                    return (
                                        <Menu
                                            dataSource={
                                                [{id: '1',
                                                name: 'Лист',
                                                items: menuItems
                                                }]
                                                }


                                            onSubmenuShowing={this.props.onTopMenuClick}


                                            displayExpr="name"
                                            showFirstSubmenuMode={this.showFirstSubmenuModes[1]}
                                            orientation={'horizontal'}
                                            submenuDirection={'auto'}
                                            hideSubmenuOnMouseLeave={true}
                                            onItemClick={this.menuItemClick}
                                          />
                                    );

                                }else{
                                    return null;
                                    }
                                }
                          }
                     />


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






