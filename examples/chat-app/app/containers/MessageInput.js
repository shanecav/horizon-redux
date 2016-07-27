/**
*
* MessageInput
*
*/
'use strict'

import React, { PropTypes, Component } from 'react'
import { connect } from 'react-redux'

import { addMessageRequest } from '../actions/chat'

class MessageInput extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  };

  render () {
    return (
      <div>
        <input type="text" onKeyUp={this._handleKeyUp} />
      </div>
    )
  }

  _handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      this.props.dispatch(addMessageRequest({
        text: event.target.value,
        datetime: new Date()
      }))
      event.target.value = ''
    }
  }
}

export default connect()(MessageInput)
