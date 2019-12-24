import React, { Component } from 'react';
import ReactDOM from "react-dom";
import LayoutWithToolbar from "./LayoutWithToolbar.jsx";
import AddRemoveLayout from './AddRemoveLayout.jsx';
import TestGrid from './TestGrid.jsx';
import { FileUploader } from 'devextreme-react';
import "./index.css";

const App = () => (
    <div>
        <LayoutWithToolbar />
    </div>
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;
//module.hot.accept();

function onLayoutChange(e){

}


export function sendRequest(request_string, successCallback, method='GET', data){
    const httpRequest = new XMLHttpRequest();
    var httpStr = window.location.origin + '/' + request_string;

    httpRequest.open(method,httpStr,true);
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var respObj = JSON.parse(httpRequest.responseText);
            successCallback(respObj);
        }
    };
    if (!data){
        httpRequest.send();
    }else{
        httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        httpRequest.send(JSON.stringify(data));
    }
}