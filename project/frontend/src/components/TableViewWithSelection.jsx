import React, { Component } from 'react';
import ReactDOM from "react-dom";
import TabView from './TabView.jsx';
import TableView from './TableView.jsx';
import SheetSelectDropDown from './SheetSelectDropDown.jsx';
import AddGUIDToComponent from './AddGUIDToComponent.jsx';



export default class TableViewWithSelection extends Component {

    constructor(props) {
        super(props);
        this.state={
                        sheet_id: 0,
                        sheet_type:''
                      };
    }

    sendLoadNewSheet(){
    }

    loadNewSheet(prm_sheet_id, prm_sheet_type){
        this.sendLoadNewSheet(prm_sheet_id, prm_sheet_type);
    }

    render(){

        return (
            <React.Fragment>
                <TabView
                    sendLoadNewSheet={click => this.sendLoadNewSheet = click}
                    additionalToolbarItem={()=>{return(
                                                        <SheetSelectDropDown
                                                            onSelectNewSheet={this.loadNewSheet.bind(this)}
                                                            />
                                                        );
                                                }
                                          }
                    {...this.props}
                />
            </React.Fragment>
        );
    }

}


