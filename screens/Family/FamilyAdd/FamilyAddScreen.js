import React, { Component } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Form, Item, Input, Button, Text, ListItem, CheckBox, Right, Left } from 'native-base';
import { connect } from 'react-redux';
import FamilyImage from './FamilyImage';
import helpers from '../../../helpers/helpers';
import { addFamily, updateFamily } from '../../../helpers/reducers/familyReducer';

class FamilyAddScreen extends Component {

  static navigationOptions = ({navigation}) => ({
    title: (navigation.state.params && navigation.state.params.title) || "Add Family",
  })

  constructor(props) {
    super(props);
    let family = {};
    if (props.navigation.state.params) family = props.navigation.state.params.family;
    props.navigation.setParams({title: family && family.id ? "Edit Family" : "Add Family" });
    this.state = {
      newFamilyName: family.name || '',
      isUploading: false,
      isAdding: false,
      isUpdating: false,
      photo: family.photo || '',
      mode: family && family.id ? "edit" : "add",
    }
    this.handleFamilyAdd = this.handleFamilyAdd.bind(this);
    this.handleImagePicker = this.handleImagePicker.bind(this);
    this.handleFamilyUpdate = this.handleFamilyUpdate.bind(this);
    this.handleAction = this.handleAction.bind(this);
    this.shouldAllowNext = this.shouldAllowNext.bind(this);
  }

  componentWillReceiveProps(nextProps) {

    // Handle isAdding
    if (nextProps.families.isAdding !== this.state.isAdding) {
      this.setState({ isAdding: nextProps.families.isAdding });
    }

    // Handle isUpdating
    if (nextProps.families.isUpdating !== this.state.isUpdating) {
      this.setState({ isUpdating: nextProps.families.isUpdating });
    }

    // Handle Adding Success
    if (!nextProps.families.isAdding && this.state.isAdding && !nextProps.families.isAddingError) {
      this.props.navigation.goBack();
    }

    // Handle Updating Success
    if (!nextProps.families.isUpdating && this.state.isUpdating && !nextProps.families.isUpdatingError) {
      this.props.navigation.goBack();
    }

    if (nextProps.families.isAddingError) {
      Toast.show({
        text: 'Ops! Family could not be created. We are fixing it!',
      })
    }
  }

  handleFamilyAdd() {
    this.setState({ isAdding: true });
    const { newFamilyName, photo } = this.state;
    this.props.addFamily({ newFamilyName, photo })
  }

  handleImagePicker() {
    this.setState({ isUploading: true });
    helpers._pickImage()
      .then(upload => {
        this.setState({ isUploading: false, photo: upload.uri, photoSizes: upload.photoSizes });
      })
      .catch(error => {
        // TODO: Toast
        console.log(error);
        this.setState({ isUploading: false });
      })
  }

  handleFamilyUpdate() {
    const { newFamilyName, photo } = this.state;
    const familyId = this.props.navigation.state.params.family.id;
    this.props.updateFamily(familyId, { name: newFamilyName, photo });
  }

  handleAction() {
    this.state.mode === 'add' ? this.handleFamilyAdd() : this.handleFamilyUpdate();
  }

  shouldAllowNext() {
    if (this.state.newFamilyName.trim().length >= 2) return true;
    return false;
  }

  render() {
    const { isUploading, photo, isOnlyManagers, newFamilyName, isAdding, mode, isUpdating } = this.state;

    const isActionDisabled = isAdding || isUploading || isUpdating || !this.shouldAllowNext();
    return (
      <View style={styles.container}>
        <View style={styles.flex}>
          <FamilyImage
            image={photo}
            onPickImageSelect={this.handleImagePicker}
            isUploading={isUploading}
          />
          <Form style={styles.form}>
            <View style={styles.inputTitleContainer}>
              <Text style={styles.fieldTitle}>FAMILY NAME</Text>
            </View>
            <Item regular style={{ backgroundColor: 'white' }}>
              <Input
                value={newFamilyName}
                onChangeText={newFamilyName => this.setState({ newFamilyName })}
              />
            </Item>
          </Form>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            full
            primary
            onPress={() => isActionDisabled ? null : this.handleAction()}
            disabled={isActionDisabled}
            style={styles.button}
          >
            {(isAdding || isUploading || isUpdating) ?
              <ActivityIndicator /> :
              <Text>{mode === 'add' ? 'Add' : 'Update'} Family</Text>
            }
          </Button>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  families: state.familyReducer.families || {},
})

const mapDispatchToProps = {
  addFamily,
  updateFamily,
}

export default connect(mapStateToProps, mapDispatchToProps)(FamilyAddScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  button: {
    height: 56,
  },
  buttonContainer: {
    height: 56,
  },
  noMargin: {
    margin: 0,
  },
  listItem: {
    paddingLeft: 5,
    marginLeft: 0,
  },
  form: {
    margin: 17,
  },
  inputTitleContainer: {
    marginBottom: 10,
    paddingLeft: 5,
  },
  flex: {
    flex: 1,
  }
});