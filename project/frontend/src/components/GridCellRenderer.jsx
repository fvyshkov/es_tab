import {Component} from "react";


export default class GridCellRenderer extends Component {


    componentWillMount() {
        this.setMood(this.props.value)
    }

    refresh(params) {
        this.setMood(params.value);
    }

    setMood(mood) {
        this.setState({
            imgForMood: mood === 'Happy' ? 'https://www.ag-grid.com/images/smiley.png' : 'https://www.ag-grid.com/images/smiley-sad.png'
        })
    };

    render() {
        console.log('GridCellRenderer', this);
        return (
            this.props.value

        );
    }
}