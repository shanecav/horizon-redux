import horizon from './connect'

let HorizonRedux
if (process.env.USE_LIB === true) {
  HorizonRedux = require('../../../../lib').default
} else {
  HorizonRedux = require('../../../../src').default
}

const horizonRedux = HorizonRedux(horizon)

export default horizonRedux
