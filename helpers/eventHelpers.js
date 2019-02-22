import * as firebase from 'firebase';
import userHelper from './userHelpers';
import helpers from './helpers';
import familyHelper from './familyHelpers';
import userHelpers from './userHelpers';

const eventHelpers = {

  getDb: () => {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    return db;
  },

  addEvent: (eventObject) => {
    return new Promise((resolve, reject) => {
      eventObject.createdAt = helpers.getFirebaseTimeStamp();
      eventObject.createdBy = userHelpers.getCurrentUserEmail();
      const ref = eventHelpers.getDb().collection('events').doc();
      eventObject.id = ref.id;
      ref.set(eventObject)
        .then(res => {
          resolve(eventObject);
        })
        .catch(error => {
          console.log(error);
          reject(false);
        })
    })
  },

  getEvents: () => {
    return new Promise((resolve, reject) => {
      eventHelpers.getDb().collection('events').get()
        .then(snapshot => {
          const events = [];
          const userFamilies = familyHelper.getUserFamilyIds()
            .then(familiyIds => {
              snapshot.forEach(doc => {
                const data = doc.data();
                if (familiyIds.indexOf(data.family.id) > -1) {
                  events.push(data);
                }
              });
              resolve(events);
            })
        })
    })
  },

  getUpcomingEvents: () => {
    return new Promise((resolve, reject) => {
      eventHelpers.getDb().collection('events').get()
        .then(snapshot => {
          const events = [];
          const userFamilies = familyHelper.getUserFamilyIds()
            .then(familiyIds => {
              snapshot.forEach(doc => {
                const data = doc.data();
                if (familiyIds.indexOf(data.family.id) > -1) {
                  events.push(data);
                }
              });
              resolve(events);
            })
        })
    })
  },

  updateEvent: (event) => {
    return new Promise((resolve, reject) => {
      event.updateAt = helpers.getFirebaseTimeStamp();
      eventHelpers.getDb().collection('events').doc(event.id)
        .update(event)
        .then(res => {
          resolve(event);
        })
        .catch(error => {
          console.log(error);
          reject(false);
        })
    })
  },

  updateFamily: (ref, updateObject) => {
    return new Promise((resolve, reject) => {

      eventHelpers.getDb().collection('families').doc(ref).update(updateObject)
        .then(res => resolve(true))
        .catch(error => reject(false));
    })
  },

  getFamilies: () => {
    const currentUserEmail = firebase.auth().currentUser.email;
    return new Promise((resolve, reject) => {
      eventHelpers.getDb().collection('families')
        .where(`memberEmails.${helpers.formatEmail(currentUserEmail)}`, '==', true)
        .get()
        .then(snapshot => {
          const families = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            families.push(data);
          });
          resolve(families);
        })
    })
  },

  deleteEvent: (eventId) => {
    return new Promise((resolve, reject) => {
      eventHelpers.getDb().collection('events').doc(eventId).delete()
        .then(res => {
          resolve(res);
        })
        .catch(error => {
          console.log(error);
          reject(false);
        })
    })
  }

}

export default eventHelpers;