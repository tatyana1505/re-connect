import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, BackHandler } from 'react-native';
import { Notifications } from 'expo';
import { loginUser } from '../helpers/reducers/userReducer';
import userHelpers from '../helpers/userHelpers';
import { connect } from 'react-redux';
import commonColor from '../native-base-theme/variables/commonColor';
import * as firebase from 'firebase';
import helpers from '../helpers/helpers';

class LandingScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoggingIn: false,
    }
  }


  componentWillMount() {

    // Notification Listener
    Notifications.addListener((notification) => {
      if (notification.origin === 'selected') {
        const type = notification.data ? notification.data.type : '';
        if (type === 'event') {
          this.props.navigation.navigate('EventListing');
        } else if (type === 'family') {
          this.props.navigation.navigate('FamilyListing');
        }
      }
    })

    // Auth Listener
    this.authListenerUnSubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user != null) {
        this.props.loginUser({}, userHelpers.getCurrentUserEmail(), true);
      } else {
        this.authListenerUnSubscribe();
        this.props.navigation.navigate('Login');
      }
    })
  }

  componentWillReceiveProps(nextProps) {

    // Handle logging in
    if (nextProps.users.isLoggingIn && !this.state.isLoggingIn) {
      this.setState({ isLoggingIn: nextProps.users.isLoggingIn });
    }

    // Handle upon login
    if (this.state.isLoggingIn && !nextProps.users.isLoggingIn && !nextProps.users.isLoggingInError) {
      this.props.navigation.navigate('LoggedIn');
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={'large'} color={commonColor.brandPrimary} />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  users: state.userReducer.users,
})

const mapDispatchToProps = {
  loginUser,
}

export default connect(mapStateToProps, mapDispatchToProps)(LandingScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});