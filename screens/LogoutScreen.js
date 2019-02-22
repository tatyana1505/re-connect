import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Toast } from 'native-base';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { logout } from '../helpers/reducers/userReducer';

class LogoutScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.logout();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.families && !nextProps.events && !nextProps.users) {
      firebase.auth().signOut()
      .then(() => {
        this.props.navigation.navigate('Login');
      })
    }
  }

  render() {

    return (
      <View style={styles.container}>
        <Text>Loading</Text>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  events: state.eventReducer.events,
  users: state.userReducer.users,
  families: state.familyReducer.families,
})

const mapDispatchToProps = {
  logout,
}

export default connect(mapStateToProps, mapDispatchToProps)(LogoutScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
