import { describe, it } from 'mocha'
import chai from 'chai'
import { spy } from 'sinon'

import setupHzActions from '../src/setupSubscriptionActions'

const expect = chai.expect

const actionCreator = (data) => ({ type: 'SOME_ACTION', payload: data })
const dispatch = (action) => action
const hzResult = { data: true }
const horizon = (collection) => ({ collection, subscribe: (success, err) => success(hzResult) })
const horizonErr = (collection) => ({ collection, subscribe: (success, err) => err() })
const config = [
  {
    query: horizon('test'),
    actionCreator: actionCreator,
    onQueryError: (err) => null // eslint-disable-line
  }
]
const configForceHzErr = [
  {
    query: horizonErr('test'),
    actionCreator: actionCreator,
    onQueryError: (err) => null // eslint-disable-line
  }
]
const configMissingQuery = [
  {
    actionCreator: actionCreator,
    onQueryError: (err) => null // eslint-disable-line
  }
]
const configMissingAction = [
  {
    query: horizon('test'),
    onQueryError: (err) => null // eslint-disable-line
  }
]
const configMissingErr = [
  {
    query: horizonErr('test'),
    actionCreator: actionCreator
  }
]

describe('horizon-redux configureSubscriptionActions', () => {
  it('throws an error if no dispatch is provided', () => {
    const fn = () => setupHzActions(undefined, config)
    expect(fn).to.throw(Error)
  })

  it('throws an error if no config is provided', () => {
    const fn = () => setupHzActions(dispatch, undefined)
    expect(fn).to.throw(Error)
  })

  describe('handles each item in config array', () => {
    it('throws an error if config item is missing query property', () => {
      const fn = () => setupHzActions(dispatch, configMissingQuery)
      expect(fn).to.throw(Error)
    })

    it('throws an error if config item is missing action property', () => {
      const fn = () => setupHzActions(dispatch, configMissingAction)
      expect(fn).to.throw(Error)
    })

    it('creates an onQueryError property if it is missing', () => {
      const fn = () => setupHzActions(dispatch, configMissingErr)
      // This should throw because configMissingErr uses horizonErr, which always
      // calls its subsctibe's err argument
      expect(fn).to.throw(Error)
    })

    describe('runs query with subscribe()', () => {
      it('dispatches corresponding action if query is successful', () => {
        const dispatchSpy = spy(dispatch)
        setupHzActions(dispatchSpy, config)

        // config uses actionCreator, and subscribe's success function always gets called
        // with hzResult, so dispatchSpy's return should deep equal actionCreator(hzResult)
        expect(dispatchSpy.returnValues[0]).to.eql(actionCreator(hzResult))
      })

      it('invokes onQueryError if query fails', () => {
        const onQueryErrorSpy = spy(configForceHzErr[0], 'onQueryError')
        setupHzActions(dispatch, configForceHzErr)

        expect(onQueryErrorSpy.called).to.be.true
      })
    })
  })
})
