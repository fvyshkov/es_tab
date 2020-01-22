

export function sendRequestPromise(request_string, method='GET', data){
    //console.log('request_string', request_string);
    return new Promise(function(resolve, reject) {

        const httpRequest = new XMLHttpRequest();
        var httpStr = window.location.origin + '/' + request_string;
        //var httpStr = 'http://localhost' + '/' + request_string;
        //console.log('httpStr=', httpStr);


        //console.log('method', method, 'httpStr', httpStr);
        httpRequest.open(method,httpStr,true);
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                var respObj = JSON.parse(httpRequest.responseText);
                console.log('respObj', respObj);

                resolve(respObj);
            }
        };
        if (!data){
            httpRequest.send();
        }else{
            httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            httpRequest.send(JSON.stringify(data));
        }
    });

}