import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import EventListingScreen from './Event/EventListing/EventListingScreen';

export default class HomeScreen extends React.Component {

  static navigationOptions = {
    title: 'Events',
  };

  render() {
    return (
      <View style={styles.container}>
        <EventListingScreen navigation={this.props.navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
