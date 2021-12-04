{
  const maxDepth = 20
  const maxHLen = 20
  const stair = []
  let count = 0

  for (let depth = 0; depth < maxDepth; depth++) {
    const upStair = stair[depth - 1]
    const arr = stair[depth] = []
    let n = Math.pow(2, depth)

    n = n > maxHLen ? maxHLen : n

    for (let i = 0; i < n; i++) {
      arr.push({
        id: ++count,
        pid: upStair ? upStair[rand(0, upStair.length - 1)].id : 0
      })
    }
  }

  window.treeData = stair.flat()
}

console.log(JSON.stringify(treeData))
