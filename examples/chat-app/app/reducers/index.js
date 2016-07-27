import { combineReducers } from 'redux'

import chatReducer from './chat'

const rootReducer = combineReducers({
  messages: chatReducer
})

export default rootReducer
