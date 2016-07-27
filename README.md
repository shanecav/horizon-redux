> ### Version 2.0.0 Released
> This version is a complete re-write with a very different API. If you've already used 1.x, you'll want to read through this README again to see how this version works. I think you'll find it easier and more powerful.

# horizon-redux
A small library that helps you connect Horizon.io with Redux in a flexible, non-intrusive way.

[![Build Status](https://travis-ci.org/shanecav/horizon-redux.svg?branch=master)](https://travis-ci.org/shanecav/horizon-redux)

## What does it do?
horizon-redux provides a light-weight and flexible interface for connecting [Redux](https://github.com/reactjs/redux) with [Horizon.io](http://horizon.io/). It works by letting you create "actionTakers" that make connections between Redux actions and Horizon.io events. Think of it as a **much** simpler version of [redux-saga](https://github.com/yelouafi/redux-saga) with built-in support for Horizon.io.

All of your interaction with Horizon.io, whether you're initiating or responding to queries, happens through Redux actions. This approach allows you to use Redux to manage your app's entire state, as opposed to having external Horizon.io bindings tied directly to your UI components. This way, you can enjoy the simplicity of Horizon.io without losing the benefits of a well-structured Redux app.

horizon-redux has zero npm dependencies, and its only requirements are Horizon.io and Redux.

## Installation

`npm i -S horizon-redux`

Alternatively:

`<script src="https://npmcdn.com/horizon-redux/dist/horizon-redux.min.js"></script>` (exposes window.HorizonRedux as a global variable)

## Usage

```js
// initialize horizonRedux with a Horizon client instance
const horizonRedux = HorizonRedux(horizon)
// create horizon-redux middleware
const hzMiddleware = horizonRedux.createMiddleware()
// Create the Redux store with horizon-redux middleware
const store = createStore(rootReducer, [], applyMiddleware(hzMiddleware))

// Add an actionTaker that watches for a WATCH_MESSAGES action. When that action
// is dispatched, Horizon grabs the most recent 10 messages from the messages
// table. Because we added watch(), this actionTaker's successHandler will get
// called every time new messages are added.
horizonRedux.addActionTaker(
  'WATCH_MESSAGES',
  (horizon, action) => horizon('messages').order('datetime', 'descending').limit(10).watch(),
  (result, action, dispatch) => dispatch({type: 'NEW_MESSAGES', payload: result}),
  (err, action, dispatch) => console.log('failed to load messages:', err)
)
// You can add/remove actionTakers any time, even after creating the middleware.

// Now we can dispatch the action that tells Horizon to watch for chat messages.
store.dispatch({ type: 'WATCH_MESSAGES' })

// addActionTaker returns a manager for that actionTaker with a remove() method.
// Removing an actionTaker automatically unsubscribes from all Horizon subscriptions
// associated with it, and removes it from horizonRedux.
const someActionTaker = horizonRedux.addActionTaker(/* ... */)
someActionTaker.remove()
```

#### Some key points to note:

* `horizonRedux` stores an array of actionTakers internally, which the middleware returned by `createMiddleware()` accesses. This allows you to add/remove actionTakers at any time, and the middleware will respond accordingly.
* If the Horizon client instance passed to `HorizonRedux` isn't connected, the returned `horizonRedux` instance will internally queue all actions passed through its middleware, and then replay them to itself once the Horizon client instance connects to the Horizon server. This way, no actions are lost during connection downtime.

#### Check out the 'chat-app' example in this repo for a working example based on the chat-app example from Horizon.io

## API

```js
import HorizonRedux from 'horizon-redux'
const horizonRedux = HorizonRedux(horizonInstance)
```

### horizonRedux.createMiddleware()

Creates a Redux middleware that watches for actions that match any of the actionTakers created by horizonRedux. See `horizonRedux.addActionTaker` below for more details.

#### Arguments:

n/a

#### Returns:

Redux middleware

---

### horizonRedux.addActionTaker(pattern, observableQuery, successHandler, errorHandler)

Adds an actionTaker to horizonRedux's internal array. Every action that goes through horizonRedux's middleware will be matched against every added actionTaker. The actionTaker determines how to respond to matching actions with Horizon queries.

Note that an actionTaker will run its query every time a matching action is dispatched. It's up to you to make sure you're not accidentally creating duplicate queries and subscribes.

#### Arguments:

1. `pattern` - A string, array of strings, or function used to match against dispatched action's types.
  * If it's a string, matches if `pattern === action.type`
  * If it's an array of strings, matches if any elements of the array are strictly equal to `action.type`
  * If it's a function, matches if pattern(action) returns a truthy value
2. `observableQuery` - A function that takes a Horizon client instance and an action, and returns a Horizon query. The query must be an "observable" type (`fetch()`, `watch()`, `store()`, `upsert()`, `insert()`, `replace()`, `update()`, `remove()`, or `removeAll()`). Do not call the `subscribe()` method on the query here - HorizonRedux takes care of that automatically.
3. `successHandler` - A function that takes result (the result of the query), action (the action associated with that query) and the Redux store's dispatch method. You can handle the successful query however you'd like - usually by dispatching another action with the results.
4. `errorHandler` - A function that takes the error, action (the action associated with that query) and the Redux store's dispatch method. You can handle an error scenario however you'd like.

#### Returns:

An actionTaker "manager" with a single method: `remove()`. Calling the `remove()` method automatically unsubscribes from all Horizon subscriptions associated with the actionTaker, and removes it from horizonRedux so that it no longer responds to its matching actions.

#### Example:

```js
horizonRedux.addActionTaker(
  actions.WATCH_MESSAGES,
  (horizon, action) =>
    horizon('messages').order('datetime', 'descending').limit(10).watch(),
  (result, action, dispatch) => {
    dispatch(actions.newMessages(result))
  },
  (err, action, dispatch) => {
    console.log('failed to load messages:', err)
  }
)
```

## License

[MIT](LICENSE.md)
