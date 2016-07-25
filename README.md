# horizon-redux
A small library that helps you connect Horizon.io with Redux in a flexible, non-intrusive way.

[![Build Status](https://travis-ci.org/shanecav/horizon-redux.svg?branch=master)](https://travis-ci.org/shanecav/horizon-redux)

## What does it do?
horizon-redux provides a light-weight (<1kb minified + gzipped) and flexible interface for connecting Redux with [Horizon.io](http://horizon.io/). It accomplishes this by providing two functions: `createMiddleware` and `setupSubscriptionActions`.

`createMiddleware` is used to create a Redux middleware that watches for specific actions, and makes corresponding Horizon queries when they're dispatched.

`setupSubscriptionActions` is used to register Horizon query subscriptions to respond by dispatching corresponding actions every time the subscription receives new data. The subscription can be a one-time `fetch()`, or a continuous `watch()`.

This approach allows you to use Redux to manage your app's entire state, as opposed to having external Horizon.io bindings directly to your UI components. That way, you can enjoy the simplicity of Horizon.io without losing the benefits of a well-structured Redux app.

## Installation

`npm i -S horizon-redux`

## Usage

```js
import { compose, applyMiddleware, createStore } from 'redux'
import Horizon from '@horizon/client'
import HorizonRedux from 'horizon-redux'

import { ADD_MESSAGE, addMessageSuccess, addMessageFailure, newMessages } from '../actions/chat'

const hz = Horizon({ host: 'localhost:8181' })

// Create Redux middleware that watches for specific actions and runs a corresponding Horizon query
const hzMiddleware = HorizonRedux.createMiddleware(
  hz,
  {
    [ADD_MESSAGE]: (horizon, action, dispatch) => horizon('messages').store(action.payload)
  }
)

// Create the Redux store with horizon-redux middleware
const store = createStore(
  rootReducer,
  window.initialState,
  applyMiddleware(hzMiddleware)
)

// Set up Redux action(s) to dispatch whenever a corresponding Horizon client subscription receives new data
HorizonRedux.setupSubscriptionActions(
  hz,
  store.dispatch,
  [{
    query: (horizon) => horizon('messages').order('datetime', 'descending').limit(10).watch(),
    actionCreator: newMessages
  }]
)
```

## API

### createMiddleware(horizon, config)

#### Arguments:

1. `horizonInstance` - A Horizon.io client instance
2. `config` - An object where each key is an action type, and each corresponding value is a function that takes a horizon instance, action, and Redux store dispatch method as arguments and runs a Horizon Collection query.

Example:
```js
const hzMiddleware = HorizonRedux.createMiddleware(horizonInstance, {
  [ADD_MESSAGE_REQUEST]: (horizon, action, dispatch) => {
    horizon('messages').store(action.payload).subscribe(
      (id) => dispatch(addMessageSuccess(id, action.payload)),
      (err) => dispatch(addMessageFailure(err, action.payload))
    )
  }
  // etc...
})
```

### setupSubscriptionActions(horizonInstance, dispatch, config)

#### Arguments:

1. `horizonInstance` - A Horizon.io client instance
2. `dispatch` - Redux store dispatch method
3. `config` - An array of objects with the following properties:
  * `query` - function that takes a Horizon instance and returns a Horizon query without .subscribe() method
  * `actionCreator` - function that takes Horizon query result data and returns an action using that data
  * `onQueryError` - (optional) function that takes a Horizon query error and handles it

Example:
```js
HorizonRedux.setupSubscriptionActions(horizonInstance, store.dispatch, [
  {
    query: (horizon) => horizon('messages').order('datetime', 'descending').limit(10).watch(),
    actionCreator: refreshMessages,
    onQueryError: (err) => {
      console.error('error receiving new messages from horizon server')
    }
  }
  // etc...
])
```

## License

[MIT](LICENSE)
