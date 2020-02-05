import React from 'react';
import ColorBox from 'devextreme-react/color-box';
import { Popup } from 'devextreme-react/popup';

import { TextBox } from 'devextreme-react/text-box';
import { SelectBox } from 'devextreme-react/select-box';
import { CheckBox } from 'devextreme-react/check-box';



import { sendRequest } from './App.js';
import 'devextreme-react/text-area';
import Form, { Item } from 'devextreme-react/form';
import { FileUploader } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
import { getReport } from './getReport.js';
import TreeReference from './TreeReference.jsx';
import RefTextBox from './RefTextBox.js';
import {sendRequestPromise} from './sendRequestPromise.js';

export default class SheetToExcelRptDialog extends React.Component {
    constructor() {
        super();
        this.state = {
            labelLocation: 'left',
            readOnly: false,
            showColon: true,
            referData: [],
            showRef: false,
            showFltItemsRef: false,
            sht_flt_id: 0,
            col_flt_id: 0,
            row_flt_id: 0,
            detailFl: false,
            showIndCodesFl: false,
            detailHeaderFl: false,
            sht_flt_name: '',
            col_flt_name: '',
            row_flt_name: '',
            fltItemList: [],
            fltFixedValues: {},
            indMask: '',
            referFltItemsName: "test",
            fltItemReferData: [],
            //minColWidth: 300,
            colCount: 1,
            width: 200,
            showRef: false
        };

        this.formData = {};

        this.toolbarItems =   [
                                {
                                    widget: "dxButton",
                                    location: "after",

                                    toolbar: "bottom",


                                    options: {
                                        text: "Отчет",
                                        onClick: ()=> {
                                                            //а то render опять перепишет this.formData
                                                            var localFormData = Object.assign({}, this.formData);

                                                            console.log('this.state.detailFl', this.state.detailFl);
                                                            console.log('this.state.detailFl', this.state.detailHeaderFl);
                                                            console.log('this.state.detailFl', this.state.showIndCodesFl);
                                                            console.log('this.state.indMask', this.state.indMask);
                                                            console.log('this.state.sht_flt_id', this.state.sht_flt_id);
                                                            console.log('this.state.row_flt_id', this.state.row_flt_id);
                                                            console.log('this.state.col_flt_id', this.state.col_flt_id);
                                                            console.log('this.state.fltFixedValues', this.state.fltFixedValues);
                                                            var addSkey = '';
                                                            for (var fltId in this.state.fltFixedValues){
                                                                addSkey+= 'FLT_ID_'+fltId+'=>'+this.state.fltFixedValues[fltId];
                                                            }

                                                            var repParams = {};

                                                            repParams['P_SHT_ID'] = {type:"S", value: this.props.sheet_id};
                                                            repParams['P_FLT_ID_SHEET'] = {type:"S", value: this.state.sht_flt_id===0 ? '': this.state.sht_flt_id.toString()};
                                                            repParams['P_FLT_ID_ROW'] = {type:"S", value: this.state.row_flt_id===0 ? '': this.state.row_flt_id.toString()};
                                                            repParams['P_FLT_ID_COLUMN'] = {type:"S", value: this.state.col_flt_id===0 ? '': this.state.col_flt_id.toString()};
                                                            repParams['P_ADD_SKEY'] = {type:"S", value: addSkey};
                                                            repParams['P_IND_MASK'] = {type:"S", value: this.state.indMask};
                                                            repParams['P_DTLFL'] = {type:"S", value: this.state.detailFl ? '1': '0'};
                                                            repParams['P_DTLHEADERFL'] = {type:"S", value: this.state.detailHeaderFl ? '1': '0'};
                                                            repParams['P_INDCODEFL'] = {type:"S", value: this.state.showIndCodesFl ? '1': '0'};



                                                            this.props.onDialogClose();

                                                            getReport('C_ES_SHT_RPT', repParams);
                                                       }
                                    }
                                },
                                {
                                    widget: "dxButton",
                                    location: "after",

                                    toolbar: "bottom",


                                    options: {
                                        text: "Отмена",
                                        onClick: ()=> this.props.onDialogClose()
                                    }
                                }
                            ];
    }

