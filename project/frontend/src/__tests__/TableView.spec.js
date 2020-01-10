import React from 'react';
import TabView from '../components/TabView.jsx';
import Grid from '../components/Grid.jsx';
import { render, mount, shallow } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';
import "babel-polyfill";
import { AgGridReact } from "@ag-grid-community/react";
import {sendRequestPromise} from '../components/sendRequestPromise.js';

import { Provider } from "react-redux";
import store from "../store/index";



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
        const wrapper = mount(<Provider store={store}><TabView layoutItemID={'100'} /></Provider>);
console.log('after mount');
        var myGrid = wrapper.find(Grid).instance();
        //var tabView = wrapper.find(TabView).instance();
console.log(wrapper.html());

        await waitForAsyncCondition(() => {
                                            return myGrid.gridApi !== undefined
                                            },
                                    5);
        var tabView = wrapper.find(TabView);
        await tabView.instance().loadNewSheet(2434, 'tree');

        //await setTimeout(()=>{}, 5000);

        //console.log(wrapper.html());

        //var htmlIncludeColumn = wrapper.html().includes('<span class="tag" id="39595_tag" aria-label="ГО">');

        //expect(htmlIncludeColumn).toBeFalsy();
        //expect(wrapper.html()).toMatchSnapshot();

        wrapper.instance().setTestFieldAsync('100');

        await waitForAsyncCondition(() => {return  wrapper.html().includes('4864755');}, 1000);
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