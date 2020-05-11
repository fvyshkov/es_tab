import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

export default class AMChart extends Component {

    constructor(props) {
        super(props);

        this.state = {
                    key:0
                };
        console.log("AMChart this.props", props);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.createChart = this.createChart.bind(this);

        this.chart = null;
    }

    componentDidMount(){

        this.createChart();
    }

    createChart() {
        console.log("AMChart this.props", this.props);
        this.chart = am4core.create("chartdiv", am4charts.XYChart);

        //.slice();
        /* Create axes */
        var categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = this.props.indexBy;
        categoryAxis.renderer.minGridDistance = 30;

        /* Create value axis */
        var valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

        var additionalAxisExists = this.props.keys.find(dataKey=>{
             return (dataKey in this.props.measuresProperties && this.props.measuresProperties[dataKey].additionalAxis==1);
        })
        ? true: false;

        if (additionalAxisExists){
            var valueAxis2 = this.chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis2.renderer.opposite = true;
            valueAxis2.syncWithAxis = valueAxis;
            valueAxis2.tooltip.disabled = true;
        }


        /* Create series */
        this.props.keys.forEach((dataKey, keyIndex)=>{
            console.log("dataKey", dataKey);
            var seriesType = "Bar";
            var additionalAxis = false;
            console.log("this.props.measuresProperties", dataKey, this.props.measuresProperties);

            if (dataKey in this.props.measuresProperties){
                seriesType = this.props.measuresProperties[dataKey].seriesType;
                additionalAxis = this.props.measuresProperties[dataKey].additionalAxis==1;

            }



            if (seriesType=="Bar"){
                var series = this.chart.series.push(new am4charts.ColumnSeries());
            }else{
                var series = this.chart.series.push(new am4charts.LineSeries());

            }

            if (additionalAxis){
                series.yAxis = valueAxis2;
            }else{
                series.yAxis = valueAxis;
            }

            series.name = dataKey;
            series.dataFields.valueY = dataKey;
            series.dataFields.categoryX = this.props.indexBy;


            series.fill = this.props.getColor(keyIndex);
            if (seriesType=="Line"){
                series.fillOpacity = 0;
            }else{
                series.fillOpacity = 1;
            }
            series.stroke = this.props.getColor(keyIndex);
            series.tooltip.label.textAlign = "middle";

            if (series instanceof am4charts.ColumnSeries){
                series.columns.template.tooltipText = "[#fff font-size: 15px]{name} - {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]"
                series.columns.template.propertyFields.fillOpacity = "fillOpacity";
                series.columns.template.propertyFields.stroke = "stroke";


                series.columns.template.propertyFields.strokeWidth = "strokeWidth";
                series.columns.template.propertyFields.strokeDasharray = "columnDash";
                series.columns.template.propertyFields.dataKey = dataKey;

                series.columns.template.events.on("hit", function(ev) {
                    if (this.props.seriesSetup){
                        console.log("column hit", ev.target);
                        this.props.seriesSetup(ev.target.propertyFields.dataKey);
                    }
                }, this);

            }else if (series instanceof am4charts.LineSeries){
                var bullet = series.bullets.push(new am4charts.Bullet());
                bullet.fill = am4core.color("#fdd400"); // tooltips grab fill from parent by default
                bullet.tooltipText = "[#fff font-size: 15px]{name} - {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]"

                bullet.seriesName = dataKey;
                var circle = bullet.createChild(am4core.Circle);
                circle.radius = 4;
                circle.fill = am4core.color("#fff");
                circle.strokeWidth = 3;
                series.segments.template.propertyFields.dataKey = dataKey;

                series.segments.template.interactionsEnabled = true;
                series.segments.template.events.on("hit", ev => {
                                                            var item = ev.target.dataItem.component.tooltipDataItem.dataContext;
                                                            console.log("line clicked on: " ,  ev.target.propertyFields.dataKey);
                                                            if (this.props.seriesSetup){
                                                                this.props.seriesSetup(ev.target.propertyFields.dataKey);
                                                            }
                                                        },this);

            }

        });
        /*
        var lineSeries = chart.series.push(new am4charts.LineSeries());
        lineSeries.name = "Expenses";
        lineSeries.dataFields.valueY = "expenses";
        lineSeries.dataFields.categoryX = "year";

        lineSeries.stroke = am4core.color("#fdd400");
        lineSeries.strokeWidth = 3;
        lineSeries.propertyFields.strokeDasharray = "lineDash";
        lineSeries.tooltip.label.textAlign = "middle";

        var bullet = lineSeries.bullets.push(new am4charts.Bullet());
        bullet.fill = am4core.color("#fdd400"); // tooltips grab fill from parent by default
        bullet.tooltipText = "[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]"
        var circle = bullet.createChild(am4core.Circle);
        circle.radius = 4;
        circle.fill = am4core.color("#fff");
        circle.strokeWidth = 3;
        */
        this.chart.data = this.props.data;;

    }

  componentDidUpdate(oldProps) {
    console.log("update MChart this.props", this.props);
    this.createChart();
    return;
    var data2 = this.props.data.map((row, index)=>{
        return {
            date:row[this.props.indexBy],
            name:"name_"+index,
            value:row[this.props.keys[0]]
            };
    });


    console.log("componentDidUpdate data2", data2);
    if (JSON.stringify(data2)!=JSON.stringify(this.chart.data)){
        this.chart.data = data2;
        this.setState({key:this.state.key+1});
    }
  }


  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    console.log("render charts.data", this.props);

    return (
      <div id="chartdiv" key={this.state.key} style={{ width: "100%", height: "100%" }}></div>
    );
  }
}
