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
        return sendRequestPromise('sht_filters/?sht_id='+this.state.sheet_id);
    }


    loadNewSheet(prm_sheet_id, prm_sheet_type){
        this.setState({sheet_id: prm_sheet_id, sheet_type: prm_sheet_type});
        this.sendLoadAll(prm_sheet_id, prm_sheet_type);
    }

    getViewUserPreferences(){
        return sendRequestPromise('sht_state/?sht_id='+ this.state.sheet_id);
    }

    getColumnsListRequestString(){

        var httpStr = "sht_columns/?";
        if (this.state.sheet_id){
            httpStr +='sht_id='+this.state.sheet_id;
        }
       /* var skey = this.getFilterSkey();
        if  (skey){
            httpStr += '&skey='+skey;
        }*/
        //httpStr = this.addAdditionalSheetParams(httpStr);
        return httpStr;
    }

    render(){

        return (
            <React.Fragment>
                <ReTableView
                    sendLoadAll={click => this.sendLoadAll = click}
                    getFilterData={this.getFilterData.bind(this)}
                    additionalSheetParams={{sht_id: this.state.sheet_id, sheet_type: this.state.sheet_type}}
                    getViewUserPreferences={this.getViewUserPreferences.bind(this)}
                    getColumnsListRequestString={this.getColumnsListRequestString.bind(this)}
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


