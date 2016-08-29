// @flow

import type {
  ActionTakerPattern,
  ActionTakerObservableQuery,
  ActionTakerSuccessHandler,
  ActionTakerErrorHandler,
  ActionTaker,
  ActionTakers,
  ActionTakerManager
} from '../types/horizon-redux'

/**
 * Function that creates an actionTaker. An actionTaker is a plain object that
 * sits in horizon-redux's actionTakers array (with every other actionTakler).
 * The actionHandler function (called by the middleware) uses this array of
 * actionTakers, which are matched against every dispatched action that passes
 * through the horizon-redux middleware.
 */
export function createActionTaker (
  pattern: ActionTakerPattern,
  observableQuery: ActionTakerObservableQuery,
  successHandler?: ActionTakerSuccessHandler,
  errorHandler?: ActionTakerErrorHandler,
  type?: string = 'takeEvery'
) {
  if (
    typeof pattern !== 'string' &&
    !Array.isArray(pattern) &&
    typeof pattern !== 'function'
  ) {
    throw new Error('pattern must be a string, array of strings, or function')
  }

  if (typeof observableQuery !== 'function') {
    throw new Error('observableQuery must be a function that returns an observable horizon query')
  }

  if (successHandler && typeof successHandler !== 'function') {
    throw new Error('successHandler must be a function')
  }

  if (errorHandler && typeof errorHandler !== 'function') {
    throw new Error('errorHandler must be a function')
  }

  return {
    pattern,
    observableQuery,
    successHandler,
    errorHandler,
    type,
    subscribers: []
  }
}

/**
 * Function that creates an actionTakerManager from an actionTaker. An
 * actionTakerManager is a plain object with one property: remove(). remove()
 * unsubscribes every one of its actionTaker's subscriptions, and then removes
 * that actionTaker from the actionTakers array.
 */
export function createActionTakerManager (
  actionTakers: ActionTakers,
  actionTaker: ActionTaker
): ActionTakerManager {
  const remove = () => {
    // unsubscribe from all of this actionTaker's subscribers
    actionTaker.subscribers.forEach((subscriber) => {
      subscriber.unsubscribe()
    })
    // remove this actionTaker from actionTakers array
    actionTakers.splice(actionTakers.indexOf(actionTaker), 1)
  }

  return {
    remove
  }
}
