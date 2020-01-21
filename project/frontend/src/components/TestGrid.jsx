import React, { Component } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';


export default class TestGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [
        { headerName: "Make", field: "make" },
        { headerName: "Model", field: "model" },
        { headerName: "Price", field: "price" }],
      rowData: []
    }
  }

    componentDidMount(){
        this.setRowData();
    }
  setRowData(){

    setTimeout(()=>{
        const rowData =
        [
        { make: "Toyota", model: "Celica", price: 35000 },
        { make: "Ford", model: "Mondeo", price: 32000 },
        { make: "Porsche", model: "Boxter", price: 72000 }];

        this.setState({rowData: rowData});

    },3000);

  }

  render() {
    return (
    <div className="Wrapper">
      <div className="ag-theme-balham" style={ {height: '100%', width: '100%'} }>
        <AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={this.state.rowData}
            modules={AllCommunityModules}>
        </AgGridReact>
      </div>
      </div>
    );
  }
}