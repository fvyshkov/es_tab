import React from 'react';
import TableView from '../components/TableView.jsx';
import { render, mount } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';

describe('<TableView />', () => {

    it('TableView пустой', () => {
      const wrapper = render(<TableView />);
      expect(renderToJson(wrapper)).toMatchSnapshot();
    });


});