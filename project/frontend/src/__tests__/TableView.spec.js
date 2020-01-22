import React from 'react';
import TabView from '../components/TabView.jsx';
import TestGrid from '../components/TestGrid.jsx';
import TableViewWithSelection from '../components/TableViewWithSelection.jsx';
import Grid from '../components/Grid.jsx';
import ReGrid from '../components/ReGrid.jsx';
import { render, mount, shallow } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';
import "babel-polyfill";
import { AgGridReact } from "@ag-grid-community/react";
import {sendRequestPromise} from '../components/sendRequestPromise.js';
import { Provider } from "react-redux";
import store from "../store/index";
import PropTypes from 'prop-types';



import mock from 'xhr-mock';

jest.mock('../components/sendRequestPromise.js');

export const ensureGridApiHasBeenSet = component => {
    return waitForAsyncCondition(() => {
        return component.instance().api !== undefined
    }, 10000)
};

export const waitForAsyncCondition = (condition, maxAttempts, attempts=0) => new Promise(function (resolve, reject) {
    (function waitForCondition() {
        // we need to wait for the gridReady event before we can start interacting with the grid
        // in this case we're looking at the api property in our App component, but it could be
        // anything (ie a boolean flag)
        if (condition()) {
            // once our condition has been met we can start the tests
            return resolve();
        }
        attempts++;

        if(attempts >= maxAttempts) {
            reject("Max timeout waiting for condition")
        }

        // not set - wait a bit longer
        setTimeout(waitForCondition, 10);
    })();
});





describe('<TabView />', () => {

    beforeEach((done) => {

        wrapper = mount(<Provider store={store}>
                        <div style={{width:500, height:500}}>
                        <TableViewWithSelection layoutItemID={'100'} />
                        </div>
                        </Provider>);

        var grid = wrapper.find(ReGrid).instance();
        await waitForAsyncCondition(() => {
                                            return grid.gridApi !== undefined
                                            },
                                    5);

          /*
        component = mount(());
        agGridReact = component.find(AgGridReact).instance();
        // don't start our tests until the grid is ready
        ensureGridApiHasBeenSet(component).then(() => done(), () => fail("Grid API not set within expected time limits"));
            */
    });

    it('check snapshot', async () => {

        const wrapper = mount(<Provider store={store}>
                        <div style={{width:500, height:500}}>
                        <TableViewWithSelection layoutItemID={'100'} />
                        </div>
                        </Provider>);

        var myGrid = wrapper.find(ReGrid).instance();
        await waitForAsyncCondition(() => {
                                            return myGrid.gridApi !== undefined
                                            },
                                    5);

        var tabView = wrapper.find(TableViewWithSelection);
        tabView.instance().loadNewSheet(2434, 'tree');
/*
        await waitForAsyncCondition(() => { return myGrid.gridApi.getDisplayedRowCount() >1
                                            },
                                            1000);


        await waitForAsyncCondition(() => myGrid.gridApi.getCellRendererInstances() &&
                                      myGrid.gridApi.getCellRendererInstances().length > 0, 5)
            .then(() => null, () => fail("Renderer instance not created within expected time")
            );
*/

        await waitForAsyncCondition(() => {return   wrapper.html().includes('5864755.22');},
                                            1000);

         expect(wrapper.html()).toMatchSnapshot();
    })



    //});



});