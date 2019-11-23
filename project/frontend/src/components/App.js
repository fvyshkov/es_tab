import React, { Component } from 'react';
import ReactDOM from "react-dom";
import SheetView from "./SheetView.jsx";


const App = () => (
    <SheetView />
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;


export function sendGetRequest(request_string, successCallback){
    console.log(' sendGetRequest begin ');
    const httpRequest = new XMLHttpRequest();
    var httpStr = 'http://127.0.0.1:8000/'+request_string;
    httpRequest.open("GET",httpStr,true);
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var respObj = JSON.parse(httpRequest.responseText);
            console.log(' sendGetRequest before callback ');
            successCallback(respObj);
        }
    };
    httpRequest.send();
}

//export default sendGetRequest;