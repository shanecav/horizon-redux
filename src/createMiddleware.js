/**
 * @flow
 */

import type { ActionType, Action, Dispatch, Store } from '../types/redux'
import type { HorizonInstance } from '../types/horizon'
type Config = {
  [actionType: ActionType]: (horizon: HorizonInstance, action: Action, dispatch: Dispatch) => void
}

/**
 * Create middleware that intercepts specific actions and runs corresponding Horizon queries
 *
 * @param {object} config - Object where each key is an action type, and each corresponding value is a function that takes a horizon instance, action, and Redux store dispatch method as arguments and runs a Horizon Collection query.
 * @returns {function} Redux middleware
 */
export default (horizon: HorizonInstance, config: Config) => {
  if (horizon === undefined) {
    throw new Error('createMiddleware must be passed a Horizon.io client instance.')
  }

  if (config === undefined) {
    throw new Error('createMiddleware must be passed a config object.')
  }

  // create middleware that intercepts and handles write actions
  const middleware = ({ dispatch, getState }: Store) => (next: Dispatch) => (action: Action) => {
    // if this action type corresponds to one of the keys of the config arg object
    if (action.type && config[action.type] !== undefined) {
      if (typeof config[action.type] !== 'function') {
        throw new Error('Each property of the createMiddleware configuration object must be a function that accepts an action object and uses it to run a Horizon query.')
      }

      // run the query (dispatch is provided for success/error handlers).
      // FYI return value isn't used anywhere.
      return config[action.type](horizon, action, dispatch)
    }
    // otherwise this action is unrelated
    return next(action)
  }

  return middleware
}
