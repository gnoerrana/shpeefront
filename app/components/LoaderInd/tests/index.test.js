import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';

import LoaderInd from '../index';

describe('<LoaderInd />', () => {
  it('should match the snapshot', () => {
    const renderedComponent = renderer.create(<LoaderInd />).toJSON();
    expect(renderedComponent).toMatchSnapshot();
  });
});
