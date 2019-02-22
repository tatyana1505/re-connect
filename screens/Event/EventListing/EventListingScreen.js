import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Fab, Icon, Text, Container, Content, Tab, Tabs, TabHeading } from 'native-base';
import colors from '../../../native-base-theme/variables/commonColor';
import Loading from '../../../components/Loading';
import EventList from './EventList';
import { connect } from 'react-redux';
import { getEvents, observeEvents } from '../../../helpers/reducers/eventReducer';
import { observeFamily } from '../../../helpers/reducers/familyReducer';
import helpers from '../../../helpers/helpers';

class EventListingScreen extends Component {

  static navigationOptions = {
    title: 'Events',
    headerStyle: {
      elevation: 0,
      shadowOffset: {},
      backgroundColor: colors.brandPrimary,
      borderBottomWidth: 0,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      events: props.events ? props.events.data : null,
      isFetching: false,
    }
  }

  componentDidMount() {
    // For real time updates
    this.props.observeFamily();
    // this.props.observeEvents();

    if (!this.state.events) {
      this.props.getEvents();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.events.isFetching !== this.state.isFetching) {
      this.setState({ isFetching: nextProps.events.isFetching });
    }

    if (!helpers.areObjectsEqual(nextProps.events.data, this.state.events)) {
      this.setState({ events: nextProps.events.data });
    }
  }

  renderTabHeading(text) {
    return (
      <TabHeading style={{ backgroundColor: colors.brandPrimary }}>
        <Text>{text}</Text>
      </TabHeading>
    )
  }


  render() {
    const { events, isFetching } = this.state;
    let upcomingEvents = [];
    let pastEvents = [];
    if (events) {
      events.map(event => {
        if (event.endDate && event.endDate.toMillis() > Date.now()) upcomingEvents.push(event);
        else pastEvents.push(event);
      });
    }
    return (
      <Container>
        {events && !isFetching &&
          <Content>
            <Tabs>
              <Tab heading={this.renderTabHeading('Upcoming')} style={{ backgroundColor: 'transparent' }}>
                <EventList events={upcomingEvents} navigation={this.props.navigation} />
              </Tab>
              <Tab heading={this.renderTabHeading('Past')} style={{ backgroundColor: 'transparent' }}>
                <EventList
                  events={pastEvents}
                  navigation={this.props.navigation}
                  noEventText="No past events"
                />
              </Tab>
            </Tabs>
          </Content>
        }
        {isFetching && <Loading />}
        <Fab
          direction="up"
          style={{ backgroundColor: colors.brandPrimary }}
          position="bottomRight"
          onPress={() => this.props.navigation.navigate('EventAdd')}>
          <Icon name="add" />
        </Fab>
      </Container>
    );
  }
}

const mapDispatchToProps = {
  getEvents,
  observeFamily,
  observeEvents,
}

const mapStateToProps = state => {
  return {
    events: state.eventReducer.events || {},
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventListingScreen);