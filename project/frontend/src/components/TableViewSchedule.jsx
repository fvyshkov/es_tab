import React, { Component } from 'react';
import TableView from './TableView.jsx';
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

    render() {
        console.log('render ', this.props);
        return (
            <div>
                <TableView
                    sheet_id = {0}
                    sheet_type = {''}
                    additionalSheetParams={this.props.additionalSheetParams}
                    onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                    onToolbarDeleteClick={this.onToolbarDeleteClick.bind(this)}
                    layoutItemID={this.props.layoutItemID}
                    getDatasource={scheduleDatasource.bind(this)}
                    onInsertCallback={this.onInsertCallback.bind(this)}
                    onDeleteCallback={this.onDeleteCallback.bind(this)}
                    onCellFocused={this.onCellFocused.bind(this)}
                    onGetGridApi={this.onGetGridApi.bind(this)}

                />
            </div>
        );
    }
}


function scheduleDatasource(gridComponent) {
        console.log('!!!scheduleDatasource!!!');

        return {

            getRows(params,testFunction){
                console.log('commentDatasource getRows');

                let httpStr = 'get_schedule/?viewType=ScheduleView';

                httpStr = gridComponent.addAdditionalSheetParams(httpStr);

                sendRequest(httpStr, (rowData) =>{
                                                        if (rowData.length >0) {
                                                            let lastRow = () => {
                                                                return rowData.length;
                                                            };

                                                            for (var i = 0; i < rowData.length; i++) {
                                                                if (rowData[i].column_data){
                                                                    var colData =  rowData[i].column_data;
                                                                    for (var colIndex=0; colIndex<colData.length; colIndex++){
                                                                        rowData[i][colData[colIndex].key] = colData[colIndex].sql_value;
                                                                    }
                                                                }
                                                            }
                                                            params.successCallback(rowData, lastRow());

                                                            if (gridComponent.savedFocusedCell){
                                                                gridComponent.gridApi.ensureIndexVisible(gridComponent.savedFocusedCell.rowIndex);
                                                                gridComponent.gridApi.ensureColumnVisible(gridComponent.savedFocusedCell.column);
                                                                gridComponent.gridApi.setFocusedCell(gridComponent.savedFocusedCell.rowIndex, gridComponent.savedFocusedCell.column);
                                                             }


                                                            rowData.forEach(function(row) {
                                                                if (gridComponent.props.expandedGroupIds &&
                                                                    gridComponent.props.expandedGroupIds.indexOf(row.node_key) > -1) {
                                                                    if (gridComponent.gridApi.getRowNode(row.node_key)){
                                                                        gridComponent.gridApi.getRowNode(row.node_key).setExpanded(true);
                                                                    }

                                                                }


                                                            });
                                                        }else{
                                                            params.successCallback([], 0);
                                                        }
                                                    }
                            );

            }
        }
   }