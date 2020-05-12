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
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.createChart = this.createChart.bind(this);
        this.createTrendLine = this.createTrendLine.bind(this);

        this.chart = null;
    }

    componentDidMount(){

        this.createChart();
    }

    getTrendValues(data){
        //на входе нужен массив значений [100, 200, 100 ...]
        console.log("getTrendValues data", data);
        if (data.length==0){
            return 0;
        }

        var xySum = 0;
        var ySum = 0;
        var xSum = 0;
        var xxSum = 0;
        var n = data.length;

        data.forEach((y, index)=>{
            var x = index+1;
            xySum += x*y;
            xSum += x;
            ySum += y;
            xxSum += x*x;
        });

        var b = (n*xySum-xSum*ySum)/(n*xxSum-xSum*xSum);
        var a = (ySum- b*xSum)/n;

        var startY = a+b;
        var endY = a+b*n;

        return {startY: startY, endY: endY};
    }

    getTrendDescripton(data, categoryX, valueY){

        var resultData = [];

        var trendValues = this.getTrendValues(data.map(row=>{
            return row[valueY];
        }));

        const startPoint = {};
        console.log("--data", data);
        startPoint[categoryX] = data[0][categoryX];
        startPoint[valueY] = trendValues.startY;// data[0][valueY];
        resultData.push(startPoint);

        const endPoint = {};
        endPoint[categoryX] = data[data.length-1][categoryX];
        endPoint[valueY] = trendValues.endY;//data[data.length-1][valueY];
        resultData.push(endPoint);

        return {data:resultData, categoryX: categoryX, valueY: valueY};
    }

    createTrendLine(trendDescription) {
        var trend = this.chart.series.push(new am4charts.LineSeries());

        trend.dataFields.valueY = trendDescription.valueY;
        trend.dataFields.categoryX = trendDescription.categoryX;
        trend.strokeWidth = 4;
        trend.stroke = am4core.color("#c00");
        trend.fill = am4core.color("#c00");
        trend.data = trendDescription.data;
        //trend.tooltipText = "Тренд по "+trendDescription.valueY;

        var bullet = trend.bullets.push(new am4charts.CircleBullet());
        //bullet.tooltipText = "{categoryX}\n[bold font-size: 17px]значение: {valueY}[/]";
        bullet.tooltipText = "Тренд по "+trendDescription.valueY+" : {valueY}[/]";
        bullet.strokeWidth = 4;
        bullet.stroke = am4core.color("#66ccff")
        bullet.circle.fill = trend.stroke;

        var hoverState = bullet.states.create("hover");
        hoverState.properties.scale = 1.7;

        return trend;
    };

    createChart() {
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

        if (this.props.scrollbarX){
            this.chart.scrollbarX = new am4core.Scrollbar();
        }

        if (this.props.scrollbarY){
            this.chart.scrollbarY = new am4core.Scrollbar();
        }



        //}

        /* Create series */
        this.props.keys.forEach((dataKey, keyIndex)=>{
            var seriesType = "Bar";
            var additionalAxis = false;
            var showLinearTrend = false;

            if (dataKey in this.props.measuresProperties){
                seriesType = this.props.measuresProperties[dataKey].seriesType;
                additionalAxis = this.props.measuresProperties[dataKey].additionalAxis==1;
                showLinearTrend = this.props.measuresProperties[dataKey].showLinearTrend==1;
            }

            if (showLinearTrend){
                const trendDescription = this.getTrendDescripton(this.props.data, this.props.indexBy, dataKey);
                console.log("trendDescription", trendDescription);
                this.createTrendLine(trendDescription);
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
                series.fillOpacity = .8;
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
    this.createChart();
    return;
    var data2 = this.props.data.map((row, index)=>{
        return {
            date:row[this.props.indexBy],
            name:"name_"+index,
            value:row[this.props.keys[0]]
            };
    });


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

    return (
      <div id="chartdiv" key={this.state.key} style={{ width: "100%", height: "100%" }}></div>
    );
  }
}
