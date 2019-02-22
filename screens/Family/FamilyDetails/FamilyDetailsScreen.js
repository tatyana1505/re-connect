import React, { Component } from 'react';
import {
  View, Dimensions, TouchableOpacity, ActivityIndicator,
  Modal, Alert, Image
} from 'react-native';
import {
  Icon, List, ListItem, Left, Body, Right, Text,
  Thumbnail, Container, Content, Toast, H3,
} from 'native-base';
import { connect } from 'react-redux';
import familyPlaceholderImage from '../../../assets/images/familyPlaceholder/familyPlaceholder.png';
import helpers from '../../../helpers/helpers';
import familyHelpers from '../../../helpers/familyHelpers';
import Avatar from '../../../components/Avatar';
import MemberOption from './MemberOption';
import MemberAdd from '../../Members/MemberAdd';
import userHelpers from '../../../helpers/userHelpers';
import { updateFamily, deleteFamily } from '../../../helpers/reducers/familyReducer';
import FullscreenLoading from '../../../components/FullscreenLoading';
import commonColor from '../../../native-base-theme/variables/commonColor';

const LEAVE_GROUP_ALERT = "You are about to leave the group. Are you sure?"

class FamilyDetailsScreen extends Component {

  static navigationOptions = ({ navigation }) => ({
    header: null,
  })

  constructor(props) {
    super(props);
    const { familyId } = props.navigation.state.params
    this.state = {
      family: this.props.families.data.find(family => family.id === familyId),
      isUploading: false,
      isAddMemberModalVisible: false,
      isUpdating: false,
      isDeleting: false,
    }
    this.handleImageUpdate = this.handleImageUpdate.bind(this);
    this.handleMemberAction = this.handleMemberAction.bind(this);
    this.handleAddNewMemberClick = this.handleAddNewMemberClick.bind(this);
    this.handleAssignEmailComplete = this.handleAssignEmailComplete.bind(this);
    this.showDeleteAlert = this.showDeleteAlert.bind(this);
  }

  componentWillReceiveProps(nextProps) {

    // Handle Family Update
    const familyId = this.state.family.id;
    const newFamily = nextProps.families.data.find(family => family.id === familyId);

    if (!helpers.areObjectsEqual(newFamily, this.state.family)) {

      if (newFamily && !newFamily.memberEmails[helpers.formatEmail(userHelpers.getCurrentUserEmail())]) {
        // If user exited the group
        this.props.navigation.navigate('FamilyListing');
        Toast.show({
          text: 'Group exited',
        })
      } else {
        this.setState({ family: newFamily });
      }
    }

    // Handle isUpdating
    if (nextProps.families.isUpdating !== this.state.isUpdating) {
      if (this.state.isUpdating && !nextProps.families.isUpdating && !nextProps.isUpdatingError) {
        this.setState({ family: newFamily });
        Toast.show({
          text: 'Updated!',
        })
      }
      this.setState({ isUpdating: nextProps.families.isUpdating });
    }

    // handle updating error
    if (nextProps.families.isUpdatingError) {
      Toast.show({
        text: 'Ops! Something went wrong. We are fixing it.',
      })
    }

    // Handle isDeleting
    if (nextProps.families.isDeleting && !this.state.isDeleting) {
      this.setState({ isDeleting: nextProps.families.isDeleting });
    }

    if (this.state.isDeleting && !nextProps.families.isDeleting && !nextProps.families.isDeletingError) {
      this.props.navigation.navigate('FamilyListing');
    }
  }

  handleImageUpdate() {
    this.setState({ isUploading: true });
    helpers._pickImage()
      .then(url => {
        const family = JSON.parse(JSON.stringify(this.state.family))
        family.photo = url;
        this.setState({ isUploading: false, family });
        familyHelpers.updateFamily(family.ref, family)
          .then(res => {
          })
      })
      .catch(error => {
        console.log('could not upload');
        this.setState({ isUploading: false });
      })
  }

