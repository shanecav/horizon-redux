// @flow

import createMiddlewareCreator from './createMiddleware'
import { createActionTaker, createActionTakerManager } from './actionTaker'

import type { HorizonInstance } from '../types/horizon'
import type { Middleware } from '../types/redux'
import type { ActionTakers, ActionTakerAdder } from '../types/horizon-redux'

export default function HorizonRedux (
  hz: HorizonInstance
): {
  createMiddleware: () => Middleware,
  addActionTaker: ActionTakerAdder,
  takeEvery: ActionTakerAdder,
  takeLatest: ActionTakerAdder
} {
  if (typeof hz !== 'function') {
    throw new Error('must pass HorizonRedux a Horizon.io client instance')
  }

  let actionTakers:ActionTakers = []

  // The Redux middleware creator. When this is added to the Redux store, it
  // will replace the dispatch function with Redux's dispatch.
  const createMiddleware = createMiddlewareCreator(hz, actionTakers)

  // Function that adds action takers to the actionTakers array
  const addActionTaker: ActionTakerAdder = (
    pattern,
    observableQuery,
    successHandler,
    errorHandler,
    type
  ) => {
    // Create the actionTaker
    const actionTaker = createActionTaker(pattern, observableQuery, successHandler, errorHandler, type)
    // Add the new actionTaker to actionTakers array
    actionTakers.push(actionTaker)

    // Create & return the actionTakerManager (which has the remove() method)
    return createActionTakerManager(actionTakers, actionTaker)
  }

  const takeEvery: ActionTakerAdder = (
    pattern,
    observableQuery,
    successHandler,
    errorHandler
  ) => addActionTaker(pattern, observableQuery, successHandler, errorHandler, 'takeEvery')

  const takeLatest: ActionTakerAdder = (
    pattern,
    observableQuery,
    successHandler,
    errorHandler
  ) => addActionTaker(pattern, observableQuery, successHandler, errorHandler, 'takeLatest')

  return {
    createMiddleware,
    addActionTaker,
    takeEvery,
    takeLatest
  }
}
