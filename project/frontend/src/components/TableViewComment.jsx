import React, { Component } from 'react';
import ReTableView from './ReTableView.jsx';
import commentDatasource from './commentDatasource.js';
import CommentPanel from './CommentPanel.jsx';
import {sendRequestPromise} from './App.js';

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
        if (responseObject.length===1){
            this.state.currentComment.fileIds += responseObject[0]['file_id'] + ',';
            this.setState({currentComment: this.state.currentComment});
        }

    }


    onInsertCallback(){
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
        sendRequestPromise(httpRequest)
            .then((newRows)=>{
                this.sendInsertRecord(newRows, this.gridApi);
                this.setState({itemPanelVisible: false});
            });
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

    getDataRequestString(){
        var httpStr = 'get_comments/?dummy=1';
        /*if (this.state.sheet_id){
            httpStr += '&sht_id=' + this.state.sheet_id;
        }*/
        return httpStr;
    }

    sendDeleteRecord(){

    }

    onDeleteCallback(){
        var dataForDelete = this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).data;
        sendRequestPromise('delete_comment/?proc_id=' + dataForDelete.proc_id + '&njrn=' + dataForDelete.njrn,'POST',{})
            .then(()=>{this.sendDeleteRecord()});
    }

    onGetGridApi(gridApi){
        //console.log('TableViewComment this.props.onGetGridApi', this.props.onGetGridApi);
        this.gridApi = gridApi;
        console.log('onGetGridApi', this.gridApi);
    }

    getMenuItems(){
        var items = [{
                        id: '1_1',
                        name: 'Удалить все комментарии',
                        price: 220,
                        icon: 'download'}];
        return items;
    }


    onGetGridApi(gridApi){
        this.gridApi = gridApi;
        console.log('tableViewComments onGetGridApi', this.gridApi);
    }

    render() {
        return (
            <div>
                <CommentPanel
                    title={"Комментарий по значению"}
                    popupVisible={this.state.itemPanelVisible}
                    sendItemPanelClose={this.onItemPanelClose.bind(this)}
                    commentData={this.state.currentComment}
                    saveData={this.saveData.bind(this)}
                    onFileValueChanged={this.onFileValueChanged.bind(this)}
                    onFileUploaded={this.onFileUploaded.bind(this)}
                    uploadFile={this.uploadFile.bind(this)}
                />

                <ReTableView
                    additionalSheetParams={this.props.additionalSheetParams}
                    onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                    onToolbarDeleteClick={this.onToolbarDeleteClick.bind(this)}
                    layoutItemID={this.props.layoutItemID}
                    getDatasource={commentDatasource.bind(this)}
                    onInsertCallback={this.onInsertCallback.bind(this)}
                    onDeleteCallback={this.onDeleteCallback.bind(this)}
                    sendDeleteRecord={click => this.sendDeleteRecord = click}
                    sendInsertRecord={click => this.sendInsertRecord = click}
                    onCellFocused={this.onCellFocused.bind(this)}
                    onGetGridApi={this.onGetGridApi.bind(this)}
                    getDataRequestString={this.getDataRequestString.bind(this)}
                    getRowNodeId={(data)=>{return data.com_id;}}
                    getMenuItems={this.getMenuItems}
                    additionalToolbarItem={()=>{return(<div className="toolbar-label">Комментарии по значению</div>);}}

                />
            </div>
        );
    }
}