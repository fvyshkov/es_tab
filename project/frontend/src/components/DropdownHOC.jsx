import React, { Component } from "react";
import DropdownTreeSelect from "react-dropdown-tree-select";
import 'react-dropdown-tree-select/dist/styles.css';



export default class DropdownHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
                      data:  props.data,
                      treeName: props.treeName,
                      filterID: props.filterID

                 };
  }



  setCheckedForId(treeData, id, checked){
    for (var i=0;i<treeData.length;i++){
        if (treeData[i].id===id){
            treeData[i].checked=checked;
        }
        if (treeData[i].children){
            this.setCheckedForId(treeData[i].children,id,checked);
        }
    }
  }


    handleChange = (currentNode,selectedNodes) => {
        var newData=this.state.data;
        this.setCheckedForId( newData, currentNode.id, currentNode.checked);
        this.props.onChangeSelection(selectedNodes, this.state.data,  this.state.filterID);
    };



  render() {
    return (
    <div>
     <div>{this.state.treeName}</div>
      <div>
        <DropdownTreeSelect
          data={this.state.data}
          onChange={this.handleChange}
          onAction={this.onAction}
          onNodeToggle={this.onNodeToggle}
          mode={'radioSelect'}
        />
     </div>
    </div>
    );
  }
}
