const React = require('react');

module.exports = {
  Platform: {
    OS: 'android',
    select: (objs) => objs.android || objs.default
  },
  StyleSheet: {
    create: (styles) => styles
  },
  View: (props) => React.createElement('View', props, props.children),
  Text: (props) => React.createElement('Text', props, props.children),
  TouchableOpacity: (props) => React.createElement('TouchableOpacity', props, props.children),
  TextInput: (props) => React.createElement('TextInput', props, props.children),
  ScrollView: (props) => React.createElement('ScrollView', props, props.children),
  FlatList: (props) => React.createElement('FlatList', props, props.children),
  Modal: (props) => React.createElement('Modal', props, props.children),
  ActivityIndicator: (props) => React.createElement('ActivityIndicator', props, props.children),
  Alert: {
    alert: jest.fn()
  }
};
