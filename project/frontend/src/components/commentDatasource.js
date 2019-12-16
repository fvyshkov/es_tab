import { sendRequest } from './App.js';

export default function commentDatasource(gridComponent) {
        console.log('!!!commentDatasource!!!');

        return {

            getRows(params,testFunction){
                console.log('commentDatasource getRows');

                let httpStr = 'get_comments/?dummy=1';

                if (gridComponent.props.sheet_id){
                    httpStr = httpStr.concat('&sht_id=', gridComponent.props.sheet_id);
                }
                /*
                httpStr = httpStr.concat( '&skey=',gridComponent.props.skey());
                if (params.parentNode.data){
                   httpStr = httpStr.concat( '&flt_id=',params.parentNode.data.flt_id,'&flt_item_id=',params.parentNode.data.flt_item_id);
                }
                if (params.request.groupKeys){
                    httpStr = httpStr.concat( '&group_keys=',params.request.groupKeys);
                }
                */

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