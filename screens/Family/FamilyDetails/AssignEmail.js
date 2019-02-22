import React, { Component } from 'react';
import { View } from 'native-base';
import userHelpers from '../../../helpers/userHelpers';
import helpers from '../../../helpers/helpers';

class AssignEmail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchEmail: '',
      searchedUsers: null,
    }
  }


  searchUser() {
    if (helpers.validateEmail(this.state.searchEmail)) {
      const user = await userHelpers.getUserData(this.state.searchEmail)
      this.setState({ user });
    }
  }

  render() {
    return (
      <View>
        <Text>Search a user by email</Text>
        <Item>
          <Input
            placeholder="Email"
            onChangeText={searchEmail => this.setState({ searchEmail })}
            keyboardType="email-address"
          />
        </Item>
        <Button primary full onPress={this.props.onSearch}><Text>Search</Text></Button>
      </View>
    );
  }
}

export default AssignEmail;