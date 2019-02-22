import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Icon, Fab, Text, Container, Content } from 'native-base';
import FamilyItem from './FamilyItem';
import colors from '../../../native-base-theme/variables/commonColor';
import Loading from '../../../components/Loading';
import { connect } from 'react-redux';
import { getFamilies } from '../../../helpers/reducers/familyReducer';
import userHelpers from '../../../helpers/userHelpers';
import helpers from '../../../helpers/helpers';

class FamilyListingScreen extends React.Component {

  static navigationOptions = {
    title: 'Family',
  };

  constructor(props) {
    super(props);
    this.state = {
      families: props.families || null,
    }
  }

  componentDidMount() {
    if (!this.state.families) this.props.getFamilies();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.state.family) !== JSON.stringify(nextProps.families)) {
      this.setState({ families: nextProps.families });
    }
  }


  render() {
    const currentUserFormatEmail = helpers.formatEmail(userHelpers.getCurrentUserEmail());
    return (
      <Container>
        {this.state.families && this.state.families.data &&
          <Content padder>
            <List>
              {this.state.families.data.map((family, index) => {
                return !family.memberEmails[currentUserFormatEmail] ?
                  null :
                  <FamilyItem family={family} key={index} navigation={this.props.navigation} />
              })}
            </List>
            {this.state.families.length === 0 &&
              <View style={{ margin: 17 }}>
                <Text>You do not belong to any families right now. Click <Text
                  onPress={() => this.props.navigation.navigate('FamilyAdd')}
                  style={{ color: 'blue', textDecorationLine: 'underline' }}>here</Text> to create one</Text>
              </View>
            }
          </Content>
        }
        {this.state.families && this.state.families.isLoading && <Loading />}

        <Fab
          active={this.state.active}
          direction="up"
          style={{ backgroundColor: colors.brandPrimary }}
          position="bottomRight"
          onPress={() => this.props.navigation.navigate('FamilyAdd')}>
          <Icon name="add" />
        </Fab>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    families: state.familyReducer.families,
  };
};

const mapDispatchToProps = {
  getFamilies,
};


export default connect(mapStateToProps, mapDispatchToProps)(FamilyListingScreen);
