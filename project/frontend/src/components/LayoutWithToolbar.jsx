import React, { Component } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import notify from 'devextreme/ui/notify';
import { sendRequest } from './App.js';
import AddRemoveLayout from './AddRemoveLayout.jsx';

import TableViewWithSelection from './TableViewWithSelection.jsx';
import TableViewFlow from './TableViewFlow.jsx';
import TableViewComment from './TableViewComment.jsx';
import TableViewConf from './TableViewConf.jsx';
import TableViewHistory from './TableViewHistory.jsx';
import TableViewSchedule from './TableViewSchedule.jsx';
import ReTableView from './ReTableView.jsx';


import { AgGridReact } from "@ag-grid-community/react";
import {processTree} from './esUtils.js';
import SimpleDialog from './SimpleDialog.jsx';
import {someChartModel, someChartModel2} from './testData.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import Reference from './Reference.js';

const layoutComponents = {
    TableViewWithSelection: TableViewWithSelection,
    TableViewFlow: TableViewFlow,
    TableViewComment: TableViewComment,
    TableViewConf: TableViewConf,
    TableViewHistory: TableViewHistory,
    TableViewSchedule: TableViewSchedule,
    ReTableView: ReTableView
};


export default class LayoutWithToolbar extends Component {



    constructor(props) {
        super(props);

        this.layoutForSave = [];
        this.addLayoutParams = [];
        this.state={
                    items:[],
                    addLayoutDialogVisible: false,
                    showLayoutsRefer: false,
                    layoutsList:[]
                    };
        this.addElementToLayout = this.addElementToLayout.bind(this);
        this.getNewLayoutItemID = this.getNewLayoutItemID.bind(this);
        this.openPatternLayout = this.openPatternLayout.bind(this);
        this.savePatternLayout = this.savePatternLayout.bind(this);
    }


    addItemButtonOptions = {
        elementAttr: {"id": "add_layout_sheet_item"},
        icon: 'plus',
        onClick: () => {
                            var refer = React.createRef();
                            console.log('refer created=', refer);
                            this.addElementToLayout(
                                                        <TableViewWithSelection ref={refer}
                                                            layoutItemID={"n" + this.state.items.length}
                                                            onToolbarCloseClick={this.onToolbarCloseClick.bind(this)}
                                                            addElementToLayout={this.addElementToLayout.bind(this)}
                                                            getNewLayoutItemID={this.getNewLayoutItemID}
                                                            onLayoutContentChange={this.onLayoutContentChange.bind(this)}
                                                            getLayoutForSave={this.getLayoutForSave.bind(this)}
                                                            doBeforeSaveLayout={this.doBeforeSaveLayout.bind(this)}
                                                            sendTest={click => this.sendTest = click}

                                                         />,
                                                         null,
                                                         "TableViewWithSelection",
                                                         null,
                                                         refer
                                                    );
                        }
    }

    getLayoutForSave(){
        return this.layoutForSave;
    }

    closeButtonOptions = {
        icon: 'close',
        onClick: () => {
            this.setState({items:[]});
        }
    }


    openPatternLayoutButtonOptions = {
        icon: 'columnfield',
        onClick: () => {



                //return;
                sendRequestPromise('get_layouts/')
                    .then((layouts)=>{
                        this.setState({layoutsList:layouts, showLayoutsRefer:true,  layoutsReferenceMode: 'openLayout'});
                });

        }
    }


    sendLayoutBeforeSave(){
    }

    savePatternLayoutButtonOptions = {
        //icon: 'save',
        text: "Сохранить новый рабочий стол",
        onClick: () => {
            this.savePatternLayout(true);
        }
    }

    savePatternLayoutReplaceButtonOptions = {
        //icon: 'save',
        text: "Сохранить вместо...",
        onClick: () => {
            this.savePatternLayout(false);
        }
    }

    savePatternLayout(saveAsNew){

        this.state.items.forEach((item)=>{
            if (item.refer && item.refer.current && item.refer.current.sendTest){
                item.refer.current.sendLayoutBeforeSave();
            }
        });
        this.savedLayout = this.layoutForSave;


        this.addLayoutParams = [
            {dataField:"LONGNAME", label:"Наименование", value: "Рабочий стол",  visible: true}
        ];

        if (saveAsNew){
            this.setState({addLayoutDialogVisible:true});
        }else{
            sendRequestPromise('get_layouts/')
                    .then((layouts)=>{
                        this.setState({layoutsList:layouts, showLayoutsRefer:true,  layoutsReferenceMode: 'saveLayout'});
                });
        }

    }

