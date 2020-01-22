import React, { Component } from 'react';
import TableView from './TableView.jsx';
import ReTableView from './ReTableView.jsx';
import commentDatasource from './commentDatasource.js';
import CommentPanel from './CommentPanel.jsx';
import {sendRequest} from './App.js';

export default class TableViewSchedule extends Component {
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
        var httpStr;
        httpStr = "sht_columns/?viewType=ScheduleView";
        return httpStr;
    }

    getDataRequestString(){
        var httpStr = 'get_schedule/?viewType=ScheduleView';
        return httpStr;
    }

    render() {
        console.log('render ', this.props);
        return (
            <div>
                <ReTableView
                    additionalSheetParams={this.props.additionalSheetParams}
                    getRowNodeId={(data)=>{return data.node_key;}}
                    getDataRequestString={this.getDataRequestString.bind(this)}
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


