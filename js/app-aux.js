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

Array.prototype.swap = function(a, b) {
  const t = this[a]
  this[a] = this[b]
  this[b] = t
}

Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    this.swap(i, Math.floor(Math.random() * (i + 1)))
  }
  return this
}