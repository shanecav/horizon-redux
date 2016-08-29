// @flow

import type { HorizonInstance } from '../types/horizon'
import type { Action, Dispatch } from '../types/redux'
import type {
  ActionTaker,
  ActionTakers
} from '../types/horizon-redux'

export function actionTakerMatchesAction (
  action: Action,
  actionTaker: ActionTaker
): bool {
  return (
    typeof actionTaker.pattern === 'string' &&
    actionTaker.pattern === action.type
  ) || (
    Array.isArray(actionTaker.pattern) &&
    actionTaker.pattern.indexOf(action.type) !== -1
  ) || (
    typeof actionTaker.pattern === 'function' &&
    actionTaker.pattern(action)
  )
}

/**
 * Function that creates an actionHandler. The actionHandler is called for every
 * action that is dispatched through the horizon-redux middleware. It matches
 * that action against every actionTaker in the actionTakers array, and then
 * performs the appropriate operations for each matching actionTaker.
 */
export function createActionHandler (
  hz: HorizonInstance,
  actionTakers: ActionTakers,
  dispatch: Dispatch
) {
  return (action: Action): void => {
    actionTakers.forEach((actionTaker) => {
      if (actionTakerMatchesAction(action, actionTaker)) {
        const observable = actionTaker.observableQuery(hz, action)

        // if this actionTaker's query has a success or error handler, set up
        // the new subscription
        if (actionTaker.successHandler || actionTaker.errorHandler) {
          // set up observableQuery subscriber
          const subscriber = observable.subscribe(
            actionTaker.successHandler
              // $FlowIssue: not detecting above conditional
              ? (result) => actionTaker.successHandler(result, action, dispatch)
              : undefined,
            actionTaker.errorHandler
              // $FlowIssue: not detecting above conditional
              ? (err) => actionTaker.errorHandler(err, action, dispatch) // eslint-disable-line handle-callback-err
              : undefined
          )

          // add observable to actionTaker's subscribers so it can be
          // unsubscribed if the actionTaker is removed
          if (actionTaker.type === 'takeEvery') {
            actionTaker.subscribers.push(subscriber)
          } else if (actionTaker.type === 'takeLatest') {
            // Ensure that this actionTaker has only one active subscription,
            // which is based on the latest matching action dispatched
            actionTaker.subscribers.forEach((subscriber) => {
              subscriber.unsubscribe()
            })
            actionTaker.subscribers = [subscriber]
          }
        }
      }
    })
  }
}
