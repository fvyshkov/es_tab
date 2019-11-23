import React, { Component } from "react";
import DropdownHOC from "./DropdownHOC.jsx";
import { sendGetRequest } from './App.js';
//import "./index.css";



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
        sendGetRequest('sht_filters/?sht_id='+this.props.sheet_id, this.onLoadFilterNodes)
    }

  onLoadFilterNodes(data){
  //  console.log('onLoadFilterNodes this', this);
   // console.log('onLoadFilterNodes data', data);
    this.filterList = data;
    this.setState({filterList : data});
    /*for (var i = 0; i < filterTest.length; i++) {
        var filterData=new FilterData(filterTest[i]);
        this.filterList.push(filterData);

    }*/
  }

    componentDidMount() {
        if (this.props.sendRefreshPanel)
            this.props.sendRefreshPanel(this.refreshPanel);
    }


  handleChangeTest (selectedNodesPrm, filterID)  {
    //console.log('parent prm=',selectedNodesPrm, filterID);
    this.props.onFilterPanelChange(selectedNodesPrm, filterID);
    this.setState( {selectedNodeList:selectedNodesPrm});
  }
  render() {
  //  console.log('render filterPanel ', this.state.filterList);
    this.filterRenderItems = this.state.filterList.map((fltItem, key) =>
        <DropdownHOC
          key={fltItem.flt_id}
          data={fltItem.filter_node_list}
          treeName={fltItem.name}
          onChangeSelection={this.handleChangeTest}
          filterID={fltItem.flt_id}
          mode={'radioSelect'}
        />

    );

    for (var i=0; i< this.filterRenderItems.length; i++){
//        console.log('this.filterRenderItems', this.filterRenderItems[i]);
    }

    return (
    <div className="FilterPanel" >
        {this.filterRenderItems}
    </div>
    );
  }
}
