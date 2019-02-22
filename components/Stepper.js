import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Footer } from 'native-base';

const Stepper = (props) => {
  return (
    <View>
      {React.Children.map(props.children, (child, i) => {
        if (i === props.activeStep) return (
          <View>{child}</View>
        );
      })}
    </View>
  )
}

export default Stepper;

export const Step = (props) => (
  <View>{props.children}</View>
)