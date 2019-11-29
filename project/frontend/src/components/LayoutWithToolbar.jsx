import React, { Component } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import notify from 'devextreme/ui/notify';
import { sendRequest } from './App.js';
import AddRemoveLayout from './AddRemoveLayout.jsx';
import SheetView from './SheetView.jsx';
import GridExample from './GridExample.jsx';
import { AgGridReact } from "@ag-grid-community/react";

export default class LayoutWithToolbar extends Component {



    constructor(props) {
        super(props);

        this.state={
                    items:[]
                    };
        this.getNewLayoutItem = this.getNewLayoutItem.bind(this);
        this.addNewLayoutItem = this.addNewLayoutItem.bind(this);
    }


    addItemButtonOptions = {
        icon: 'plus',
        onClick: () => {
                            //console.log('e', e);
                            this.addNewLayoutItem();
                        }
    }

    layoutButtonOptions = {
        icon: 'mediumiconslayout',
        onClick: () => {
            notify('layoutButtonOptions');
        }
    }

    closeButtonOptions = {
        icon: 'close',
        onClick: () => {
            notify('close');
        }
    }

    addNewLayoutItem(){
        this.setState({
          // Add a new item. It must have a unique key!
              items: this.state.items.concat({
                i: "n" + this.state.items.length,
                x: 0,
                y: Infinity, // puts it at the bottom
                w: 6,
                h: 2,
                renderItem:


                        <div className="TestBorder">

                            <SheetView />

                        </div>

              })
        });
    }

    getNewLayoutItem(){
        console.log('onGetNewLayoutItem');
        return {name:'test', value:100};
    }

    render(){
        return (
            <React.Fragment>
            <div className='Wrapper'>
                <Toolbar>
                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.addItemButtonOptions} />
                   <Item location={'before'}
                    widget={'dxButton'}
                    options={this.layoutButtonOptions} />
                    <Item location={'after'}
                    widget={'dxButton'}
                    options={this.closeButtonOptions} />
                </Toolbar>
                <AddRemoveLayout
                    items={this.state.items}

                    getNewLayoutItem={this.getNewLayoutItem}
                 />
            </div>
            </React.Fragment>
        );
    }
//addNewLayoutItem={click => this.addNewLayoutItem = click}
}


