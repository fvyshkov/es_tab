import React from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import { mount } from 'enzyme';
import SheetToolbar from "../components/SheetToolbar.jsx";

import { shallow } from 'enzyme';
//import MyComponent from './MyComponent';




describe('<App />', () => {

    const wrap1 = mount(<SheetToolbar />);

  it('renders', () => {

    expect(wrap1.find(SheetToolbar).exists()).toBe(true);
  });

  it('should be possible to activate button with Spacebar', () => {
  const component = mount(<Toolbar />);
  expect(component).toMatchSnapshot();
  component.unmount();
});

});

