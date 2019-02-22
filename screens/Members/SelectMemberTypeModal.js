import React from 'react';
import { View, Text } from 'react-native';
import { List, ListItem, Body, Left, Right, Radio, Icon } from 'native-base';

const SelectMemberTypeModal = (props) => {

  const items = [{
    slug: 'parent',
    title: "Parent",
  }]
  return (
    <List>
      {props.allowParent &&
        <ListItem onPress={() => props.onSelect('parent')}>
          <Body>
            <Text>Parent</Text>
          </Body>
          <Right>
            <Radio selected={props.activeSelection === 'parent'} onPress={() => props.onSelect('parent')} />
          </Right>
        </ListItem>
      }
      <ListItem onPress={() => props.onSelect('partner')}>
        <Body>
          <Text>Partner</Text>
        </Body>
        <Right>
          <Radio selected={props.activeSelection === 'partner'} onPress={() => props.onSelect('partner')} />
        </Right>
      </ListItem>
      <ListItem onPress={() => props.onSelect('children')}>
        <Body>
          <Text>Children</Text>
        </Body>
        <Right>
          <Radio selected={props.activeSelection === 'children'} onPress={() => props.onSelect('children')} />
        </Right>
      </ListItem>
    </List>
  );
};

export default SelectMemberTypeModal;