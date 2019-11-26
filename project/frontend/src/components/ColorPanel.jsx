import React from 'react';
import ColorBox from 'devextreme-react/color-box';
import { Popup } from 'devextreme-react/popup';
import { sendGetRequest } from './App.js';

var rgbToHex = function (rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};

class ColorPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
                    popupVisible: this.props.popupVisible
                };
    this.handleColorChange = ({ value }) => this.setState({ color: value });

    this.processColors = this.processColors.bind(this);
    this.loadColors = this.loadColors.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);

     this.toolbarItems =   [
                                {
                                    widget: "dxButton",
                                    location: "after",
                                    options: {
                                        icon: "save",
                                        onClick: this.onSaveClick
                                    }
                                }
                            ];
  }

  onSaveClick(){
       // this.loadColors();
  }

    hidePopup(){
        this.props.onClose();
    }

    //не понял как получить ID компонента, чтобы решить все одной функцией
    onColorChange_Arest(e){
       this.setState({colorArest:e.value});
    }

    onColorChange_Hand(e){
       this.setState({colorHand:e.value});
    }

    onColorChange_Total(e){
       this.setState({colorTotal:e.value});
    }

    onColorChange_Cons(e){
       this.setState({colorCons:e.value});
    }

    onColorChange_Conf(e){
       this.setState({colorConf:e.value});
    }

    onColorChange_ConfPart(e){
       this.setState({colorConfPart:e.value});
    }

    onColorChange_Filter(e){
       this.setState({colorFilter:e.value});
    }

    componentDidMount() {
        this.loadColors();
    }

    processColors(sht_info){
        if (sht_info.length===0){
            return;
        }


        this.setState({
                        colorArest: '#'+rgbToHex( sht_info[0]['color_restrict']),
                        colorHand: '#'+rgbToHex(sht_info[0]['color_hand_input']),
                        colorTotal: '#'+rgbToHex(sht_info[0]['color_totals']),
                        colorCons: '#'+rgbToHex(sht_info[0]['color_cons']),
                        colorConf: '#'+rgbToHex(sht_info[0]['color_confirm']),
                        colorConfPart: '#'+rgbToHex(sht_info[0]['color_part_confirm']),
                        colorFilter: '#'+rgbToHex(sht_info[0]['color_flt'])
                       });

    }

    loadColors(){
        sendGetRequest('sht_info/?sht_id='+this.props.sheet_id,this.processColors);
    }

  render() {
    return (
      <React.Fragment>
      <Popup
          visible={this.state.popupVisible}
          onHiding={this.hidePopup.bind(this)}
          dragEnabled={true}
          closeOnOutsideClick={true}
          showTitle={true}
          title="Цветовая схема"
          width={600}
          height={500}
          toolbarItems={this.toolbarItems }
         >
        <div className="form">
          <div className="dx-fieldset">

            <div className="dx-field">
              <div className="dx-field-label">Запрет редактирования</div>
              <div className="dx-field-value">
                <ColorBox
                  name={'colorArest'}
                  value={this.state.colorArest}
                  onValueChanged ={this.onColorChange_Arest.bind(this)}
                />
              </div>
            </div>

            <div className="dx-field">
              <div className="dx-field-label">Ручной ввод</div>
              <div className="dx-field-value">
                <ColorBox
                  name={'colorHand'}
                  value={this.state.colorHand}
                  onClosed={this.onColorChange_Hand.bind(this)}
                />
              </div>
            </div>

            <div className="dx-field">
              <div className="dx-field-label">Итоги {this.state.colorTotal}</div>
              <div className="dx-field-value">
                <ColorBox
                  id={'colorTotal'}
                  value={this.state.colorTotal}
                  onClosed={this.onColorChange_Total.bind(this)}
                />
              </div>
            </div>

            <div className="dx-field">
              <div className="dx-field-label">Консолидация</div>
              <div className="dx-field-value">
                <ColorBox
                  id={'colorArest'}
                  value={this.state.colorCons}
                  onClosed={this.onColorChange_Cons.bind(this)}
                />
              </div>
            </div>

            <div className="dx-field">
              <div className="dx-field-label">Утверждение</div>
              <div className="dx-field-value">
                <ColorBox
                  value={this.state.colorConf}
                  onClosed={this.onColorChange_Conf.bind(this)}
                />
              </div>
            </div>

            <div className="dx-field">
              <div className="dx-field-label">Неполное утверждение</div>
              <div className="dx-field-value">
                <ColorBox
                  value={this.state.colorConfPart}
                  onClosed={this.onColorChange_ConfPart.bind(this)}
                />
              </div>
            </div>

            <div className="dx-field">
              <div className="dx-field-label">Аналитики</div>
              <div className="dx-field-value">
                <ColorBox
                  value={this.state.colorFilter}
                  onClosed={this.onColorChange_Filter.bind(this)}
                />
              </div>
            </div>

          </div>

        </div>
      </Popup>
      </React.Fragment>
    );
  }
}

export default ColorPanel;
