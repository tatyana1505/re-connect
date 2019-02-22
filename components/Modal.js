import React from 'react';
import { Modal, View, Text } from 'react-native';
import { Header, Left, Body } from 'native-base';

const CustomModal = (props) => {
  return (
    <Modal
      visible={props.visible}
      presentationStyle={props.presentationStyle}
      animationStyle={props.animationStyle || 'slide'}
    >
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
        <View style={{ flex: 1, height: 200 }}>
          <ScrollView>
            <Header>
              <Left>
              </Left>
              <Body>
                <Text>Header</Text>
              </Body>
            </Header>
            <View style={{ flex: 1 }}>
              {props.children}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;