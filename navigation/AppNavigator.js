import React from 'react'
import { createSwitchNavigator, createDrawerNavigator } from 'react-navigation';
import MainTabNavigator from './MainTabNavigator';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LogoutScreen from '../screens/LogoutScreen';
import Drawer from '../components/Drawer';
import { Icon } from 'native-base';
import commonColor from '../native-base-theme/variables/commonColor';

export default createSwitchNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  Landing: LandingScreen,
  Login: LoginScreen,
  LoggedIn: createDrawerNavigator({
    Home: {
      screen: MainTabNavigator,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => <Icon size={24} name="home" style={{ color: tintColor }} />,
      }
    },
    Profile: {
      screen: ProfileScreen,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => <Icon size={24} name="person" style={{ color: tintColor }} />,
      }
    },
    Logout: {
      screen: LogoutScreen,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => <Icon size={24} name="ios-log-out" style={{ color: tintColor }} />,
      }
    },
  }, {
      initialRouteName: 'Home',
      contentComponent: Drawer,
      contentOptions: {
        activeTintColor: commonColor.brandPrimary,
      }
    })
});