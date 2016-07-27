'use strict'

require('es6-promise').polyfill()
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'
import { compose, applyMiddleware, createStore } from 'redux'
import createLogger from 'redux-logger'
import horizonRedux from './horizon/redux'

import {
  ADD_MESSAGE_REQUEST,
  WATCH_MESSAGES,
  watchMessages,
  newMessages,
  addMessageSuccess,
  addMessageFailure } from './actions/chat'
import rootReducer from './reducers'
import Root from './components/Root'

const hzMiddleware = horizonRedux.createMiddleware()

// Create the Redux store
const store = createStore(
  rootReducer,
  window.initialState,
  compose(
    applyMiddleware(hzMiddleware, createLogger()),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
)

// You can add/remove actionTakers any time, even after creating the middleware.
// I've added them here for simplicity, but in a real app they could live
// wherever makes the most sense with the app's structure.

// Watch for ADD_MESSAGE_REQUEST actions and store their payload in the messages table
// If successful, dispatch ADD_MESSAGE_SUCCESS. If there's an error, dispatch
// ADD_MESSAGE_FAILURE and log a message to the console.
horizonRedux.addActionTaker(
  ADD_MESSAGE_REQUEST,
  (horizon, action) =>
    horizon('messages').store(action.payload),
  (id, action, dispatch) => {
    // the success handler for write queries doesn't occur until the write is
    // confirmed by the database, so you may see the NEW_MESSAGES action
    // get dispatched before the ADD_MESSAGE_SUCCESS action.
    dispatch(addMessageSuccess(id, action.payload))
  },
  (err, action, dispatch) => {
    console.log('failed to add message:', action.payload)
    dispatch(addMessageFailure(err, action.payload))
  }
)

// Watch for WATCH_MESSAGES action and grab the most recent 10 messages from the
// messages table. Because we added watch(), this actionTaker's successHandler
// will get called every time new messages are added.
horizonRedux.addActionTaker(
  WATCH_MESSAGES,
  (horizon, action) =>
    horizon('messages').order('datetime', 'descending').limit(10).watch(),
  (result, action, dispatch) => {
    dispatch(newMessages(result))
  },
  (err, action, dispatch) => {
    console.log('failed to load messages')
  }
)

// Now we can dispatch the initial action that tells horizon to watch for chat messages.
//
// We don't have to worry about whether or not the Horizon client has finished
// connecting to the Horizon server, because horizonRedux internally queues
// actions that are dispatched through its middleware while Horizon is not
// connected, and will handle them as soon as Horizon is ready.
store.dispatch(watchMessages())

const appNode = document.createElement('div')
document.body.appendChild(appNode)

const renderRoot = (RootComponent) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <RootComponent />
      </Provider>
    </AppContainer>,
    appNode
  )
}
renderRoot(Root)

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const Root = require('./components/Root').default
    renderRoot(Root)
  })
}
