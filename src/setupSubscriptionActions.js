/**
 * @flow
 */

import type { Dispatch, Action } from '../types/redux'
type Subscription = {
  query: any,
  actionCreator: (result: any) => Action,
  onQueryError: (err: any) => void
}
type Config = Array<Subscription>

/**
 * Setup Horizon Collection query fetches and watches to dispatch
 * corresponding actions when data is received.
 *
 * @param {function} dispatch - dispatch method from a Redux store
 * @param {array} config - Array of objects with 'query' (Horizon query without .subscribe() method), 'actionCreator' (function that takes Horizon query result data and returns an action using that data), and 'onQueryError' (function that takes a Horizon query error and handles it) properties.
 */
export default (dispatch: Dispatch, config: Config) => {
  if (dispatch === undefined) {
    throw Error('setupSubscriptionActions must be passed a redux store\'s dispatch method')
  }

  if (config === undefined) {
    throw Error('setupSubscriptionActions must be passed a config array')
  }

  // set up read queries and their corresponding actions
  config.forEach((subscriptions: Subscription) => {
    if (!subscriptions.query || !subscriptions.actionCreator) {
      throw new Error('Each item in setupSubscriptionActions config must be an object with query and action properties')
    }

    if (!subscriptions.onQueryError || typeof subscriptions.onQueryError !== 'function') {
      subscriptions.onQueryError = (err) => {
        throw new Error(err)
      }
    }

    // Execute the query and dispatch the appropriate actions
    subscriptions.query.subscribe(
      (data) => dispatch(subscriptions.actionCreator(data)),
      subscriptions.onQueryError
    )
  })
}
