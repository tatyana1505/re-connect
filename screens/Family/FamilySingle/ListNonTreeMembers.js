import React from 'react';
import { View } from 'react-native';
import { Text, List, ListItem, Right, Left, Body, Icon, Thumbnail, Radio } from 'native-base';
import Avatar from '../../../components/Avatar';

const ListNonTreeMembers = (props) => {
  const emailsOfUsersToShow = Object.keys(props.family.members).filter(key => {
    return props.family.membersNotInTree.indexOf(key) > -1;
  })
  return (
    <View style={{ flex: 1 }}>
      <List>
        {emailsOfUsersToShow.map(email => {
          const user = props.family.members[email];
          return (
            <ListItem onPress={() => props.onUserSelect(email)} avatar key={email}>
              <Left>
                <Avatar
                  photo={user.data.photo}
                  name={user.data.displayName}
                  thumbnailSize="small"
                  size={36}
                />
              </Left>
              <Body>
                <Text>{user.data.displayName}</Text>
              </Body>
              <Right>
                <Radio selected={props.selectedUserEmail === email} onPress={() => props.onUserSelect(email)} />
              </Right>
            </ListItem>
          )
        })}
      </List>
      {emailsOfUsersToShow.length === 0 && !props.isUpdating &&
        <Text>All members of the group are in the family tree. Add new members to the group first and then you can add them to the tree.</Text>
      }
    </View>
  );
};

export default ListNonTreeMembers;