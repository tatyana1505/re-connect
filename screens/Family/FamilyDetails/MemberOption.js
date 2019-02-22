import React from 'react';
import { TouchableOpacity, View } from 'react-native'
import { Icon } from 'native-base';
import { Menu, MenuOptions, MenuOption, MenuTrigger, } from 'react-native-popup-menu';
import colors from '../../../native-base-theme/variables/commonColor';

const FamilySingleActionPicker = (props) => {
  const adminsArray = ["admin", "manager"];
  const isAssignEmail = props.status === 'noemail' && adminsArray.indexOf(props.currentUserRole) > -1;
  const isAssignManager = adminsArray.indexOf(props.currentUserRole) > -1 && props.memberRole === 'member' && props.status !== 'noemail';
  const isRemoveManager = adminsArray.indexOf(props.currentUserRole) > -1 && props.memberRole === 'manager';
  const isDeletable = !props.isRootNode && adminsArray.indexOf(props.currentUserRole) > -1 && props.memberRole !== 'admin';

  const isNoOption = !isAssignEmail && !isAssignManager && !isRemoveManager && !isDeletable;

  return (
    isNoOption ? null :
      <Menu>
        <MenuTrigger children={isNoOption ? null : <Trigger />} customStyles={triggerStyle} />
        <MenuOptions customStyles={itemStyles}>

          {/* Assign Email */}
          {isAssignEmail &&
            <MenuOption
              onSelect={() => props.onActionPress('assignEmail', props.refKey)}
              text='Assign Email'
            />
          }

          {/* Assign Manager */}
          {isAssignManager &&
            <MenuOption onSelect={() => props.onActionPress('assignManager', props.refKey)} text='Assign Manager' />
          }

          {/* Remove As Manager */}
          {isRemoveManager &&
            <MenuOption onSelect={() => props.onActionPress('removeAsManager', props.refKey)} text='Remove As Manager' />
          }

          {/* Delete User */}
          {isDeletable &&
            <MenuOption onSelect={() => props.onDeletePress(props.refKey)} text='Remove Member' />
          }
        </MenuOptions>
      </Menu >
  );
};

export default FamilySingleActionPicker;

const Trigger = () => {
  return (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', paddingRight: 0, width: 48, alignItems: 'center' }}>
      <Icon name="more" />
    </View>
  )
}

const itemStyles = {
  optionWrapper: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
}

const triggerStyle = {
  triggerWrapper: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    height: 30,
  },
}