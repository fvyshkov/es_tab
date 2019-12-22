import React, {Component} from 'react';

export default class SheetCellTooltip extends Component {
    getReactContainerClasses() {
        console.log('tooltip getReactContainerClasses');
        return ['custom-tooltip'];
    }

    render() {
        const data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
        console.log('tooltip' , this.props);
        return (
            <div className="custom-tooltip" style={{backgroundColor: this.props.color || 'white'}}>
                <p><span>Пользователь: </span> <b>{this.props.columnData.comment_usr_name}</b></p>
                <p><span>Комментарий: </span> {this.props.columnData.comment_text}</p>
            </div>
        );
    }
}