import React, { Component } from 'react';
import TableView from './TableView.jsx';
import commentDatasource from './commentDatasource.js';
import CommentPanel from './CommentPanel.jsx';
import {sendRequest} from './App.js';

export default class TableViewComment extends Component {
    constructor(props) {
        super(props);

        this.savedFocusedCell = {};
        this.state={
            itemPanelVisible: false,
            itemData:{},
            fileIds: '',
            focusedCell: {},
            currentComment: {
                                    sheet_name: "Книга => 2019 => 1.0 => Группа => Лист",
                                    flt_dsrc:"Подразделение=ГО \n Показатель=Кредиты",
                                    prim:"",
                                    correctdt : "",
                                    fileIds: "",
                                    fileList:[]
                                  }
        }
    }

    onFileUploaded(e){

        var responseObject = JSON.parse(e.request.response);
        console.log('onFileUploaded resp file_id', responseObject);
        if (responseObject.length===1){
            console.log('111=', responseObject[0]['file_id']);
            this.state.currentComment.fileIds += responseObject[0]['file_id'] + ',';
            this.setState({currentComment: this.state.currentComment});
        }

    }

    loadItemData(item_id){
        this.setState({currentComment: {
                                    com_id:1,
                                    sheet_name: "Книга => 2019 => 1.0 => Группа => Лист",
                                    flt_dsrc:"Подразделение=ГО \n Показатель=Кредиты",
                                    prim:"test\n test2 \n test3 ",
                                    correctdt : ""
                                  }
                                 });
    }

    onInsertCallback(){
        console.log('insert addparams', this.props.additionalSheetParams);
        this.setState({currentComment: {
                                    sheet_name: this.props.additionalSheetParams.sheet_path,
                                    flt_dscr: this.props.additionalSheetParams.flt_dscr,
                                    prim:"",
                                    correctdt : "",
                                    fileList:[],
                                    fileIds :"",

                                  }
                                 });

        this.setState({itemPanelVisible: true});
    }

    onItemPanelClose(){
        this.setState({itemPanelVisible: false});
    }

    uploadFile(o){

        console.log('uploadFile', o);

    }

    saveData(){

        var httpRequest = 'insert_comment/?ind_id=' + this.props.additionalSheetParams.ind_id;
        httpRequest += '&skey=' + this.props.additionalSheetParams.skey;
        httpRequest += '&prim=' + this.state.currentComment.prim;
        httpRequest += '&fileids=' + this.state.currentComment.fileIds.replace(/(^,)|(,$)/g, "");
        sendRequest(httpRequest, ()=> {this.gridApi.purgeServerSideCache();},'POST',{});
    }

    onFileValueChanged(e){
        console.log('onFileValueChanged', e);
        this.state.currentComment.fileList = e.previousValue;
        this.setState({currentComment: this.state.currentComment});


    }

    onToolbarDeleteClick(){
        console.log('delete comment');
    }

    onCellFocused(params){
        this.setState({focusedCell:params.api.getFocusedCell()});
        this.gridApi = params.api;
        console.log('onCellFocused this.gripApi', this.gridApi);
    }

    onDeleteCallback(){
        console.log('delete ', this.state.focusedCell);
        this.savedFocusedCell = this.state.focusedCell;
        var data = this.gridApi.getDisplayedRowAtIndex(this.savedFocusedCell.rowIndex).data;
        sendRequest('delete_comment/?proc_id=' + data.proc_id + '&njrn=' + data.njrn,()=> {this.gridApi.purgeServerSideCache();},'POST',{});
    }

    onGetGridApi(gridApi){
        //console.log('TableViewComment this.props.onGetGridApi', this.props.onGetGridApi);
        this.gridApi = gridApi;
        console.log('onGetGridApi', this.gridApi);
    }

    render() {
        console.log('render ', this.props);
        return (
            <div>
                <CommentPanel
                    popupVisible={this.state.itemPanelVisible}
                    sendItemPanelClose={this.onItemPanelClose.bind(this)}
                    commentData={this.state.currentComment}
                    saveData={this.saveData.bind(this)}
                    onFileValueChanged={this.onFileValueChanged.bind(this)}
                    onFileUploaded={this.onFileUploaded.bind(this)}
                    uploadFile={this.uploadFile.bind(this)}
                />

                <TableView
                    sheet_id = {0}
                    sheet_type = {''}
                    additionalSheetParams={this.props.additionalSheetParams}
                    onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                    onToolbarDeleteClick={this.onToolbarDeleteClick.bind(this)}
                    layoutItemID={this.props.layoutItemID}
                    getDatasource={commentDatasource.bind(this)}
                    onInsertCallback={this.onInsertCallback.bind(this)}
                    onDeleteCallback={this.onDeleteCallback.bind(this)}
                    onCellFocused={this.onCellFocused.bind(this)}
                    onGetGridApi={this.onGetGridApi.bind(this)}

                />
            </div>
        );
    }
}