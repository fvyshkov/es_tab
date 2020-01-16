import React, { Component } from 'react';
import ReactDOM from "react-dom";
import TabView from './TabView.jsx';
import TableView from './TableView.jsx';
import ReTableView from './ReTableView.jsx';
import SheetSelectDropDown from './SheetSelectDropDown.jsx';
import { sendRequestPromise } from './sendRequestPromise.js';


export default class TableViewWithSelection extends Component {

    constructor(props) {
        super(props);
        this.state={
                        sheet_id: 0,
                        sheet_type:''
                      };
    }

    sendLoadAll(){
    }


    getFilterData(){
        var filterData = sendRequestPromise('sht_filters/?sht_id='+this.state.sheet_id);
        console.log('filterData', filterData);
        return filterData;
    }


    loadNewSheet(prm_sheet_id, prm_sheet_type){
        this.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});
        this.sendLoadAll(prm_sheet_id, prm_sheet_type);
    }

    render(){

        return (
            <React.Fragment>
                <ReTableView
                    sendLoadAll={click => this.sendLoadAll = click}
                    getFilterData={this.getFilterData.bind(this)}
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


