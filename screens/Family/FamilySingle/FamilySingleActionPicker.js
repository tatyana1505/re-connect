import React from 'react';
import { TouchableOpacity, View } from 'react-native'
import { Icon } from 'native-base';
import { Menu, MenuOptions, MenuOption, MenuTrigger, } from 'react-native-popup-menu';
import commonColor from '../../../native-base-theme/variables/commonColor';

const FamilySingleActionPicker = (props) => {
  return (
    <Menu>
      <MenuTrigger children={<Trigger />} />
      <MenuOptions customStyles={itemStyles}>
        <MenuOption onSelect={() => props.onSelect('add')} text='Add To Tree' />
        <MenuOption onSelect={() => props.onSelect('delete')} text='Delete From Tree' />
        <MenuOption onSelect={() => props.onSelect('view')} text='View Details' />
      </MenuOptions>
    </Menu>
  );
};

export default FamilySingleActionPicker;

const Trigger = () => (
  <View style={{ height: commonColor.toolbarHeight, width: 56, justifyContent: 'center', alignItems: 'center' }}>
    <Icon name="more" style={{ color: "white" }} />
  </View>
)

const itemStyles = {
  optionWrapper: {
    margin: 5
  },
  optionsContainer: {
    marginTop: 20,
  }
}