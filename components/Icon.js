import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'native-base'
import { Platform } from 'react-native';

const CustomIcon = (props) => {
  if (props.name === undefined) return null;

  let name = props.name;
  if (!props.sameName) {
    name = (Platform.OS === 'ios' ? 'ios-' : 'md-') + name
  }
  return (
    <Icon
      name={name}
      size={parseInt(props.size)}
      color={props.color}
      style={props.style}
    />
  )
};

CustomIcon.propTypes = {
  name: PropTypes.string.isRequired,
  sameName: PropTypes.bool,
  size: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
}

CustomIcon.defaultProps = {
  sameName: false,
  size: 17,
  color: 'black',
}

export default CustomIcon;
