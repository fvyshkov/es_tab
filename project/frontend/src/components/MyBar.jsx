import React, { PureComponent } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as d3 from 'd3';

const data = [
  {
    name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
  },
  {
    name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
  },
  {
    name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
  },
  {
    name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
  },
  {
    name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
  },
  {
    name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
  },
  {
    name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
  },
];

const colorMaps = {
 "accent" :d3.schemeAccent,
 "category10":d3.schemeCategory10,
 "dark2":d3.schemeDark2,
 "pastel1":d3.schemePastel1,
 "set1":d3.schemeSet1,
 "set2":d3.schemeSet2
}

export class MyBar extends PureComponent {

  render() {

    console.log("this.props.colors", this.props.colors);
    var colorFuncton = d3.scaleOrdinal(this.props.colors.scheme in colorMaps ?colorMaps[this.props.colors.scheme]:colorMaps["accent"]);

    var bars=this.props.keys.map((key, index)=>{
        return (<Bar dataKey={key} fill={colorFuncton(index)} />);
    });
    /*


    */
    return (
    <ResponsiveContainer>
      <BarChart
        data={this.props.data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={this.props.indexBy} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars}
      </BarChart>
      </ResponsiveContainer>
    );
  }
}
