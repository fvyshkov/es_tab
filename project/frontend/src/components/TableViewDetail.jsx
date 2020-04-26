import React, { Component } from 'react';
import ReTableView from './ReTableView.jsx';
import CommentPanel from './CommentPanel.jsx';
import {sendRequest} from './App.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import {processAdditionalParams} from './esUtils.js';

export default class TableViewDetail extends Component {
    constructor(props) {
        super(props);

        this.savedFocusedCell = {};
        this.state={
            itemPanelVisible: false,
            itemData:{}
        }
    }



    onInsertCallback(){
        console.log('insert addparams');
        var httpStr = 'insert_record/?dummy=1'+ processAdditionalParams(this.props.additionalSheetParams);
        console.log('insert httpStr', httpStr);

        sendRequestPromise(httpStr,'POST',{})
            .then((newRows)=>{
                console.log('added detail', newRows);
                this.gridApi.updateRowData({ add: newRows });

                var rowNode = this.gridApi.getRowNode(newRows[0].id);
                var data_test = newRows[0];
                var columns = newRows[0]['column_data'];
                for (var i=0; i< columns.length; i++){
                    console.log('column', columns[i])
                    data_test[columns[i]['key']] = columns[i]['sql_value']
                }
                rowNode.setData(data_test);

                if (this.props.updateParentCallback){
                    this.props.updateParentCallback(this.props.additionalSheetParams);
                }

            });
    }

    onToolbarDeleteClick(){
        console.log('delete comment');
    }

    onCellFocused(params){
        this.setState({focusedCell:params.api.getFocusedCell()});
        this.gridApi = params.api;
    }

    onDeleteCallback(){
        var dataForDelete = this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).data;
        var req_id = dataForDelete.id;
        console.log("dataForDelete req_id", req_id);
        sendRequestPromise('delete_record/?req_id='+req_id,'POST',{})
            .then(()=>{this.sendDeleteRecord()})
            .then(()=>{
                if (this.props.updateParentCallback){
                    this.props.updateParentCallback(this.props.additionalSheetParams);
                }
            });
    }

    onGetGridApi(gridApi){
        this.gridApi = gridApi;
        console.log('onGetGridApi', this.gridApi);
    }

    getColumnsListRequestString(){
        console.log('this.props.additionalSheetParams=',this.props.additionalSheetParams);
        var httpStr = "sht_columns/?viewType=FlowView&sht_id="+this.props.additionalSheetParams.sht_id+
            "&dop="+this.props.additionalSheetParams.dop+
            "&skey="+this.props.additionalSheetParams.skey;

        return httpStr;
    }

    getDataRequestString(){
        var httpStr = 'sht_nodes/?dummy=1';
        if (this.props.additionalSheetParams){
            for (var paramName in this.props.additionalSheetParams){
                if (Object.prototype.hasOwnProperty.call(this.props.additionalSheetParams, paramName)){
                    httpStr += '&'+paramName+'='+this.props.additionalSheetParams[paramName];
                }
            }

        }

        return httpStr;
    }

    onCellValueChanged(params){

        //var httpStr = 'update_record/?dummy=1'+ processAdditionalParams(this.props.additionalSheetParams);
        console.log("onCellValueChanged params", params);
        this.setState({isLoaded:0});

        sendRequestPromise('update_record/?req_id='+params.data.id+'&value='+encodeURIComponent(params.value)+'&col_id='+params.column.colDef.ind_id, 'POST',{})
            .then((data)=>{
                var rowNode = this.gridApi.getRowNode(params.data.id);
                var data_test = data[0];
                var columns = data[0]['column_data'];
                for (var i=0; i< columns.length; i++){
                    data_test[columns[i]['key']] = columns[i]['sql_value']
                }
                rowNode.setData(data_test);

                this.setState({isLoaded:1});
            })
            .then(()=>{
                if (this.props.updateParentCallback){
                   this.props.updateParentCallback(this.props.additionalSheetParams);
                }
            });


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
                    sendDeleteRecord={click => this.sendDeleteRecord = click}
                    onCellValueChanged={this.onCellValueChanged.bind(this)}
                    additionalToolbarItem={()=>{return(<div className="toolbar-label">Детализация</div>);}}
                />
            </div>
        );
    }
}


