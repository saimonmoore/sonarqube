/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { shallow } from 'enzyme';
import ListStyleFacet, { Props } from '../ListStyleFacet';
import { waitAndUpdate } from '../../../helpers/testUtils';

it('should render', () => {
  expect(shallowRender()).toMatchSnapshot();
});

it('should select items', () => {
  const onChange = jest.fn();
  const wrapper = shallowRender({ onChange });
  const instance = wrapper.instance() as ListStyleFacet<string>;

  // select one item
  instance.handleItemClick('b', false);
  expect(onChange).lastCalledWith({ foo: ['b'] });
  wrapper.setProps({ values: ['b'] });

  // select another item
  instance.handleItemClick('a', false);
  expect(onChange).lastCalledWith({ foo: ['a'] });
  wrapper.setProps({ values: ['a'] });

  // unselect item
  instance.handleItemClick('a', false);
  expect(onChange).lastCalledWith({ foo: [] });
  wrapper.setProps({ values: [] });

  // select multiple items
  wrapper.setProps({ values: ['b'] });
  instance.handleItemClick('c', true);
  expect(onChange).lastCalledWith({ foo: ['b', 'c'] });
  wrapper.setProps({ values: ['b', 'c'] });

  // unselect item
  instance.handleItemClick('c', true);
  expect(onChange).lastCalledWith({ foo: ['b'] });
});

it('should toggle', () => {
  const onToggle = jest.fn();
  const wrapper = shallowRender({ onToggle });
  wrapper.find('FacetHeader').prop<Function>('onClick')();
  expect(onToggle).toBeCalled();
});

it('should clear', () => {
  const onChange = jest.fn();
  const wrapper = shallowRender({ onChange, values: ['a'] });
  wrapper.find('FacetHeader').prop<Function>('onClear')();
  expect(onChange).toBeCalledWith({ foo: [] });
});

it('should search', async () => {
  const onSearch = jest.fn().mockResolvedValue({
    results: ['d', 'e'],
    paging: { pageIndex: 1, pageSize: 2, total: 3 }
  });
  const wrapper = shallowRender({ onSearch });

  // search
  wrapper.find('SearchBox').prop<Function>('onChange')('query');
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(onSearch).lastCalledWith('query');

  // load more results
  onSearch.mockResolvedValue({
    results: ['f'],
    paging: { pageIndex: 2, pageSize: 2, total: 3 }
  });
  wrapper.find('ListFooter').prop<Function>('loadMore')();
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(onSearch).lastCalledWith('query', 2);

  // clear search
  onSearch.mockClear();
  wrapper.find('SearchBox').prop<Function>('onChange')('');
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(onSearch).not.toBeCalled();

  // search for no results
  onSearch.mockResolvedValue({ results: [], paging: { pageIndex: 1, pageSize: 2, total: 0 } });
  wrapper.find('SearchBox').prop<Function>('onChange')('blabla');
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(onSearch).lastCalledWith('blabla');

  // search fails
  onSearch.mockRejectedValue(undefined);
  wrapper.find('SearchBox').prop<Function>('onChange')('blabla');
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot(); // should render previous results
  expect(onSearch).lastCalledWith('blabla');
});

function shallowRender(props: Partial<Props<string>> = {}) {
  return shallow(
    <ListStyleFacet
      facetHeader="facet header"
      fetching={false}
      getFacetItemText={identity}
      getSearchResultKey={identity}
      getSearchResultText={identity}
      onChange={jest.fn()}
      onSearch={jest.fn()}
      onToggle={jest.fn()}
      open={true}
      property="foo"
      renderFacetItem={identity}
      renderSearchResult={identity}
      searchPlaceholder="search for foo..."
      stats={{ a: 10, b: 8, c: 1 }}
      values={[]}
      {...props}
    />
  );
}

function identity(str: string) {
  return str;
}