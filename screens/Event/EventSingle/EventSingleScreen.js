import React, { Component } from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Icon, Card, CardItem, Body, Right, Content, Text, Container } from 'native-base';
import * as AddCalendarEvent from 'react-native-add-calendar-event';
import colors from '../../../native-base-theme/variables/commonColor';
import userHelpers from '../../../helpers/userHelpers';
import { Permissions } from 'expo';
import { connect } from 'react-redux';
import { deleteEvent } from '../../../helpers/reducers/eventReducer';
import FullscreenLoading from '../../../components/FullscreenLoading';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

class EventSingleScreen extends Component {

  constructor(props) {
    super(props);
    this.handleAddToCalendar = this.handleAddToCalendar.bind(this);
    this.handleLocationNavigation = this.handleLocationNavigation.bind(this);
    this.state = {
      isDeleting: false,
    }
  }

  static navigationOptions = ({ navigation }) => {
    const event = navigation.state.params.event;
    const allowEdit = event.createdBy === userHelpers.getCurrentUserEmail()
    return {
      title: event.title.toUpperCase(),
      headerRight: !allowEdit ? null : (
        <TouchableOpacity
          onPress={() => navigation.navigate('EventAdd', { event: event })}
          style={{ height: colors.toolbarHeight, justifyContent: 'center', paddingHorizontal: 16 }}
        >
          <Icon name="create" style={{ color: colors.inverseTextColor }} />
        </TouchableOpacity>
      )
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.events.isDeleting && !this.state.isDeleting) {
      this.setState({ isDeleting: nextProps.events.isDeleting });
    }

    if (this.state.isDeleting && !nextProps.events.isDeleting && !nextProps.events.isDeletingError) {
      this.props.navigation.navigate('EventListing');
    }
  }


  handleLocationNavigation() {
    const { event } = this.props.navigation.state.params;
    const address = event.address.structured_formatting.main_text + ',' + event.address.structured_formatting.secondary_text;
    const url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + encodeURI(address);
    Linking.openURL(url);
  }

  async handleAddToCalendar() {
    const { event } = this.props.navigation.state.params;
    const { status } = await Permissions.getAsync(Permissions.CALENDAR);

    AddCalendarEvent.presentEventCreatingDialog({
      title: event.title,
      notes: event.description,
      startDate: new Date(event.startDate.toMillis()).toISOString(),
      endDate: new Date(event.endDate.toMillis()).toISOString(),
      location: event.address ? event.address.structured_formatting.main_text : "",
    })
      .then((eventInfo) => {
        // handle success - receives an object with `calendarItemIdentifier` and `eventIdentifier` keys, both of type string.
        // These are two different identifiers on iOS.
        // On Android, where they are both equal and represent the event id, also strings.
        // when { action: 'CANCELLED' } is returned, the dialog was dismissed
        console.warn(JSON.stringify(eventInfo));
      })
      .catch((error) => {
        // handle error such as when user rejected permissions
        console.warn(error);
      });
    // }
  }

  render() {
    const { event } = this.props.navigation.state.params;
    const startDate = new Date(event.startDate.toMillis());
    const endDate = new Date(event.endDate.toMillis());
    const { isDeleting } = this.state;
    return (
      <Container>
        {!isDeleting &&
          <Content padder>
            <Card transparent>
              <CardItem bordered>
                <Text style={styles.cardTitle}>Description</Text>
              </CardItem>
              <CardItem>
                <Text style={styles.textStyle}>{event.description}</Text>
              </CardItem>
            </Card>

            {event.address &&
              <Card transparent>
                <CardItem style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon style={styles.iconStyle} name="map" />
                    <Text style={{ paddingLeft: 5, color: '#333' }}>{event.address.structured_formatting.main_text}</Text>
                  </View>
                  <View>
                    <TouchableOpacity>
                      <Text style={styles.textStyle} onPress={this.handleLocationNavigation}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </CardItem>
              </Card>
            }

            <Card transparent>
              <CardItem>
                <Icon style={styles.iconStyle} name="people" />
                <Text style={{ paddingLeft: 5, color: '#333' }}>{event.family.name}</Text>
              </CardItem>
            </Card>

            <Card transparent>
              <CardItem>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1, paddingTop: 3 }}>
                    <Text style={styles.dateTitle}>START</Text>
                    <Text style={styles.textStyle}>{getDate(startDate)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Icon name="clock" style={{ fontSize: 15, marginRight: 5, width: 15 }} />
                      <Text style={styles.textStyle}>
                        {getTime(startDate)} {event.timezone && ` (${event.timezone.abbr})`}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.dateTitle}>END</Text>
                    <Text style={styles.textStyle}>{getDate(endDate)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Icon name="clock" style={{ fontSize: 15, marginRight: 5, width: 15 }} />
                      <Text style={styles.textStyle}>
                        {getTime(endDate)} {event.timezone && ` (${event.timezone.abbr})`}
                      </Text>
                    </View>
                  </View>
                </View>
              </CardItem>
            </Card>
            {/* <Card transparent>
              <CardItem button onPress={this.handleAddToCalendar} style={{ flexDirection: 'row' }}>
                <Icon style={styles.iconStyle} name="calendar" />
                <Text style={{ paddingLeft: 5, color: '#333' }}>Add To Calendar</Text>
              </CardItem>
            </Card> */}
            {userHelpers.getCurrentUserEmail() === event.createdBy &&
              <Card transparent>
                <CardItem button onPress={() => this.props.deleteEvent(event.id)}>
                  <Text style={{ color: colors.brandDanger }}>Delete Event</Text>
                </CardItem>
              </Card>
            }
          </Content>
        }
        {isDeleting && <FullscreenLoading />}
      </Container>
    );
  }
}

mapStateToProps = state => ({
  events: state.eventReducer.events,
})

mapDispatchToProps = {
  deleteEvent,
}
export default connect(mapStateToProps, mapDispatchToProps)(EventSingleScreen);

function getTime(date) {
  const hour = date.getHours();
  const minutes = date.getMinutes();

  return `${hour}:${minutes < 10 ? '0' + minutes : minutes}`;
}

function getDate(date) {
  return `${date.getDate()} ${months[date.getMonth() + 1]}, ${date.getFullYear()}`
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 21,
    color: '#333',
  },
  iconStyle: {
    fontSize: 16,
    width: 16,
    color: '#333',
  },
  dateTitle: {
    fontSize: 24,
    color: '#333',
  },
  textStyle: {
    color: '#333',
  }
})