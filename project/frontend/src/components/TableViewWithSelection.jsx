import React, { Component } from 'react';
import ReactDOM from "react-dom";
import TabView from './TabView.jsx';
import TableView from './TableView.jsx';
import ReTableView from './ReTableView.jsx';
import SheetSelectDropDown from './SheetSelectDropDown.jsx';
import { sendRequestPromise } from './sendRequestPromise.js';
import notify from 'devextreme/ui/notify';


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

    onCellValueChanged(params){
        if (this.state.sheet_type==='tree'){
            console.log('change val tree', this.getFilterSkey(), params.data.node_key, params.colDef.field);
            sendRequestPromise('update_tree_record/?sht_id='+this.state.sheet_id+
                                '&skey='+this.getFilterSkey()+
                                '&cell_skey='+params.data.node_key +','+ params.colDef.field +
                            '&ind_id='+params.data.ind_id + '&value='+params.value

                        , 'POST',{});

        }else{
            sendRequestPromise('update_record/?req_id='+params.data.id+'&value='+params.value+'&col_id='+params.column.colDef.ind_id, 'POST',{});
        }
    }

    getColumnsListRequestString(){

        var httpStr = "sht_columns/?";
        if (this.state.sheet_id){
            httpStr +='sht_id='+this.state.sheet_id;
        }

        return httpStr;
    }

    saveViewState(viewState){
        var httpStr = 'sht_state_update/?sht_id='+this.state.sheet_id;
        sendRequestPromise(httpStr,'POST', viewState);
    }

    onInsertCallback(){
        //this.loadNewSheet(2434, 'tree');
        console.log('ins test', this);
        if (this.state.sheet_id){
                sendRequest('insert_record/?sht_id='+this.state.sheet_id+'&skey='+this.getFilterSkey(),
                            this.sendInsertRecord,
                            'POST',
                            {});
        }
    }

    getDataRequestString(){
        var httpStr = 'sht_nodes/?dummy=1';
        if (this.state.sheet_id){
            httpStr += '&sht_id=' + this.state.sheet_id;
        }
        return httpStr;
    }

    render(){

        return (
            <React.Fragment>
                <ReTableView
                    sendLoadAll={click => this.sendLoadAll = click}
                    onInsertCallback={this.onInsertCallback.bind(this)}
                    getFilterData={this.getFilterData.bind(this)}
                    additionalSheetParams={{sht_id: this.state.sheet_id, sheet_type: this.state.sheet_type}}
                    getViewUserPreferences={this.getViewUserPreferences.bind(this)}
                    getColumnsListRequestString={this.getColumnsListRequestString.bind(this)}
                    saveViewState={this.saveViewState.bind(this)}
                    onCellValueChanged={this.onCellValueChanged.bind(this)}
                    getDataRequestString={this.getDataRequestString.bind(this)}
                    getRowNodeId={(data)=>{return data.node_key;}}
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


