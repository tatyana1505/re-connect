import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Right, Left, Body, Icon, Header, Footer, Button, Content, Container } from 'native-base';
import { connect } from 'react-redux';
import { updateFamily } from '../../../helpers/reducers/familyReducer'
import Stepper, { Step } from '../../../components/Stepper';
import SelectMemberTypeModal from '../../Members/SelectMemberTypeModal';
import colors from '../../../native-base-theme/variables/commonColor';
import ListNonTreeMembers from './ListNonTreeMembers';
import familyHelpers from '../../../helpers/familyHelpers';

class AddToTreeModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refUser: props.refUser,
      newUserType: props.allowParent ? 'parent' : 'partner',
      selectedUserEmail: null,
      totalSteps: 2,
      isUpdating: false,
      activeStep: 0,
    }
    this.handleMemberTypeSelection = this.handleMemberTypeSelection.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.handleUserSelection = this.handleUserSelection.bind(this);
    this.shouldAllowNext = this.shouldAllowNext.bind(this);
    this.handleStepBack = this.handleStepBack.bind(this);
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


  handleMemberTypeSelection(newUserType) {
    this.setState({ newUserType });
  }

  handleNextStep() {
    const { activeStep, newUserType, selectedUserEmail } = this.state;
    const { family, refUserEmail } = this.props;
    if (activeStep === 0) {
      if (newUserType) {
        this.setState({ activeStep: 1 });
      }
    } else if (activeStep === 1) {
      if (selectedUserEmail) {
        const updatedObject = familyHelpers.addMemberToTree(
          refUserEmail,
          selectedUserEmail,
          newUserType,
          family,
          family.id
        );
        this.props.updateFamily(family.id, updatedObject);
      }
    }
  }

  handleUserSelection(selectedUserEmail) {
    this.setState({ selectedUserEmail });
  }

  shouldAllowNext() {
    const { activeStep, selectedUserEmail } = this.state;
    if (activeStep === 0) return true;
    if (activeStep === 1 && selectedUserEmail) return true;
    return false;
  }

  handleStepBack() {
    const { activeStep } = this.state;
    if (activeStep === 0) this.props.onClose();
    else this.setState({ activeStep: activeStep - 1 });
  }

  render() {

    const shouldAllowNext = this.shouldAllowNext();

    const { isUpdating, newUserType, totalSteps, activeStep } = this.state;
    return (
      <Container>
        <Header style={{ alignItems: 'center', backgroundColor: colors.brandPrimary, paddingRight: 0 }}>
          <Body>
            <Text style={styles.headerTitle}>
              Add To Family Tree
            </Text>
          </Body>
          <Right>
            <Button transparent style={{ height: colors.toolbarHeight, width: 56, alignItems: 'center' }} onPress={this.props.onClose}>
              <Icon name="close" style={{ color: colors.inverseTextColor }} />
            </Button>
          </Right>
        </Header>
        <Content padder>
          <Stepper activeStep={activeStep}>
            <Step>
              <SelectMemberTypeModal
                onSelect={this.handleMemberTypeSelection}
                allowParent={this.props.allowParent}
                activeSelection={newUserType}
              />
            </Step>
            <Step>
              <ListNonTreeMembers
                family={this.props.family}
                selectedUserEmail={this.state.selectedUserEmail}
                onUserSelect={this.handleUserSelection}
                isUpdating={this.state.isUpdating}
              />
            </Step>
          </Stepper>
        </Content>
        <Footer style={styles.footer}>
          <Left>
            <Button
              transparent
              onPress={isUpdating ? null : this.handleStepBack}
              style={{ height: colors.toolbarHeight }}
              style={{ opacity: isUpdating ? 0.5 : 1, height: colors.toolbarHeight }}
            >
              <Text style={styles.footerText}>Back</Text>
            </Button>
          </Left>
          <Body style={{ alignItems: 'center', justifyContent: 'center' }}>
            {Array(totalSteps).fill(1).map((item, index) => (
              <View
                key={index}
                style={[styles.circle, activeStep >= index ? styles.filledCircle : styles.hollowCircle]}
              />
            ))}
          </Body>
          <Right>
            <Button
              transparent
              onPress={!isUpdating && shouldAllowNext ? this.handleNextStep : null}
              disabled={!shouldAllowNext}
              style={{ opacity: !shouldAllowNext ? 0.5 : 1, height: colors.toolbarHeight, }}
            >
              {!isUpdating &&
                <Text onPress={this.handleNextStep} style={styles.footerText}>
                  {activeStep === 0 && "Next"}
                  {activeStep === 1 && "Add"}
                  {activeStep === 2 && "Done"}
                </Text>
              }
              {isUpdating && <ActivityIndicator color={colors.brandDanger} style={{ paddingRight: 17 }} />}
            </Button>
          </Right>
        </Footer>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  families: state.familyReducer.families,
})

const mapDistachToProps = {
  updateFamily,
}

export default connect(mapStateToProps, mapDistachToProps)(AddToTreeModal);

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
    paddingHorizontal: 20,
    height: 64,
  },
  footerText: {
    color: colors.brandPrimary
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
  headerTitle: {
    fontSize: colors.headerTitleFontSize,
    fontWeight: colors.headerTitleFontWeight,
    color: colors.inverseTextColor,
  }
})