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
        if (trendDescription.strokeColor){
            trend.stroke = am4core.color(trendDescription.strokeColor);
        }else{
            trend.stroke = am4core.color("#c00");
        }
        trend.data = trendDescription.data;

        var bullet = trend.bullets.push(new am4charts.CircleBullet());
        bullet.tooltipText = "Тренд по "+trendDescription.valueY+" : {valueY}[/]";
        bullet.strokeWidth = 4;
        bullet.stroke = am4core.color("#66ccff")
        bullet.circle.fill = trend.stroke;

        if (trendDescription.additionalAxis){
            trend.yAxis = this.chart.yAxes.values[1];// valueAxis2;
        }else{
            trend.yAxis = this.chart.yAxes.values[0];// valueAxis;
        }

        var hoverState = bullet.states.create("hover");
        hoverState.properties.scale = 1.7;

        return trend;
    };

    createPieChart(){
        this.chart = am4core.create("chartdiv", am4charts.PieChart);
        this.chart.data = this.props.data;
        // Add and configure Series
        this.props.keys.forEach((dataKey, keyIndex)=>{

        //trendDescription['strokeColor'] = this.props.getColor(keyIndex);

            var pieSeries = this.chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = dataKey;
            pieSeries.dataFields.category = this.props.indexBy;

            pieSeries.colors.list = [1,2,3,4,5,6,7,8].map(index=>{
                console.log("this.props.getColor(index)", this.props.getColor(index));
                return  am4core.color(this.props.getColor(index));
            });



            pieSeries.labels.template.text = "{category}: {value.value}";
            pieSeries.slices.template.tooltipText = "{category}, " + dataKey + ": {value.value}[/]";

            pieSeries.slices.template.stroke = am4core.color("#fff");
            pieSeries.slices.template.fillOpacity = this.props.chartParams.fillOpacity;
            pieSeries.slices.template.strokeWidth = 2;
            //pieSeries.slices.template.fill = this.props.getColor(keyIndex);

            if (keyIndex<this.props.keys.length-1){
                pieSeries.labels.template.disabled = true;
            }


        });
    }


    createChart() {

        if (this.props.chartParams && this.props.chartParams.chartType=="Pie"){
            this.createPieChart();
            return;
        }

        var isChartXYExists = this.chart && this.chart.prototype &&
                                    this.chart.prototype.isPrototypeOf(am4charts.XYChart);
        if (!isChartXYExists){
            this.chart = am4core.create("chartdiv", am4charts.XYChart);
            this.chart.cursor = new am4charts.XYCursor();
            this.chart.cursor.maxTooltipDistance = 1;

            var categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.renderer.minGridDistance = 30;


            /* Create value axis */
            var valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

            var valueAxis2 = this.chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis2.renderer.opposite = true;
            valueAxis2.syncWithAxis = valueAxis;
            valueAxis2.tooltip.disabled = true;

            if (this.props.scrollbarX){
                this.chart.scrollbarX = new am4core.Scrollbar();
            }

            if (this.props.scrollbarY){
                this.chart.scrollbarY = new am4core.Scrollbar();
            }

        }
        this.chart.xAxes.values[0].dataFields.category = this.props.indexBy;
        this.chart.data = this.props.data;

        /* Delete series */
        while(this.chart.series.values.length>0){
            this.chart.series.removeIndex(0).dispose();
        }

        console.log("chart  measuresProperties ", this.props.measuresProperties);

        /* Add series*/
        this.props.keys.forEach((dataKey, keyIndex)=>{
            var seriesType = this.props.chartParams.chartType;
            var additionalAxis = this.props.chartParams.additionalAxis;
            var showLinearTrend = this.props.chartParams.showLinearTrend;
            var smoothLine = this.props.chartParams.smoothLine;
            var fillOpacity = this.props.chartParams.fillOpacity;
            var stacked = this.props.chartParams.stacked;


            if (dataKey in this.props.measuresProperties){
                console.log("chart series "+dataKey, this.props.measuresProperties[dataKey]);
                seriesType = this.props.measuresProperties[dataKey].chartType;
                additionalAxis = this.props.measuresProperties[dataKey].additionalAxis;
                showLinearTrend = this.props.measuresProperties[dataKey].showLinearTrend;
                smoothLine = this.props.measuresProperties[dataKey].smoothLine;
                fillOpacity = this.props.measuresProperties[dataKey].fillOpacity;
                stacked = this.props.measuresProperties[dataKey].stacked;
            }

            if (showLinearTrend){
                const trendDescription = this.getTrendDescripton(this.props.data, this.props.indexBy, dataKey);
                trendDescription['strokeColor'] = this.props.getColor(keyIndex);
                trendDescription['additionalAxis'] = additionalAxis;
                this.createTrendLine(trendDescription);
            }

            if (seriesType=="Bar"){
                var series = this.chart.series.push(new am4charts.ColumnSeries());
            }else{
                var series = this.chart.series.push(new am4charts.LineSeries());
            }

            series.name = dataKey;
            series.dataFields.valueY = dataKey;
            series.dataFields.categoryX = this.props.indexBy;
            series.fill = this.props.getColor(keyIndex);
            series.stroke = this.props.getColor(keyIndex);
            series.tooltip.label.textAlign = "middle";


            if (additionalAxis){
                series.yAxis = this.chart.yAxes.values[1];
            }else{
                series.yAxis = this.chart.yAxes.values[0];
            }

            series.stacked = stacked;

            if (seriesType=="Line"){
                series.fillOpacity = 0;
                series.tensionX = 1-smoothLine;
            }else if (seriesType == "Dots"){
                series.fillOpacity = 0;
                series.strokeOpacity = 0;
            }else if (seriesType =="Area"){
                console.log("Areea!= fillOpacity", fillOpacity);
                series.fillOpacity = fillOpacity;
                series.tensionX = 1-smoothLine;
            }else if (seriesType =="Bar"){
                series.fillOpacity = fillOpacity;
            }

            series.tooltipText = "[#fff font-size: 15px]{name} - {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]"

            if (series instanceof am4charts.ColumnSeries){

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

                bullet.seriesName = dataKey;

                bullet.propertyFields.dataKey = dataKey;
                bullet.events.on("hit", function(event){
                    if (this.props.seriesSetup){
                        this.props.seriesSetup(event.target.propertyFields.dataKey);
                    }
                }, this);

                var circle = bullet.createChild(am4core.Circle);
                circle.radius = 4;
                circle.fill = am4core.color("#fff");
                circle.strokeWidth = 3;
                series.segments.template.propertyFields.dataKey = dataKey;

                series.segments.template.interactionsEnabled = true;
                series.segments.template.events.on("hit", ev => {
                                                            if (this.props.seriesSetup){
                                                                this.props.seriesSetup(ev.target.propertyFields.dataKey);
                                                            }
                                                        },this);

            }

        });



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
