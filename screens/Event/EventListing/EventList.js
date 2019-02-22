import React from 'react';
import { View, Text, List, ListItem, Icon, Right, Left } from 'native-base';
import { StyleSheet } from 'react-native';
import moment from 'moment';
import colors from '../../../native-base-theme/variables/commonColor';

const EventList = ({ events, navigation, noEventText }) => {
  const currentUserTimeOffset = -((new Date()).getTimezoneOffset() / 60);
  return (
    <View>
      <List style={{ backgroundColor: 'transparent' }}>
        {events.length > 0 && events.map((event, index) => {
          const startDate = new Date(event.startDate ? event.startDate.toMillis() : "");
          const endDate = new Date(event.endDate ? event.endDate.toMillis() : "");
          const isMultiDay = Math.abs(moment(startDate).diff(moment(endDate), 'days')) > 0;
          return (
            <ListItem
              key={index}
              style={styles.listitem}
              onPress={() => navigation.push('EventSingle', { event })}
            >
              <Left>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                  <View>
                    <Text style={{ fontSize: 18 }}>
                      {event.title}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="people" style={styles.noteIcon} />
                    <Text note>{event.family.name}</Text>
                  </View>
                  {event.address &&
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="map" style={styles.noteIcon} />
                      <Text note>{event.address.structured_formatting.main_text}</Text>
                    </View>
                  }
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="time" style={styles.noteIcon} />
                    <Text note>
                      {moment(startDate).format('h:MM A')}
                      {event.timezone && currentUserTimeOffset !== event.timezone.offset && ` (${event.timezone.abbr}) `}
                    </Text>
                  </View>
                </View>
              </Left>
              <Right style={{ width: 70, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28 }}>{startDate.getDate()}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{moment(startDate).format('MMM')}</Text>
                </View>
                {isMultiDay &&
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 12 }}>(Multi Day)</Text>
                  </View>
                }
              </Right>
            </ListItem>
          )
        })}
      </List>
      {events.length === 0 &&
        <View style={{ margin: 17 }}>
          <Text>{noEventText || "No upcoming events"}</Text>
        </View>
      }
    </View>
  );
};

export default EventList;

const styles = StyleSheet.create({
  listitem: {
    alignItems: 'flex-start',
    paddingRight: 0,
  },
  noteIcon: {
    color: colors.listNoteColor,
    fontSize: 14,
    paddingRight: 5,
  }
})