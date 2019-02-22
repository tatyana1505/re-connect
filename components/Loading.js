import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import commonColor from '../native-base-theme/variables/commonColor';

const Loading = (props) => {
  return (
    <View style={[styles.container, props.style]}>
      <ActivityIndicator size="large" color={commonColor.brandPrimary} />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});