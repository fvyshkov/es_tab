import React, { Component } from 'react';
import ReTableView from './ReTableView.jsx';
import CommentPanel from './CommentPanel.jsx';
import {sendRequest} from './App.js';

export default class TableViewHistory extends Component {
    constructor(props) {
        super(props);

        this.savedFocusedCell = {};
        this.state={
            itemPanelVisible: false,
            itemData:{}
        }
    }


    onInsertCallback(){
        console.log('insert addparams', this.props.additionalSheetParams);
    }

    onToolbarDeleteClick(){
        console.log('delete comment');
    }

    onCellFocused(params){
        this.setState({focusedCell:params.api.getFocusedCell()});
        this.gridApi = params.api;
    }

    onDeleteCallback(){
        console.log('delete this.gridApi', this.gridApi);
    }

    onGetGridApi(gridApi){
        this.gridApi = gridApi;
        console.log('onGetGridApi', this.gridApi);
    }

    getColumnsListRequestString(){
        var httpStr = "sht_columns/?viewType=HistoryView";
        return httpStr;
    }

    getDataRequestString(){
        var httpStr = 'get_history/?viewType=ConfView';
        return httpStr;
    }

    render() {
        return (
            <div>
                <ReTableView
                    getRowNodeId={(data)=>{return data.node_key;}}
                    getDataRequestString={this.getDataRequestString.bind(this)}
                    additionalSheetParams={this.props.additionalSheetParams}
                    onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                    onToolbarDeleteClick={this.onToolbarDeleteClick.bind(this)}
                    layoutItemID={this.props.layoutItemID}
                    onInsertCallback={this.onInsertCallback.bind(this)}
                    onDeleteCallback={this.onDeleteCallback.bind(this)}
                    onCellFocused={this.onCellFocused.bind(this)}
                    onGetGridApi={this.onGetGridApi.bind(this)}
                    getColumnsListRequestString={this.getColumnsListRequestString.bind(this)}

                />
            </div>
        );
    }
}


