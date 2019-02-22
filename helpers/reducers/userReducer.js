import familyHelpers from "../familyHelpers";
import userHelpers from "../userHelpers";

export default function userReducer(state = {}, action) {

  switch (action.type) {

    case 'USER_FETCHED':
      const users = JSON.parse(JSON.stringify((state.users && state.users.data) ? state.users.data : {}));
      users[action.userEmail] = action.userData;

      return {
        ...state,
        users: {
          ...state.users,
          isFetching: false,
          isFetchingError: false,
          data: users,
        }
      }

    case 'USER_IS_FETCHING':
      return {
        ...state,
        users: {
          ...state.users,
          isFetching: true,
          isFetchingError: false,
        }
      }

    case 'UPDATING_USER':
      return {
        ...state,
        users: {
          ...state.users,
          isUpdating: true,
          isUpdatingError: false,
        }
      }

    case 'UPDATED_USER':
      const updatedUserObject = { ...state.users.data[action.updatedUserRef], ...action.updatedUser };
      return {
        ...state,
        users: {
          ...state.users,
          isUpdating: false,
          isUpdatingError: false,
          data: { ...state.users.data, [action.updatedUserRef]: updatedUserObject },
        }
      }

    case 'LOGGING_IN_USER':
      return {
        ...state,
        users: {
          isLoggingIn: true,
          isLoggingInError: false,
        }
      }
      break;

    case 'LOGGED_IN_USER':
      return {
        ...state,
        users: {
          isLoggingIn: false,
          isLoggingInError: false,
          data: { [action.ref]: action.user }
        }
      }

    case 'LOGOUT':
      return {
        ...state,
        events: {},
        users: {},
        families: {},
      }
      break;

    case 'EMPTY_USER_OBJECT':
      return {}

    default:
      return state;
  }
}

export function loginUser(userObject, ref, isAlreadyLoggedIn = false, isNewUser, notificationToken) {
  return dispatch => {
    dispatch({
      type: 'LOGGING_IN_USER',
    });
    if (!isAlreadyLoggedIn) {
      userHelpers.updateUserAfterLogin(userObject, ref, isNewUser, notificationToken)
        .then(user => {
          dispatch({
            type: 'LOGGED_IN_USER',
            user,
            ref,
          });
        })
        .catch(error => {
          console.log(error);
          dispatch({
            type: 'LOGGING_IN_ERROR',
          })
        })
    } else {
      userHelpers.getUserData(ref)
        .then(user => {
          dispatch({
            type: 'LOGGED_IN_USER',
            user,
            ref,
          })
        })
    }
  }
}

export function getUserMeta(userEmail) {
  return (dispatch) => {
    dispatch({
      type: 'USER_IS_FETCHING',
      isLoading: true,
    })
    userHelpers.getUserData(userEmail)
      .then(userData => {
        dispatch({
          type: 'USER_FETCHED',
          userData,
          userEmail,
        })
      })
  }
}

export function logout() {
  return dispatch => {
    dispatch({
      type: 'EMPTY_USER_OBJECT',
    })
    dispatch({
      type: 'EMPTY_EVENT_OBJECT',
    })
    dispatch({
      type: 'EMPTY_FAMILY_OBJECT',
    })
  }
}

export function updateUser(userObject, ref) {
  return dispatch => {
    dispatch({
      type: 'UPDATING_USER',
    });
    userHelpers.updateUserMeta(userObject, ref)
      .then(res => {
        dispatch({
          type: 'UPDATED_USER',
          updatedUser: userObject,
          updatedUserRef: ref,
        })
      })
  }
}

export function updateUserPhotoOrDisplayName(userObject, ref) {
  return async (dispatch, getState) => {
    dispatch({
      type: 'UPDATING_USER',
    });
    const resp = await userHelpers.updateUserPhotoOrDisplayName(userObject, ref);

    dispatch({
      type: 'UPDATED_USER',
      updatedUser: resp.userObject,
      updatedUserRef: ref,
    })
    dispatch({
      type: 'FAMILIES_FETCHED',
      familiesData: resp.families,
    })
  }
}