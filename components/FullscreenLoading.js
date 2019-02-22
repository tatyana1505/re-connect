import React from 'react';
import { View, ActivityIndicator, Dimensions } from 'react-native';
import commonColor from '../native-base-theme/variables/commonColor';
const FullscreenLoading = () => {
  return (
    <View style={{ elevation: 9999999, position: 'absolute', top: 0, left: 0, height: Dimensions.get('window').height, width: Dimensions.get('window').width, backgroundColor: '#0005', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={commonColor.brandPrimary} size="large" />
    </View>
  );
};

export default FullscreenLoading;