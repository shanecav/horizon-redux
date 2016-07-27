/**
*
* MessageListItem
*
*/
'use strict'

import React, { PropTypes } from 'react'

const MessageListItem = ({ message }) => {
  return (
    <li>{message.text}</li>
  )
}

MessageListItem.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    datetime: PropTypes.instanceOf(Date)
  }).isRequired
}

export default MessageListItem
