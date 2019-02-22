import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Thumbnail } from 'native-base';
import helpers from '../helpers/helpers';

const Avatar = (props) => {
  const size = props.size || 80;
  const fontSize = Math.ceil(size * .7);
  const letter = props.name ? props.name[0].toUpperCase() : 'A';

  if (props.photo && props.photo.length > 0) {
    let uri = props.photo

    // FB allows to request images with specific dimension
    if (props.photo.indexOf('graph.facebook.com') > -1) {
      uri = props.photo + "?height=" + props.size;
    }

    // Gets the best photo size if available
    if(props.photoSizes && props.photoSizes.length > 0){
      const availableSizes = Object.keys(props.photoSizes).map(size => size);
      uri = props.photoSizes[helpers.findClosestInArray(availableSizes, props.size)];
    }

    return (
      <Thumbnail
        source={{ uri }}
        style={{
          height: props.size,
          width: props.size,
          borderRadius: Platform.OS === 'ios' ? (props.size / 2) : props.size,
        }}
      />
    )
  } else {

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: props.backgroundColor || 'green', borderRadius: size }}>
        {props.children ?
          props.children :
          <Text style={{ fontSize: fontSize, color: props.fontColor || 'white' }}>{letter}</Text>
        }
      </View>
    );
  }
};

export default Avatar;