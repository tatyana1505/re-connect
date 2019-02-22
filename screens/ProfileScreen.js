import React, { Component } from 'react';
import { View, StyleSheet, TouchableHighlight, Dimensions, TouchableOpacity,
  Alert, KeyboardAvoidingView, BackHandler } from 'react-native';
import {
  Container, Content, Item, Input, Button, Icon, H2, Text,
  Footer, FooterTab, Toast, Form
} from 'native-base';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import Loading from '../components/Loading';
import { connect } from 'react-redux';
import { getUserMeta, updateUser, updateUserPhotoOrDisplayName } from '../helpers/reducers/userReducer';
import userHelpers from '../helpers/userHelpers';
import Avatar from '../components/Avatar';
import commonColor from '../native-base-theme/variables/commonColor';
import helpers from '../helpers/helpers';
import FullscreenLoading from '../components/FullscreenLoading';

class ProfileScreen extends Component {

  constructor(props) {
    super(props);
    this.currentUserEmail = userHelpers.getCurrentUserEmail();

    this.state = {
      currentUserName: (props.users.data && props.users.data[this.currentUserEmail] && props.users.data[this.currentUserEmail].displayName) || null,
      userMeta: (props.users && props.users.data && props.users.data[this.currentUserEmail]) || null,
      isFetched: false,
      isFetching: false,
      isUpdating: false,
      isUploadingNewImage: false,
      isDatePicker: false,
    }
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.shouldAllowUpdate = this.shouldAllowUpdate.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  componentDidMount() {
    if (!this.state.userMeta) {
      this.props.getUserMeta(this.currentUserEmail);
    }

    // Back Button Handler
    BackHandler.addEventListener('hardwareBackPress', this.handleGoBack);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleGoBack);
  }


  handleGoBack() {
    this.props.navigation.navigate('Tabs');
    return true;
  }

  componentWillReceiveProps(nextProps) {
    // Handle is Fetching
    if (!this.state.isFetching && nextProps.users.isFetching) {
      this.setState({ isFetching: nextProps.users.isFetching });
    }

    // Handle fetching done
    if (this.state.isFetching && !nextProps.users.isFetching && !nextProps.users.isFetchingError) {
      this.setState({
        currentUserName: nextProps.users.data[this.currentUserEmail].displayName,
        userMeta: nextProps.users.data[this.currentUserEmail],
        isFetching: false,
        isFetched: true
      });
    }

    // Handle Updating Event Start
    if (nextProps.users.isUpdating) {
      this.setState({ isUpdating: true });
    }

    // Handle Updaing Event Done
    if (!nextProps.users.isUpdating && this.state.isUpdating) {
      this.setState({ isUpdating: false });
      if (!nextProps.users.isUpdatingError) {
        this.setState({ userMeta: nextProps.users.data[this.currentUserEmail] })
        Toast.show({
          text: 'Profile Updated',
        })
      } else {
        Alert.alert(
          'Alert',
          'Sorry! The profile could not be updated!',
          [
            { text: 'OK', style: 'cancel' },
          ],
          { cancelable: true }
        )
      }
    }
  }

  handleFieldChange(key, value) {
    this.setState({ userMeta: { ...this.state.userMeta, [key]: value } });
  }

  shouldAllowUpdate() {
    const { userMeta } = this.state;
    if (userMeta && userMeta.displayName && userMeta.displayName.length >= 2) return true;
    return false;
  }

  handleUpdate() {
    if (this.state.userMeta !== this.state.currentUserName) {
      this.props.updateUserPhotoOrDisplayName(this.state.userMeta, this.currentUserEmail);
    } else {
      this.props.updateUser(this.state.userMeta, this.currentUserEmail);
    }
  }

  async handleImage() {
    this.setState({ isUpdating: true });
    let profileImages = null;
    try {
      profileImages = await helpers._pickProfileImage();
    } catch (error) {
      this.setState({ isUpdating: false });
    }


    if (profileImages && profileImages.uri) {
      this.props.updateUser({ photo: profileImages.uri, photoSizes: profileImages.sizes }, userHelpers.getCurrentUserEmail());
    }
  }