    doBeforeSaveLayout(parentLayoutId, charts){
        this.layoutForSave.forEach((layout)=>{
            if (layout.itemId == parentLayoutId){
                layout['chartsData'] = charts;
            }
        });
        //удалим графики из списка сохраняемых виджетов
        /*
        this.layoutForSave = this.layoutForSave.filter((layout)=>{
            var isChart = charts.find((chart)=>{
                return chart.chartLayoutId == layout.itemId;
            });
            return !isChart;
        });
        */
        //console.log("doBeforeSaveLayout this.layoutForSave", this.layoutForSave);
    }


    openPatternLayout(layout){

        console.log("this.layoutForSave", this.layoutForSave);
        console.log("this.savedLayout", layout);
        //return;
        //сначала удалим все что есть
        this.setState({items:[]});

        this.layoutForSave = layout;
        this.savedLayout = layout;

        console.log("this.savedLayout", layout);

        this.savedLayout.forEach((layoutItem)=>{
            if (layoutItem.elementType in layoutComponents){
                const Component = layoutComponents[layoutItem.elementType];

                var refer = {};

                if (layoutItem.elementType == "TableViewWithSelection"){
                    refer = React.createRef();
                }

                console.log("SHEET=", layoutItem.sheet);

                this.addElementToLayout(
                                <Component
                                    ref={refer}
                                    layoutItemID={"n" + this.state.items.length}
                                    onToolbarCloseClick={this.onToolbarCloseClick.bind(this)}
                                    addElementToLayout={this.addElementToLayout.bind(this)}
                                    getNewLayoutItemID={this.getNewLayoutItemID}
                                    onLayoutContentChange={this.onLayoutContentChange.bind(this)}
                                    doBeforeSaveLayout={this.doBeforeSaveLayout.bind(this)}
                                    getLayoutForSave={this.getLayoutForSave.bind(this)}
                                    sheet={layoutItem.sheet}
                                    filterNodes={layoutItem.filterNodes}
                                    chartsData={layoutItem.chartsData}
                                    {...layoutItem.formParams}
                                 />,
                                layoutItem.layout,
                                layoutItem.elementType,
                                layoutItem.formParams,
                                refer
                             );

            }else{
                console.log("NO such elementtype  layoutItem.elementType", layoutItem.elementType);
            }
        });
    }

    onLayoutContentChange(contentChangeParams){
        console.log('onLayoutContentChange 1 this.layoutForSave', this.layoutForSave);
        console.log('onLayoutContentChange 11 contentChangeParams', contentChangeParams);

        var foundItem = false;
        this.layoutForSave.forEach((layoutItem)=>{
            if (layoutItem.itemId == contentChangeParams.itemId){
                foundItem = true;
                for (var paramItem in contentChangeParams.changeParams){
                    layoutItem[paramItem] = contentChangeParams.changeParams[paramItem];
                }
            }
        });

        if (!foundItem){
            this.layoutForSave.push({itemId:contentChangeParams.itemId});
            for (var paramItem in contentChangeParams.changeParams){
                this.layoutForSave[this.layoutForSave.length-1][paramItem] = contentChangeParams.changeParams[paramItem];
            }
        }
        console.log('onLayoutContentChange 2 this.layoutForSave', this.layoutForSave);


    }


    onToolbarCloseClick(itemID){
        this.setState({ items: _.reject(this.state.items, { i: itemID }) });
    }

    getNewLayoutItemID(){
        return 'n' + this.state.items.length;
    }

    addElementToLayout(elementRenderer, layout, elementType, formParams, refer){

        console.log("addElementToLayout refer", refer);

        var actualLayout = layout
        if (!layout){
            actualLayout = { x: 0,
                            y: Infinity, // puts it at the bottom
                            w: 11,
                            h: 3};
        }


        this.setState({
          // Add a new item. It must have a unique key!
              items: this.state.items.concat({
                i: "n" + this.state.items.length,
                elementType: elementType,
                ...actualLayout,
                renderItem:elementRenderer,
                formParams: formParams,
                refer: refer
              })
        });
    }

