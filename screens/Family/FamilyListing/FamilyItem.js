import React from 'react';
import { ListItem, Right, Body, Thumbnail, Icon, Text } from 'native-base';
import familyPlaceholderImage from '../../../assets/images/familyPlaceholder/familyPlaceholder.png';

const FamilyItem = (props) => {

  handlePress = () => {
    props.navigation.push('FamilySingle', { family: props.family });
  }

  let uri = props.family.photo;
  if (props.family.photoSizes) {
    uri = props.family.photoSizes[96];
  }

  return (
    <ListItem onPress={handlePress}>
      <Thumbnail
        square
        source={uri ? { uri } : familyPlaceholderImage}
        size={96}
      />
      <Body>
        <Text style={{ paddingLeft: 20 }}>{props.family.name}</Text>
      </Body>
      <Right>
        <Icon name={"arrow-forward"} />
      </Right>
    </ListItem>
  );
};

export default FamilyItem;