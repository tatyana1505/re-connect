import React from 'react';
import { View } from 'react-native';
import { Icon } from 'native-base';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GooglePlaceSearchModal = (props) => {

  return (
    <GooglePlacesAutocomplete
      placeholder='Search'
      minLength={2} // minimum length of text to search
      autoFocus={false}
      returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
      listViewDisplayed='auto'    // true/false/undefined
      fetchDetails={false}
      renderDescription={(row) => row.description} // custom description render
      onPress={(location, details = null) => { // 'details' is provided when fetchDetails = true
        props.onAddressSelect(location);
      }}
      getDefaultValue={() => {
        return ''; // text input default value
      }}
      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: 'AIzaSyA53zo1VpN3tKrLFFSv1iDu6Go8ash6tKc',
        language: 'en', // language of the results
      }}
      styles={{
        description: {
          fontWeight: 'bold'
        },
        predefinedPlacesDescription: {
          color: '#1faadb'
        }
      }}

      currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
      currentLocationLabel="Current location"
      nearbyPlacesAPI='GoogleReverseGeocoding' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
      GoogleReverseGeocodingQuery={{
        // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
      }}

      filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

      debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
      renderRightButton={() => (
        <View style={{ justifyContent: 'center', padding: 17, marginRight: 10 }} onPress={props.onClose}>
          <Icon onPress={props.onClose} name="close" />
        </View>
      )}
    />
  );

}

export default GooglePlaceSearchModal;