import { NEW_MESSAGES } from '../actions/chat'

const chat = (state = [], action) => {
  switch (action.type) {
    case NEW_MESSAGES:
      return [...action.payload].reverse()
    default:
      return state
  }
}

export default chat
