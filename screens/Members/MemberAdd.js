import React, { Component } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Button, Header, Footer, Left, Right, Body, Icon, Text, FooterTab, Container, Content } from 'native-base';
import { connect } from 'react-redux';
import MemberAddStep1 from './MemberAddStep1';
import helpers from '../../helpers/helpers';
import colors from '../../native-base-theme/variables/commonColor';
import familyHelpers from '../../helpers/familyHelpers';
import userHelpers from '../../helpers/userHelpers';
import { updateFamily } from '../../helpers/reducers/familyReducer';

class MemberAdd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addingType: props.addingType || 'new', // "new" or "existing"
      user: null,
      email: '',
      displayName: '',
      isUpdating: false,
      isSearching: false,
      isNextDisabled: false,
      addWithEmail: 1, // 0 = without email, 1 = search by email
      isExistingUser: null,
      isSearchByEmailOnly: props.addingType === 'existing',
      userMeta: {}
    }

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleAddBySelection = this.handleAddBySelection.bind(this);
    this.checkAllowNext = this.checkAllowNext.bind(this);
    this.handleAddButton = this.handleAddButton.bind(this);
    this.addNewMember = this.addNewMember.bind(this);
    this.addExistingMember = this.addExistingMember.bind(this);
    this.handleUserDataChange = this.handleUserDataChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Handle isUpdating
    if (nextProps.families.isUpdating && !this.state.isUpdating) {
      this.setState({ isUpdating: nextProps.families.isUpdating });
    }

    // Handle updating success
    if (this.state.isUpdating && !nextProps.families.isUpdating && !nextProps.isUpdatingError) {
      this.props.onClose();
    }
  }

  emailValidationError(email) {
    if (!helpers.validateEmail(email)) {
      return 'Invalid email.';
    }

    if (this.props.family.members[email.toLowerCase()]) {
      return 'User already exist in this group';
    }
    return false;
  }

  handleUserDataChange(key, value) {
    this.setState({ userMeta: { ...this.state.userMeta, [key]: value } });
  }

  validateDisplayName(displayName) {
    if (!displayName || displayName.length < 2) {
      this.setState({ displayNameError: "Name should be atleast 2 characters" });
      return false;
    }
    return true;
  }

  handleEmailChange(email) {
    email = email.toLowerCase();
    this.setState({ email });
  }

  handleDisplayNameChange(displayName) {
    this.setState({ displayName });
  }

  addNewMember() {
    const { email, user, isExistingUser, displayName, addWithEmail, userMeta } = this.state;
    const family = JSON.parse(JSON.stringify(this.props.family));
    const updatedFamily = familyHelpers.addNewUserToFamily(addWithEmail, email, user, isExistingUser, displayName, family, userMeta)
    this.props.updateFamily(family.id, updatedFamily);
  }

  addExistingMember() {
    const { email, user, isExistingUser, displayName } = this.state;
    const { existingUserRef } = this.props;
    const family = JSON.parse(JSON.stringify(this.props.family));
    const updatedFamily = familyHelpers.addExistingUserToFamily(existingUserRef, email, user, isExistingUser, family, displayName)
    this.props.updateFamily(family.id, updatedFamily);
  }

  async handleSearch() {
    const { email } = this.state;
    this.setState({ isSearching: true, isExistingUser: null });
    const validationError = this.emailValidationError(email);
    if (validationError === false) {
      const user = await userHelpers.getUserData(email)
      this.setState({
        user: user ? user : false,
        isSearching: false,
        emailError: validationError,
        isExistingUser: !!user,
        displayName: '',
      });
    } else {
      this.setState({
        isSearching: false,
        user: null,
        emailError: validationError,
      })
    }
  }

  handleAddBySelection(addWithEmail) {
    this.setState({ addWithEmail });
  }

  handleAddButton() {
    this.state.addingType === 'existing' ? this.addExistingMember() : this.addNewMember();
  }

  checkAllowNext(activeStep) {
    const { addWithEmail, isExistingUser, user, displayName, email, userMeta } = this.state;
    if (addWithEmail === 1) {
      if (isExistingUser && user) return true;
      if (!isExistingUser && email && displayName && displayName.length >= 2) return true;
    } else {
      if (userMeta && userMeta.displayName) return true;
    }

    return false;
  }

  render() {
    const { activeStep, email, emailError, displayName, displayNameError,
      totalSteps, isUpdating, Type, user, addingType, newUserType, isSearchByEmailOnly } = this.state;


    const allowNext = this.checkAllowNext(activeStep);

    return (
      <Container>
        <Header style={styles.header}>
          <Body>
            <Text style={styles.headerText} >{this.props.title}</Text>
          </Body>
          <Right>
            <Button
              transparent
              onPress={this.props.onClose}
              style={styles.HeaderRight}
            >
              <Icon style={styles.headerIcon} name="close" />
            </Button>
          </Right>
        </Header>

        <MemberAddStep1
          onEmailChange={this.handleEmailChange}
          email={email}
          emailError={emailError}
          onSearch={this.handleSearch}
          isSearching={this.state.isSearching}
          user={user}
          addWithEmail={this.state.addWithEmail}
          onAddBySelect={this.handleAddBySelection}
          isExistingUser={this.state.isExistingUser}
          allowWithoutEmail={addingType === 'new'}
          isSearchByEmailOnly={isSearchByEmailOnly}
          onDisplayNameChange={this.handleDisplayNameChange}
          onUserDataChange={this.handleUserDataChange}
          userMeta={this.state.userMeta}
        />

        <Footer>
          <FooterTab>
            <Button
              primary
              full
              disabled={!allowNext || isUpdating}
              onPress={this.handleAddButton}
            >
              {!isUpdating && <Text style={{ lineHeight: 18 }}>Add</Text>}
              {isUpdating && <ActivityIndicator />}
            </Button>
          </FooterTab>
        </Footer>

      </Container>
    );
  }
}

const mapStateToProps = state => ({
  families: state.familyReducer.families,
})

const mapDispatchToProps = {
  updateFamily,
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberAdd);

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 64,
    backgroundColor: colors.tabBgColor
  },
  footerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
    height: 64,
  },
  footerText: {
    color: colors.brandPrimary,
    fontSize: colors.headerTitleFontSize,
  },
  circle: {
    height: 10,
    width: 10,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  filledCircle: {
    backgroundColor: colors.brandPrimary,
  },
  hollowCircle: {
    borderWidth: 0.5,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    paddingRight: 0
  },
  headerText: {
    color: colors.inverseTextColor,
    fontSize: colors.headerTitleFontSize,
    fontWeight: colors.headerTitleFontWeight,
    marginHorizontal: 16,
  },
  headerIcon: {
    color: colors.inverseTextColor,
  },
  footerBodyStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  HeaderRight: {
    width: 56,
    height: colors.toolbarHeight,
    alignItems: 'center',
  }
})