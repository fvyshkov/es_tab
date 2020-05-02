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

import {processTree} from './esUtils.js';
import SimpleDialog from './SimpleDialog.jsx';
import {someChartModel, someChartModel2} from './testData.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import Reference from './Reference.js';

import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import GridLoader from "react-spinners/GridLoader";
import PropagateLoader from "react-spinners/PropagateLoader";


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

        this.currentLayout = {};

        this.layoutForSave = [];
        this.addLayoutParams = [];
        this.state={
                    items:[],
                    addLayoutDialogVisible: false,
                    showLayoutsRefer: false,
                    layoutsList:[],
                    isLoading: false
                    };
        this.addElementToLayout = this.addElementToLayout.bind(this);
        this.getNewLayoutItemID = this.getNewLayoutItemID.bind(this);
        this.openPatternLayout = this.openPatternLayout.bind(this);
        this.savePatternLayout = this.savePatternLayout.bind(this);

        this.componentDidMount = this.componentDidMount.bind(this);
    }




    addItemButtonOptions = {
        elementAttr: {"id": "add_layout_sheet_item"},
        icon: 'plus',
        hint: "Новое окно",
        onClick: () => {
                            var refer = React.createRef();
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
        elementAttr: {"id": "close_all_layout_items"},
        icon: 'close',
        hint: "Закрыть все окна",
        onClick: () => {
            this.setState({items:[]});
        }
    }


    openPatternLayoutButtonOptions = {
        elementAttr: {"id": "open_desktop"},
        icon: 'columnfield',
        hint: "Открыть рабочий стол",
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
        elementAttr: {"id": "save_desktop_new"},
        //text: "Сохранить новый рабочий стол",
        icon: "newfolder",
        hint: "Сохранить новый рабочий стол",
        onClick: () => {
            this.savePatternLayout(true);
        }
    }

    savePatternLayoutReplaceButtonOptions = {
        elementAttr: {"id": "save_desktop_replace"},
        //text: "Сохранить как...",
        icon: "paste",
        hint: "Сохранить рабочий стол как...",
        onClick: () => {
            this.savePatternLayout(false);
        }
    }

    savePatternLayout(saveAsNew, replaceCurrent = false){

        this.state.items.forEach((item)=>{
            if (item.refer && item.refer.current && item.refer.current.sendLayoutBeforeSave){
                item.refer.current.sendLayoutBeforeSave();
            }
        });

        this.savedLayout = this.layoutForSave;

        this.addLayoutParams = [
            {dataField:"LONGNAME", label:"Наименование", value: "Рабочий стол",  visible: true}
        ];

        if (saveAsNew){
            this.setState({addLayoutDialogVisible:true});
        }else if (!replaceCurrent){
            sendRequestPromise('get_layouts/')
                    .then((layouts)=>{
                        this.setState({layoutsList:layouts, showLayoutsRefer:true,  layoutsReferenceMode: 'saveLayout'});
                });
        }else{
            this.addLayout({layoutId: this.currentLayout.id});
        }

    }

    componentDidMount(){
        this.setState({isLoading: true});
        sendRequestPromise('get_layouts/')
            .then((layouts)=>{
                this.setState({isLoading: false});
                layouts.forEach(layout=>{
                    if (layout.defaultfl=="1"){
                        this.currentLayout = Object.assign({}, layout);
                        this.openPatternLayout(layout.layout);

                    }
                });
            });

    }

    doBeforeSaveLayout(parentLayoutId, charts, expandedGroupIds, filterModel, columnState){


        this.layoutForSave.forEach((layout)=>{
            if (layout.itemId == parentLayoutId){
                layout['chartsData'] = [];
                layout['expandedGroupIds'] = expandedGroupIds;
                layout['columnFilterModel'] = filterModel;
                layout['columnState'] = columnState;
                for (var chartIndex in charts){
                    var chart = charts[chartIndex];
                    if (this.layoutForSave.find(element=> element.itemId == chart.chartLayoutId)){
                        layout['chartsData'].push(chart);
                    }
                }
            }
        });
    }


    openPatternLayout(layout){

        //сначала удалим все что есть
        this.setState({items:[]});

        this.layoutForSave = layout;
        this.savedLayout = layout;

        this.savedLayout.forEach((layoutItem)=>{
            if (layoutItem.elementType in layoutComponents){
                const Component = layoutComponents[layoutItem.elementType];

                var refer = {};

                if (layoutItem.elementType == "TableViewWithSelection"){
                    refer = React.createRef();
                }

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
                                    expandedGroupIds={layoutItem.expandedGroupIds}
                                    columnFilterModel={layoutItem.columnFilterModel}
                                    columnState={layoutItem.columnState}
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



    }


    onToolbarCloseClick(itemID){
        this.setState({ items: _.reject(this.state.items, { i: itemID }) });
    }

    getNewLayoutItemID(){
        return 'n' + this.state.items.length;
    }

    addElementToLayout(elementRenderer, layout, elementType, formParams, refer){


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


        var cleanedLayout = this.layoutForSave.filter(
            (forSaveItem)=>{
                return layout.find((layoutItem)=>{return layoutItem.i == forSaveItem.itemId;
                        });
            });
        this.layoutForSave = this.layoutForSave.filter(
            (forSaveItem)=>{
                return layout.find((layoutItem)=>{return layoutItem.i==forSaveItem.itemId;
                        });
            });
        window.scrollTo(0,document.body.scrollHeight);
    }

    addLayout(params){

        var httpStr =  'update_layout/?dummy=1';
        if (params.layoutId){
            httpStr += '&layout_id='+ params.layoutId;
        }

        if (params.LONGNAME){
            httpStr += '&longname='+ encodeURIComponent(params.LONGNAME.value);
        }

        sendRequestPromise(httpStr, 'POST', this.layoutForSave)
            .then(()=>{notify('Рабочий стол сохранен', 'success')});
    }

    closeLayoutsReference(params){

        this.setState({showLayoutsRefer:false});
        if (params){
            if (this.state.layoutsReferenceMode=='openLayout'){
                this.currentLayout = Object.assign({}, params);
                this.openPatternLayout(params.layout);
            }else if (this.state.layoutsReferenceMode=='saveLayout'){

                this.addLayout({layoutId: params.id});
            }
        }
    }

    deleteLayout(params){
        var ids = params.map(row=> {return {id: row.id}});

        sendRequestPromise('delete_layout/', 'POST', {ids:ids})
            .then(()=>{

                var layoutsFiltered = this.state.layoutsList.filter((layout)=>{
                    var deletedId = ids.find((deletedLayout)=>{ return deletedLayout.id ==layout.id  });
                    return !deletedId;
                });

                this.setState({layoutsList:layoutsFiltered});
            })
            .catch(()=>{console.log("delete layout error!!!")});
    }

    render(){

        this.state.layoutsList.forEach((layout)=>{
            layout.defaultfl  = (layout.defaultfl=="1");
        });

        var layoutsRefer = this.state.showLayoutsRefer ? <Reference
                data={this.state.layoutsList}
                 onRefHidden={this.closeLayoutsReference.bind(this)}
                 keyField={'id'}

                 onDeleteItem={this.deleteLayout.bind(this)}
                 toolbarAdd={
                        [
                        {
                            icon:"product",
                            key:"default",
                            hint:"Установить рабочий стол по умолчанию",
                            type:"normal",
                            onClick:(params)=>{

                                if (params.length>0){
                                    sendRequestPromise("layout_set_default/?layout_id="+params[0].id)
                                        .then(()=>sendRequestPromise('get_layouts/'))
                                        .then((layouts)=>{
                                            this.setState({layoutsList:layouts});
                                        })
                                        .then(()=>{
                                            if (params[0].defaultfl=="0"){
                                                notify("Задан рабочий стол по умолчанию","success");
                                            }else{
                                                notify("Снят признак рабочего стола по умолчанию","success");
                                            }
                                        });
                                }
                            }
                        }
                        ]
                 }
                 refdscr={{
                        title: 'Рабочие столы',
                        columns: [
                          {caption: 'По умолчанию', field: 'defaultfl', dataType: 'boolean', width:"20%"},
                          {caption: 'Наименование', field: 'longname', width:"50%"},
                          {caption: 'Дата и время', field: 'correctdt', width:"30%"}
                        ]
                      }}
            /> : null;

        const override = css`
                          display: block;
                          margin: 0 auto;
                          border-color: red;
                        `;
        return (
            <React.Fragment>
            <div className='Wrapper' currentlayoutname={this.currentLayout.longname} isloading={this.state.isLoading? "1":"0"}>
                <Toolbar >

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
                    location={"after"}
                    widget={'dxButton'}
                    options={this.savePatternLayoutButtonOptions} />

                    <Item
                    location={"after"}
                    widget={'dxButton'}
                    options={this.savePatternLayoutReplaceButtonOptions} />


                    <Item
                    location={"after"}
                    widget={'dxButton'}
                    options={
                        {
                            elementAttr: {"id": "save_desktop_replace_current"},
                            icon: "save",
                            disabled: (this.currentLayout && this.currentLayout.longname  ) ? false: true,
                            hint: (this.currentLayout && this.currentLayout.longname ) ?  "Сохранить с заменой текущего ("+this.currentLayout.longname +  ")": "",
                            onClick: () => {
                                this.savePatternLayout(false, true);
                            }
                        }
                    } />

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
                <div className="layout-loader">
                    <PropagateLoader
                          css={override}
                          size={30}
                          color={"lightblue"}
                          loading={this.state.isLoading}
                    />
                </div>

                <AddRemoveLayout
                    items={this.state.items}
                    onLayoutChange={this.onLayoutChange.bind(this)}
                 />
            </div>
            </React.Fragment>
        );
    }
}


