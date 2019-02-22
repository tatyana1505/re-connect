import React, { Component } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text, View, List, ListItem, Icon, Left, Body, Container, Content } from 'native-base';
import moment from 'moment';
import commonColor from '../native-base-theme/variables/commonColor';
import Avatar from '../components/Avatar';
import { connect } from 'react-redux';
import { getUserMeta } from '../helpers/reducers/userReducer';
import Loading from '../components/Loading';
import helpers from '../helpers/helpers';
import familyHelpers from '../helpers/familyHelpers';

class FamilyProfileScreen extends Component {

  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      user: props.navigation.state.params.user,
      userFamily: null,
      family: this.props.navigation.state.params.family,
      userMeta: {},
    }
  }

  componentDidMount() {
    const { user } = this.state;
    this.setState({ userFamily: this.findInTree(this.state.family.tree, this.state.user.email) });

    if (this.props.users.data[user.email]) {
      this.setState({ userMeta: this.props.users.data[user.email] })
    } else {
      this.props.getUserMeta(user.email);
    }
  }

  findInTree(tree, email, updates) {
    if (tree.email === email) {
      return { ...tree, ...updates }
    };

    if (tree.partners) {
      for (let i = 0; i < tree.partners.length; i++) {
        const resp = this.findInTree(tree.partners[i], email, { children: [...tree.children], partners: [tree] });
        if (resp) return resp;
      }
    }

    if (tree.children) {
      for (let j = 0; j < tree.children.length; j++) {
        const siblings = tree.children.filter(child => child.email !== tree.children[j].email);
        const resp = this.findInTree(tree.children[j], email, { parents: [tree, ...tree.partners], siblings });
        if (resp) return resp;
      }
    }

    return false;
  }

  componentWillReceiveProps(nextProps) {

    if (!helpers.areObjectsEqual(nextProps.navigation.state.params, this.props.navigation.state.params)) {
      const nextUser = nextProps.navigation.state.params.user;
      if (nextUser.email !== this.state.user.email) {
        const family = nextProps.navigation.state.params.family;
        const userMeta = nextProps.users.data[nextUser.email] || null;

        this.setState({
          user: nextUser,
          family: nextProps.navigation.state.params.family,
          userFamily: this.findInTree(family.tree, nextUser.email),
          userMeta,
          isFetching: !!userMeta,
        })

        if (!userMeta) {
          this.props.getUserMeta(nextUser.email);
        }
      }
    }

    // Handle is Fetching
    if (!this.state.isFetching && nextProps.users.isFetching) {
      this.setState({ isFetching: nextProps.users.isFetching });
    }

    // Handle fetching done
    if (this.state.isFetching && !nextProps.users.isFetching && !nextProps.users.isFetchingError) {
      this.setState({ userMeta: nextProps.users.data[this.state.user.email], isFetching: false });
    }
  }

  render() {
    const { width } = Dimensions.get('window');
    const { user, family, userFamily } = this.state;
    const { isFetching } = this.state;

    const userMeta = { ...this.state.userMeta, ...user.data };

    let dob = userMeta.dob;
    if (dob && dob.toMillis) {
      dob = dob.toMillis();
    } else if (dob && dob.seconds) {
      dob = dob.seconds * 1000;
    }


    if (userMeta) {
      userMetaObject = [
        {
          icon: 'call',
          value: userMeta.phone,
          onPress: () => Linking.openURL(`tel:${userMeta.phone}`)
        },
        {
          icon: 'calendar',
          value: userMeta.dob ? moment(new Date(dob)).format('D MMM, YYYY') : '',
        },
        {
          icon: 'briefcase',
          value: userMeta.occupation
        },
        {
          icon: 'globe',
          value: `${userMeta.currentCity || ''}${userMeta.currentState ? ', ' + userMeta.currentState : ''}${userMeta.currentCountry ? ', ' + userMeta.currentCountry : ''}`
        },
      ]
    }

    return (
      <Container>
        <Content>
          <View style={styles.imageContainer}>
            <View style={{ marginBottom: 17 }}>
              <Avatar name={user.data.displayName} photo={user.data.photo} photoSizes={user.data.photoSizes} size={width > 480 ? 196 : 128} />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: commonColor.inverseTextColor, fontSize: 24 }}>{user.data.displayName}</Text>
              {helpers.validateEmail(user.email || '') &&
                <Text style={{ color: commonColor.inverseTextColor }}>({user.email})</Text>
              }
            </View>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={{ position: 'absolute', padding: 17, top: 0, left: 0, marginTop: 17 }}
            >
              <Icon name="arrow-back" style={{ color: 'white' }} />
            </TouchableOpacity>
          </View>
          {isFetching && <Loading />}
          {!isFetching &&
            <View>
              <View>
                {userMeta && (userMeta.occupation || userMeta.currentCity || userMeta.currentState || userMeta.currentCountry || userMeta.dob) &&
                  <List>
                    <ListItem itemDivider noBorder>
                      <Text>Bio</Text>
                    </ListItem>
                    {userMetaObject.map(meta => {
                      if (!meta.value || meta.value === '') return null;
                      return (
                        <ListItem icon key={meta.icon} noBorder onPress={meta.onPress || null}>
                          <Left>
                            <Icon name={meta.icon} style={{ width: 36, textAlign: 'center' }} />
                          </Left>
                          <Body>
                            <Text>{meta.value}</Text>
                          </Body>
                        </ListItem>
                      )
                    })}
                  </List>
                }
                {userFamily &&
                  <View>
                    {userFamily.parents && userFamily.parents.length > 0 &&
                      <ListRelation title="Parents" users={userFamily.parents} navigation={this.props.navigation} family={family} />
                    }

                    {userFamily.partners && userFamily.partners.length > 0 &&
                      <ListRelation title="Partners" users={userFamily.partners} navigation={this.props.navigation} family={family} />
                    }

                    {userFamily.children && userFamily.children.length > 0 &&
                      <ListRelation title="Children" users={userFamily.children} navigation={this.props.navigation} family={family} />
                    }

                    {userFamily.siblings && userFamily.siblings.length > 0 &&
                      <ListRelation title="Siblings" users={userFamily.siblings} navigation={this.props.navigation} family={family} />
                    }
                  </View>
                }
              </View>
            </View>
          }
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  users: state.userReducer.users,
})

const mapDispatchToProps = {
  getUserMeta,
}

export default connect(mapStateToProps, mapDispatchToProps)(FamilyProfileScreen);

const styles = StyleSheet.create({
  imageContainer: {
    width: Dimensions.get('window').width,
    paddingVertical: 40,
    backgroundColor: commonColor.brandPrimary,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  relationItem: {
    marginVertical: 3
  }
})

const ListRelation = ({ title, users, navigation, family }) => (
  <List>
    <ListItem itemDivider>
      <Text>{title}</Text>
    </ListItem>
    {users.map((user, index) => (
      <ListItem avatar key={index} style={styles.relationItem} noBorder onPress={() => navigation.navigate('FamilyProfile', { user, family })}>
        <Left>
          <Avatar name={user.data.displayName} photo={user.data.photo} size={36} photoSizes={user.data.photoSizes} />
        </Left>
        <Body>
          <Text>{user.data.displayName}</Text>
        </Body>
      </ListItem>
    ))}
  </List>
)