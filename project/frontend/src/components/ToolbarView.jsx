import React, { Component } from 'react';
import ReactDOM from "react-dom";
import Toolbar, { Item } from 'devextreme-react/toolbar';

import "./index.css";



export default class ToolbarView extends Component {
    constructor(props) {
        super(props);
        this.state={
                      };

        this.onToolbarCloseClick = this.onToolbarCloseClick.bind(this);
    }

    onToolbarCloseClick(){
        if (this.props.onToolbarCloseClick){
            this.props.onToolbarCloseClick(this.props.layoutItemID);
        }
    }


    render(){
        return (
            <React.Fragment>

                <Toolbar>
                    {this.props.additionalToolbarItems}
                    <Item location={'after'}
                    widget={'dxButton'}
                    options={{
                                icon: 'close',
                                onClick: (e) => {
                                                this.onToolbarCloseClick();
                                                }
                            }} />
                </Toolbar>


                <div id={'content_'+this.props.layoutItemID} class="ag-theme-balham ToolbarViewContent">
                    {this.props.contentRender && <this.props.contentRender />}
                </div>

            </React.Fragment>
        );

    }

}


