import React, { Component } from 'react';
import { View, Modal, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Button } from 'native-base';
import { connect } from 'react-redux';
import familyHelpers from '../../../helpers/familyHelpers';
import helpers from '../../../helpers/helpers';
import FamilySingleActionPicker from './FamilySingleActionPicker';
import UserNode from './UserNode';
import commonColor from '../../../native-base-theme/variables/commonColor';
import AddToTreeModal from './AddToTreeModal';
import { updateFamily } from '../../../helpers/reducers/familyReducer';
import FullscreenLoading from '../../../components/FullscreenLoading';

class FamilySingleScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    const { family, onSelect, isAddingMode, isDeletingMode } = navigation.state.params;
    return {
      headerTitle: (
        <TouchableOpacity
          style={styles.headerContainer}
          onPress={() => { navigation.navigate('FamilyDetails', { familyId: family.id }) }}
        >
          <Text style={styles.headerTitle}>{family.name.toUpperCase()}</Text>
        </TouchableOpacity>
      ),
      headerRight: (isAddingMode || isDeletingMode) ?
        <Button transparent onPress={() => onSelect('normal')} style={{ height: commonColor.toolbarHeight, justifyContent: 'center' }}>
          <Text style={{ color: commonColor.inverseTextColor }}>Done</Text>
        </Button>
        : (
          <FamilySingleActionPicker onSelect={onSelect} />
        )
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      refUserEmail: null,
      modalVisible: false,
      newUserType: null,
      isAddingMode: false,
      isDeletingMode: false,
      familyTree: null,
      family: this.props.navigation.state.params.family,
      isUpdating: false,
    }

    this.allMemberEmails = [];

    this.handleNewMemberClick = this.handleNewMemberClick.bind(this);
    this.handleAddModalClose = this.handleAddModalClose.bind(this);

    this.handleAddingComplete = this.handleAddingComplete.bind(this);
    this.handleActionSelect = this.handleActionSelect.bind(this);
    this.showDeleteAlert = this.showDeleteAlert.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({ onSelect: this.handleActionSelect });
  }

  componentWillReceiveProps(nextProps) {
    // Handle Family Update
    const familyId = this.state.family.id;
    const newFamily = nextProps.families.data.find(family => family.id === familyId);
    if (!helpers.areObjectsEqual(newFamily, this.state.family)) {
      this.setState({ family: newFamily });
    }

    // Handle isUpdating Done
    if (this.state.isUpdating && !nextProps.families.isUpdating) {
      this.setState({ isUpdating: nextProps.families.isUpdating });
    }
  }


  handleActionSelect(type) {
    switch (type) {
      case 'add':
        this.props.navigation.setParams({ isAddingMode: true });
        this.setState({ isAddingMode: true, isDeletingMode: false });
        break;
      case 'delete':
        this.props.navigation.setParams({ isDeletingMode: true });
        this.setState({ isDeletingMode: true, isAddingMode: false });
        break;
      case 'view':
        this.props.navigation.navigate('FamilyDetails', { family: this.props.navigation.state.params.family });
        break;
      case 'normal':
        this.props.navigation.setParams({ isAddingMode: false, isDeletingMode: false });
        this.setState({ isAddingMode: false, isDeletingMode: false });
      default:
        break;
    }
  }

  showDeleteAlert(email) {
    Alert.alert(
      'Alert',
      'This user and its partners and children will also be deleted. Are you sure?',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Delete', onPress: () => this.handleDelete(email) },
      ],
      { cancelable: true }
    )
  }

  async handleDelete(email) {
    const { family } = this.state;
    this.setState({
      isDeletingMode: false,
      isAddingMode: false,
      isUpdating: true,
    });

    const updatedFamily = familyHelpers.removeMemberFromTree(email, family, true);

    this.props.updateFamily(family.id, updatedFamily);
  }


  handleNewMemberClick(refUserEmail) {
    this.setState({
      modalVisible: true,
      refUserEmail,
    });
  }

  handleAddModalClose() {
    this.setState({ modalVisible: false });
  }

  handleAddingComplete() {
    this.setFamilyMembers();
    this.setState({ modalVisible: false });
  }


  render() {
    const { isAddingMode, isDeletingMode, modalVisible,
      refUserEmail, family } = this.state;
    const familyTree = family.tree;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ScrollView showsHorizontalScrollIndicator={false}
          maximumZoomScale={2}
          minimumZoomScale={0.5}
        >
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            maximumZoomScale={2}
            minimumZoomScale={0.5}
          >
            {familyTree &&
              <View style={{ marginTop: 20 }}>
                <UserNode
                  family={family}
                  user={familyTree}
                  onNewMemberClick={this.handleNewMemberClick}
                  onMemberDelete={this.showDeleteAlert}
                  isRootNode
                  isAddingMode={isAddingMode}
                  isDeletingMode={isDeletingMode}
                  navigation={this.props.navigation}
                />

              </View>
            }
          </ScrollView>
          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={this.handleAddModalClose}
          >
            <AddToTreeModal
              family={family}
              refUserEmail={refUserEmail}
              allowParent={refUserEmail === this.state.family.rootNode}
              onClose={this.handleAddModalClose}
              onComplete={this.handleAddingComplete}
            />
          </Modal>
        </ScrollView>
        {this.state.isUpdating && <FullscreenLoading />}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  families: state.familyReducer.families || {}
})

const mapDispatchToProps = {
  updateFamily,
};

export default connect(mapStateToProps, mapDispatchToProps)(FamilySingleScreen);

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    height: commonColor.toolbarHeight,
    justifyContent: 'center',
  },
  headerTitle: {
    color: commonColor.inverseTextColor,
    fontSize: commonColor.headerTitleFontSize,
    fontWeight: commonColor.headerTitleFontWeight,
  }
})