     hidePopup(){
        this.props.onDialogClose();
    }


    onRefButtonClick(refcode) {
        console.log('refcode', refcode);
        var httpStr = 'get_flt/?sht_id='+this.props.sheet_id;

        httpStr += '&sht_flt_id='+this.state.sht_flt_id;
        httpStr += '&row_flt_id='+this.state.row_flt_id;
        httpStr += '&col_flt_id='+this.state.col_flt_id;

        sendRequestPromise(httpStr)
            .then(response => {
                console.log('resp', response);
                this.setState({showRef: true, refCode: refcode, referData: response});
            })


    }


    onRefFltValueButtonClick(refcode){
        console.log('onRefFltValueButtonClick.refcode', refcode);
        var fltId = refcode.replace('FLT_ID_','');
        console.log('fltId', fltId);
        sendRequestPromise('get_flt_items/?flt_id='+fltId)
            .then(response => {
                console.log('resp ITEMS', response);
                this.setState({showFltItemsRef: true, refCode: refcode, fltItemReferData: response});
            });


            this.setState({showFltItemsRef: true});
    }

    closeReference(row, refCode){
        console.log('closeref', row, refCode);

        //return;
        if (refCode==='SHT_FLT'){
            this.setState({sht_flt_id: row.id, sht_flt_name: row.name});

        }else if(refCode==='ROW_FLT'){
            this.setState({row_flt_id: row.id, row_flt_name: row.name});
        }else if(refCode==='COL_FLT'){
            this.setState({col_flt_id: row.id, col_flt_name: row.name});
        }
        this.setState({showRef: false});
    }


    closeItemsReference(row, refCode){
        console.log('closeItemsReference', row, refCode);

        var  fltFixedValues = this.state.fltFixedValues;

        fltFixedValues[refCode] = {id:row.id, name: row.name};

        this.setState({fltFixedValues: fltFixedValues});

        this.setState({showFltItemsRef: false});
    }


    onShtReferFieldValueChanged(e){
        console.log('onReferFieldValueChanged', e);
        if (e.value===''){
            this.setState({sht_flt_id: 0, sht_flt_name: ''});
        }
    }

    onRowReferFieldValueChanged(e){
        console.log('onReferFieldValueChanged', e);
        if (e.value===''){
            this.setState({row_flt_id: 0, row_flt_name: ''});
        }
    }

    onColReferFieldValueChanged(e){
        console.log('onReferFieldValueChanged', e);
        if (e.value===''){
            this.setState({col_flt_id: 0, col_flt_name: ''});
        }
    }


    onFocusOut(){

        console.log('onFocusOut');

        var httpStr = 'get_flt/?sht_id='+this.props.sheet_id;
        var itemsList = [];

        httpStr += '&sht_flt_id='+this.state.sht_flt_id;
        httpStr += '&row_flt_id='+this.state.row_flt_id;
        httpStr += '&col_flt_id='+this.state.col_flt_id;

        sendRequestPromise(httpStr)
            .then(response => {
                console.log('resp', response);
                this.setState({fltItemList: response});
            })

    }


     onChangeIndCodesFl(e){
        console.log('onChangeIndCodesFl', e);
        this.setState({showIndCodesFl:e.value});
    }

     onChangeDetailFl(e){
        console.log('onChangeDetailFl', e);
        this.setState({detailFl:e.value});
    }

     onChangeDetailHeaderFl(e){
        console.log('onChangeDetailHeaderFl', e);
        this.setState({detailHeaderFl:e.value});
     }

     onChangeIndMask(e){
        this.setState({indMask:e.value});
     }


