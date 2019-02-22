import React from 'react';
import * as firebase from 'firebase';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions, ScrollView } from 'react-native';
import FbLoginImg from '../assets/images/fb-login.png';
import GoogleLoginImg from '../assets/images/google-login.png';
import { Permissions, Notifications } from 'expo';
import userHelpers from '../helpers/userHelpers';
import helpers from '../helpers/helpers';
import FullscreenLoading from '../components/FullscreenLoading';
import { connect } from 'react-redux';
import { loginUser } from '../helpers/reducers/userReducer';
import EmailLogin from '../components/EmailLogin';
import { Container, Content } from 'native-base';
import configuration from '../helpers/configuration';

const globalError = {
  "auth/invalid-email": "Email is invalid",
  "auth/user-disabled": "This user is disabled",
  "auth/user-not-found": "This user does not exist. Please signup",
  "auth/wrong-password": "Incorrect password",
  "auth/email-already-in-use": "This email already exist. Please login or retrive you password",
  "auth/operation-not-allowed": "You account has been disabled",
  "auth/weak-password": "Password is not strong enough",
}

class LoginScreen extends React.Component {

  constructor(props) {
    super(props);
    this._loginWithGoogle = this._loginWithGoogle.bind(this);
    this.loginWithFacebook = this.loginWithFacebook.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handlePostLogin = this.handlePostLogin.bind(this);
    this.handleEmailAction = this.handleEmailAction.bind(this);
    this.EmailLoginComp = null;
    this.showAlert = this.showAlert.bind(this);
    this.state = {
      isLoggingIn: false,
      isEmailActivity: false,
      isPasswordResetEmailSent: false,
    };
    this.env = helpers.getEnv();
  }

  async getNotificationToken() {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    return token;
  }



  componentWillReceiveProps(nextProps) {

    // Handle logging in
    if (nextProps.users.isLoggingIn && !this.state.isLoggingIn) {
      this.setState({ isLoggingIn: nextProps.users.isLoggingIn });
    }

    // Handle upon login
    if (this.state.isLoggingIn && !nextProps.users.isLoggingIn && !nextProps.users.isLoggingInError) {
      this.props.navigation.navigate('Tabs');
    }
  }

  async loginWithFacebook() {
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(
      configuration.loginCredentials.facebook[env].id,
      { permissions: ['public_profile', 'email'] }
    );

    if (type === 'success') {
      // Build Firebase credential with the Facebook access token.
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      this.handleLogin(credential);
    }
  }


  async _loginWithGoogle() {
    try {
      const result = await Expo.Google.logInAsync({
        ...configuration.loginCredentials[env].google,
        scopes: ["profile", "email"]
      });

      if (result.type === "success") {
        const { idToken, accessToken } = result;
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
        this.handleLogin(credential);
      } else {
        return { cancelled: true };
      }
    } catch (err) {
      console.log("err:", err);
    }
  };

  async handleEmailAction(type, email, password, displayName) {

    if (type === 'register' && (!displayName || displayName.length === 0)) {
      this.showAlert('Please enter display name to signup');
      return;
    }

    this.setState({ isEmailActivity: true });
    let res = null;
    try {
      switch (type) {
        case 'register':
          res = await firebase.auth().createUserWithEmailAndPassword(email, password);
          break;
        case 'login':
          res = await firebase.auth().signInWithEmailAndPassword(email, password);
          break;
        case 'forgotpassword':
          res = await firebase.auth().sendPasswordResetEmail(email);
          break;
        default:
          break;
      }

      this.setState({ isEmailActivity: false });

      if (["login", "register"].indexOf(type) > -1) {
        // If email is not verified
        if (res.additionalUserInfo.providerId === 'password' && !res.user.emailVerified) {
          try {
            await firebase.auth().currentUser.updateProfile({
              displayName,
            });
            sendEmail = await firebase.auth().currentUser.sendEmailVerification();
            firebase.auth().signOut();
            this.showAlert('Please verify your email. We have sent you an email for verification!');
            this.EmailLoginComp.resetState();
          } catch (error) {
            firebase.auth().signOut();
            this.showAlert();
          }
        } else {
          const userObject = {
            user: {
              displayName,
              photoURL: ''
            },
            additionalUserInfo: res.additionalUserInfo,
          };
          this.handlePostLogin(userObject);
        }
      } else if (type === 'forgotpassword') {
        this.setState({ isPasswordResetEmailSent: true });
        this.showAlert("Please check your email for password reset link.");
        this.EmailLoginComp.resetState();
      }

    } catch (error) {
      this.setState({ isEmailActivity: false });
      this.showAlert(null, error.code)
      console.log(error);
    }
  }

  handleLogin(credential) {
    this.setState({ isLoggingIn: true });
    firebase
      .auth()
      .signInAndRetrieveDataWithCredential(credential)
      .then(res => {
        this.handlePostLogin(res);
      })
      .catch(error => {
        this.setState({ isLoggingIn: false });
        console.log("firebase cred err:", error);
        this.showAlert('Sorry! We could not log you in right now. Please try again later.')
        firebase.auth().signOut();
      });
  }

  showAlert(errorMessage, errorCode) {
    Alert.alert(
      'Alert',
      errorMessage || globalError[errorCode] || "Something went wrong",
      [
        { text: 'OK' },
      ],
      { cancelable: false }
    )
  }

  handlePostLogin(res) {
    const isNewUser = res.additionalUserInfo.isNewUser;
    const notificationToken = null;
    this.getNotificationToken()
      .then(notificationToken => {

        console.log(notificationToken);
        const userObject = {};

        if (notificationToken) {
          notificationToken = helpers.formatToken(notificationToken)

          // Add token to the user Object
          userObject.notificationToken = {
            [notificationToken]: true,
          }
        }

        // If new user, then add more info to the user object
        if (isNewUser) {
          userObject.displayName = res.user.displayName,
            userObject.photo = res.user.photoURL;
        }

        this.props.loginUser(userObject, userHelpers.getCurrentUserEmail(), false, isNewUser, notificationToken);

      })
      .catch(error => {
        this.showAlert('Something went wrong');
        firebase.auth().signOut();
        console.log(error);
      })
  }

  render() {
    const { isEmailActivity, isLoggingIn, isPasswordResetEmailSent } = this.state;
    return (
      <Container style={{ justifyContent: 'center' }}>
        {isLoggingIn && <FullscreenLoading />}
        <Content contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 300 }}>
            <EmailLogin
              onSubmit={this.handleEmailAction}
              isEmailActivity={isEmailActivity}
              isPasswordResetEmailSent={isPasswordResetEmailSent}
              ref={ref => this.EmailLoginComp = ref}
            />
            {/* <Text style={{ marginVertical: 17 }}>OR</Text> */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 17 }}>
              <TouchableOpacity onPress={this._loginWithGoogle} style={{ marginRight: 17, height: 64 }}>
                <Image source={GoogleLoginImg} resizeMode={'contain'} style={styles.loginImg} />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.loginWithFacebook} style={{ height: 64 }}>
                <Image source={FbLoginImg} resizeMode={'contain'} style={styles.loginImg} />
              </TouchableOpacity>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  users: state.userReducer.users,
})

const mapDispatchToProps = {
  loginUser,
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginImg: {
    width: 64,
    height: 64,
  }
});