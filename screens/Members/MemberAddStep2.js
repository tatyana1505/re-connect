import React from 'react';
import { View } from 'react-native';
import { Item, Input, Button, Text } from 'native-base';

class MemberAddStep2 extends React.Component {

  render() {
    return (
      <View style={{ margin: 17 }}>
        {this.props.addWithEmail === 1 &&
          <View>
            <View style={{ marginBottom: 10, paddingLeft: 5 }}>
              <Text>Email</Text>
            </View>
            <Item regular disabled style={{ backgroundColor: 'white' }}>
              <Input disabled value={this.props.email} />
            </Item>
          </View>
        }
        <View style={{ marginBottom: 10, marginTop: 10, paddingLeft: 5 }}>
          <Text>Name</Text>
        </View>
        <Item regular style={{ backgroundColor: 'white' }}>
          <Input onChangeText={displayName => this.props.onDisplayNameChange(displayName)}
          />
        </Item>
        
        <Text>{this.props.displayNameError}</Text>
      </View>
    );
  }

};

export default MemberAddStep2;