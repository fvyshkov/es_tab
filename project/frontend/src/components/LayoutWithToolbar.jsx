import React, { Component } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import notify from 'devextreme/ui/notify';
import { sendRequest } from './App.js';
import AddRemoveLayout from './AddRemoveLayout.jsx';

export default class LayoutWithToolbar extends Component {



    constructor(props) {
        super(props);

        this.state={};
    }


    addItemButtonOptions = {
        icon: 'plus',
        onClick: (e) => {
                        notify('AddItem');
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



    render(){
        return (
            <React.Fragment>
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
                <AddRemoveLayout />
            </React.Fragment>
        );
    }

}


