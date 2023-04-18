const info = (...params) => {
  //not to print in console during test mode
  if(process.env.NODE_ENV !== 'test') console.log(...params)
}

const error = (...params) => {
  //not to print in console during test mode
  if(process.env.NODE_ENV !== 'test') console.error(...params)
}

module.exports = {
  info, error
}