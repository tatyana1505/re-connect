import React from 'react';
import { Platform, View, TouchableOpacity } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon, Text } from 'native-base';
import colors from '../native-base-theme/variables/commonColor';

// Family Import
import FamilyListingScreen from '../screens/Family/FamilyListing/FamilyListingScreen';
import FamilyAddScreen from '../screens/Family/FamilyAdd/FamilyAddScreen';
import FamilySingleScreen from '../screens/Family/FamilySingle/FamilySingleScreen';
import FamilyDetailsScreen from '../screens/Family/FamilyDetails/FamilyDetailsScreen';

// Event Import
import EventAddScreen from '../screens/Event/EventAdd/EventAddScreen';
import EventSingleScreen from '../screens/Event/EventSingle/EventSingleScreen';
import EventListingScreen from '../screens/Event/EventListing/EventListingScreen';
import FamilyProfileScreen from '../screens/FamilyProfileScreen';

// const FamilyListingStack = createStackNavigator({
//   FamilyListing: {
//     screen: FamilyListingScreen,
//     navigationOptions: ({ navigation }) => ({
//       headerBackTitle: null,
//       headerLeft: (
//         <TouchableOpacity onPress={() => { navigation.navigate('DrawerOpen') }}>
//           <Text style={{ paddingLeft: 17, paddingRight: 25 }}>
//             <Icon name="menu" size={20} style={{ color: '#fff' }} />
//           </Text>
//         </TouchableOpacity>
//       )
//     })
//   },
//   FamilyAdd: FamilyAddScreen,
//   FamilySingle: {
//     screen: FamilySingleScreen,
//   },
//   FamilyDetails: FamilyDetailsScreen,
//   FamilyProfile: FamilyProfileScreen,
// }, {
//     navigationOptions: {
//       headerStyle: {
//         backgroundColor: colors.brandPrimary,
//       },
//       headerTintColor: colors.headerTintColor,
//     },
//   });


// const EventListingStack = createStackNavigator({
//   EventListing: {
//     screen: EventListingScreen,
//     navigationOptions: ({ navigation }) => ({
//       headerStyle: { shadowOffset: {}, backgroundColor: colors.brandPrimary, borderBottomWidth: 0, elevation: 0 },
//       headerLeft: (
//         <TouchableOpacity onPress={() => { navigation.navigate('DrawerOpen') }}>
//           <Text style={{ paddingLeft: 17, paddingRight: 25 }}>
//             <Icon name="menu" size={20} style={{ color: '#fff' }} />
//           </Text>
//         </TouchableOpacity>
//       )
//     })
//   },
//   EventAdd: {
//     screen: EventAddScreen,
//     navigationOptions: { tabBarVisible: false }
//   },
//   EventSingle: EventSingleScreen,
// }, {
//     navigationOptions: {
//       headerStyle: {
//         backgroundColor: colors.brandPrimary,
//       },
//       headerTintColor: colors.headerTintColor,
//     },
//   });

const TabNavigation = createBottomTabNavigator({

  EventListing: {
    screen: EventListingScreen,
    navigationOptions: {
      title: 'Events',
      tabBarLabel: 'Events',
      headerStyle: { shadowOffset: {}, backgroundColor: colors.brandPrimary, borderBottomWidth: 0, elevation: 0 },
      tabBarIcon: ({ tintColor }) => (
        <Icon
          size={24}
          name={
            Platform.OS === 'ios'
              ? `ios-calendar${tintColor ? '' : '-outline'}`
              : 'md-calendar'
          }
          style={{ color: tintColor }}
        />
      ),
    }
  },
  FamilyListing: {
    screen: FamilyListingScreen,
    navigationOptions: {
      title: 'Family',
      tabBarLabel: 'Family',
      tabBarIcon: ({ tintColor }) => (
        <Icon
          size={24}
          name={
            Platform.OS === 'ios'
              ? `ios-people${tintColor ? '' : '-outline'}`
              : 'md-people'
          }
          style={{ color: tintColor }}
        />
      ),
    }
  },
}, {
    initialRouteName: 'EventListing',
    animationEnabled: true,
    lazy: true,
    tabBarOptions: {
      activeTintColor: colors.brandPrimary,
    },
    navigationOptions: ({ navigation }) => {
      const currentRouteName = navigation.state.routeName;
      return {
        tabBarVisible: ['FamilyListing', 'EventListing'].indexOf(currentRouteName) > -1,
        title: 'Hello',

      }
    },
  });

export default MainTabNavigator = createStackNavigator({
  Tabs: {
    screen: TabNavigation,
    navigationOptions: ({ navigation }) => ({
      headerLeft: (
        <TouchableOpacity onPress={() => { navigation.toggleDrawer() }}>
          <Text style={{ paddingLeft: 17, paddingRight: 25 }}>
            <Icon name="menu" size={20} style={{ color: 'white' }} />
          </Text>
        </TouchableOpacity>
      ),
      title: 'Home',
      headerBackTitle: null,
      headerStyle: { shadowOffset: {}, backgroundColor: colors.brandPrimary, borderBottomWidth: 0, elevation: 0 },
    })
  },
  EventAdd: {
    screen: EventAddScreen,
    navigationOptions: { tabBarVisible: false }
  },
  EventSingle: EventSingleScreen,
  FamilyAdd: FamilyAddScreen,
  FamilySingle: FamilySingleScreen,
  FamilyDetails: FamilyDetailsScreen,
  FamilyProfile: FamilyProfileScreen,
}, {
    initialRouteName: 'Tabs',
    navigationOptions: {
      headerTintColor: colors.headerTintColor,
      headerStyle: {
        backgroundColor: colors.brandPrimary,
      },
      headerTintColor: colors.headerTintColor,
    },
  })