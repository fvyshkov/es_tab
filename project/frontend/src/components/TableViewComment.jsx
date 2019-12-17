import React, { Component } from 'react';
import TableView from './TableView.jsx';
import commentDatasource from './commentDatasource.js';
import CommentPanel from './CommentPanel.jsx';

export default class TableViewComment extends Component {
    constructor(props) {
        super(props);

        this.state={itemPanelVisible: false}
        //
    }

    onInsertCallback(){
        this.setState({itemPanelVisible: true});
    }

    onItemPanelClose(){
        this.setState({itemPanelVisible: false});
    }

    render() {
        console.log('render ', this.props);
        return (
            <div>
                <CommentPanel
                    popupVisible={this.state.itemPanelVisible}
                    sendItemPanelClose={this.onItemPanelClose.bind(this)}
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