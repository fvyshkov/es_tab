import {sht_filters_2434, sht_info_2434, sht_state_2434, sht_columns_2434, sht_nodes_2434} from './apiData.js';


    /*
    mocking sendRequestPromise sht_state/?sht_id=2434
    mocking sendRequestPromise sht_columns/?&sht_id=2434
    mocking sendRequestPromise sht_info/?sht_id=2434
    */
export function sendRequestPromise(request_string, method='GET', data) {
    console.log('mocking sendRequestPromise', request_string);
    return new Promise((resolve, reject) => {
        var data=[];
        if (request_string.startsWith('sht_filters')){
            console.log('flt');
            data = sht_filters_2434;
        }else if (request_string.startsWith('sht_state')){
            console.log('state');
            data = sht_state_2434;
        }else if (request_string.startsWith('sht_info')){
            console.log('info');
            data = sht_info_2434;
        }else if (request_string.startsWith('sht_column')){
            console.log('cols');
            data = sht_columns_2434;
        }else if (request_string.startsWith('sht_nodes')){
            console.log('nodes');
            data = sht_nodes_2434;
        }



        resolve(data);
        //process.nextTick(() =>  {console.log('resolving...', data);resolve(data);});


    });
}


