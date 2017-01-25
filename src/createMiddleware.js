// @flow

import { createActionHandler } from './actionHandler'

import type { HorizonInstance, Dispatch, Action, Middleware } from './'
import type { ActionTakers } from '../types/horizon-redux'

/**
 * Function that creates the horizon-redux middleware, and also provides
 * horizon-redux with the Redux store's dispatch method when the middleware is
 * added to the store.
 */
export default function createMiddlewareCreator (
  hz: HorizonInstance,
  actionTakers: ActionTakers
) {
  return (): Middleware => ({ dispatch, getState }) => {
    // create the actionHandler
    const handleAction = createActionHandler(hz, actionTakers, dispatch, getState)

    return (next: Dispatch) => (action: Action) => {
      handleAction(action)
      return next(action)
    }
  }
}
