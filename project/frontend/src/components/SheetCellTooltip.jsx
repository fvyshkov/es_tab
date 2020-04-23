import React, {Component} from 'react';
import { sendRequestPromise } from './sendRequestPromise.js';

export default class SheetCellTooltip extends Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }

    constructor(props) {
        super(props);
        this.state={
                    commentText:"Загрузка комментария..."
                    };
        this.componentDidMount = this.componentDidMount.bind(this);

    }

    componentDidMount(){
        var httpStr = 'get_cell_comment/?ind_id='+this.props.columnData.ind_id;
        console.log("this.props.columnData", this.props.columnData);

        if (this.props.columnData.req_id){
            httpStr += '&req_id='+this.props.columnData.req_id;
        }else{
            httpStr += '&skey='+this.props.columnData.cell_skey;
        }

        sendRequestPromise(httpStr)
            .then((data)=>this.setState({commentText: data[0].text}));
    }

    render() {
        return (
            <div className="custom-tooltip" style={{backgroundColor: this.props.color || '#eff5b8'}}>
                <p>{this.state.commentText}</p>
            </div>
        );
    }
}