import Horizon from '@horizon/client'

const horizon = Horizon({ host: 'localhost:8181' })
horizon.connect()

export default horizon
