/**
*
* MessageList
*
*/
'use strict'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import MessageListItem from '../components/MessageListItem'

const MessageList = ({ messages }) => {
  return (
    <div>
      <ul>
        {messages.map((message, index) =>
          <MessageListItem key={index} message={message} />
        )}
      </ul>
    </div>
  )
}

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      datetime: PropTypes.instanceOf(Date)
    })
  ).isRequired
}

const mapStateToProps = (state) => ({
  messages: state.messages
})

export default connect(mapStateToProps)(MessageList)
