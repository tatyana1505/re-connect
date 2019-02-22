import * as firebase from 'firebase';
import familyHelpers from "../familyHelpers";
import eventHelpers from '../eventHelpers';
import userHelpers from "../userHelpers";
import helpers from '../helpers';

export default function familyReducer(state = {}, action) {
  switch (action.type) {

    case 'OVERWRITE_EVENTS':
      return {
        ...state,
        events: {
          ...state.events,
          data: action.events,
        }
      }
      break;

    case 'ADDING_EVENT':
      return {
        ...state,
        events: {
          ...state.events,
          isAdding: true,
          isAddingError: false
        }
      }
      break;
    case 'EVENT_ADDED':
      return {
        ...state,
        events: {
          ...state.events,
          isAdding: false,
          isAddingError: false,
          data: state.events.data ? state.events.data.concat(action.newEvent) : [action.newEvent],
        }
      }
      break;
    case 'EVENT_ADDING_ERROR':
      return {
        ...state,
        events: {
          ...state.events,
          isAdding: false,
          isAddingError: true,
        }
      }
      break;

    case 'FETCHING_EVENTS':
      return {
        ...state,
        events: {
          ...state.events,
          isFetchingError: false,
          isFetching: true,
        }
      }
      break;

    case 'FETCHED_EVENTS':
      return {
        ...state,
        events: {
          ...state.events,
          isFetching: false,
          isFetchingError: false,
          data: action.events,
        }
      }
      break;

    case 'FETCHING_EVENTS_ERROR':
      return {
        ...state,
        events: {
          ...state.events,
          isFetching: false,
          isFetchingError: true,
        }
      }
      break;

    case 'UDPATING_EVENT':
      return {
        ...state,
        events: {
          ...state.events,
          isUpdating: true,
          isUpdatingError: false,
        }
      }
      break;

    case 'UPDATED_EVENT':
      const eventsData1 = [...state.events.data];
      eventsData1.splice(eventsData1.findIndex(event => event.id === action.updatedEvent.id), 1);
      eventsData1.push(action.updatedEvent);

      return {
        ...state,
        events: {
          ...state.events,
          isUpdating: false,
          isUpdatingError: false,
          // data: eventsData1,
        }
      }
      break;

    case 'UPDATING_EVENT_ERROR':
      return {
        ...state,
        events: {
          ...state.events,
          isUpdatingError: true,
          isUpdating: false,
        }
      }
      break;
    case 'DELETING_EVENT':
      return {
        ...state,
        events: {
          ...state.events,
          isDeleting: true,
          isDeletingError: false,
        }
      }
      break;
    case 'DELETED_EVENT':
      const eventsData = [...state.events.data];
      eventsData.splice(eventsData.findIndex(event => event.id === action.eventId), 1);
      return {
        ...state,
        events: {
          ...state.events,
          isDeleting: false,
          isDeletingError: false,
          data: eventsData,
        }
      }
      break;

    case 'EMPTY_EVENT_OBJECT':
      return {}
      break;

    default:
      return state;
  }
}

export function observeEvents() {

  return dispatch => {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    db.collection('events')
      .where(`memberEmails.${helpers.formatEmail(userHelpers.getCurrentUserEmail())}`, '==', true)
      .onSnapshot((snapshot) => {
        console.log(snapshot.metadata.hasPendingWrites);
        if (!snapshot.metadata.hasPendingWrites) {
          familyHelpers.getUserFamilyIds()
            .then(familiyIds => {
              const events = [];
              snapshot.forEach(doc => {
                const data = doc.data();
                if (familiyIds.indexOf(data.family.id) > -1) {
                  events.push(data);
                }
              });
              dispatch({
                type: 'OVERWRITE_EVENTS',
                events,
              })
            })
        }
      })
  }
}

export function getEvents() {
  return dispatch => {
    dispatch({
      type: 'FETCHING_EVENTS',
    });

    eventHelpers.getEvents()
      .then(events => {
        dispatch({
          type: 'FETCHED_EVENTS',
          events,
        })
      })
      .catch(error => {
        console.log(error);
        dispatch({
          type: 'FETCHING_EVENTS_ERROR',
        })
      })
  }
}

export function addEvent(eventObject) {
  return dispatch => {
    dispatch({
      type: 'ADDING_EVENT',
    });

    eventHelpers.addEvent(eventObject)
      // addedEvent is different from eventObject since addedEvent also has createdBy param
      .then(addedEvent => {
        dispatch({
          type: 'EVENT_ADDED',
          newEvent: addedEvent,
        })
      })
      .catch(error => {
        console.log(error);
        dispatch({
          type: 'EVENT_ADDING_ERROR',
        })
      })
  }
}

export function updateEvent(eventObject) {
  return dispatch => {
    dispatch({
      type: 'UDPATING_EVENT',
    });

    eventHelpers.updateEvent(eventObject)
      .then(updatedEvent => {
        dispatch({
          type: 'UPDATED_EVENT',
          updatedEvent,
        })
      })
  }
}

export function deleteEvent(eventId) {
  return dispatch => {
    dispatch({
      type: 'DELETING_EVENT',
    });
    eventHelpers.deleteEvent(eventId)
      .then(res => {
        dispatch({
          type: 'DELETED_EVENT',
          eventId: eventId,
        })
      })
  }
}