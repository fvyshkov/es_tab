import React from 'react';
import { Chart, Series, CommonSeriesSettings, Label, Format, Legend, Export, Size } from 'devextreme-react/chart';
export default class DXBar extends React.Component {



  render() {

    var contentElement = document.querySelector("#chart_content_"+this.props.layoutItemID);
    console.log("content=", contentElement);
    if (contentElement){
        console.log("size=", contentElement.offsetWidth, contentElement.offsetHeight);
    }
    const series=this.props.keys.map(key=>{
        return (<Series
                  valueField={key}
                  name={key}
                />);
    });

/*    return (
    <img height="100%" width="100%" src="https://i.pinimg.com/originals/59/b6/47/59b647cc4d2c0a911786a83bbf7ef1ea.jpg" />
    );

    elementAtt={{"style": "width:100%;height:100%"}}
    size={{width:this.props.parentWidth, height:this.props.parentHeight}}
    */
    return (
      <Chart id="chart123"
        title={this.props.title}
        dataSource={this.props.data}
        onPointClick={this.onPointClick}


      >
                        <Size
                    height={"100%"}
                    width={"100%"}
                />
        <CommonSeriesSettings
          argumentField={this.props.indexBy}
          type="bar"
          hoverMode="allArgumentPoints"
          selectionMode="allArgumentPoints"
        >
          <Label visible={true}>
            <Format type="fixedPoint" precision={0} />
          </Label>
        </CommonSeriesSettings>
        {series}
        <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
        <Export enabled={true} />
      </Chart>
    );
  }

  onPointClick(e) {
    e.target.select();
  }
}