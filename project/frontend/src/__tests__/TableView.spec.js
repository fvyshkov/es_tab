import React from 'react';
import TabView from '../components/TabView.jsx';
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

    it('Test mock', async () => {

        console.log('window.location.origin', window.location.origin);
        //return;
        const wrapper = mount(<Provider store={store}><TableViewWithSelection layoutItemID={'100'} /></Provider>);
console.log('after mount');
        var myGrid = wrapper.find(ReGrid).instance();

        var agGridReact = wrapper.find(AgGridReact).instance();
        //var tabView = wrapper.find(TabView).instance();
//console.log(wrapper.html());

        await waitForAsyncCondition(() => {
                                            return myGrid.gridApi !== undefined
                                            },
                                    5);

        await waitForAsyncCondition(() => {
                                            return (myGrid.gridReadyFlag)
                                            },
                                    500);


        var tabView = wrapper.find(TableViewWithSelection);
        tabView.instance().loadNewSheet(2434, 'tree');

        // expect(agGridReact.api).toBeTruthy();

        //return;
        //tabView.instance().testAsyncSetValue(100);
        await waitForAsyncCondition(() => {
                            //console.log('testing...');
                                            //wrapper.html().includes('ag-header-cell-text');
                                            return (myGrid.state.columnDefs.length>1);
                                            },
                                            1000);


        //agGridReact.render();
        //const agGridReactWrapper = wrapper.find(AgGridReact);
      //  console.log('FINAL', myGrid.gridColumnApi);


        await waitForAsyncCondition(() => { return myGrid.gridApi.getDisplayedRowCount() >1
                                            },
                                            1000);

        //myGrid.gridApi.forEachNode((node, index)=>{console.log('row', index, node);});
        //console.log('FINAL', myGrid.gridApi.getDisplayedRowAtIndex(0).data);

        await waitForAsyncCondition(() => myGrid.gridApi.getCellRendererInstances() &&
                                      myGrid.gridApi.getCellRendererInstances().length > 0, 5)
              .then(() => null, () => fail("Renderer instance not created within expected time"));

     //   myGrid.gridApi.getCellRendererInstances().forEach((cell)=>{console.log('cell', cell);});
     //   console.log('FINAL', myGrid.gridApi.getDisplayedRowAtIndex(0).data);
        //console.log('FINAL', wrapper.html());// agGridReact.render().html());

          expect(wrapper.contains('')).toEqual(true);

      //  await waitForAsyncCondition(() => {return  tabView.instance().state.sheet_id==2324;}, 1000);
 //await waitForAsyncCondition(() => {return  wrapper.html().includes('востребования');}, 1000);
        //await setTimeout(()=>{}, 5000);

        //console.log(wrapper.html());

        //var htmlIncludeColumn = wrapper.html().includes('<span class="tag" id="39595_tag" aria-label="ГО">');

        //expect(htmlIncludeColumn).toBeFalsy();
        //expect(wrapper.html()).toMatchSnapshot();

        //wrapper.instance().setTestFieldAsync('100');

       // await waitForAsyncCondition(() => {return  wrapper.html().includes('востребования');}, 1000);
       // console.log('testField', wrapper.instance().getTestField());
/*
        await waitForAsyncCondition(() => {
                                                //var html='<span class="tag" id="39595_tag" aria-label="ГО">';
                                                var testValue='199322';
                                                //return html.includes('-199322.73')
                                                return wrapper.html().includes(testValue)
                                          }, 10000);

*/
        //console.log(wrapper.html());
    //
    })


/*
    it('should do something', async function() {
        jest.setTimeout(20000);
        const wrapper = mount(<TabView />);

        var myGrid = wrapper.find(Grid).instance();
        //var AgGridReact = wrapper.find(AgGridReact).instance();
        // don't start our tests until the grid is ready
       // await ensureGridApiHasBeenSet(agGridReact).then(() => done(), () => fail("Grid API not set within expected time limits"));

       await waitForAsyncCondition(() => {

                                            return myGrid.gridApi !== undefined
                                            },
                                    5);

        wrapper.instance().loadNewSheet(6754, 'tree');

        await waitForAsyncCondition(() => {
                                                var html='<span>-199322.73</span>';
                                                //return html.includes('-199322.73')
                                                return wrapper.html().includes('2402')
                                          }, 10000);

//        console.log(wrapper.html());

        //console.log(wrapper.html());
        //component.render().find('.ag-cell-value').html().toEqual(`<span>-199322.73</span>`)
        //console.log('agGridReact.api', agGridReact.api);
        //wrapper.instance().loadNewSheet(2324, 'tree');
        //console.log('after testGetPromise');
        //wrapper.update();
        //
        //console.log('inst', wrapper.instance);
        //expect(wrapper.instance().bar).toBe(100);
        //expect(renderToJson(wrapper)).toMatchSnapshot();
    });
*/

});