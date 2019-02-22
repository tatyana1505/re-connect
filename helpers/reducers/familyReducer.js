import familyHelpers from "../familyHelpers";
import * as firebase from 'firebase';
import userHelpers from "../userHelpers";
import helpers from "../helpers";


export default function familyReducer(state = {}, action) {

  switch (action.type) {

    case 'OVERWRITE_FAMILIES':
      const newData = action.families.map(family => {
        family.tree = familyHelpers.getAllFamilyMembers(family);
        return family;
      });
      return {
        ...state,
        families: {
          ...state.families,
          data: newData,
        }
      }

    case 'FAMILIES_FETCHED':
      const familyData = action.familiesData.map(family => {
        family.tree = familyHelpers.getAllFamilyMembers(family);
        return family;
      });
      return {
        ...state,
        families: {
          ...state.families,
          data: familyData,
          isLoading: false
        }
      };

    case 'FAMILIES_IS_FETCHING':
      return {
        ...state,
        families: {
          ...state.families,
          isLoading: action.isLoading,
        }
      }

    case 'ADDING_FAMILY':
      return {
        ...state,
        families: {
          ...state.families,
          isAdding: true,
          isAddingError: false,
        }
      }
      break;

    case 'ADDED_FAMILY':
      return {
        ...state,
        families: {
          ...state.families,
          isAdding: false,
          isAddingError: false,
          data: state.families.data.concat(action.newFamily),
        }
      }

    case 'UPDATING_FAMILY':
      return {
        ...state,
        families: {
          ...state.families,
          isUpdating: true,
          isUpdatingError: false,
        }
      }

    case 'UPDATED_FAMILY':
      let familiesData = [...state.families.data];
      updatedItemIndex = familiesData.findIndex(family => family.id === action.updatedFamilyId);

      action.updatedFamilyData['tree'] = familyHelpers.getAllFamilyMembers(action.updatedFamilyData);

      if (updatedItemIndex > -1) {
        const updatedFamilyData = {
          ...familiesData[updatedItemIndex],
          ...action.updatedFamilyData,
        }
        familiesData.splice(updatedItemIndex, 1);
        familiesData.push(updatedFamilyData);
      }

      return {
        ...state,
        families: {
          ...state.families,
          isUpdating: false,
          isUpdatingError: false,
          data: familiesData,
        }
      }
      break;

    case 'DELETING_FAMILY':
      return {
        ...state,
        families: {
          ...state.families,
          isDeleting: true,
          isDeletingError: false,
        }
      }

    case 'DELETED_FAMILY':
      const familiesData1 = [...state.families.data];
      familiesData1.splice(familiesData1.findIndex(family => family.id === action.familyId), 1);
      return {
        ...state,
        families: {
          ...state.families,
          isDeleting: false,
          isDeletingError: false,
          data: familiesData1,
        }
      }
      break;

    case 'EMPTY_FAMILY_OBJECT':
      return {}
      break;

    default:
      return state;
  }
}

export function observeFamily() {

  return dispatch => {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    db.collection('families')
      .where(`memberEmails.${helpers.formatEmail(userHelpers.getCurrentUserEmail())}`, '==', true)
      .onSnapshot((snapshot) => {
        if (!snapshot.metadata.hasPendingWrites) {
          const families = [];
          snapshot.forEach(doc => {
            families.push(doc.data());
          })
          dispatch({
            type: 'OVERWRITE_FAMILIES',
            families,
          })
        }
      })
  }
}

export function deleteFamily(familyId) {
  return dispatch => {
    dispatch({
      type: 'DELETING_FAMILY',
    });
    familyHelpers.deleteFamily(familyId)
      .then(res => {
        dispatch({
          type: 'DELETED_FAMILY',
          familyId,
        })
      })
  }
}

export function addFamily(familyObject) {
  return dispatch => {
    dispatch({
      type: 'ADDING_FAMILY',
    });
    familyHelpers.addNewFamily(familyObject)
      .then(newFamily => {
        dispatch({
          type: 'ADDED_FAMILY',
          newFamily,
        })
      })
  }
}

export function updateFamily(ref, updatedFamilyData) {
  return (dispatch) => {
    dispatch({
      type: 'UPDATING_FAMILY',
    })
    familyHelpers.updateFamily(ref, updatedFamilyData)
      .then(res => {
        dispatch({
          type: 'UPDATED_FAMILY',
          updatedFamilyData,
          updatedFamilyId: ref,
        })
      })
      .catch(error => {
        console.log(error);
      })
  }
}

export function getFamilies() {
  return (dispatch) => {
    dispatch({
      type: 'FAMILIES_IS_FETCHING',
      isLoading: true,
    })
    familyHelpers.getFamilies()
      .then(familiesData => {
        dispatch({
          type: 'FAMILIES_FETCHED',
          familiesData,
        })
      })
  }
}