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
        hint: "Обновить",
        onClick: (e) => {
            this.props.onRefreshCallback();
        }
    }

    insertButtonOptions = {
        elementAttr: {"id": "view_insert"},
        icon: 'plus',
        hint: "Новая запись",
        onClick: (e) => {
            //console.log('insertButtonOptions.onClick');
            this.props.onInsertCallback();
        }
    }

    deleteButtonOptions = {
        elementAttr: {"id": "view_delete"},
        icon: 'minus',
        hint: "Удалить запись",
        onClick: (e) => {
            this.props.onDeleteCallback();
        }
    }


    closeButtonOptions = {
        elementAttr: {"id": "view_close"},
        icon: 'close',
        hint: "Закрыть окно",
        onClick: (e) => {
            this.props.onCloseCallback();
        }
    }

    saveButtonOptions = {
        elementAttr: {"id": "view_save"},
        icon: 'save',
        hint: "Сохранить",
        onClick: () => {
            this.props.onSaveCallback();
        }
    }

    colorButtonOptions = {
        elementAttr: {"id": "view_color"},
        icon: 'palette',
        hint: "Цветовая схема",
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
                            elementAttr: {"id": "view_insert"},
                            hint: "Добавить запись",
                            onClick: (e) => {this.props.onInsertCallback();}}
                    }/>

                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.deleteButtonOptions} />

                    <Item location={'before'}
                    widget={'dxButton'}
                    options={{
                                icon: 'undo',
                                elementAttr: {"id": "view_undo"},
                                hint: "Отмена коррекции",
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

                                }

                                processTree(menuItems, (item)=>{
                                    if (item.getDisabled){

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






