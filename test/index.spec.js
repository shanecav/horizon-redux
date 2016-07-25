import { describe, it } from 'mocha'
import chai from 'chai'

import horizonRedux from '../src'

const expect = chai.expect

describe('horizon-redux index.js', () => {
  it('exports createMiddleware', () => {
    expect(horizonRedux.createMiddleware).to.be.a('function')
  })

  it('exports setupSubscriptionActions', () => {
    expect(horizonRedux.setupSubscriptionActions).to.be.a('function')
  })
})
