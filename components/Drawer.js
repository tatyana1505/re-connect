import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Content, Container } from 'native-base';
import { DrawerItems } from 'react-navigation';
import Avatar from '../components/Avatar';
import userHelpers from '../helpers/userHelpers';
import { connect } from 'react-redux';
import commonColor from '../native-base-theme/variables/commonColor';

const Drawer = (props) => {
  const user = props.users && props.users.data && props.users.data[userHelpers.getCurrentUserEmail()];
  return (
    <Container>
      <Content>
        {user &&
          <View style={styles.profile}>
            <View style={{ marginBottom: 10 }}>
              <Avatar name={user.displayName} photo={user.photo} size={128} photoSizes={user.photoSizes} />
            </View>
            <Text style={styles.displayName}>
              {user.displayName}
            </Text>
            <Text style={styles.email}>{userHelpers.getCurrentUserEmail()}</Text>
          </View>
        }
        <DrawerItems {...props} />
      </Content>
    </Container>
  );
};

const mapStateToProps = state => ({
  users: state.userReducer.users,
})

export default connect(mapStateToProps, {})(Drawer);

const styles = {
  profile: {
    backgroundColor: commonColor.brandPrimary,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 17,
    justifyContent: 'center',
  },
  displayName: {
    color: 'white',
    fontWeight: '500',
  },
  email: {
    color: 'white',
    fontSize: 14,
  }
}