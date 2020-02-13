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

export default class LayoutWithToolbar extends Component {



    constructor(props) {
        super(props);

        this.state={
                    items:[]
                    };
        this.addElementToLayout = this.addElementToLayout.bind(this);
        this.getNewLayoutItemID = this.getNewLayoutItemID.bind(this);
        this.openPatternLayout = this.openPatternLayout.bind(this);
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
                                                         />
                                                    );
                        }
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
            this.openPatternLayout();
        }
    }


    openPatternLayout(){
        /*откроем конкретную послеГагим набором аналитик
            4) график по ЗК
            5) Кредиты
            6) Потоки по кредитм

            можно описать это как последовательность операций, таких как
            1) добавить новый view
            2) выбрать лдист
            3) выбрать аналитики, обновить
            4) открыть гроафик по view (выделенный диапазон)
            5) установить координаты view
            6) закрыть view
            7) открыть подлчиненный список по view (по клетке, по записи, по листу)
                комментарии
                потоки платежей
                графики
                история утверждения
                детализация
        */

        const sheet1={
                      "label": "Ликвидность",
                      "type": "SHEET",
                      "id": "2434",
                      "parent_id": "515_535_465_1073",
                      "hasItems": false,
                      "icon": "detailslayout",
                      "sheet_type": "tree",
                      "stype": "P",
                      "sheet_path": "MIS => 2.Бюджет Планирование, контроль, факт => 2017 => 1.0 => GAP отчеты => Ликвидность",
                      "proc_id": 195042,
                      "nstat": 3,
                      "bop_id": 10922,
                      "ver_id": 10922,
                      "year": 10922,
                      "selected": true
                    };

        var filterNodes2 = {
  "5631": {
    "flt_id": 5631,
    "name": "Плоскость планирования",
    "filter_node_list": [
      {
        "id": "53621",
        "id_hi": null,
        "name": "План",
        "groupfl": "0",
        "npp": 1000,
        "nlevel": 0,
        "flt_id": 5631,
        "label": "План"
      }
    ]
  },
  "5632": {
    "flt_id": 5632,
    "name": "ЦФО и инвестиции",
    "filter_node_list": [
      {
        "id": "39594",
        "id_hi": null,
        "name": "Delta Bank",
        "groupfl": "1",
        "npp": 0,
        "nlevel": 0,
        "flt_id": 5632,
        "label": "Delta Bank",
        "children": [
          {
            "id": "39595",
            "id_hi": "39594",
            "name": "ГО",
            "groupfl": "0",
            "npp": 0,
            "nlevel": 1,
            "flt_id": 5632,
            "label": "ГО"
          },
          {
            "id": "39598",
            "id_hi": "39594",
            "name": "Филиалы",
            "groupfl": "1",
            "npp": 0,
            "nlevel": 1,
            "flt_id": 5632,
            "label": "Филиалы",
            "children": [
              {
                "id": "39604",
                "id_hi": "39598",
                "name": "Алматы",
                "groupfl": "0",
                "npp": 0,
                "nlevel": 2,
                "flt_id": 5632,
                "label": "Алматы",
                "checked": true
              },
              {
                "id": "39608",
                "id_hi": "39598",
                "name": "Астана",
                "groupfl": "0",
                "npp": 0,
                "nlevel": 2,
                "flt_id": 5632,
                "label": "Астана"
              }
            ]
          }
        ]
      }
    ]
  }
};


    var sheet2 = {
  "label": "Аренда",
  "type": "SHEET",
  "id": "2441",
  "parent_id": "515_535_465_1077",
  "hasItems": false,
  "icon": "detailslayout",
  "sheet_type": "table",
  "stype": "R",
  "sheet_path": "MIS => 2.Бюджет Планирование, контроль, факт => 2017 => 1.0 => Заявочные бюджеты => Аренда",
  "proc_id": 195049,
  "nstat": 3,
  "bop_id": 10922,
  "ver_id": 10922,
  "year": 10922,
  "selected": true
};

        var filterNodes1 = {
  "5618": {
    "flt_id": 5618,
    "name": "Временные корзины",
    "filter_node_list": [
      {
        "id": "53594",
        "id_hi": null,
        "name": "366 и более",
        "groupfl": "0",
        "npp": 8,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "366 и более"
      },
      {
        "id": "53595",
        "id_hi": null,
        "name": "Входящий остаток",
        "groupfl": "0",
        "npp": 1,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "Входящий остаток"
      },
      {
        "id": "53596",
        "id_hi": null,
        "name": "До востребования",
        "groupfl": "0",
        "npp": 2,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "До востребования"
      },
      {
        "id": "53597",
        "id_hi": null,
        "name": "ИТОГО",
        "groupfl": "0",
        "npp": 9,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "ИТОГО"
      },
      {
        "id": "53598",
        "id_hi": null,
        "name": "От 1 до 7 дней",
        "groupfl": "0",
        "npp": 3,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "От 1 до 7 дней"
      },
      {
        "id": "53599",
        "id_hi": null,
        "name": "От 181 до 365 дней",
        "groupfl": "0",
        "npp": 7,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "От 181 до 365 дней"
      },
      {
        "id": "53600",
        "id_hi": null,
        "name": "От 31 до 90 дней",
        "groupfl": "0",
        "npp": 5,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "От 31 до 90 дней"
      },
      {
        "id": "53601",
        "id_hi": null,
        "name": "От 8 до 30 дней",
        "groupfl": "0",
        "npp": 4,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "От 8 до 30 дней"
      },
      {
        "id": "53602",
        "id_hi": null,
        "name": "От 91 до 180 дней",
        "groupfl": "0",
        "npp": 6,
        "nlevel": 0,
        "flt_id": 5618,
        "label": "От 91 до 180 дней"
      }
    ]
  },
  "5619": {
    "flt_id": 5619,
    "name": "ЦФО и инвестиции",
    "filter_node_list": [
      {
        "id": "39595",
        "id_hi": null,
        "name": "ГО",
        "groupfl": "0",
        "npp": 0,
        "nlevel": 1,
        "flt_id": 5619,
        "label": "ГО",
        "checked": true
      }
    ]
  },
  "5620": {
    "flt_id": 5620,
    "name": "Показатели листа",
    "filter_node_list": [
      {
        "id": "141114",
        "id_hi": null,
        "name": "5. Мгновенная ликвидность",
        "groupfl": "0",
        "npp": 6,
        "nlevel": 0,
        "flt_id": 5620,
        "label": "5. Мгновенная ликвидность"
      },
      {
        "id": "141833",
        "id_hi": null,
        "name": "6. Текущая ликвидность",
        "groupfl": "0",
        "npp": 7,
        "nlevel": 0,
        "flt_id": 5620,
        "label": "6. Текущая ликвидность"
      },
      {
        "id": "141834",
        "id_hi": null,
        "name": "7. Долгосрочная ликвидность",
        "groupfl": "0",
        "npp": 8,
        "nlevel": 0,
        "flt_id": 5620,
        "label": "7. Долгосрочная ликвидность"
      },
      {
        "id": "104368",
        "id_hi": null,
        "name": "1. Активы",
        "groupfl": "1",
        "npp": 1,
        "nlevel": 0,
        "flt_id": 5620,
        "label": "1. Активы",
        "children": [
          {
            "id": "104369",
            "id_hi": "104368",
            "name": "1.1. Кредиты",
            "groupfl": "1",
            "npp": 1,
            "nlevel": 1,
            "flt_id": 5620,
            "label": "1.1. Кредиты",
            "children": [
              {
                "id": "104370",
                "id_hi": "104369",
                "name": "1.1.1. Основной долг",
                "groupfl": "0",
                "npp": 1,
                "nlevel": 2,
                "flt_id": 5620,
                "label": "1.1.1. Основной долг"
              },
              {
                "id": "104371",
                "id_hi": "104369",
                "name": "1.1.2. Проценты",
                "groupfl": "0",
                "npp": 2,
                "nlevel": 2,
                "flt_id": 5620,
                "label": "1.1.2. Проценты"
              }
            ]
          }
        ]
      },
      {
        "id": "104373",
        "id_hi": null,
        "name": "3. GAP (месяц)",
        "groupfl": "0",
        "npp": 3,
        "nlevel": 0,
        "flt_id": 5620,
        "label": "3. GAP (месяц)"
      },
      {
        "id": "104374",
        "id_hi": null,
        "name": "2. Пассивы",
        "groupfl": "1",
        "npp": 2,
        "nlevel": 0,
        "flt_id": 5620,
        "label": "2. Пассивы",
        "children": [
          {
            "id": "104375",
            "id_hi": "104374",
            "name": "2.1. Депозиты",
            "groupfl": "1",
            "npp": 1,
            "nlevel": 1,
            "flt_id": 5620,
            "label": "2.1. Депозиты",
            "children": [
              {
                "id": "104376",
                "id_hi": "104375",
                "name": "2.1.1. Основной долг",
                "groupfl": "0",
                "npp": 1,
                "nlevel": 2,
                "flt_id": 5620,
                "label": "2.1.1. Основной долг"
              },
              {
                "id": "104377",
                "id_hi": "104375",
                "name": "2.1.2. Проценты",
                "groupfl": "0",
                "npp": 2,
                "nlevel": 2,
                "flt_id": 5620,
                "label": "2.1.2. Проценты"
              }
            ]
          }
        ]
      },
      {
        "id": "104378",
        "id_hi": null,
        "name": "4. GAP (нарастающим итогом)",
        "groupfl": "0",
        "npp": 5,
        "nlevel": 0,
        "flt_id": 5620,
        "label": "4. GAP (нарастающим итогом)"
      }
    ]
  }
};


        this.addElementToLayout(
                                <TableViewWithSelection
                                    layoutItemID={"n" + this.state.items.length}
                                    onToolbarCloseClick={this.onToolbarCloseClick.bind(this)}
                                    addElementToLayout={this.addElementToLayout.bind(this)}
                                    getNewLayoutItemID={this.getNewLayoutItemID}
                                    sheet={sheet1}
                                    filterNodes={filterNodes1}
                                 />,

                                 { x: 0,
                                    y: 0,
                                    w: 4,
                                    h: 4}

                             );
     //   return;
        this.addElementToLayout(
                                <TableViewWithSelection
                                    layoutItemID={"n" + this.state.items.length}
                                    onToolbarCloseClick={this.onToolbarCloseClick.bind(this)}
                                    addElementToLayout={this.addElementToLayout.bind(this)}
                                    getNewLayoutItemID={this.getNewLayoutItemID}
                                    sheet={sheet2}
                                    filterNodes={filterNodes2}
                                 />,
                                 { x: 6,
                                    y: 0,
                                    w: 5,
                                    h: 3}
                             );

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


    render(){
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
                    options={this.openPatternLayoutButtonOptions} />
                </Toolbar>
                <AddRemoveLayout
                    items={this.state.items}
                 />
            </div>
            </React.Fragment>
        );
    }
}


