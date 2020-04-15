import React, {Component} from 'react';

export default class SheetCellTooltip extends Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }

    render() {

        return (
            <div className="custom-tooltip" style={{backgroundColor: this.props.color || '#eff5b8'}}>
                <p><span>Пользователь: </span> <b>{this.props.columnData.comment_usr_name}</b></p>
                <p><span>Комментарий: </span> {this.props.columnData.comment_text}</p>
            </div>
        );
    }
}