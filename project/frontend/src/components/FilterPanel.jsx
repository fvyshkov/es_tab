import React, { Component } from "react";
import DropdownHOC from "./DropdownHOC.jsx";
import { sendRequest } from './App.js';


export default class HOC extends Component {
    constructor(props) {
        super(props);
        this.filterList = [];
        this.sheet_id = this.props.sheet_id;
        this.state = {
                          data: props.data,
                          filterList: this.filterList,
                          selectedNodeList:[]
                     };
        this.handleChangeTest = this.handleChangeTest.bind(this);
        this.onLoadFilterNodes = this.onLoadFilterNodes.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.refreshPanel = this.refreshPanel.bind(this);
    }

    refreshPanel() {
        sendRequest('sht_filters/?sht_id='+this.props.sheet_id, this.onLoadFilterNodes)
    }

    onLoadFilterNodes(data){
        this.filterList = data;
        this.setState({filterList : data});
    }

    componentDidMount() {
        if (this.props.sendRefreshPanel)
            this.props.sendRefreshPanel(this.refreshPanel);
    }


    handleChangeTest (selectedNodesPrm, filterID)  {
        this.props.onFilterPanelChange(selectedNodesPrm, filterID);
        this.setState( {selectedNodeList:selectedNodesPrm});
    }

    render() {
        this.filterRenderItems = this.state.filterList.map(
            (fltItem, key) =>
                <DropdownHOC
                  key={fltItem.flt_id}
                  data={fltItem.filter_node_list}
                  treeName={fltItem.name}
                  onChangeSelection={this.handleChangeTest}
                  filterID={fltItem.flt_id}
                  mode={'radioSelect'}
                />
        );


        return (
            <div>
                {this.filterRenderItems}
            </div>
        );
  }
}
