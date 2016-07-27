/**
 * @flow
 */

// Redux/Middleware types
// Mostly taken from https://github.com/flowtype/flow-typed/blob/master/definitions/npm/redux_v3.x.x/flow_%3E%3Dv0.23.x/redux_v3.x.x.js
export type State = any
export type ActionType = string|Symbol
export type Action = {
  type: ActionType,
  payload?: any,
  error?: boolean,
  meta?: any
}
export type Reducer<State, Action> = (state: State, action: Action) => State
export type Dispatch = (a: Action) => any
export type Store = {
  dispatch: Dispatch,
  getState: () => State,
  subscribe: (listener: () => void) => () => void,
  replaceReducer: (reducer: Reducer<any, any>) => void
}
