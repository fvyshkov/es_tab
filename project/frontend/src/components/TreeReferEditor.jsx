import React, {Component} from "react";
import ReactDOM from "react-dom";
import { TreeView } from 'devextreme-react';
import referStore from './sheetReference.js';


export default class TreeReferEditor extends Component {
    constructor(props) {
        super(props);

        this.treeDataSource = [];
        this.treeView_itemSelectionChanged = this.treeView_itemSelectionChanged.bind(this);
        this.state = {
                        selectedItemData:{},
                        refData: JSON.parse( referStore.getData(this.props.colDef.field)),
                        };
    }

    componentDidMount() {
        this.refs.container.addEventListener('keydown', this.checkAndSelectRow);
        this.focus();
    }

    componentWillUnmount() {
        this.refs.container.removeEventListener('keydown', this.checkAndSelectRow);
    }

    checkAndSelectRow = (event) => {
        if ([37, 39].indexOf(event.keyCode) > -1) { // left and right
            this.selectedItemData = event.itemData;
            event.stopPropagation();
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