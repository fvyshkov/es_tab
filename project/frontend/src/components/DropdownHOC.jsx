import React, { Component } from "react";
import DropdownTreeSelect from "react-dropdown-tree-select";
import 'react-dropdown-tree-select/dist/styles.css';



export default class HOC extends Component {
  constructor(props) {
    super(props);

    var preparedData = this.prepareData(props.data);
    this.state = {
                      data:  preparedData,
                      treeName: props.treeName,
                      filterID: props.filterID

                 };
  }


  prepareData = data => {
    if (!data)
        return data;
    var cloned = data.slice(0);

    // insert special select all node
    cloned.splice(0, 0, {
      label: "Все значения",
      value: "0",
      className: "select-all",
      filterID: this.props.filterID
    });

    return cloned;
  };

  toggleAll = checked => {
    return;
/*
потом
    const { data } = this.state.data;
    for (var i = 1; i < data.length; i++) {
      data[i].checked = checked;
    }
    this.setState({ data });
*/
  };


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
    if (currentNode.value === "0") this.toggleAll(currentNode.checked);

    //console.log('child before onChangeSelection');

    var newData=this.state.data;
    this.setCheckedForId( newData, currentNode.id, currentNode.checked);

    this.props.onChangeSelection(selectedNodes, this.state.filterID);


  };



  render() {
//    console.log('this.props.treeName', this.props.treeName);
  //  console.log('this.state.treeName', this.state.treeName);
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
