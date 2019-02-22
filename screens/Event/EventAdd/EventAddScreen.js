import React from 'react';
import { StyleSheet, View, Modal, ActivityIndicator, Dimensions, TouchableHighlight } from 'react-native';
import {
  Item, Input, Textarea, Button, Picker, Icon, Text, FooterTab, Container, Content, Footer, Toast
} from 'native-base';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { connect } from 'react-redux';
import moment from 'moment';
import GooglePlaceSearchModal from './GooglePlaceSearchModal';
import { getFamilies } from '../../../helpers/reducers/familyReducer';
import { addEvent, updateEvent } from '../../../helpers/reducers/eventReducer';
import Loading from '../../../components/Loading';
import helpers from '../../../helpers/helpers';
import timezones from '../../../helpers/timezones';

class EventAddScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params && navigation.state.params.event ? "Edit Event" : "Add Event",
  });

  constructor(props) {
    super(props);
    let event = props.navigation.state.params ? props.navigation.state.params.event : {};

    const currentUserTimeOffset = -((new Date()).getTimezoneOffset() / 60);
    const defaultTimeZone = timezones.find(timezone => timezone.offset === currentUserTimeOffset);

    this.state = {
      // If mode is "add", it will be empty object, else will contain the existing data
      event,
      mode: event.id ? "edit" : "add", // "add" or "edit"

      // Event Data
      title: event.title || '',
      description: event.description || '',
      address: event.address || null,
      startDate: event.startDate ? new Date(event.startDate.toMillis()) : null,
      endDate: event.endDate ? new Date(event.endDate.toMillis()) : null,
      timezone: defaultTimeZone,
      familyId: event.family ? event.family.id : undefined,

      families: props.families ? props.families.data : null,

      // Visibility
      isStartDateVisible: false,
      isEndDateVisible: false,
      isAddressModal: false,

      // Ongoing Actions
      isAdding: false,
      isUpdating: false,
      isLoading: false,

    };
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.onAddressPress = this.onAddressPress.bind(this);
    this.handleAddressSelect = this.handleAddressSelect.bind(this);
    this.handleAddressModalClose = this.handleAddressModalClose.bind(this);
    this.handleFamilySelection = this.handleFamilySelection.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.shouldAllowNext = this.shouldAllowNext.bind(this);
    this.handleAction = this.handleAction.bind(this);
    this.handleTimezoneSelection = this.handleTimezoneSelection.bind(this);
  }

  componentDidMount() {
    if (!this.state.families) {
      this.props.getFamilies();
    }
  }

  componentWillReceiveProps(nextProps) {

    if (!this.state.families && nextProps.families.data) {
      this.setState({ families: nextProps.families.data });
    }

    if (this.state.isLoading !== nextProps.families.isLoading) {
      this.setState({ isLoading: nextProps.families.isLoading })
    }

    // Handle Adding Event Start
    if (nextProps.events.isAdding) {
      this.setState({ isAdding: true });
    }

    // Handle Updating Event Start
    if (nextProps.events.isUpdating) {
      this.setState({ isUpdating: true });
    }

    // Handle Adding Event Done
    if (!nextProps.events.isAdding && this.state.isAdding && !nextProps.events.isAddingError) {
      this.props.navigation.navigate('EventListing');
    }

    // Handle Updaing Event Done
    if (!nextProps.events.isUpdating && this.state.isUpdating && !nextProps.isUpdatingError) {
      this.props.navigation.navigate('EventListing');
    }

    // Adding Error
    if (nextProps.events.isAddingError) {
      this.setState({ isAdding: false });
      Toast.show({
        text: 'Ops! There was an error adding the event. We are fixing it!',
      })
    }
  }

  onStartDateChange(startDate) {
    this.setState({ startDate, isStartDateVisible: false });
  }

  onEndDateChange(endDate) {
    this.setState({ endDate, isEndDateVisible: false });
  }

  onAddressPress() {
    this.setState({ isAddressModal: true });
  }

  handleAddressSelect(address) {
    this.setState({
      address,
      isAddressModal: false,
    })
  }

  handleAddressModalClose() {
    this.setState({ isAddressModal: false });
  }

  handleFamilySelection(familyId) {
    this.setState({ familyId })
  }

  handleTimezoneSelection(timezone) {
    this.setState({ timezone });
  }

  getEventObject() {
    const event = this.state.event;
    event.title = this.state.title;
    event.description = this.state.description;
    event.startDate = helpers.getFirebaseTimeStamp(this.state.startDate);
    event.endDate = helpers.getFirebaseTimeStamp(this.state.endDate);
    event.address = this.state.address;
    event.timezone = this.state.timezone;

    const selectedFamily = this.state.families.filter(family => family.id === this.state.familyId);

    event.family = {
      id: this.state.familyId,
      name: selectedFamily.length > 0 ? selectedFamily[0].name : '',
    }
    return event;
  }

  onFieldChange(key, value) {
    this.setState({ [key]: value });
  }

  shouldAllowNext() {
    const { title, startDate, endDate, location, familyId, } = this.state;
    if (title.trim().length >= 1 && startDate && endDate && familyId) return true;
    return false;
  }

  handleAction() {
    const event = this.getEventObject();
    const { eventRef, mode } = this.state;
    if (mode === "add") this.props.addEvent(event);
    if (mode === "edit") this.props.updateEvent(event);
  }

  render() {
    const { isAdding, isUpdating, families, isLoading, title,
       startDate, endDate, address, familyId, isAddressModal,
      isStartDateVisible, isEndDateVisible, mode, timezone } = this.state;
    const allowNext = this.shouldAllowNext();

    const actionText = mode === "add" ? "Add" : "Update";

    return (
      <Container>
        {isLoading && <Loading />}
        {!isLoading && families &&
          <Content padder>
            <View>
              <View style={{ marginBottom: 10, paddingLeft: 5 }}>
                <Text style={styles.fieldTitle}>EVENT NAME *</Text>
              </View>
              <Item regular style={{ backgroundColor: 'white' }}>
                <Input
                  onChangeText={value => this.onFieldChange('title', value)}
                  value={title}
                />
              </Item>

              <View style={styles.fieldStyle}>
                <Text style={styles.fieldTitle}>DESCRIPTION</Text>
              </View>

              <Textarea style={styles.textarea} rowSpan={5} bordered onChangeText={value => this.onFieldChange('description', value)} />

              <View style={styles.fieldStyle}>
                <Text style={styles.fieldTitle}>START TIME *</Text>
              </View>

              <TouchableHighlight onPress={() => this.setState({ isStartDateVisible: true })} style={{ height: 50, backgroundColor: '#fff', paddingLeft: 8, justifyContent: 'center' }}>
                <Text>{startDate && moment(startDate).format('D MMM, YYYY HH:mm')}</Text>
              </TouchableHighlight>

              <View style={styles.fieldStyle}>
                <Text style={styles.fieldTitle}>END TIME *</Text>
              </View>

              <TouchableHighlight onPress={() => this.setState({ isEndDateVisible: true })} style={{ height: 50, backgroundColor: '#fff', paddingLeft: 8, justifyContent: 'center' }}>
                <Text>{endDate && moment(endDate).format('D MMM, YYYY HH:mm')}</Text>
              </TouchableHighlight>

              <View style={styles.fieldStyle}>
                <Text style={styles.fieldTitle}>TIME ZONE *</Text>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  mode="dropdown"
                  iosIcon={<Icon name="arrow-dropright" />}
                  style={{ width: undefined }}
                  placeholder="Select Family"
                  placeholderStyle={{ color: "#bfc6ea" }}
                  placeholderIconColor="#007aff"
                  selectedValue={timezone}
                  onValueChange={this.handleTimezoneSelection}
                >

                  {timezones.map(timezone => (
                    <Picker.Item
                      label={`${timezone.text} (${timezone.abbr})`}
                      value={timezone}
                      key={timezone.abbr}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.fieldStyle}>
                <Text style={styles.fieldTitle}>LOCATION</Text>
              </View>

              <TouchableHighlight onPress={this.onAddressPress} style={{ height: 50, backgroundColor: '#fff', paddingLeft: 8, justifyContent: 'center' }}>
                <Text>{address ? address.structured_formatting.main_text : ""}</Text>
              </TouchableHighlight>

              <View style={styles.fieldStyle}>
                <Text style={styles.fieldTitle}>FAMILY *</Text>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  mode="dropdown"
                  iosIcon={<Icon name="arrow-dropright" />}
                  style={{ width: undefined }}
                  placeholder="Select Family"
                  placeholderStyle={{ color: "#bfc6ea" }}
                  placeholderIconColor="#007aff"
                  selectedValue={familyId}
                  onValueChange={this.handleFamilySelection}
                >
                  <Picker.Item label={"Select Family"} value={""} />
                  {families.map(family => (
                    <Picker.Item label={family.name} value={family.id} key={family.id} />
                  ))}
                </Picker>
              </View>

              <Modal
                animationType="slide"
                transparent={false}
                visible={isAddressModal}
                onRequestClose={this.handleAddressModalClose}
              >
                <GooglePlaceSearchModal onClose={this.handleAddressModalClose} onAddressSelect={this.handleAddressSelect} />
              </Modal>

              <DateTimePicker
                isVisible={isStartDateVisible}
                onConfirm={this.onStartDateChange}
                onCancel={() => { this.setState({ isStartDateVisible: false }) }}
                mode={'datetime'}
                maximumDate={endDate || undefined}
              />

              <DateTimePicker
                isVisible={isEndDateVisible}
                onConfirm={this.onEndDateChange}
                onCancel={() => { this.setState({ isEndDateVisible: false }) }}
                mode={'datetime'}
                minimumDate={startDate || undefined}
              />

              <View style={{ marginVertical: 17 }}>
                <Text>* required fields</Text>
              </View>
            </View>
          </Content>
        }
        <Footer>
          <FooterTab>
            <Button
              full
              primary
              onPress={(isAdding || isUpdating || !allowNext) ? null : this.handleAction}
              style={{ height: 56 }}
              disabled={!allowNext}
            >
              {isAdding || isUpdating ? <ActivityIndicator /> : <Text style={{ lineHeight: 18 }}>{actionText}</Text>}
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 17,
    marginTop: 17
  },
  fieldTitle: {
    fontSize: 16,
    marginTop: 10
  },
  leftBody: {
    alignItems: 'flex-start',
  },
  addButtonContainer: {
    width: Dimensions.get('window').width,
    height: 56,
  },
  fieldStyle: {
    marginVertical: 10,
    marginLeft: 5,
  },
  pickerContainer: {
    height: 50,
    backgroundColor: '#fff',
    paddingLeft: 8,
    justifyContent: 'center',
  },
  textarea: {
    backgroundColor: 'white',
    paddingTop: 15,
  }
});

const mapStateToProps = state => {
  return {
    families: state.familyReducer.families || {},
    events: state.eventReducer.events || {},
  }
}

const mapDispatchToProps = {
  getFamilies,
  addEvent,
  updateEvent,
}

export default connect(mapStateToProps, mapDispatchToProps)(EventAddScreen)