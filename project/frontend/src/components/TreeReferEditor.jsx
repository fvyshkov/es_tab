import React, {Component} from "react";
import ReactDOM from "react-dom";
import { TreeView } from 'devextreme-react';


export default class TreeReferEditor extends Component {
    constructor(props) {
        super(props);

        this.treeDataSource = [];
        this.treeView_itemSelectionChanged = this.treeView_itemSelectionChanged.bind(this);
        this.state = {selectedItemData:{}};
    }

    componentWillMount() {
       // this.setHappy(this.props.value === "Happy");
    }

    componentDidMount() {
        this.loadRefData();
        this.refs.container.addEventListener('keydown', this.checkAndSelectRow);
        this.focus();
    }

    componentWillUnmount() {
        this.refs.container.removeEventListener('keydown', this.checkAndSelectRow);
    }

    checkAndSelectRow = (event) => {
        if ([37, 39].indexOf(event.keyCode) > -1) { // left and right
            this.selectedItemData = event.itemData;
            //console.log('checkAndToggleMoodIfLeftRight', event);
            event.stopPropagation();
        }
    }

    checkAndToggleMoodIfLeftRight = (event) => {
        if ([37, 39].indexOf(event.keyCode) > -1) { // left and right
            this.toggleMood();
            console.log('checkAndToggleMoodIfLeftRight', event);
            //event.stopPropagation();
        }
    }

    componentDidUpdate() {
        this.focus();
    }

    focus() {
        window.setTimeout(() => {
            let container = ReactDOM.findDOMNode(this.treeView);
            if (container) {
                container.focus();
            }
        })
    }

    getValue() {
        if (this.state.selectedItemData){
            return this.state.selectedItemData.id;
         }else{
            return null;
         }
    }

    isPopup() {
        return true;
    }

    loadRefData(){
        console.log('loadref ent_id=',this.props.colDef.field);
        const httpRequest = new XMLHttpRequest();
        var httpStr = 'http://127.0.0.1:8000/refer/?col_id='+this.props.colDef.field;
        httpRequest.open("GET",httpStr,true);
        httpRequest.onreadystatechange = () => {
          if (httpRequest.readyState === 4 && httpRequest.status === 200) {
              var respObj = JSON.parse(httpRequest.responseText);
              this.setState({refData:respObj});
          }
        };
        httpRequest.send();

    }

  treeView_itemSelectionChanged(e){
    this.setState({
                selectedItemData: e.itemData
            },
            () => this.props.api.stopEditing()
        );
  }

    render() {

        return (
        <div ref="container" className="treeRef">
      <TreeView dataSource={this.state.refData}
        ref={(ref) => this.treeView = ref}

       keyExpr={'id'}
        selectionMode={'single'}

              virtualModeEnabled={false}
              dataStructure={'plain'}


              valueExpr={'id'}
              rootValue={'0'}
              displayExpr={'name'}

              parentIdExpr ={'id_hi'}

        selectByClick={true}
        onContentReady={this.treeView_onContentReady}
        onItemSelectionChanged={this.treeView_itemSelectionChanged}
      />
      </div>
    );
    }
}