import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import userHelpers from '../../helpers/userHelpers';
import { ListItem, List, Body, Right, Icon, Text } from 'native-base';
import familyHelpers from '../../helpers/familyHelpers';
import helpers from '../../helpers/helpers';
import Loading from '../../components/Loading';

class JoiningRequestsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: null,
      isLoading: false,
    }
    this.handleAcceptAction = this.handleAcceptAction.bind(this);
  }

  componentDidMount() {
    this.getJoiningRequests();
  }

  getJoiningRequests() {
    this.setState({ isLoading: true });
    userHelpers.getAllJoiningRequests()
      .then(requests => {
        this.setState({ requests, isLoading: false });
      })
  }

  async handleAcceptAction(requestId) {
    this.setState({ isLoading: true });
    const request = this.state.requests.find(request => request.id === requestId);
    const family = await familyHelpers.getFamilyById(request.family.id);
    const currentUserEmail = userHelpers.getCurrentUserEmail();

    request.status = 'accepted';
    family.members[currentUserEmail].status = "active";
    family.memberEmails[helpers.formatEmail(request.to)] = true;

    userHelpers.updateJoiningRequest(request, family)
      .then(res => {
        this.getJoiningRequests();
      })

  }

  showRejectionConfirmation(requestId) {
    Alert.alert(
      'Alert',
      'You are about to decline the request. Are you sure?',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Decline', onPress: () => this.handleRejectAction(requestId) },
      ],
      { cancelable: true }
    )
  }

  async handleRejectAction(requestId) {
    this.setState({ isLoading: true });
    const request = this.state.requests.find(request => request.id === requestId);
    const family = await familyHelpers.getFamilyById(request.family.id);
    const currentUserEmail = userHelpers.getCurrentUserEmail();

    request.status = 'rejected';
    family.members[currentUserEmail].status = "rejected";
    family.memberEmails[helpers.formatEmail(request.to)] = "rejected";
    // delete family.members[currentUserEmail]
    // delete family.memberEmails[helpers.formatEmail(request.to)];

    userHelpers.updateJoiningRequest(request, family)
      .then(res => {
        this.getJoiningRequests();
      })
  }


  render() {
    const { isLoading, requests } = this.state;
    return (
      <View style={{ flex: 1 }}>
        {isLoading && <Loading />}
        <List>
          {requests && requests.map(request => (
            <ListItem key={request.id}>
              <Body>
                <Text>{request.family.name}</Text>
              </Body>
              <Right>
                <Icon name="checkmark-circle" onPress={() => this.handleAcceptAction(request.id)} />
              </Right>
              <Right>
                <Icon name="close-circle" onPress={() => this.showRejectionConfirmation(request.id)} />
              </Right>
            </ListItem>
          ))}
        </List>
        {requests && requests.length === 0 &&
          <Text>You do not have any pending requests.</Text>
        }
      </View>
    );
  }
}

export default JoiningRequestsScreen;