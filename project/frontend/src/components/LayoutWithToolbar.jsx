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
        this.addElementToLayout = this.addElementToLayout.bind(this);
        this.getNewLayoutItemID = this.getNewLayoutItemID.bind(this);
    }


    addItemButtonOptions = {
        icon: 'plus',
        onClick: () => {
                            this.addElementToLayout(
                                                        <SheetView
                                                            layoutItemID={"n" + this.state.items.length}
                                                            onToolbarCloseClick={this.onToolbarCloseClick.bind(this)}
                                                            addElementToLayout={this.addElementToLayout.bind(this)}
                                                            getNewLayoutItemID={this.getNewLayoutItemID}
                                                         />
                                                    );
                        }
    }

    closeButtonOptions = {
        icon: 'close',
        onClick: () => {
            this.setState({items:[]});
        }
    }



    onToolbarCloseClick(itemID){
        this.setState({ items: _.reject(this.state.items, { i: itemID }) });
    }

    getNewLayoutItemID(){
        return 'n' + this.state.items.length;
    }

    addElementToLayout(elementRenderer){
        this.setState({
          // Add a new item. It must have a unique key!
              items: this.state.items.concat({
                i: "n" + this.state.items.length,
                x: 0,
                y: Infinity, // puts it at the bottom
                w: 10,
                h: 3,
                renderItem:elementRenderer
              })
        });
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
                    options={this.closeButtonOptions} />
                </Toolbar>
                <AddRemoveLayout
                    items={this.state.items}
                 />
            </div>
            </React.Fragment>
        );
    }
}


