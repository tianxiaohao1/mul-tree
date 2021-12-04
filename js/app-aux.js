function sleep(time) {
  return time && new Promise((next) => {
    setTimeout(next, time)
  })
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

Array.prototype.first = function() {
  return this[0]
}

Array.prototype.last = function() {
  return this[this.length - 1]
}