    onLayoutChange(layout){
        console.log('onLayoutChange 01 ', this.layoutForSave);
        console.log('onLayoutChange(layout)', layout);
        console.log('onLayoutChange(items)', this.state.items);

        //layoutForSave={itemId, layout, type,  sheet, filterNodes}
        layout.forEach((layoutItem)=>{
            var forSaveItem = this.layoutForSave.find((forSaveItem)=>{ return forSaveItem.itemId == layoutItem.i  });

            var itemData = this.state.items.find((item)=>{ return item.i == layoutItem.i});

            if (forSaveItem){
                forSaveItem.layout = {x: layoutItem.x, y: layoutItem.y, h: layoutItem.h, w: layoutItem.w};

                forSaveItem.elementType = itemData.elementType;
                if (itemData.formParams){
                    forSaveItem.formParams = itemData.formParams;
                }

            }else{
                this.layoutForSave.push({
                    itemId: layoutItem.i,
                    layout : {x: layoutItem.x, y: layoutItem.y, h: layoutItem.h, w: layoutItem.w},
                    elementType: itemData.elementType,
                    formParams : itemData.formParams
                });
            }





        });

        console.log('onLayoutChange 021 ', this.layoutForSave);
        console.log('onLayoutChange 022 ', layout);
        console.log('onLayoutChange 022 layout.length ', layout.length, "this.layoutForSave.length", this.layoutForSave.length);

        var cleanedLayout = this.layoutForSave.filter(
            (forSaveItem)=>{
                return layout.find((layoutItem)=>{return layoutItem.i == forSaveItem.itemId;
                        });
            });
        console.log('onLayoutChange 022 cleanedLayout ', cleanedLayout);
        //this.layoutForSave = [];
        //this.layoutForSave = cleanedLayout;
        this.layoutForSave = this.layoutForSave.filter(
            (forSaveItem)=>{
                return layout.find((layoutItem)=>{return layoutItem.i==forSaveItem.itemId;
                        });
            });

        console.log('onLayoutChange 03 ', this.layoutForSave);
        console.log('this.layoutForSave', this.layoutForSave);
    }

    addLayout(params){

        console.log('addLayout', params);

        var httpStr =  'update_layout/?dummy=1';
        if (params.layoutId){
            httpStr += '&layout_id='+ params.layoutId;
        }

        if (params.LONGNAME){
            httpStr += '&longname='+ params.LONGNAME.value;
        }

        sendRequestPromise(httpStr, 'POST', this.layoutForSave)
            .then(()=>{notify('Рабочий стол сохранен', 'success')});
    }

    closeLayoutsReference(params){

        this.setState({showLayoutsRefer:false});
        if (params){
            if (this.state.layoutsReferenceMode=='openLayout'){
                this.openPatternLayout(params.layout);
            }else if (this.state.layoutsReferenceMode=='saveLayout'){

                this.addLayout({layoutId: params.id});
            }
        }
    }

    deleteLayout(params){
        //console.log("deleteLayout", params);
        var ids = params.map(row=> {return {id: row.id}});

        sendRequestPromise('delete_layout/', 'POST', {ids:ids})
            .then(()=>{

                var layoutsFiltered = this.state.layoutsList.filter((layout)=>{
                    var deletedId = ids.find((deletedLayout)=>{ return deletedLayout.id ==layout.id  });
                    return !deletedId;
                });
                //console.log("2 this.state.layoutsList.length", this.state.layoutsList.length);

                this.setState({layoutsList:layoutsFiltered});
            })
            .catch(()=>{console.log("delete layout error!!!")});
    }

    render(){

        var layoutsRefer = this.state.showLayoutsRefer ? <Reference
                data={this.state.layoutsList}
                 onRefHidden={this.closeLayoutsReference.bind(this)}
                 keyField={'id'}
                 onDeleteItem={this.deleteLayout.bind(this)}
                 refdscr={{
                        title: 'Рабочие столы',
                        columns: [
                          {caption: 'Наименование', field: 'longname'},
                          {caption: 'Дата и время', field: 'correctdt'}
                        ]
                      }}
            /> : null;




        return (
            <React.Fragment>
            <div className='Wrapper'>
                <Toolbar>
                    <Item
                    location={'before'}
                    widget={'dxButton'}
                    options={this.addItemButtonOptions} />
                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.closeButtonOptions} />



                    <Item location={'after'}
                    widget={'dxButton'}
                    options={this.openPatternLayoutButtonOptions} />

                    <Item
                    locateInMenu="always"
                    widget={'dxButton'}
                    options={this.savePatternLayoutButtonOptions} />

                    <Item
                    locateInMenu="always"
                    widget={'dxButton'}
                    options={this.savePatternLayoutReplaceButtonOptions} />


                </Toolbar>

                {layoutsRefer}

                <SimpleDialog
                    dialogParams={this.addLayoutParams}
                    popupVisible={this.state.addLayoutDialogVisible}
                    title={"Сохранение рабочего стола"}
                    onDialogClose={()=>{this.setState({addLayoutDialogVisible:false});}}
                    onDialogConfirm={this.addLayout.bind(this)}
                    width={400}
                    height={200}
                />



                <AddRemoveLayout
                    items={this.state.items}
                    onLayoutChange={this.onLayoutChange.bind(this)}
                 />
            </div>
            </React.Fragment>
        );
    }
}


