import { describe, it } from 'mocha'
import chai from 'chai'
import { spy } from 'sinon'

import createMiddleware from '../src/createMiddleware'

const expect = chai.expect

const horizon = () => null
const validConfig = {
  SOME_ACTION: (action, dispatch) => null
}
const invalidConfig = {
  SOME_ACTION: 'string is not a function'
}

describe('horizon-redux createMiddleware', () => {
  it('throws an error if no horizon instance is provided', () => {
    const fn = () => createMiddleware(undefined, validConfig)
    expect(fn).to.throw(Error)
  })

  it('throws an error if no config is provided', () => {
    const fn = () => createMiddleware(horizon, undefined)
    expect(fn).to.throw(Error)
  })

  describe('return redux middleware', () => {
    const horizonReduxMiddleware = createMiddleware(horizon, validConfig)
    const invalidHorizonReduxMiddleware = createMiddleware(horizon, invalidConfig)
    const doDispatch = () => {}
    const doGetState = () => {}
    const nextHandler = horizonReduxMiddleware({dispatch: doDispatch, getState: doGetState})
    const invalidNextHandler = invalidHorizonReduxMiddleware({dispatch: doDispatch, getState: doGetState})

    it('must return a function to handle next', () => {
      expect(nextHandler).to.be.a('function')
      expect(nextHandler.length).to.equal(1)
    })

    describe('handle next', () => {
      it('must return a function to handle action', () => {
        const actionHandler = nextHandler()

        expect(actionHandler).to.be.a('function')
        expect(actionHandler.length).to.equal(1)
      })

      describe('handle action', () => {
        it('must throw an error if matching config value is not a function', () => {
          const invalidActionHandler = invalidNextHandler()
          const fn = () => invalidActionHandler({ type: 'SOME_ACTION' })

          expect(fn).to.throw(Error)
        })

        it('must run the function from config whose key matches the action type', () => {
          const actionHandler = nextHandler()
          const configFunctionSpy = spy(validConfig, 'SOME_ACTION')

          actionHandler({ type: 'SOME_ACTION' })
          expect(configFunctionSpy.called).to.be.true
        })

        it('must pass action to next if no matching config key found', () => {
          const next = spy()
          const actionHandler = nextHandler(next)

          actionHandler({ type: 'UNRELATED_ACTION' })
          expect(next.called).to.be.true
        })
      })
    })
  })
})
