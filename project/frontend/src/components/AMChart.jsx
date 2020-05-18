import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_annotation from "@amcharts/amcharts4/plugins/annotation";

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


        if (this.props.chartParams.invertedAxis){
            trend.xAxis = this.chart.xAxes.values[trendDescription.additionalAxis? 1 : 0];
            trend.dataFields.valueX = trendDescription.valueY;
            trend.dataFields.categoryY = trendDescription.categoryX;
        }else{
            trend.yAxis = this.chart.yAxes.values[trendDescription.additionalAxis? 1 : 0];
            trend.dataFields.valueY = trendDescription.valueY;
            trend.dataFields.categoryX = trendDescription.categoryX;
        }

        var hoverState = bullet.states.create("hover");
        hoverState.properties.scale = 1.7;

        return trend;
    };

    createPieChart(){
        this.chart = am4core.create("chartdiv_"+this.props.chartId, am4charts.PieChart);

        if (this.props.chartParams.showLegend){
            this.chart.legend = new am4charts.Legend();
            this.chart.legend.position = this.props.chartParams.showLegend;
        }else{
            this.chart.legend = null;
        }


        var annotation = this.chart.plugins.push(new am4plugins_annotation.Annotation());

        this.chart.data = this.props.data;
        // Add and configure Series
        this.props.keys.forEach((dataKey, keyIndex)=>{

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

    createPieChartDouble(){

        var container = am4core.create("chartdiv_"+this.props.chartId, am4core.Container);

        var data = [{
            "disabled": true,
            "color": am4core.color("#dadada"),
            "opacity": 0.8,
            "strokeDasharray": "4,4"
        }];

        data[0][this.props.keys[0]] = 1;
        data[0][this.props.indexBy] = "Нет данных";

        data = data.concat(this.props.data.map(row=>{
                var newRow={};
                newRow[this.props.keys[0]] = row[this.props.keys[0]];
                newRow[this.props.indexBy] = row[this.props.indexBy];
                return newRow;
            }));

        container.width = am4core.percent(100);
        container.height = am4core.percent(100);
        container.layout = "horizontal";

        container.events.on("maxsizechanged", function () {
            chart1.zIndex = 0;
            separatorLine.zIndex = 1;
            dragText.zIndex = 2;
            chart2.zIndex = 3;
        })

        var chart1 = container.createChild(am4charts.PieChart);
        chart1 .fontSize = 11;
        chart1.hiddenState.properties.opacity = 0; // this makes initial fade in effect
        chart1.data = data;
        chart1.radius = am4core.percent(70);
        chart1.innerRadius = am4core.percent(40);
        chart1.zIndex = 1;

        var series1 = chart1.series.push(new am4charts.PieSeries());
        series1.dataFields.value = this.props.keys[0];
        series1.dataFields.category = this.props.indexBy;
        series1.colors.step = 4;
        series1.alignLabels = false;
        series1.labels.template.bent = true;
        series1.labels.template.radius = 3;
        series1.labels.template.padding(0,0,0,0);

        var sliceTemplate1 = series1.slices.template;
        sliceTemplate1.cornerRadius = 5;
        sliceTemplate1.draggable = true;
        sliceTemplate1.inert = true;
        sliceTemplate1.propertyFields.fill = "color";
        sliceTemplate1.propertyFields.fillOpacity = "opacity";
        sliceTemplate1.propertyFields.stroke = "color";
        sliceTemplate1.propertyFields.strokeDasharray = "strokeDasharray";
        sliceTemplate1.strokeWidth = 1;
        sliceTemplate1.strokeOpacity = 1;

        var zIndex = 5;

        sliceTemplate1.events.on("down", function (event) {
            event.target.toFront();
            // also put chart to front
            var series = event.target.dataItem.component;
            series.chart.zIndex = zIndex++;
        })

        series1.ticks.template.disabled = true;

        sliceTemplate1.states.getKey("active").properties.shiftRadius = 0;

        sliceTemplate1.events.on("dragstop", function (event) {
            handleDragStop(event);
        })

        // separator line and text
        var separatorLine = container.createChild(am4core.Line);
        separatorLine.x1 = 0;
        separatorLine.y2 = 300;
        separatorLine.strokeWidth = 3;
        separatorLine.stroke = am4core.color("#dadada");
        separatorLine.valign = "middle";
        separatorLine.strokeDasharray = "5,5";


        var dragText = container.createChild(am4core.Label);
        dragText.text = "Двойная диаграмма";
        dragText.rotation = 90;
        dragText.valign = "middle";
        dragText.align = "center";
        dragText.paddingBottom = 5;

        // second chart
        var chart2 = container.createChild(am4charts.PieChart);
        chart2.hiddenState.properties.opacity = 0; // this makes initial fade in effect
        chart2 .fontSize = 11;
        chart2.radius = am4core.percent(70);
        chart2.data = data;
        chart2.innerRadius = am4core.percent(40);
        chart2.zIndex = 1;

        var series2 = chart2.series.push(new am4charts.PieSeries());
        series2.dataFields.value = this.props.keys[0];
        series2.dataFields.category = this.props.indexBy;
        series2.colors.step = 4;

        series2.alignLabels = false;
        series2.labels.template.bent = true;
        series2.labels.template.radius = 3;
        series2.labels.template.padding(0,0,0,0);
        series2.labels.template.propertyFields.disabled = "disabled";

        var sliceTemplate2 = series2.slices.template;
        sliceTemplate2.copyFrom(sliceTemplate1);

        series2.ticks.template.disabled = true;

        function handleDragStop(event) {
            var targetSlice = event.target;
            var dataItem1;
            var dataItem2;
            var slice1;
            var slice2;

            if (series1.slices.indexOf(targetSlice) != -1) {
                slice1 = targetSlice;
                slice2 = series2.dataItems.getIndex(targetSlice.dataItem.index).slice;
            }
            else if (series2.slices.indexOf(targetSlice) != -1) {
                slice1 = series1.dataItems.getIndex(targetSlice.dataItem.index).slice;
                slice2 = targetSlice;
            }


            dataItem1 = slice1.dataItem;
            dataItem2 = slice2.dataItem;

            var series1Center = am4core.utils.spritePointToSvg({ x: 0, y: 0 }, series1.slicesContainer);
            var series2Center = am4core.utils.spritePointToSvg({ x: 0, y: 0 }, series2.slicesContainer);

            var series1CenterConverted = am4core.utils.svgPointToSprite(series1Center, series2.slicesContainer);
            var series2CenterConverted = am4core.utils.svgPointToSprite(series2Center, series1.slicesContainer);

            // tooltipY and tooltipY are in the middle of the slice, so we use them to avoid extra calculations
            var targetSlicePoint = am4core.utils.spritePointToSvg({ x: targetSlice.tooltipX, y: targetSlice.tooltipY }, targetSlice);

            if (targetSlice == slice1) {
                if (targetSlicePoint.x > container.pixelWidth / 2) {
                    var value = dataItem1.value;

                    dataItem1.hide();

                    var animation = slice1.animate([{ property: "x", to: series2CenterConverted.x }, { property: "y", to: series2CenterConverted.y }], 400);
                    animation.events.on("animationprogress", function (event) {
                        slice1.hideTooltip();
                    })

                    slice2.x = 0;
                    slice2.y = 0;

                    dataItem2.show();
                }
                else {
                    slice1.animate([{ property: "x", to: 0 }, { property: "y", to: 0 }], 400);
                }
            }
            if (targetSlice == slice2) {
                if (targetSlicePoint.x < container.pixelWidth / 2) {

                    var value = dataItem2.value;

                    dataItem2.hide();

                    var animation = slice2.animate([{ property: "x", to: series1CenterConverted.x }, { property: "y", to: series1CenterConverted.y }], 400);
                    animation.events.on("animationprogress", function (event) {
                        slice2.hideTooltip();
                    })

                    slice1.x = 0;
                    slice1.y = 0;
                    dataItem1.show();
                }
                else {
                    slice2.animate([{ property: "x", to: 0 }, { property: "y", to: 0 }], 400);
                }
            }

            toggleDummySlice(series1);
            toggleDummySlice(series2);

            series1.hideTooltip();
            series2.hideTooltip();
        }

        function toggleDummySlice(series) {
            var show = true;
            for (var i = 1; i < series.dataItems.length; i++) {
                var dataItem = series.dataItems.getIndex(i);
                if (dataItem.slice.visible && !dataItem.slice.isHiding) {
                    show = false;
                }
            }

            var dummySlice = series.dataItems.getIndex(0);
            if (show) {
                dummySlice.show();
            }
            else {
                dummySlice.hide();
            }
        }

        series2.events.on("datavalidated", function () {

            var dummyDataItem = series2.dataItems.getIndex(0);
            dummyDataItem.show(0);
            dummyDataItem.slice.draggable = false;
            dummyDataItem.slice.tooltipText = undefined;

            for (var i = 1; i < series2.dataItems.length; i++) {
                series2.dataItems.getIndex(i).hide(0);
            }
        })

        series1.events.on("datavalidated", function () {
            var dummyDataItem = series1.dataItems.getIndex(0);
            dummyDataItem.hide(0);
            dummyDataItem.slice.draggable = false;
            dummyDataItem.slice.tooltipText = undefined;
        })

    }


    createChart() {
        if (this.interval){
            clearInterval(this.interval);
        }


        if (this.props.chartParams && this.props.chartParams.chartType=="Pie"){
            if (this.props.chartParams.doubleChart){
                this.createPieChartDouble();
            }else{
                this.createPieChart();
            }
            return;
        }

        var isChartXYExists = this.chart && this.chart.prototype &&
                                    this.chart.prototype.isPrototypeOf(am4charts.XYChart);
        if (!isChartXYExists){




            this.chart = am4core.create("chartdiv_"+this.props.chartId, am4charts.XYChart);

            this.chart.legend = new am4charts.Legend();

            var titleLabel = this.chart.plotContainer.createChild(am4core.Label);
            titleLabel.x = am4core.percent(50);
            titleLabel.y = am4core.percent(0);
            titleLabel.dy = -35;
            titleLabel.fontSize = 20;
            titleLabel.horizontalCenter = "middle";
            titleLabel.verticalCenter = "middle";
            titleLabel.tagName = "titleLabel";
            titleLabel.text = this.props.chartParams.title;

            if (this.props.chartParams.invertedAxis){
                var AxesForCategory = this.chart.yAxes;
                var AxesForValue = this.chart.xAxes;
            }else{
                var AxesForCategory = this.chart.xAxes;
                var AxesForValue = this.chart.yAxes;
            }

            var categoryAxis = AxesForCategory.push(new am4charts.CategoryAxis());
            categoryAxis.renderer.minGridDistance = this.props.chartParams.minGridDistance;


            /* Create value axis */
            var valueAxis = AxesForValue.push(new am4charts.ValueAxis());
            var valueAxis2 = AxesForValue.push(new am4charts.ValueAxis());
            valueAxis2.renderer.opposite = true;
            valueAxis2.syncWithAxis = valueAxis;
            valueAxis2.tooltip.disabled = true;



        }

        if (this.props.chartParams.showLegend){
            this.chart.legend = new am4charts.Legend();
            this.chart.legend.position = this.props.chartParams.showLegend;
        }else{
            this.chart.legend = null;
        }

        this.chart.plotContainer.children.values.forEach((child, index)=>{
            if (child.tagName=="titleLabel"){
                child.text = this.props.chartParams ? this.props.chartParams.chartTitle: "";
            }
        });


        var annotation = this.chart.plugins.push(new am4plugins_annotation.Annotation());

        if (!this.props.chartParams.race){
            this.chart.cursor = new am4charts.XYCursor();
            this.chart.cursor.maxTooltipDistance = 1;

            if (this.props.scrollbarX){
                this.chart.scrollbarX = new am4core.Scrollbar();
            }

            if (this.props.scrollbarY){
                this.chart.scrollbarY = new am4core.Scrollbar();
            }
        }


        var AxesForCategory = this.props.chartParams.invertedAxis ? this.chart.yAxes : this.chart.xAxes;
        AxesForCategory.values[0].dataFields.category = this.props.indexBy;

        AxesForCategory.values[0].renderer.minGridDistance = this.props.chartParams.minGridDistance;
        AxesForCategory.values[0].renderer.labels.template.rotation = this.props.chartParams.labelRotation;


        var AxesForValue = this.props.chartParams.invertedAxis ? this.chart.xAxes : this.chart.yAxes;

        if (this.props.chartParams.showPercent){
            for (var i=0;i<2;i++){
                AxesForValue.values[i].calculateTotals = true;
                AxesForValue.values[i].min = 0;
                AxesForValue.values[i].max = 100;
                AxesForValue.values[i].strictMinMax = true;
            }

        }


        this.chart.data = this.props.data;





        /* Delete series */
        while(this.chart.series.values.length>0){
            this.chart.series.removeIndex(0).dispose();
        }

        console.log("chart  measuresProperties ", this.props.measuresProperties);

        /* Add series*/

        if (!this.props.chartParams.race){
            var seriesList = this.props.keys.slice();
        }else{
            var seriesList = ["value"];
        }
        seriesList.forEach((dataKey, keyIndex)=>{
            var seriesType = this.props.chartParams.chartType;
            var additionalAxis = this.props.chartParams.additionalAxis;
            var showLinearTrend = this.props.chartParams.showLinearTrend;
            var smoothLine = this.props.chartParams.smoothLine;
            var fillOpacity = this.props.chartParams.fillOpacity;
            var stacked = this.props.chartParams.stacked;
            var strokeWidth = this.props.chartParams.strokeWidth;
            var strokeDasharray = this.props.chartParams.strokeDasharray;


            if (dataKey in this.props.measuresProperties){
                console.log("chart series "+dataKey, this.props.measuresProperties[dataKey]);
                seriesType = this.props.measuresProperties[dataKey].chartType;
                additionalAxis = this.props.measuresProperties[dataKey].additionalAxis;
                showLinearTrend = this.props.measuresProperties[dataKey].showLinearTrend;
                smoothLine = this.props.measuresProperties[dataKey].smoothLine;
                fillOpacity = this.props.measuresProperties[dataKey].fillOpacity;
                stacked = this.props.measuresProperties[dataKey].stacked;
                strokeWidth = this.props.measuresProperties[dataKey].strokeWidth;
                strokeDasharray = this.props.measuresProperties[dataKey].strokeDasharray;
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
            series.fill = this.props.getColor(keyIndex);
            series.stroke = this.props.getColor(keyIndex);
            series.tooltip.label.textAlign = "middle";


            if (this.props.chartParams.invertedAxis){
                series.xAxis = this.chart.xAxes.values[additionalAxis? 1 : 0];
                series.dataFields.valueX = dataKey;
                if(this.props.chartParams.showPercent){
                    series.dataFields.valueXShow = "totalPercent";
                }
                series.dataFields.categoryY = this.props.indexBy;
            }else{
                series.yAxis = this.chart.yAxes.values[additionalAxis? 1 : 0];
                series.dataFields.valueY = dataKey;
                if(this.props.chartParams.showPercent){
                    series.dataFields.valueYShow = "totalPercent";
                }
                series.dataFields.categoryX = this.props.indexBy;
            }

            series.stacked = stacked;

            if (seriesType=="Line"){
                series.fillOpacity = 0;
                if (this.props.chartParams.invertedAxis){
                    series.tensionY = 1-smoothLine;
                }else{
                    series.tensionX = 1-smoothLine;
                }
            }else if (seriesType == "Dots"){
                series.fillOpacity = 0;
                series.strokeOpacity = 0;
            }else if (seriesType =="Area"){
                series.fillOpacity = fillOpacity;
                series.tensionX = 1-smoothLine;

            }else if (seriesType =="Bar"){
                series.fillOpacity = fillOpacity;

            }

            series.strokeWidth = strokeWidth;
            series.strokeDasharray = strokeDasharray;

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
                bullet.fill = am4core.color("#fdd400");

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


        ///////RACE BEGIN
        if (this.props.chartParams.race){

            this.setupRace();


        }
        ///////RACE END

    }



    setupRace(){
        this.chart.zoomOutButton.disabled = true;
        var AxesForCategory = this.props.chartParams.invertedAxis ? this.chart.yAxes : this.chart.xAxes;
        AxesForCategory.values[0].dataFields.category = this.props.indexBy;

        var AxesForValue = this.props.chartParams.invertedAxis ? this.chart.xAxes : this.chart.yAxes;

        this.chart.numberFormatter.bigNumberPrefixes = [
                  { "number": 1e+3, "suffix": "K" },
                  { "number": 1e+6, "suffix": "M" },
                  { "number": 1e+9, "suffix": "B" }
                ];

            var stepDuration = 4000;
            var chart = this.chart;
            var label = this.chart.plotContainer.createChild(am4core.Label);
            var categoryAxis = AxesForCategory.values[0];
            var valueAxis =  AxesForValue.values[0];

                categoryAxis.renderer.grid.template.location = 0;
                //categoryAxis.dataFields.category = "network";
                categoryAxis.renderer.minGridDistance = 1;
                categoryAxis.renderer.inversed = true;
                categoryAxis.renderer.grid.template.disabled = true;

            valueAxis.min = 0;
            valueAxis.rangeChangeEasing = am4core.ease.linear;
            valueAxis.rangeChangeDuration = stepDuration;
            valueAxis.extraMax = 0.1;


            if (this.props.chartParams.invertedAxis){
                label.x = am4core.percent(97);
                label.y = am4core.percent(95);
                label.dx = -15;
                label.fontSize = 20;
                label.horizontalCenter = "right";
                label.verticalCenter = "middle";


            }else{
                label.x = am4core.percent(3);
                label.y = am4core.percent(5);
                label.dx = -15;
                label.fontSize = 20;
                label.horizontalCenter = "left";
                label.verticalCenter = "middle";
            }


            this.chart.series.values.forEach(series=>{
                series.interpolationDuration = stepDuration;
                series.interpolationEasing = am4core.ease.linear;

                series.columns.template.adapter.add("fill", function(fill, target){
                      return chart.colors.getIndex(target.dataItem.index*2);
                    });


                var labelBullet = series.bullets.push(new am4charts.LabelBullet())

                const cornerRadius = 5;

                if (this.props.chartParams.invertedAxis){
                    labelBullet.label.text = "{valueX.workingValue.formatNumber('#.0as')}";//"{values.valueX.workingValue.formatNumber('#.0as')}";
                    labelBullet.label.horizontalCenter = "right";
                    labelBullet.label.textAlign = "end";

                    series.columns.template.column.cornerRadiusBottomRight = cornerRadius;
                    series.columns.template.column.cornerRadiusTopRight = cornerRadius;


                }else{
                    labelBullet.label.text = "{valueY.workingValue.formatNumber('#.0as')}";//"{values.valueX.workingValue.formatNumber('#.0as')}";
                    labelBullet.label.horizontalCenter = "middle";
                    labelBullet.label.verticalCenter = "top";

                    series.columns.template.column.cornerRadiusTopLeft = cornerRadius;
                    series.columns.template.column.cornerRadiusTopRight = cornerRadius;

                }

                labelBullet.label.dx = -10;
            });



            var playButton = this.chart.plotContainer.createChild(am4core.PlayButton);
            playButton.x = am4core.percent(97);
            playButton.y = am4core.percent(95);
            playButton.dy = -2;
            playButton.verticalCenter = "middle";

            playButton.events.on("toggled", function(event) {
              if (event.target.isActive) {
                play(this);
              }
              else {
                stop(this);
              }
            }, this);

            var beginCategory= this.props.data.length ? this.props.data[0][this.props.indexBy] :null;

            //var raceCurrentCategory = beginCategory;
            var raceCurrentCategory = this.props.keys.length ? this.props.keys[0]: null;
            label.text = raceCurrentCategory;
            /////setup first data


            var newData = this.props.data.length ? this.props.data.map(row=>{
                var newRow = {};
                newRow[this.props.indexBy] = row[this.props.indexBy];
                newRow["value"] = row[raceCurrentCategory];
                return newRow;
            }):null;

             console.log("start newData", newData);
              this.chart.data = newData;

            //var interval;

            function play(component) {
              component.interval = setInterval(function(){
                nextCategory(component);
              }, stepDuration)
              nextCategory(component);
            }

            function stop(component) {
              if (component.interval) {
                clearInterval(component.interval);
              }
            }

            function nextCategory(component) {
                var indexOfCurrent = component.props.keys.findIndex(row=>{
                    return row == raceCurrentCategory;
                });
                if (indexOfCurrent==component.props.keys.length-1){
                    var indexOfNext = 0;
                }else{
                    var indexOfNext = indexOfCurrent+1;
                }
                raceCurrentCategory = component.props.keys[indexOfNext];


                var newData = component.props.data.length ? component.props.data.map(row=>{
                    var newRow = {};
                    newRow[component.props.indexBy] = row[component.props.indexBy];
                    newRow["value"] = row[raceCurrentCategory];
                    return newRow;
                }):null;


                    newData.forEach(row=>{
                        var chartDataIndex = component.chart.data.findIndex(chartRow=>{
                            return chartRow[component.props.indexBy] == row[component.props.indexBy];
                        });
                        component.chart.data[chartDataIndex]["value"]=row["value"];
                    });

                    component.chart.invalidateRawData();


              console.log("RACE", component.chart.data);
              var itemsWithNonZero = 0;

                /*
              for (var i = 0; i < chart.data.length; i++) {
                chart.data[i].MAU = newData[i].MAU;
                if (chart.data[i].MAU > 0) {
                  itemsWithNonZero++;
                }
              }*/

              component.chart.series.values.forEach(series=>{
                    if (raceCurrentCategory == beginCategory) {
                        series.interpolationDuration = stepDuration / 4;
                        valueAxis.rangeChangeDuration = stepDuration / 4;
                    }
                    else {
                        series.interpolationDuration = stepDuration;
                        valueAxis.rangeChangeDuration = stepDuration;
                    }

                   categoryAxis.sortBySeries = series;
              });


              label.text = raceCurrentCategory;

              //categoryAxis.zoom({ start: 0, end: itemsWithNonZero / categoryAxis.dataItems.length });

            }
/*
            this.chart.series.values.forEach(series=>{
                   categoryAxis.sortBySeries = series;
            });
*/
    }

    componentDidUpdate(oldProps) {
        this.createChart();
    }


  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
    if (this.interval){
            clearInterval(this.interval);
        }

  }

  render() {

    return (
      <div id={"chartdiv_"+this.props.chartId} key={this.state.key} style={{ width: "100%", height: "100%" }}></div>
    );
  }
}


