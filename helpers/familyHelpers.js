import * as firebase from 'firebase';
import userHelpers from './userHelpers';
import helpers from './helpers';
import uuid from 'uuid';
import { updateFamily } from './reducers/familyReducer';

const familyHelpers = {
  getDb: () => {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    return db;
  },

  addNewFamily: (familyObject) => {
    return new Promise((resolve, reject) => {

      const currentUser = userHelpers.getCurrentUser();
      const currentUserEmail = currentUser.email;
      const ref = familyHelpers.getDb().collection('families').doc();


      const newFamily = {
        name: familyObject.newFamilyName,
        photo: familyObject.photo,
        members: {
          [currentUserEmail]: {
            children: [],
            partners: [],
            data: {
              displayName: currentUser.displayName,
              photo: currentUser.photoURL,
            },
            status: 'active',
          }
        },
        memberEmails: { [helpers.formatEmail(currentUserEmail)]: true },
        membersNotInTree: [],
        managers: {},
        admin: currentUserEmail,
        rootNode: currentUserEmail,
        isArchived: false,
        createdAt: helpers.getFirebaseTimeStamp(),
        createdBy: currentUserEmail,
      }

      newFamily.id = ref.id;

      ref.set(newFamily)
        .then(ref => {
          resolve(newFamily);
        })
        .catch(error => {
          console.log(error);
          reject(false);
        })
    })
  },

  addExistingUserToFamily(userRef, newUserRef, newUserDetails, isExistingUser, family, displayName) {

    // Get members existing details and delete the reference
    const memberExistingDetails = family.members[userRef];
    delete family.members[userRef];

    // create a new reference
    family.members[newUserRef] = memberExistingDetails;
    family.members[newUserRef].data.displayName = newUserDetails.displayName || displayName;
    family.members[newUserRef].data.photo = newUserDetails.photoUrl || '';
    family.members[newUserRef].status = "active";

    // delete old reference from memberEmails
    delete family.memberEmails[userRef];
    family.memberEmails[helpers.formatEmail(newUserRef)] = true;


    // Update all partner and children reference of this user
    for (const key in family.members) {

      const partners = family.members[key].partners;
      const children = family.members[key].children;

      const partnerIndex = partners.findIndex(email => email === userRef);
      if (partnerIndex > -1) {
        partners.splice(partnerIndex, 1);
        partners.push(newUserRef);
        family.members[key].partners = partners;
      }

      const childrenIndex = children.findIndex(email => email === userRef);
      if (childrenIndex > -1) {
        children.splice(childrenIndex, 1);
        children.push(newUserRef);
        family.members[key].children = children;
      }
    }


    // If rootNode, update the value
    if (family.rootNode === userRef) {
      family.rootNode === newUserRef;
    }

    // 
    const indexInNotTreeList = family.membersNotInTree.indexOf(userRef);
    if (indexInNotTreeList > -1) {
      family.membersNotInTree.splice(indexInNotTreeList, 1);
      family.membersNotInTree.push(newUserRef);
    }

    return family;
  },

  addNewUserToFamily: (addWithEmail, email, user, isExistingUser, displayName, family, userMeta) => {

    if(email){
      const requesterName = family.members[userHelpers.getCurrentUserEmail()].data.displayName;
      familyHelpers.sendInvitationEmail(email, displayName, requesterName, family.name )
    }
    const key = addWithEmail ? email : uuid.v1();

    const members = family.members;
    const memberEmails = family.memberEmails;
    let rootNode = family.rootNode;
    const membersNotInTree = family.membersNotInTree || [];

    // If the user is in the DB, use the display name from there.
    if (addWithEmail && user) {
      displayName = user.displayName;
    }

    members[key] = {
      data: {
        displayName,
        ...userMeta,
      },
      children: [],
      partners: [],
      status: addWithEmail ? "active" : "noemail",
    }

    memberEmails[helpers.formatEmail(key)] = true;

    membersNotInTree.push(key);

    const newFamilyObject = { members, memberEmails, rootNode, membersNotInTree };
    return newFamilyObject;
  },

  sendInvitationEmail(receiverEmail, receiverName, requesterName, familyName){
    let url = "https://us-central1-shreyans-gandhi.cloudfunctions.net/sendInvitationEmail?";
    url += `recieverEmail=${receiverEmail}`;
    url += `&recieverName=${receiverName}`;
    url += `&requesterName=${requesterName}`;
    url += `&familyName=${familyName}`;
    fetch(url, {
      method: 'GET'
    })
  },

  addMemberToTree: (refUser, newUserRef, relationshipType, family, familyId) => {

    const members = family.members;
    let rootNode = family.rootNode;
    const membersNotInTree = family.membersNotInTree;

    if (relationshipType === 'partner') {
      if (!members[refUser].partners) {
        members[refUser].partners = [newUserRef];
      } else {
        members[refUser].partners.push(newUserRef);
      }
    }

    if (relationshipType === 'parent') {
      members[newUserRef].children.push(refUser)
      if (rootNode === refUser) {
        rootNode = newUserRef;
      }
    }

    if (relationshipType === 'children') {
      if (!members[refUser]) {
        members[refUser].children = [newUserRef];
      } else {
        members[refUser].children.push(newUserRef);
      }
    }

    membersNotInTree.splice(membersNotInTree.indexOf(newUserRef), 1);

    const updateObject = { members, rootNode, membersNotInTree };
    return updateObject;

  },

  updateFamily: (ref, familyObject) => {
    return new Promise((resolve, reject) => {
      familyObject.updatedAt = helpers.getFirebaseTimeStamp();
      const batch = familyHelpers.getDb().batch();
      batch.update(familyHelpers.getDb().collection('families').doc(ref), familyObject);

      batch.commit()
        .then(res => resolve(true))
        .catch(error => reject(false));
    })
  },

  getUserFamilyIds: () => {
    return new Promise((resolve, reject) => {
      familyHelpers.getFamilies()
        .then(families => {
          const IDs = families.map(family => family.id);
          resolve(IDs);
        })
    })
  },

  getFamilies: () => {
    const currentUserEmail = userHelpers.getCurrentUserEmail();
    return new Promise((resolve, reject) => {
      console.log(helpers.formatEmail(currentUserEmail));
      familyHelpers.getDb().collection('families')
        .where(`memberEmails.${helpers.formatEmail(currentUserEmail)}`, '==', true)
        .get()
        .then(snapshot => {
          const families = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            families.push(data);
          });
          resolve(families);
        })
    })
  },

  getFamilyById: (id) => {
    return new Promise((resolve, reject) => {
      familyHelpers.getDb().collection('families').doc(id)
        .get()
        .then(doc => {
          if (doc.exists) {
            resolve(doc.data());
          } else {
            resolve(null);
          }
        })
    })
  },

  getAllFamilyMembers: (family) => {
    const familyTreeObject = familyHelpers.getFamilyMemberObjectNew(family.rootNode, family);
    return familyTreeObject;
  },

  getFamilyMemberObjectNew: (userEmail, family, onlySelfData = false, ) => {
    const user = {
      email: userEmail,
      children: [],
      partners: [],
      data: family.members[userEmail].data,
    }

    if (!onlySelfData) {
      const partnerEmails = family.members[userEmail].partners;
      const childrenEmail = family.members[userEmail].children;

      if (childrenEmail.length > 0) {
        user.children = childrenEmail.map(email => familyHelpers.getFamilyMemberObjectNew(email, family, false));

        // user.children = user.children.map(child => {

          // Add siblings to the child
          // child.siblings = childrenEmail.reduce((siblings = [], siblingEmail) => {
          //   if (siblingEmail !== child.email) {
          //     siblings.push(family.members[siblingEmail]);
          //   }
          //   return siblings;
          // }, [])

          // Add parent to the child
          // child.parents = [family[userEmail]];
          // partnerEmails.map(partnerEmail => {
          //   child.parents.push(family.members[partnerEmail]);
          // })
          // return child;
        // })
      }

      if (partnerEmails.length > 0) {
        user.partners = partnerEmails.map(email => ({
          data: family.members[email].data,
          email,
          // children: childrenEmail.map(childEmail => family.members[childEmail]), // this user's children are also his/her partner's children
          // partners: [family.members[userEmail]], // this user is also a partner to his partner
        }))
      }
    }

    return user;
  },

  getFamilyMemberObject: (userEmail, family, onlySelfData = false) => {
    return new Promise((resolve, reject) => {
      const user = {
        email: userEmail,
        children: [],
        data: [],
        partners: [],
      };

      const allPromises = [userHelpers.getUserData(userEmail)];

      if (!onlySelfData) {

        // // Get User Partner
        const partnerEmails = family.members[userEmail].partners;
        allPromises.push(familyHelpers.getUserPartnerDetails(userEmail, partnerEmails, family));

        // Get User Children
        const children = family.members[userEmail].children;
        children.map(child => {
          allPromises.push(familyHelpers.getFamilyMemberObject(child, family));
        })

      }

      Promise.all(allPromises)
        .then(values => {
          user.data = values[0] || family.members[userEmail].data || {};
          if (!onlySelfData) {
            user.partners = values.length >= 2 ? values[1] : [];
            for (let i = 2; i < values.length; i++) {
              user.children.push(values[i]);
            }
          }
          resolve(user);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        })
    })
  },

  getUserPartnerDetails: (userEmail, partnerEmails = [], family) => {
    return new Promise((resolve, reject) => {

      if (!partnerEmails || partnerEmails.length === 0) resolve([]);

      const allPromises = partnerEmails.map(partnerEmail => familyHelpers.getFamilyMemberObject(partnerEmail, family, true));

      Promise.all(allPromises).then(values => {
        resolve(values);
      })
    })
  },

  assignUserAsManager(userRef, family) {
    family.managers[helpers.formatEmail(userRef)] = true;
    return family;
  },

  removeUserAsManager(userRef, family) {
    delete family.managers[helpers.formatEmail(userRef)];
    return family;
  },

  removeMemberFromTree: (userRef, family, updateDB = true) => {
    const members = family.members;
    const membersNotInTree = family.membersNotInTree;
    let memberEmails = family.memberEmails;

    const res = familyHelpers.removeSingleMemberFromTree(userRef, members, memberEmails, membersNotInTree);

    family.members = res.members;
    family.memberEmails = res.memberEmails;
    family.membersNotInTree = res.membersNotInTree;

    return family;
  },

  removeSingleMemberFromTree: (email, members, memberEmails, membersNotInTree) => {

    // Delete partners

    const partners = members[email].partners || [];
    partners.map(partnerEmail => {
      membersNotInTree.push(partnerEmail);
    })
    members[email].partners = [];

    // Delete Children
    const children = members[email].children || [];
    children.map(child => {
      res = familyHelpers.removeSingleMemberFromTree(child, members, memberEmails, membersNotInTree);
      members = res.members;
      memberEmails = res.memberEmails;
    })

    // Delete Self
    membersNotInTree.push(email);

    for (const key in members) {

      // Delete Self reference as children
      const children = members[key].children || [];
      const index = children ? children.indexOf(email) : -1;
      if (index > -1) {
        children.splice(index, 1);
        members[key].children = children;
        break;
      }

      // Delete self reference as partners
      const partners = members[key].partners || [];
      const index1 = partners ? partners.indexOf(email) : -1;
      if (index1 > -1) {
        partners.splice(index1, 1);
        members[key].partners = partners;
        break;
      }
    }

    return { members, memberEmails, membersNotInTree };

  },

  removeMember: (userEmail, family) => {
    family = familyHelpers.removeMemberFromTree(userEmail, family, false)
    delete family.members[userEmail];
    delete family.memberEmails[helpers.formatEmail(userEmail)];
    family.membersNotInTree.splice(family.membersNotInTree.indexOf(userEmail), 1);
    delete family.managers[helpers.formatEmail(userEmail)];

    return {
      members: family.members,
      memberEmails: family.memberEmails,
      membersNotInTree: family.membersNotInTree,
      managers: family.managers,
    };
  },

  deleteFamily: (familyId) => {
    return new Promise((resolve, reject) => {
      familyHelpers.getDb().collection('families').doc(familyId).delete()
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

export default familyHelpers;