  handleMemberAction(action, userKey) {
    const family = JSON.parse(JSON.stringify(this.state.family));

    if (action === 'assignEmail') {
      this.setState({ isAddMemberModalVisible: true, userKey });
    }

    if (action === "removeAsManager") {
      const updatedFamily = familyHelpers.removeUserAsManager(userKey, family);
      this.props.updateFamily(updatedFamily.id, updatedFamily);
    }

    if (action === "assignManager") {
      const updatedFamily = familyHelpers.assignUserAsManager(userKey, family);
      this.props.updateFamily(updatedFamily.id, updatedFamily);
    }

    if (action === 'remove') {
      const updatedFamily = familyHelpers.removeMember(userKey, family);
      this.props.updateFamily(family.id, updatedFamily);
    }
  }

  handleAssignEmailComplete() {
    this.setState({ isAddMemberModalVisible: false })
  }

  handleAddNewMemberClick() {
    this.setState({ isAddMemberModalVisible: true, userKey: null });
  }

  showDeleteAlert(email, message, actionText) {
    if (!message) {
      message = 'This user and its partners and children will also be deleted. Are you sure?';
    }
    Alert.alert('Alert', message,
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: actionText || 'Delete', onPress: () => this.handleMemberAction('remove', email) },
      ],
      { cancelable: true }
    )
  }

  render() {
    const { family, isUploading } = this.state;
    const currentUserEmail = userHelpers.getCurrentUserEmail();

    if (!family) return null;

    let currentUserRole = "member";
    if (currentUserEmail === family.admin) {
      currentUserRole = 'admin';
    } else if (family.managers[helpers.formatEmail(currentUserEmail)]) {
      currentUserRole = 'manager';
    }

    const screenWidth = Dimensions.get('window').width;
    let uri = family.photo;

    if (family.photoSizes && family.photoSizes.length > 0) {
      if (screenWidth <= 480) {
        uri = family.photoSizes[480];
      } else {
        uri = familyPhotoSizes[960];
      }
    }

    return (
      <Container>
        <Content>
          <View>
            <Image
              source={uri ? { uri } : familyPlaceholderImage}
              style={{ height: screenWidth * 3 / 4, width: screenWidth }}
            />
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={{ position: 'absolute', padding: 17, top: 0, left: 0, marginTop: 17 }}
            >
              <Icon name="arrow-back" style={{ color: 'white' }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('FamilyAdd', { family })}
              style={{ position: 'absolute', padding: 20, bottom: 0, right: 0 }}
            >
              <Icon name="create" style={{ color: 'white' }} />
            </TouchableOpacity>
            <View style={{ position: 'absolute', bottom: 20, left: 20 }}>
              <Text style={{ fontSize: 36, lineHeight: 36, color: commonColor.inverseTextColor }}>{family.name}</Text>
            </View>
            {isUploading &&
              <View style={styles.imageUploadLoading}>
                <ActivityIndicator size="large" />
              </View>
            }
          </View>

          <View style={{ marginVertical: 17, backgroundColor: '#fff' }}>
            <List>
              <ListItem
                avatar
                noBorder
                onPress={() => this.props.navigation.navigate('FamilySingle', { family })}
              >
                <Body>
                  <Text>View Family Tree</Text>
                </Body>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            </List>
          </View>

          <View style={{ marginVertical: 17, backgroundColor: '#fff' }}>

            {["admin", "manager"].indexOf(currentUserRole) > -1 &&
              <List>
                <ListItem onPress={this.handleAddNewMemberClick} avatar style={{ marginVertical: 5 }}>
                  <Left>
                    <Avatar size={36}>
                      <Icon name="person-add" style={{ color: '#fff' }} size={28} />
                    </Avatar>
                  </Left>
                  <Body><Text>Add New Member</Text></Body>
                </ListItem>
              </List>
            }

            <List>
              {Object.keys(family.members).map(key => {

                let memberRole = "member";
                if (key === family.admin) {
                  memberRole = "admin";
                } else if (family.managers[helpers.formatEmail(key)]) {
                  memberRole = "manager";
                }

                return (
                  <Member
                    member={family.members[key]}
                    key={key}
                    refKey={key}
                    onActionPress={this.handleMemberAction}
                    onDeletePress={this.showDeleteAlert}
                    isRootNode={key === family.rootNode}
                    isCurrentUserAdmin={key === family.admin}
                    currentUserRole={currentUserRole}
                    memberRole={memberRole}
                    onPress={() => this.props.navigation.navigate('FamilyProfile', { user: { ...family.members[key], email: key }, family })}
                  />
                )
              })}
            </List>
          </View>

          {[family.admin, family.rootNode].indexOf(currentUserEmail) === -1 &&
            <View style={{ marginVertical: 17, backgroundColor: '#fff' }}>
              <List>
                <ListItem
                  avatar
                  noborder
                  onPress={() => this.showDeleteAlert(userHelpers.getCurrentUserEmail(), LEAVE_GROUP_ALERT, "Exit")}
                >
                  <Left style={{ width: 36, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="ios-log-out-outline" style={{ color: commonColor.brandDanger }} size={28} />
                  </Left>
                  <Body>
                    <Text style={{ color: commonColor.brandDanger }}>Exit Group</Text>
                  </Body>
                </ListItem>
              </List>
            </View>
          }

          {family.admin === userHelpers.getCurrentUserEmail() &&
            <View style={{ marginVertical: 17, backgroundColor: '#fff' }}>
              <List>
                <ListItem
                  avatar
                  noborder
                  onPress={() => this.props.deleteFamily(family.id)}
                >
                  <Left style={{ width: 36, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trash" style={{ color: commonColor.brandDanger }} size={28} />
                  </Left>
                  <Body>
                    <Text style={{ color: commonColor.brandDanger }}>Delete Family</Text>
                  </Body>
                </ListItem>
              </List>
            </View>
          }


          <Modal
            visible={this.state.isAddMemberModalVisible}
            onRequestClose={() => this.setState({ isAddMemberModalVisible: false })}
          >
            <MemberAdd
              addingType={this.state.userKey ? "existing" : "new"}
              family={family}
              onClose={() => { this.setState({ isAddMemberModalVisible: false }) }}
              onComplete={this.handleAssignEmailComplete}
              existingUserRef={this.state.userKey}
              title={this.state.userKey ? "Assign Email" : "Add New Member"}
            />
          </Modal>
        </Content>
        {(this.state.isUpdating || this.state.isDeleting) && <FullscreenLoading />}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  families: state.familyReducer.families,
})

const mapDispatchToProps = {
  updateFamily,
  deleteFamily,
};

export default connect(mapStateToProps, mapDispatchToProps)(FamilyDetailsScreen);

const Member = ({ member, refKey, isRootNode, onActionPress, currentUserRole, memberRole, onDeletePress, onPress }) => (
  <ListItem avatar key={refKey} noBorder style={{ marginVertical: 5 }} onPress={onPress}>
    <Left>
      <View style={{ marginRight: 17, flexDirection: 'row', alignItems: 'center' }}>
        <Avatar
          name={member.data.displayName}
          size={36}
          photo={member.data.photo}
          photoSizes={member.data.photoSizes}
        />
      </View>
    </Left>
    <Body style={{ flexDirection: 'row', marginLeft: 0, justifyContent: 'space-between' }}>
      <Text numberOfLines={1}>{member.data.displayName}</Text>
      {memberRole === "admin" && <Text note>Admin</Text>}
      {memberRole === "manager" && <Text note>Manager</Text>}
    </Body>
    <Right style={{ paddingTop: 0, paddingBottom: 0, justifyContent: 'center', paddingRight: 0, width: 48 }}>
      <MemberOption
        refKey={refKey}
        onActionPress={onActionPress}
        onDeletePress={onDeletePress}
        status={member.status}
        isRootNode={isRootNode}
        memberRole={memberRole}
        currentUserRole={currentUserRole}
      />
    </Right>
  </ListItem>
)