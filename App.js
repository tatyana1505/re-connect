import React from 'react';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import { Platform, StatusBar, StyleSheet, View, BackHandler } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import { NavigationActions } from "react-navigation";
import { StyleProvider, Root } from "native-base";
import getTheme from './native-base-theme/components';
import variables from './native-base-theme/variables/commonColor.js'
import { MenuProvider } from 'react-native-popup-menu';
import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import reducer from './helpers/reducers/index';

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

// To ignore the firebase related timer warning
import { YellowBox } from 'react-native';
import userHelpers from './helpers/userHelpers';
import helpers from './helpers/helpers';
import configuration from './helpers/configuration';
YellowBox.ignoreWarnings(['Setting a timer']);

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    const { dispatch, nav } = this.props;
    if (nav.index === 0) {
      return false;
    }

    dispatch(NavigationActions.back());
    return true;
  };

  componentWillMount() {
    const env = helpers.getEnv();
    let firebaseConfig = env === 'prod' ? configuration.prodFirebase : configuration.devFirebase;
    firebase.initializeApp(firebaseConfig);
  }


  componentDidMount() {
    if (this.props.exp && this.props.exp.notification) {
    }
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <Root>
          <StyleProvider style={getTheme(variables)}>
            <Provider store={store}>
              <View style={styles.container}>
                {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                <MenuProvider>
                  <AppNavigator />
                </MenuProvider>
              </View>
            </Provider>
          </StyleProvider>
        </Root>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([

      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        // ...Icon.Ionicons.font,

      }),
      Expo.Font.loadAsync({
        'Roboto': require('native-base/Fonts/Roboto.ttf'),
        'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5F4',
  },
});
