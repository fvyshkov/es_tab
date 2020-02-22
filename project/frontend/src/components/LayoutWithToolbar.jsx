import React, { Component } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import notify from 'devextreme/ui/notify';
import { sendRequest } from './App.js';
import AddRemoveLayout from './AddRemoveLayout.jsx';
import TableView from './TableView.jsx';
import TableViewWithSelection from './TableViewWithSelection.jsx';
import { AgGridReact } from "@ag-grid-community/react";
import {processTree} from './esUtils.js';
import SimpleDialog from './SimpleDialog.jsx';
import {someChartModel, someChartModel2} from './testData.js';
import { sendRequestPromise } from './sendRequestPromise.js';
import Reference from './Reference.js';

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
                            this.addElementToLayout(
                                                        <TableViewWithSelection
                                                            layoutItemID={"n" + this.state.items.length}
                                                            onToolbarCloseClick={this.onToolbarCloseClick.bind(this)}
                                                            addElementToLayout={this.addElementToLayout.bind(this)}
                                                            getNewLayoutItemID={this.getNewLayoutItemID}
                                                            onLayoutContentChange={this.onLayoutContentChange.bind(this)}
                                                            getLayoutForSave={this.getLayoutForSave.bind(this)}
                                                            sendLayoutBeforeSave={click => this.sendLayoutBeforeSave = click}
                                                            doBeforeSaveLayout={this.doBeforeSaveLayout.bind(this)}
                                                         />
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
            sendRequestPromise('get_layouts/')
                .then((layouts)=>{
                    this.setState({layoutsList:layouts, showLayoutsRefer:true});
                });

        }
    }


    sendLayoutBeforeSave(){
    }

    savePatternLayoutButtonOptions = {
        icon: 'save',
        onClick: () => {
            this.savePatternLayout();
        }
    }

    savePatternLayout(){

        this.sendLayoutBeforeSave();
        this.savedLayout = this.layoutForSave;

        this.addLayoutParams = [
            {dataField:"LONGNAME", label:"Наименование", value: "Рабочий стол",  visible: true}
        ];

        this.setState({addLayoutDialogVisible:true});
        /*
        return;

        console.log('savePatternLayout this.layoutForSave=1=', this.layoutForSave);
        this.sendLayoutBeforeSave();
        console.log('savePatternLayout this.layoutForSave=2=', this.layoutForSave);
        this.savedLayout = this.layoutForSave;

        sendRequestPromise('save_layout', 'POST', this.layoutForSave)
            .then(()=>notify('Рабочий стол сохранен','success'));
        */
    }

    doBeforeSaveLayout(charts){
        console.log('doBeforeSaveLayout charts', charts);
        this.layoutForSave.forEach((layout)=>{
            var layoutChartsData = [];
            charts.forEach((chart)=>{
                if (chart.parentLayoutId == layout.itemId){
                    layoutChartsData.push(chart);
                }
            });
            layout['chartsData'] = layoutChartsData;
        });
        //удалим графики из списка сохраняемых виджетов
        this.layoutForSave = this.layoutForSave.filter((layout)=>{
            var isChart = charts.find((chart)=>{
                return chart.chartLayoutId == layout.itemId;
            });
            return !isChart;
        });


    }

    openPatternLayout(layout){
        //сначала удалим все что есть
        this.setState({items:[]});

        this.layoutForSave = layout;
        this.savedLayout = layout;

        this.savedLayout.forEach((layoutItem)=>{
            this.addElementToLayout(
                                <TableViewWithSelection
                                    layoutItemID={"n" + this.state.items.length}
                                    onToolbarCloseClick={this.onToolbarCloseClick.bind(this)}
                                    addElementToLayout={this.addElementToLayout.bind(this)}
                                    getNewLayoutItemID={this.getNewLayoutItemID}
                                    onLayoutContentChange={this.onLayoutContentChange.bind(this)}
                                    doBeforeSaveLayout={this.doBeforeSaveLayout.bind(this)}
                                    getLayoutForSave={this.getLayoutForSave.bind(this)}
                                    sendLayoutBeforeSave={click => this.sendLayoutBeforeSave = click}
                                    sheet={layoutItem.sheet}
                                    filterNodes={layoutItem.filterNodes}
                                    chartsData={layoutItem.chartsData}
                                 />,
                                 layoutItem.layout
                             );
        });
    }

    onLayoutContentChange(contentChangeParams){
        this.layoutForSave.forEach((layoutItem)=>{
            if (layoutItem.itemId == contentChangeParams.itemId){
                for (var paramItem in contentChangeParams.changeParams){
                    layoutItem[paramItem] = contentChangeParams.changeParams[paramItem];
                }
            }
        });


    }


    onToolbarCloseClick(itemID){
        this.setState({ items: _.reject(this.state.items, { i: itemID }) });
    }

    getNewLayoutItemID(){
        return 'n' + this.state.items.length;
    }

    addElementToLayout(elementRenderer, layout){
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
                ...actualLayout,
                renderItem:elementRenderer
              })
        });
    }

    onLayoutChange(layout){
        //layoutForSave={itemId, layout, type,  sheet, filterNodes}
        layout.forEach((layoutItem)=>{
            var forSaveItem = this.layoutForSave.find((forSaveItem)=>{ return forSaveItem.itemId == layoutItem.i  });
            if (forSaveItem){
                forSaveItem.layout = {x: layoutItem.x, y: layoutItem.y, h: layoutItem.h, w: layoutItem.w};
            }else{
                this.layoutForSave.push({
                    itemId: layoutItem.i,
                    x: layoutItem.x,
                    y: layoutItem.y,
                    h: layoutItem.h,
                    w: layoutItem.w
                });
            }


        });

        var cleanedLayout = this.layoutForSave.filter(
            (forSaveItem)=>{

                return layout.find((layoutItem)=>{return layoutItem.i==forSaveItem.itemId;
                        });
            });

        this.layoutForSave = [];
        this.layoutForSave = cleanedLayout;


    }

    addLayout(params){
        console.log('addLayout', params);
        sendRequestPromise('update_layout/?longname='+params.LONGNAME.value+'&layout_id=0', 'POST', this.layoutForSave)
            .then(()=>{notify('Рабочий стол сохранен', 'success')});
    }

    closeLayoutsReference(params){
        this.setState({showLayoutsRefer:false});
        //console.log('restore layout', obj);
        this.openPatternLayout(params.layout);
    }

    render(){

        var layoutsRefer = this.state.showLayoutsRefer ? <Reference
                data={this.state.layoutsList}
                 onRefHidden={this.closeLayoutsReference.bind(this)}
                 keyField={'id'}
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

                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.savePatternLayoutButtonOptions} />

                    <Item location={'before'}
                    widget={'dxButton'}
                    options={this.openPatternLayoutButtonOptions} />


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


