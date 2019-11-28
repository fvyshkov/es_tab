import React, { Component } from "react";
import DropdownHOC from "./DropdownHOC.jsx";
import { sendRequest } from './App.js';


export default class FilterPanel extends Component {
    constructor(props) {
        super(props);
        this.sheet_id = this.props.sheet_id;
        this.state = {
                          data: props.data,
                          filterList: [],
                          selectedNodeList:[]
                     };
        this.handleChangeTest = this.handleChangeTest.bind(this);
        this.onLoadFilterNodes = this.onLoadFilterNodes.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.refreshPanel = this.refreshPanel.bind(this);
    }

    refreshPanel() {
        return;
        /*
        console.log('refreshPanel');
        if (this.props.sheet_id)
            sendRequest('sht_filters/?sht_id='+this.props.sheet_id, this.onLoadFilterNodes)
        */
    }

    onLoadFilterNodes(data){
        var filterList = data;
        if (this.props.selectedFilterNodes){
            for (var i=0; i < filterList.length; i++){
                if (this.props.selectedFilterNodes[filterList[i].flt_id]){
                    var selectedNodes =  this.props.selectedFilterNodes[filterList[i].flt_id];
                    if (selectedNodes.length>0){
                        for (var j=0; j < filterList[i].filter_node_list.length; j++){
                            filterList[i].filter_node_list[j]['checked'] = (selectedNodes[0].id === filterList[i].filter_node_list[j].id);
                        }
                    }
                }
            }
        }

        this.setState({filterList : filterList});
    }



    componentDidMount() {
        if (this.props.sendRefreshPanel)
            this.props.sendRefreshPanel(this.refreshPanel);
    }


    handleChangeTest (selectedNodes, allNodes, filterID)  {
        this.props.onFilterPanelChange(selectedNodes, allNodes, filterID);
        this.setState( {selectedNodeList:selectedNodes});
    }

    render() {
        //this.filterRenderItems = this.state.filterList.map(
        if (!this.props.filterNodes || this.props.filterNodes.length===0){
            return (<div></div>);
        }
        //console.log('this.props.filterNodes', this.props.filterNodes);

        var filterRenderItems = [];

        for (var filterID in this.props.filterNodes){
            if (Object.prototype.hasOwnProperty.call(this.props.filterNodes, filterID)){
                var fltItem = this.props.filterNodes[filterID];
                //console.log('fltItem', fltItem);
                filterRenderItems.push(
                    <div key={fltItem.flt_id}>
                        <DropdownHOC
                          key={fltItem.flt_id}
                          data={fltItem.filter_node_list}
                          treeName={fltItem.name}
                          onChangeSelection={this.handleChangeTest}
                          filterID={fltItem.flt_id}
                          mode={'radioSelect'}
                        />
                    </div>
                );
            }
        }
        /*
        this.filterRenderItems = this.state.filterList.map(
            (fltItem, key) =>
                <div>
                    <DropdownHOC
                      key={fltItem.flt_id}
                      data={fltItem.filter_node_list}
                      treeName={fltItem.name}
                      onChangeSelection={this.handleChangeTest}
                      filterID={fltItem.flt_id}
                      mode={'radioSelect'}
                    />
                </div>


        );*/


        return (
            <div>
                {filterRenderItems}
            </div>
        );
  }
}
