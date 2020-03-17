import React from 'react';
import { TreeList, RemoteOperations, Column, Selection, Scrolling, Sorting } from 'devextreme-react/tree-list';
import {sendRequestPromise} from './sendRequestPromise.js';

//import service from './refdata.js';
//import { refServiceURL } from '../classes/services.js';
//import 'whatwg-fetch';
const testData = [
  {
    "id": "582043",
    "id_hi": "0",
    "name": "Клиент Сегмент 2308",
    "groupfl": "0",
    "npp": 0,
    "nlevel": 0
  },
  {
    "id": "582044",
    "id_hi": "0",
    "name": "Клиент Сегмент",
    "groupfl": "0",
    "npp": 0,
    "nlevel": 0
  },
  {
    "id": "582045",
    "id_hi": "0",
    "name": "ААА. Сегментация инвестстадия",
    "groupfl": "0",
    "npp": 0,
    "nlevel": 0
  },
  {
    "id": "582046",
    "id_hi": "0",
    "name": "Экспорт1",
    "groupfl": "0",
    "npp": 0,
    "nlevel": 0
  },
  {
    "id": "582080",
    "id_hi": "0",
    "name": "Экспорт3",
    "groupfl": "0",
    "npp": 0,
    "nlevel": 0
  }
];

const dataSource = {
  load: function(loadOptions) {
    console.log('load');
    let parentIdsParam = loadOptions.parentIds;
    let url = `getref/?CODE=${dataSource['refCode']}`;

    if (dataSource['keyvalues']){
        url += '&KEYVALUES=' + dataSource['keyvalues'];
    }

    if (dataSource['istree']) {
      if(parentIdsParam){
        url += `&PARAMS={"ID_HI":${parentIdsParam[0]||null}}`;
      }else{
        url += `&PARAMS={"ID_HI":${null}}`;
      }
    }
/*
    return fetch(url)
        .then(response => {
            var resp = response.json();
            console.log('resp', resp);
            return resp;

        });
*/
    return sendRequestPromise(url)
    //return fetch(url)
      .then(response => {
        var test = response.slice();
        console.log('response', test, "testData", testData);
        console.log('test', test.length);
        return test;
        //return new Promise(function(resolve, reject) {resolve(test);});

      });

     // .catch(() => { throw 'Ошибка загрузки данных справочника'; });
  }

};

class RefGrid extends React.Component {
    constructor(props) {
      super(props);
      console.log("1");

      this.state = {
        treeData:[]
      }
      this.hasChildren = this.hasChildren.bind(this);
      this.contentReady = this.contentReady.bind(this);
      this.selectionChanged = this.selectionChanged.bind(this);
      this.componentDidMount = this.componentDidMount.bind(this);

        console.log("2");
      //this.refdscr = this.props.refdscr;

      dataSource['refCode'] = this.props.refCode;
      dataSource['istree'] = !!this.props.refdscr.istree;
      dataSource['keyvalues'] = this.props.keyvalues;

      this.treeData = [];
    };

    componentDidMount(){
        console.log("did MOUNT", testData);

        let parentIdsParam = null;//loadOptions.parentIds;
        let url = `getref/?CODE=${dataSource['refCode']}`;

        if (dataSource['keyvalues']){
            url += '&KEYVALUES=' + dataSource['keyvalues'];
        }

        if (dataSource['istree']) {
          if(parentIdsParam){
            url += `&PARAMS={"ID_HI":${parentIdsParam[0]||null}}`;
          }else{
            url += `&PARAMS={"ID_HI":${null}}`;
          }
        }


        sendRequestPromise(url)
    //return fetch(url)
      .then(response => {
              this.setState({treeData : response});

        var test = response.slice();
        console.log('response', test, "testData", testData);
        console.log('test', test.length);
        return test;
        //return new Promise(function(resolve, reject) {resolve(test);});

      });


    }

    hasChildren(obj) {
      return obj['GROUPFL']==='1';
    };

    contentReady(obj) {
      obj.component.selectRows([1], false);
    };

    selectionChanged(sel) {
        console.log('selectionChanged');
      this.props.selectionChanged(sel.selectedRowsData[0]);
    }

    render() {
        console.log('ref render 0');
      let columns = this.props.refdscr.columns ? this.props.refdscr.columns : [];
      console.log('ref render', this.props.refdscr);
        /*
      dataSource['refCode'] = this.props.refCode;
      dataSource['istree'] = !!this.props.refdscr.istree;

        */


       // return (<div>test</div>);

      return(
            <TreeList
              id="gridContainer"
              dataSource={this.state.treeData}
              keyExpr="id"
              showBorders={true}
              height={250}
              parentIdExpr="id_hi"
              rootValue={"0"}
              columnAutoWidth={true}
              hasItemsExpr={this.hasChildren}
              onSelectionChanged={this.selectionChanged}
              onContentReady={this.contentReady}
            >
              <RemoteOperations filtering={true}/>
              <Selection mode="single" />
              {columns.map((column) => <Column key={column.field} dataField={column.field} caption={column.caption} />)}
            </TreeList>
      )
    }
}
export default RefGrid;