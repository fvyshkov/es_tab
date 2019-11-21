import React, { Component } from 'react';
import ReactDOM from "react-dom";
const App = () => (
  <h1>first react page</h1>
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;