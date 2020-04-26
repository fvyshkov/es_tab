import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
export default class AddRemoveLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 100
  };

  constructor(props) {
    super(props);

    this.state = {
      items: [0, 1, 2, 3, 4].map(function(i, key, list) {
        return {
          i: i.toString(),
          x: i * 2,
          y: 0,
          w: 2,
          h: 2,
          add: i === (list.length - 1)
        };
      }),
      newCounter: 0
    };

    this.onAddItem = this.onAddItem.bind(this);
    this.onBreakpointChange = this.onBreakpointChange.bind(this);
  }

  createElement(el) {
    const removeStyle = {
      position: "absolute",
      right: "2px",
      top: 0,
      cursor: "pointer"
    };
    const i = el.i;
    return (

      <div key={i} data-grid={el} className="LayoutItem" layoutitemtype={el.elementType} idx={i}>
        {el.renderItem}
      </div>
    );
  }

    componentDidMount() {
        //this.props.addNewLayoutItem(this.onGetAddItem.bind(this));
    }

    onGetAddItem(){
        //var newItem = this.props.getNewLayoutItem();
        //console.log('newItem=', newItem);
        //this.onAddItem();
    }

  onAddItem() {
    /*eslint no-console: 0*/
    //console.log("adding", "n" + this.state.newCounter);
    this.setState({
      // Add a new item. It must have a unique key!
      items: this.state.items.concat({
        i: "n" + this.state.newCounter,
        x: (this.state.items.length * 2) % (this.state.cols || 12),
        y: Infinity, // puts it at the bottom
        w: 5,
        h: 2
      }),
      // Increment the counter to ensure key is always unique.
      newCounter: this.state.newCounter + 1
    });
  }

  // We're using the cols coming back from this to calculate where to add new items.
  onBreakpointChange(breakpoint, cols) {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
  }

    onLayoutChange(layout) {
        console.log("onLayoutChange low");
        return;
        console.log("items ", this.state.items);
        console.log("layout", layout);

        this.setState({ layout: layout });

        if (this.props.onLayoutChange){
            this.props.onLayoutChange(layout);
        }
    }

  onRemoveItem(i) {
    this.setState({ items: _.reject(this.state.items, { i: i }) });
  }

  render() {
    return (
      <div id="LayoutGrid" className="TestWrapper">

        <ResponsiveReactGridLayout
          onLayoutChange={this.onLayoutChange.bind(this)}
          onBreakpointChange={this.onBreakpointChange.bind(this)}
          draggableCancel={'.NonDraggableAreaClassName'}
          {...this.props}
        >
          {_.map(this.props.items, el => this.createElement(el))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}