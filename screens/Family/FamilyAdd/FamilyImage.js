import React from 'react';
import { View, Image, TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import { Icon } from 'native-base';
import familyPlaceholderImage from '../../../assets/images/familyPlaceholder/familyPlaceholder.png';

const FamilyImage = ({ image, onPickImageSelect, isUploading }) => {
  return (
    <View>
      <Image
        source={image ? { uri: image } : familyPlaceholderImage}
        style={styles.image}
      />

      <TouchableOpacity
        onPress={() => { onPickImageSelect() }}
        style={styles.imageSelectIcon}
      >
        <Icon name="create" style={{ color: 'white' }} />
      </TouchableOpacity>
      {isUploading &&
        <View style={styles.imageUploadLoading}>
          <ActivityIndicator size="large" />
        </View>
      }
    </View>
  );
};

export default FamilyImage;


const styles = StyleSheet.create({
  imageUploadLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: Dimensions.get('window').width * 3 / 4,
    width: Dimensions.get('window').width,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: .5
  },
  image: {
    height: Dimensions.get('window').width * 3 / 4,
    width: Dimensions.get('window').width
  },
  imageSelectIcon: {
    position: 'absolute',
    padding: 20,
    bottom: 0,
    right: 0,
  }
})