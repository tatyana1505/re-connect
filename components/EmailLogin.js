import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { View, Text, CardItem, Card, Form, Item, Input, Button } from 'native-base';
import commonColor from '../native-base-theme/variables/commonColor';

const actionMap = {
  "login": "Login",
  "register": "Register",
  "forgotpassword": "Retrive Password",
}

class EmailLogin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      type: 'login',
      email: '',
      password: '',
      displayName: '',
    }
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPasswordResetEmailSent && this.state.type === 'forgotpassword') {
      this.setState({ type: 'login' });
    }
  }

  resetState() {
    this.setState({
      type: 'login',
      email: '',
      password: '',
      displayName: '',
    })
  }


  handleTypeChange(type) {
    this.setState({ type });
  }

  handleSubmit() {
    const { email, type, password, displayName } = this.state;
    this.props.onSubmit(type, email, password, displayName);
  }

  render() {
    const { type, email, displayName, password, verificationCode } = this.state;
    const { isEmailActivity } = this.props;
    return (
      <View style={{ backgroundColor: '#fff' }}>
        <Form>
          <KeyboardAvoidingView behavior="padding" enabled>
            {['login', 'register'].indexOf(type) > -1 &&
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={type === 'login' ? styles.activeTab : styles.inactiveTab}
                  onPress={() => this.handleTypeChange('login')}
                >
                  <Text
                    style={type === 'login' ? styles.activeTabText : styles.inactiveTabText}
                  >
                    Login
            </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={type === 'register' ? styles.activeTab : styles.inactiveTab}
                  onPress={() => this.handleTypeChange('register')}
                >
                  <Text
                    style={type === 'register' ? styles.activeTabText : styles.inactiveTabText}
                  >
                    Signup
            </Text>
                </TouchableOpacity>
              </View>
            }

            <View style={{ marginHorizontal: 17 }}>
              {type === 'forgotpassword' &&
                <View style={{ marginVertical: 17 }}>
                  <Text>Please enter you email to retrive the password</Text>
                </View>
              }

            </View>

            <View style={{ paddingHorizontal: 17, marginVertical: 17 }}>

              <View style={{ marginBottom: 10 }}>
                <Text>Email *</Text>
              </View>
              <Item regular style={{ marginBottom: 15 }}>
                <Input keyboardType="email-address" value={email} type="email" onChangeText={email => this.setState({ email })} style={{ height: 36 }} />
              </Item>

              {type !== 'forgotpassword' &&
                <View>
                  <View style={{ marginBottom: 10 }}>
                    <Text>Password *</Text>
                  </View>
                  <Item regular style={{ marginBottom: 15 }}>
                    <Input secureTextEntry value={password} type="password" onChangeText={password => this.setState({ password })} style={{ height: 36 }} />
                  </Item>
                </View>
              }

              {this.state.type === 'register' &&
                <View>
                  <View style={{ marginBottom: 10 }}>
                    <Text>Display Name *</Text>
                  </View>
                  <Item regular style={{ marginBottom: 15 }}>
                    <Input value={displayName} onChangeText={displayName => this.setState({ displayName })} style={{ height: 36 }} />
                  </Item>
                </View>
              }
              <Button primary full onPress={this.handleSubmit} disabled={isEmailActivity}>
                {isEmailActivity ?
                  <ActivityIndicator /> :
                  <Text>{actionMap[type]}</Text>
                }
              </Button>
              {type === 'login' &&
                <View style={{ marginTop: 15, alignItems: 'center' }}>
                  <Text onPress={() => this.handleTypeChange('forgotpassword')}>Forgot Password?</Text>
                </View>
              }

              {type === 'forgotpassword' &&
                <View style={{ marginTop: 15, alignItems: 'center' }}>
                  <Text onPress={() => this.handleTypeChange('login')}>Back to login?</Text>
                </View>
              }
            </View>
          </KeyboardAvoidingView>
        </Form>
      </View>
    );
  }
}

export default EmailLogin;

const styles = StyleSheet.create({
  activeTab: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  inactiveTab: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    backgroundColor: commonColor.brandPrimary,
  },
  inactiveTabText: {
    color: commonColor.inverseTextColor,
    paddingLeft: 17,
    fontSize: 20,
  },
  activeTabText: {
    paddingLeft: 17,
    fontSize: 20,
    color: commonColor.brandPrimary
  }
})