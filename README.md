# horizon-redux
A small library that helps you connect Horizon.io with Redux in a flexible, non-intrusive way.

[![Build Status](https://travis-ci.org/shanecav/horizon-redux.svg?branch=master)](https://travis-ci.org/shanecav/horizon-redux)

## What does it do?
horizon-redux helps you connect [Redux](https://github.com/reactjs/redux) with [Horizon.io](http://horizon.io/). It works by letting you create simple "actionTakers" that respond to matching actions with a Horizon query, and in turn respond to the Horizon query subscription results (usually by dispatching another action).

All of your interactions with Horizon.io, whether you're initiating or responding to queries, will happen through Redux actions. This approach allows you to use Redux to manage your app's entire state, as opposed to having external Horizon.io bindings tied directly to your UI components. This way, you can enjoy the simplicity of Horizon.io without losing the benefits of a well-structured Redux app.

horizon-redux has zero npm dependencies, and its only requirements are Horizon.io and Redux.

horizon-redux is compatible with Horizon.io 1.x and 2.x.

_Interested in a different approach? See the [Alternative Approaches](#alternative-approaches) section below for some different options for integrating Horizon with Redux._

## Installation

`npm i -S horizon-redux`

Alternatively:

`<script src="https://unpkg.com/horizon-redux/dist/horizon-redux.min.js"></script>` (exposes window.HorizonRedux as a global variable)

## Usage

```js
import HorizonRedux from 'horizon-redux'
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
horizonRedux.takeLatest(
  'WATCH_MESSAGES',
  (horizon, action, getState) => horizon('messages').order('datetime', 'descending').limit(action.payload).watch(),
  (result, action, dispatch) => dispatch({type: 'NEW_MESSAGES', payload: result}),
  (err, action, dispatch) => console.log('failed to load messages:', err)
)
// Notice how we added an actionTaker after the middleware has already been
// added to the store - horizon-redux internally stores an array of actionTakers,
// which the middleware returned by `createMiddleware()` accesses. This allows
// you to add/remove actionTakers at any time.

// Now we can dispatch the action that tells Horizon to watch for chat messages.
store.dispatch({ type: 'WATCH_MESSAGES', payload: 10 })

// addActionTaker returns an actionTakerManager with a remove() method.
// Removing an actionTaker automatically unsubscribes from all Horizon subscriptions
// associated with it, and removes it from horizonRedux. (takeEvery and
// takeLatest also return a manager.)
const someActionTaker = horizonRedux.addActionTaker(/* ... */)
someActionTaker.remove()
```

#### Check out the [chat-app](examples/chat-app) example in this repo for a basic working example based on the chat-app example from Horizon.io

# API

```js
import HorizonRedux from 'horizon-redux'
const horizonRedux = HorizonRedux(horizonInstance)
```

## horizonRedux methods:

### .createMiddleware()

Creates a Redux middleware that watches for actions that match any of the actionTakers created by horizonRedux. See `horizonRedux.addActionTaker` below for more details.

#### Arguments:

n/a

#### Returns:

Redux middleware

---

### .addActionTaker(pattern, observableQuery, successHandler, errorHandler, type)

Adds an actionTaker to horizonRedux's internal array. Every action that goes through horizonRedux's middleware will be matched against every added actionTaker. The actionTaker determines how to respond to matching actions with Horizon queries.

*Rather than calling this method directly, you can call `takeLatest(...)` or `takeEvery(...)`, which simply call `addActionTaker(...)` with the corresponding `type` argument injected automatically (see below).*

#### Arguments:

1. `pattern` - A string, array of strings, or function used to match against dispatched action's types.
    * If it's a string, matches if `pattern === action.type`
    * If it's an array of strings, matches if any elements of the array are strictly equal to `action.type`
    * If it's a function, matches if pattern(action) returns a truthy value
2. `observableQuery` - A function that takes a Horizon client instance, an action, and your Redux store's `getState` method, and returns a Horizon query. The query must be an "observable" type (`fetch()`, `watch()`, `store()`, `upsert()`, `insert()`, `replace()`, `update()`, `remove()`, or `removeAll()`). Do not call the `subscribe()` method on the query here - HorizonRedux takes care of that automatically.
3. `successHandler` (optional) - A function that takes result (the result of the query), action (the action associated with that query) and the Redux store's dispatch method. You can handle the successful query however you'd like - usually by dispatching another action with the results.
4. `errorHandler` (optional) - A function that takes the error, action (the action associated with that query) and the Redux store's dispatch method. You can handle an error scenario however you'd like.
5. `type` (optional) - A string representing the type of actionTaker to add. Must be either `'takeEvery'` or `'takeLatest'` (defaults to `'takeEvery'` if omitted). This argument determines how the actionTaker manages its subscriptions when new matching actions are dispatched:
    * If `'takeEvery'`, the actionTaker will add an additional subscription every time a matching action is dispatched.
    * If `'takeLatest'`, the actionTaker will replace the existing subscription (first calling its `unsubscribe()` method) with a new subscription every time a matching action is dispatched. Keep in mind that your success/error handlers will no longer fire after the old subscription has been unsubscribed.

#### Returns:

An actionTaker "manager" with a single method: `remove()`. Calling the `remove()` method automatically unsubscribes from all Horizon subscriptions associated with the actionTaker, and removes it from horizonRedux so that it no longer responds to its matching actions.

#### Example:

```js
// Adds an actionTaker that matches 'WATCH_MESSAGES' actions and responds by
// telling Horizon to watch for new messages in the 'messages' table. The max
// number of returned documents (limit) is set by the action's payload.limit.
// Because we set the type to 'takeLatest', it will replace the old Horizon query
// subscription (if it exists) with a new subscription every time a matching
// action is dispatched.
horizonRedux.addActionTaker(
  'WATCH_MESSAGES',
  (horizon, action, getState) =>
    horizon('messages').order('datetime', 'descending').limit(action.payload.limit || 10).watch(),
  (result, action, dispatch) => {
    dispatch(newMessages(result))
  },
  (err, action, dispatch) => {
    console.log('failed to load messages:', err)
  },
  'takeLatest'
)

// Start watching messages and return 10 at a time
store.dispatch({ type: 'WATCH_MESSAGES', payload: { limit: 10 } })

// ...now return 20 at a time instead
store.dispatch({ type: 'WATCH_MESSAGES', payload: { limit: 20 } })
```

---

### .takeLatest(pattern, observableQuery, successHandler, errorHandler)

Identical to `addActionTaker(...)` except that the type is automatically set to `'takeLatest'` (see above). Matching actions will replace the subscription from the previous matching action (first calling its `unsubscribe()` method) with the new subscription.

#### Example:

```js
// This is equivalent to the 'addActionTaker' example above.
horizonRedux.takeLatest(
  'WATCH_MESSAGES',
  (horizon, action, getState) =>
    horizon('messages').order('datetime', 'descending').limit(action.payload.limit || 10).watch(),
  (result, action, dispatch) => {
    dispatch(newMessages(result))
  },
  (err, action, dispatch) => {
    console.log('failed to load messages:', err)
  }
)

// Start watching messages and return 10 at a time
store.dispatch({ type: 'WATCH_MESSAGES', payload: { limit: 10 } })

// ...now return 20 at a time instead
store.dispatch({ type: 'WATCH_MESSAGES', payload: { limit: 20 } })
```

---

### .takeEvery(pattern, observableQuery, successHandler, errorHandler)

Identical to `addActionTaker(...)` except that the type is automatically set to `'takeEvery'` (see above). Matching actions will add new subscriptions (without replacing previous ones).

#### Example:

```js
// Adds an actionTaker that matches 'ADD_MESSAGE_REQUEST' actions and responds
// by telling Horizon to insert the message in the action's payload into the
// 'messages' table. Because we're using 'takeEvery', the subscriptions created
// by previously dispatched 'ADD_MESSAGE_REQUEST' actions will not be overwritten,
// so their success/error handlers will still fire even if new messages have
// since been added.
horizonRedux.takeEvery(
  'ADD_MESSAGE_REQUEST',
  (horizon, action, getState) => horizon('messages').store(action.payload),
  (id, action, dispatch) => dispatch(addMessageSuccess(id, action.payload)),
  (err, action, dispatch) => dispatch(addMessageFailure(err, action.payload))
)
```

## Questions/Comments/Issues?

I'm very open to feedback, and will respond to issues quickly. Feel free to [get in touch](https://twitter.com/shanecav)!

## Alternative Approaches

1. [redux-observable](https://redux-observable.js.org/) is honestly a more elegant approach. If you aren't interested in learning RxJS, then horizon-redux will work fine, but redux-observable is a great library made by smart people (and it's worth learning RxJS if you're using Horizon). Because most Horizon.io collection methods return RxJS Observables, using redux-observable should be pretty easy to integrate.

2. [redux-saga](https://github.com/yelouafi/redux-saga) is a great option if you find that you need more power than horizon-redux offers. redux-saga is a much bigger library with a larger API. With this approach, you'll likely end up writing more code than you would with horizon-redux, but it may be necessary for more complex apps. [Check out an example app using Horizon.io with redux-saga](https://github.com/shanecav/horizon-redux-saga).

## License

[MIT](LICENSE.md)