  render() {
    const { isFetching, userMeta, isUpdating, isDatePicker } = this.state;
    const { width } = Dimensions.get('window');
    const shouldAllowUpdate = this.shouldAllowUpdate();
    return (
      <Container>
        {isFetching && <Loading />}

        {!isFetching && userMeta &&
          <Content>
              <Form>
            <KeyboardAvoidingView behavior="padding" enabled>
            <View>
              <View style={styles.imageContainer}>
                <View style={{ marginBottom: 17 }}>
                  <Avatar
                    name={userMeta.displayName}
                    photo={userMeta.photo}
                    size={width > 480 ? 196 : 128}
                    photoSizes={userMeta.photoSizes}
                  />
                  <TouchableOpacity
                    onPress={this.handleImage}
                    style={{ position: 'absolute', top: width > 480 ? 196 / 8 : 128 / 8, right: 0 }}
                  >
                    <Icon name="camera" style={{ color: '#fff' }} />
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: commonColor.inverseTextColor, fontSize: 24 }}>{userMeta.displayName}</Text>
                  {helpers.validateEmail(this.currentUserEmail || '') && <Text style={{ color: commonColor.inverseTextColor }}>({this.currentUserEmail})</Text>}
                </View>
                <TouchableOpacity
                  onPress={this.handleGoBack}
                  style={{ position: 'absolute', padding: 17, top: 0, left: 0, marginTop: 17 }}
                >
                  <Icon name="arrow-back" style={{ color: 'white' }} />
                </TouchableOpacity>
              </View>

              <View style={{ marginHorizontal: 17, marginVertical: 17 }}>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Display Name *</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.handleFieldChange('displayName', value)}
                    value={userMeta.displayName}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Phone</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.handleFieldChange('phone', value)}
                    value={userMeta.phone}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Birthday</Text>
                </View>
                <TouchableHighlight onPress={() => this.setState({ isDatePicker: true })} style={styles.picker}>
                  <Text>{userMeta.dob && moment(userMeta.dob.toMillis ? new Date(userMeta.dob.toMillis()) : userMeta.dob).format('D MMM, YYYY')}</Text>
                </TouchableHighlight>

                <DateTimePicker
                  isVisible={isDatePicker}
                  onConfirm={dob => this.setState({ userMeta: { ...userMeta, dob }, isDatePicker: false })}
                  onCancel={() => { this.setState({ isDatePicker: false }) }}
                  mode={'date'}
                  maximumDate={new Date()}
                />

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Occupation</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.handleFieldChange('occupation', value)}
                    value={userMeta.occupation}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Current City</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.handleFieldChange('currentCity', value)}
                    value={userMeta.currentCity}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Current State</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.handleFieldChange('currentState', value)}
                    value={userMeta.currentState}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Current Country</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.handleFieldChange('currentCountry', value)}
                    value={userMeta.currentCountry}
                  />
                </Item>
              </View>
            </View>
            </KeyboardAvoidingView>
            </Form>
          </Content>
        }
        {isUpdating && <FullscreenLoading />}
        {!isFetching && userMeta &&
          <Footer>
            <FooterTab>
              <Button
                full
                primary
                disabled={!shouldAllowUpdate}
                onPress={this.handleUpdate}
              >
                <Text style={{ lineHeight: 18 }}>Update</Text>
              </Button>
            </FooterTab>
          </Footer>
        }
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  users: state.userReducer.users,
})

const mapDispatchToProps = {
  getUserMeta,
  updateUser,
  updateUserPhotoOrDisplayName,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);

const styles = StyleSheet.create({
  imageContainer: {
    paddingVertical: 50,
    width: Dimensions.get('window').width,
    // height: Dimensions.get('window').width / 2,
    backgroundColor: commonColor.brandPrimary,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  relationItem: {
    marginVertical: 3
  },
  fieldTitleContainer: {
    marginBottom: 10,
    paddingLeft: 5,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 17
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    paddingLeft: 8,
    justifyContent: 'center',
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#d9d5dc',
  }
})