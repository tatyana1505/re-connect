import * as firebase from 'firebase';
import { Platform } from 'react-native';
import { Constants, ImagePicker, Permissions, ImageManipulator } from 'expo';
import uuid from 'uuid';

const helpers = {

  getEnv(){
    const releaseChannel = Constants.manifest.releaseChannel;

    if (releaseChannel === null || releaseChannel === undefined || releaseChannel === '') return "dev"
    if (releaseChannel.indexOf('dev') !== -1) return "dev"
    if (releaseChannel.indexOf('staging') !== -1) return "staging"
    if (releaseChannel.indexOf('prod') !== -1) return "prod"
  },
  getFirebaseTimeStamp(date = new Date()) {
    return new firebase.firestore.Timestamp(Math.floor(date.getTime() / 1000), 0);
  },
  getDb: () => {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    return db;
  },
  validateEmail: (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  formatEmail: (email) => {
    return email.split(".").join("^");
  },

  formatToken: (token) => {
    return token.split("[").join("+").split("]").join("=");
  },

  findClosestInArray(array, goal) {
    return array.reduce(function (prev, curr) {
      return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    });
  },

  _pickProfileImage: () => {
    return new Promise(async (resolve, reject) => {

      if (Platform.OS === 'ios') {
        const cameraPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (cameraPermission.status !== 'granted') {
          reject(false);
          return;
        }
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (pickerResult.cancelled) {
        reject(false);
        return;
      }

      try {

        // Manipulate the images
        const image196 = await ImageManipulator.manipulate(pickerResult.uri, [{ resize: { height: 196, width: 196 } }])
        const image128 = await ImageManipulator.manipulate(pickerResult.uri, [{ resize: { height: 128, width: 128 } }])
        const image36 = await ImageManipulator.manipulate(pickerResult.uri, [{ resize: { height: 36, width: 36 } }])

        // Upload the images
        const upload196 = _handleImagePicked(image196)
        const upload128 = _handleImagePicked(image128);
        const upload36 = _handleImagePicked(image36);

        // Wait for uplolds to complete
        const uploads = await Promise.all([upload196, upload128, upload36]);

        resolve({
          uri: uploads[0],
          sizes: {
            "196": uploads[0],
            "128": uploads[1],
            "36": uploads[2],
          },
        })
      } catch (error) {
        reject(false);
        return;
      }

    })
  },

  _pickImage: () => {
    return new Promise(async (resolve, reject) => {

      if (Platform.OS === 'ios') {
        const cameraPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (cameraPermission.status !== 'granted') {
          reject(false);
          return;
        }
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      })

      if (pickerResult.cancelled) {
        reject(false);
        return;
      }

      try {

        // Manipulate the images
        const image960 = await ImageManipulator.manipulate(pickerResult.uri, [{ resize: { width: 960 } }])
        const image480 = await ImageManipulator.manipulate(pickerResult.uri, [{ resize: { width: 480 } }])
        const image96 = await ImageManipulator.manipulate(pickerResult.uri, [{ resize: { width: 96 } }])
        const image36 = await ImageManipulator.manipulate(pickerResult.uri, [{ resize: { width: 36 } }])

        // Upload the images
        const upload960 = _handleImagePicked(image960)
        const upload480 = _handleImagePicked(image480);
        const upload96 = _handleImagePicked(image96);
        const upload36 = _handleImagePicked(image36);

        // Wait for uplolds to complete
        const uploads = await Promise.all([upload960, upload480, upload96, upload36]);
        resolve({
          uri: uploads[0],
          sizes: {
            "960": uploads[0],
            "480": uploads[1],
            "96": uploads[2],
            "36": uploads[3],
          },
        })
      } catch (error) {
        reject(false);
        return;
      }

    })
  },

  areObjectsEqual(a = {}, b = {}) {
    try {
      return JSON.parse(JSON.stringify(a)) === JSON.parse(JSON.stringify(b));
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default helpers;

async function _handleImagePicked(pickerResult) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!pickerResult.cancelled) {
        uploadUrl = await uploadImageAsync(pickerResult.uri);
        resolve(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed, sorry :(');
      reject(false);
    }
  })
}

async function uploadImageAsync(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ref = firebase
    .storage()
    .ref()
    .child(uuid.v4());

  const snapshot = await ref.put(blob);
  const downloadUrl = await snapshot.ref.getDownloadURL();

  return downloadUrl;
}