{
  const maxDepth = 9
  const maxHLen = 20
  const stair = []
  let count = 0

  for (let i = 0; i < maxDepth; i++) {
    const upStair = stair[i - 1] || []
    let powLen = Math.pow(2, i)

    powLen = powLen > maxHLen ? maxHLen : powLen

    stair.push(Array(powLen).fill().map((_, idx) => {
      return {
        id: ++count,
        pid: upStair.getOne()?.id || 0
      }
    }))
  }
  
  // window.treeData = stair.flat()
  // console.log(treeData.map((row) => {
  //   return JSON.stringify(row)
  // }).join(',\n'))
}

window.treeData = [
  {"id":1,"pid":0},
  {"id":2,"pid":1},
  {"id":2.1,"pid":1},
  {"id":2.2,"pid":1},
  {"id":3,"pid":1},
  {"id":3.9,"pid":2},
  {"id":4,"pid":2},
  {"id":5,"pid":2},
  {"id":6,"pid":3},
  {"id":7,"pid":2},
  {"id":8,"pid":4},
  {"id":9,"pid":4},
  {"id":10,"pid":7},
  {"id":10.1,"pid":7},
  {"id":11,"pid":7},
  {"id":12,"pid":6},
  {"id":13,"pid":6},
  {"id":14,"pid":7},
  {"id":15,"pid":5},
  {"id":16,"pid":13},
  {"id":17,"pid":15},
  {"id":18,"pid":15},
  {"id":19,"pid":9},
  {"id":20,"pid":11},
  {"id":21,"pid":13},
  {"id":22,"pid":12},
  {"id":23,"pid":11},
  {"id":24,"pid":13},
  {"id":25,"pid":13},
  {"id":26,"pid":14},
  {"id":27,"pid":12},
  {"id":28,"pid":15},
  {"id":29,"pid":15},
  {"id":30,"pid":8},
  {"id":31,"pid":11},
  {"id":32,"pid":24},
  {"id":33,"pid":18},
  {"id":34,"pid":25},
  {"id":35,"pid":17},
  {"id":36,"pid":27},
  {"id":37,"pid":20},
  {"id":38,"pid":23},
  {"id":39,"pid":16},
  {"id":40,"pid":30},
  {"id":41,"pid":26},
  {"id":42,"pid":19},
  {"id":43,"pid":27},
  {"id":44,"pid":18},
  {"id":45,"pid":23},
  {"id":46,"pid":18},
  {"id":47,"pid":23},
  {"id":48,"pid":31},
  {"id":49,"pid":29},
  {"id":50,"pid":28},
  {"id":51,"pid":29},
  {"id":52,"pid":38},
  {"id":53,"pid":39},
  {"id":54,"pid":42},
  {"id":55,"pid":34},
  {"id":56,"pid":40},
  {"id":57,"pid":46},
  {"id":58,"pid":33},
  {"id":59,"pid":37},
  {"id":60,"pid":35},
  {"id":61,"pid":45},
  {"id":62,"pid":41},
  {"id":63,"pid":41},
  {"id":64,"pid":36},
  {"id":65,"pid":33},
  {"id":66,"pid":42},
  {"id":67,"pid":38},
  {"id":68,"pid":47},
  {"id":69,"pid":43},
  {"id":70,"pid":46},
  {"id":71,"pid":48},
  {"id":72,"pid":53},
  {"id":73,"pid":59},
  {"id":74,"pid":66},
  {"id":75,"pid":55},
  {"id":76,"pid":52},
  {"id":77,"pid":60},
  {"id":78,"pid":69},
  {"id":79,"pid":65},
  {"id":80,"pid":53},
  {"id":81,"pid":62},
  {"id":82,"pid":62},
  {"id":83,"pid":64},
  {"id":84,"pid":67},
  {"id":85,"pid":71},
  {"id":86,"pid":62},
  {"id":87,"pid":53},
  {"id":88,"pid":63},
  {"id":89,"pid":62},
  {"id":90,"pid":71},
  {"id":91,"pid":71},
  {"id":92,"pid":74},
  {"id":93,"pid":91},
  {"id":94,"pid":78},
  {"id":95,"pid":80},
  {"id":96,"pid":87},
  {"id":97,"pid":88},
  {"id":98,"pid":80},
  {"id":99,"pid":81},
  {"id":100,"pid":81},
  {"id":101,"pid":76},
  {"id":102,"pid":75},
  {"id":103,"pid":91},
  {"id":104,"pid":87},
  {"id":105,"pid":80},
  {"id":106,"pid":75},
  {"id":107,"pid":88},
  {"id":108,"pid":90},
  {"id":109,"pid":81},
  {"id":110,"pid":86},
  {"id":111,"pid":85}
]