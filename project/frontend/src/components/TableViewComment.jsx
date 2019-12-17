import React, { Component } from 'react';
import TableView from './TableView.jsx';
import commentDatasource from './commentDatasource.js';
import CommentPanel from './CommentPanel.jsx';

export default class TableViewComment extends Component {
    constructor(props) {
        super(props);

        this.state={
            itemPanelVisible: false,
            itemData:{},
            currentComment: {
                                    sheet_name: "Книга => 2019 => 1.0 => Группа => Лист",
                                    flt_dsrc:"Подразделение=ГО \n Показатель=Кредиты",
                                    prim:"",
                                    correctdt : "",
                                    fileList:[]
                                  }
        }
        //
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
        this.setState({currentComment: {
                                    sheet_name: "Книга => 2019 => 1.0 => Группа => Лист",
                                    flt_dsrc:"Подразделение=ГО \n Показатель=Кредиты",
                                    prim:"",
                                    correctdt : "",
                                    fileList:[]
                                  }
                                 });

        this.setState({itemPanelVisible: true});
    }

    onItemPanelClose(){
        this.setState({itemPanelVisible: false});
    }

    saveData(){
        console.log('SAVEDATA this.state.currentComment.PRIM', this.state.currentComment.prim, this.state.currentComment.fileList);
    }

    onFileValueChanged(e){
        console.log('onFileValueChanged', e);
        this.state.currentComment.fileList = e.previousValue;
        this.setState({currentComment: this.state.currentComment});


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
                />

                <TableView
                    sheet_id = {0}
                    sheet_type = {''}
                    additionalSheetParams={this.props.additionalSheetParams}
                    onToolbarCloseClick={this.props.onToolbarCloseClick.bind(this)}
                    layoutItemID={this.props.layoutItemID}
                    getDatasource={commentDatasource.bind(this)}
                    onInsertCallback={this.onInsertCallback.bind(this)}
                />
            </div>
        );
    }
}