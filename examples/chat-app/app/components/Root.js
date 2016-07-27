/**
*
* Root
*
*/
'use strict'

import React from 'react'

import MessageList from '../containers/MessageList'
import MessageInput from '../containers/MessageInput'

const Root = () => {
  return (
    <div>
      <MessageList />
      <MessageInput />
    </div>
  )
}

export default Root