  render() {
    const {
      labelLocation,
      readOnly,
      showColon,
      minColWidth,
      colCount,
      company,
      width
    } = this.state;







    var referComp = this.state.showRef ? <TreeReference
                data={this.state.referData}
                 onRefHidden={this.closeReference.bind(this)}
                 keyField={'id'}
                 refCode={this.state.refCode}
                 refdscr={{
                        title: 'Аналитики',
                        columns: [
                          {caption: 'Наименование', field: 'name'}
                        ]
                      }}
            /> : null;

    var referFltItemsComp = this.state.showFltItemsRef ? <TreeReference
                data={this.state.fltItemReferData}
                 onRefHidden={this.closeItemsReference.bind(this)}
                 keyField={'id'}
                 refCode={this.state.refCode}
                 refdscr={{
                        title: this.state.referFltItemsName,
                        columns: [
                          {caption: 'Наименование', field: 'name'}
                        ]
                      }}
            /> : null;

    var fltItems = this.state.fltItemList.map(element=>{

        var referValue ='';

        if (this.state.fltFixedValues['FLT_ID_'+element.id] &&
            this.state.fltFixedValues['FLT_ID_'+element.id]['name']){
            referValue =     this.state.fltFixedValues['FLT_ID_'+element.id]['name'];
        }

        return (


            <div className="dx-field" key={element.id}>
            <div className="dx-field-label">{element.name}</div>
              <div className="dx-field-value">
                <RefTextBox
                  value={referValue}
                  refCode={'FLT_ID_'+element.id}
                  onRefButtonClick={this.onRefFltValueButtonClick.bind(this)}

                />
              </div>
          </div>

        );
    });



    return (
            <div id="form-demo">
            {referComp}
            {referFltItemsComp}
            <Popup
                  visible={this.props.popupVisible}

                  onHiding={this.hidePopup.bind(this)}
                  dragEnabled={true}
                  closeOnOutsideClick={true}
                  showTitle={true}
                  title={"Выгрузка данных в excel"}

                  toolbarItems={this.toolbarItems}
                  resizeEnabled={true}
                  width={600}
                  height={650}
                 >


        <div className="widget-container">
         <div className="dx-fieldset">



          <div className="dx-field">
            <div className="dx-field-label">Для вывода в листы</div>
            <div className="dx-field-value">
              <RefTextBox
                value={this.state.sht_flt_name}
                id={'SHT_FLT'}
                refCode="SHT_FLT"
                onRefButtonClick={this.onRefButtonClick.bind(this)}
                onValueChanged={this.onShtReferFieldValueChanged.bind(this)}
              />
            </div>
          </div>

          <div className="dx-field">
            <div className="dx-field-label">Для вывода в строки</div>
            <div className="dx-field-value">
              <RefTextBox
                value={this.state.row_flt_name}
                refCode="ROW_FLT"
                onRefButtonClick={this.onRefButtonClick.bind(this)}
                onValueChanged={this.onRowReferFieldValueChanged.bind(this)}
              />
            </div>
          </div>

          <div className="dx-field">
            <div className="dx-field-label">Для вывода в столбцы</div>
            <div className="dx-field-value">
              <RefTextBox
                value={this.state.col_flt_name}
                refCode="COL_FLT"
                onRefButtonClick={this.onRefButtonClick.bind(this)}
                onValueChanged={this.onColReferFieldValueChanged.bind(this)}
                onFocusOut={this.onFocusOut.bind(this)}
              />
            </div>
          </div>


                <div className="dx-field">
            <div className="dx-field-label">Показатель (маска)</div>
              <div className="dx-field-value">
                <TextBox items={['Не указано', 'Женат', 'Холост']}
                  value={this.state.indMask}
                  onValueChanged={this.onChangeIndMask.bind(this)} />
              </div>
          </div>

         <div className="dx-field">
            <div className="dx-field-label">С детализацией</div>
              <div className="dx-field-value">
                <CheckBox value={this.state.detailFl} onValueChanged={this.onChangeDetailFl.bind(this)} />
              </div>
          </div>

          <div className="dx-field">
            <div className="dx-field-label">Заголовок детализации</div>
              <div className="dx-field-value">
                <CheckBox value={this.state.detailHeaderFl} onValueChanged={this.onChangeDetailHeaderFl.bind(this)} />
              </div>
          </div>

            <div className="dx-field">
            <div className="dx-field-label">Выводить коды показателей</div>
              <div className="dx-field-value">
                <CheckBox value={this.state.showIndCodesFl} onValueChanged={this.onChangeIndCodesFl.bind(this)} />
              </div>
          </div>

          {fltItems}

        </div>
      </div>



            </Popup>
            </div>
    );
  }


}

