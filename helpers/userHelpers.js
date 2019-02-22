import * as firebase from 'firebase';
import helpers from './helpers';
import familyHelpers from './familyHelpers';

const userHelpers = {

  getDb: () => {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    return db;
  },

  getCurrentUserEmail: () => {
    return userHelpers.getCurrentUser().email;
  },

  getCurrentUser: () => {
    const currentUser = firebase.auth().currentUser;
    return currentUser.providerData.length > 0 ? currentUser.providerData[0] : currentUser;
  },

  getUserData: (userEmail) => {
    return new Promise((resolve, reject) => {
      console.log(firebase.auth().currentUser);
      userHelpers.getDb().collection('userMeta').doc(userEmail).get()
        .then(doc => {
          // if the doc exist, then use that, else the information in the members array
          if (doc.exists) {
            resolve(doc.data());
          } else {
            resolve(null);
          }
        })
        .catch(error => {
          console.log(error);
        })
    })
  },

  updateUserPhotoOrDisplayName(userObject, ref, isNewUser = false, docExist = true) {
    return new Promise(async (resolve, reject) => {
      console.log(ref);
      const families = await familyHelpers.getFamilies();
      let batch = userHelpers.getDb().batch();

      console.log(families);
      families.map(family => {
        family.members[ref] = { ...family.members[ref], data: { ...userObject } };
        console.log('setting bactch update');
        console.log(family.members);
        batch.update(this.getDb().collection('families').doc(family.id), { members: family.members });
      })

      if (!isNewUser && docExist) {
        batch.update(this.getDb().collection('userMeta').doc(ref), { ...userObject });
      }

      batch.commit()
        .then(res => {
          resolve({ families, userObject });
        })
        .catch(error => {
          console.log(error);
          resolve({ families, userObject });
        })
    })
  },

  getAllUsersWithToken: (token) => {
    return new Promise((resolve, reject) => {
      console.log('going to get all memebrs with some token');
      const usersWithSameToken = [];
      userHelpers.getDb().collection('userMeta')
        .where(`notificationToken.${token}`, '==', true)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            const data = doc.data();
            data.email = doc.id;
            usersWithSameToken.push(data);
          })
          console.log('resolveing all members with token.');
          resolve(usersWithSameToken);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        })
    })
  },

  updateUserAfterLogin: (userObject, userEmail, isNewUser, notificationToken) => {
    return new Promise(async (resolve, reject) => {

      const userRef = userHelpers.getDb().collection('userMeta').doc(userEmail);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        userObject.displayName = userHelpers.getCurrentUser().displayName;
      }

      // If the user is new, then update all its instanes
      if (isNewUser || !userDoc.exists) {
        const res = await userHelpers.updateUserPhotoOrDisplayName(userObject, userEmail, isNewUser, userDoc.exists);
      }

      let currentUser = userDoc.exists ? userDoc.data() : {};
      currentUser = { ...currentUser, ...userObject };

      await userRef.set(currentUser);

      // Remove token from existing users
      if (notificationToken) {
        const batch = userHelpers.getDb().batch();
        const usersWithSameToken = await userHelpers.getAllUsersWithToken(notificationToken);
        usersWithSameToken.map(user => {
          // Do not update the current user
          if (user.email !== userEmail) {
            delete user.notificationToken[notificationToken];
            batch.update(userHelpers.getDb().collection('userMeta').doc(user.email), user);
          }
        })
        try {
          await batch.commit();
          resolve(currentUser);
        } catch (error) {
          resolve(currentUser);
        }
      }
    })
  },

  updateUserMeta: (userObject, ref) => {
    return new Promise((resolve, reject) => {
      userHelpers.getDb().collection('userMeta').doc(ref)
        .update(userObject)
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

export default userHelpers;