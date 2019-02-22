import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableHighlight } from 'react-native';
import {
  Item, Button, Input, Toast, List, ListItem, Radio, Card,
  Thumbnail, Left, Right, Body, Text, CardItem, Content,
} from 'native-base';
import commonColor from '../../native-base-theme/variables/commonColor';
import DateTimePicker from 'react-native-modal-datetime-picker';
import FullscreenLoading from '../../components/FullscreenLoading';
import Avatar from '../../components/Avatar';
import helpers from '../../helpers/helpers';
import moment from 'moment';

class MemberAddStep1 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isDatePicker: false,
      isUploading: false,
      searchedEmail: '',
    }
    this.handleDatePickerConfirm = this.handleDatePickerConfirm.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleDatePickerConfirm(value) {
    this.setState({ isDatePicker: false });
    this.props.onUserDataChange('dob', value);
  }

  async handleImage() {
    this.setState({ isUploading: true });
    let profileImages = null;
    try {
      profileImages = await helpers._pickProfileImage();
    } catch (error) {
      this.setState({ isUploading: false });
    }

    if (profileImages && profileImages.uri) {
      this.props.onUserDataChange('photo', profileImages.uri);
      this.props.onUserDataChange('photoSizes', profileImages.sizes);
      this.setState({ isUploading: false });
    }
  }

  handleSearch(){
    this.setState({searchedEmail: this.props.email});
    this.props.onSearch();
  }


  render() {
    const userMeta = this.props.userMeta;
    const { isDatePicker, isUploading } = this.state;
    return (
      <Content padder>
        {isUploading && <FullscreenLoading />}
        <Card>
          <CardItem header onPress={() => this.props.onAddBySelect(1)} button bordered>
            <Left>
              <Text>Search by email</Text>
            </Left>
            <Right>
              <Radio selected={this.props.addWithEmail === 1} onPress={() => this.props.onAddBySelect(1)} />
            </Right>
          </CardItem>
          {this.props.addWithEmail === 1 &&
            <CardItem>
              <Body>
                <Item regular style={{ backgroundColor: 'white' }}>
                  <Input
                    placeholder="Email"
                    onChangeText={email => this.props.onEmailChange(email)}
                    keyboardType="email-address"
                    value={this.props.email}
                  />
                </Item>
                <Button
                  style={{ marginTop: 17 }}
                  primary
                  full
                  onPress={this.handleSearch}
                  disabled={this.props.isSearching}
                >
                  {this.props.isSearching && <ActivityIndicator />}
                  {!this.props.isSearching && <Text>Search</Text>}
                </Button>
              </Body>
            </CardItem>
          }
          {this.props.addWithEmail === 1 &&
            <View>
              {this.props.user && <Text style={{ marginBottom: 17, marginHorizontal: 17 }}>We found a user with email {this.state.searchedEmail}.</Text>}

              {this.props.user &&
                <List>
                  <ListItem avatar noBorder>
                    <Left>
                      <Thumbnail source={{ uri: this.props.user.photo }} small />
                    </Left>
                    <Body>
                      <Text>{this.props.user.displayName}</Text>
                    </Body>
                    <Right>
                      <Radio selected={this.props.isExistingUser} />
                    </Right>
                  </ListItem>
                </List>
              }

              <CardItem>
                {this.props.user === false && <Text style={{ marginBottom: 17 }}>We could not find a any user with email {this.state.searchedEmail}. You can add this as a new member and we will send an invite to the user.</Text>}
              </CardItem>

              {this.props.user === false &&
                <View style={{margin: 17}}>
                  <Text>Invite Member</Text>
                  <View style={{ marginBottom: 10, marginTop: 10, paddingLeft: 5 }}>
                    <Text>Name</Text>
                  </View>
                  <Item regular style={{ backgroundColor: 'white' }}>
                    <Input onChangeText={displayName => this.props.onDisplayNameChange(displayName)}
                    />
                  </Item>
                </View>
              }

            </View>
          }
          {this.props.emailError &&
            <View style={{ marginHorizontal: 17 }}>
              <Text style={{ color: commonColor.brandDanger }}>{this.props.emailError}</Text>
            </View>
          }
        </Card>

        {this.props.allowWithoutEmail &&
          <Card>
            <CardItem header onPress={() => this.props.onAddBySelect(0)} button bordered>
              <Left>
                <Text>Add without email</Text>
              </Left>
              <Right>
                <Radio selected={this.props.addWithEmail === 0} onPress={() => this.props.onAddBySelect(0)} />
              </Right>
            </CardItem>
            {this.props.addWithEmail === 0 &&
              <View style={{ marginHorizontal: 17, marginVertical: 17 }}>

                {userMeta.photoSizes &&
                  <Avatar photo={userMeta.photo} photoSizes={userMeta.photoSizes} size={96} />
                }

                <Button transparent primary onPress={this.handleImage} style={{ marginBottom: 17 }}>
                  <Text>{userMeta.photo ? "Edit" : "Choose"} Picture</Text>
                </Button>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Display Name *</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.props.onUserDataChange('displayName', value)}
                    value={userMeta.displayName}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Phone</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.props.onUserDataChange('phone', value)}
                    value={userMeta.phone}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Birthday</Text>
                </View>
                <TouchableHighlight
                  onPress={() => this.setState({ isDatePicker: true })}
                  style={styles.datePicker}
                >
                  <Text>{userMeta.dob && moment(userMeta.dob).format('D MMM, YYYY')}</Text>
                </TouchableHighlight>

                <DateTimePicker
                  isVisible={isDatePicker}
                  onConfirm={this.handleDatePickerConfirm}
                  onCancel={() => { this.setState({ isDatePicker: false }) }}
                  mode={'date'}
                  maximumDate={new Date()}
                />

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Occupation</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.props.onUserDataChange('occupation', value)}
                    value={userMeta.occupation}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Current City</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.props.onUserDataChange('currentCity', value)}
                    value={userMeta.currentCity}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Current State</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.props.onUserDataChange('currentState', value)}
                    value={userMeta.currentState}
                  />
                </Item>

                <View style={styles.fieldTitleContainer}>
                  <Text style={styles.fieldTitle}>Current Country</Text>
                </View>
                <Item regular style={styles.input}>
                  <Input
                    onChangeText={value => this.props.onUserDataChange('currentCountry', value)}
                    value={userMeta.currentCountry}
                  />
                </Item>
              </View>
            }
          </Card>
        }

      </Content >
    );
  }
}

export default MemberAddStep1;

const styles = StyleSheet.create({
  fieldTitleContainer: {
    marginBottom: 10,
    paddingLeft: 5,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 17
  },
  datePicker: {
    height: 50,
    backgroundColor: '#fff',
    paddingLeft: 8,
    justifyContent: 'center',
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#d9d5dc',
  }
})