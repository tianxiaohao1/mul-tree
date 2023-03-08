/*global console document treeData*/

class MulTree {
  constructor(d) {
    const gd = d.gd = d.canvas.getContext('2d')

    if (!d.data.length) throw new Error('MulTree Error: 空数据')

    d.conf = {
      scale: 2,
      font: '14px Arial',
      padding: 20,
      stairHeight: 50,
      nodeHeight: 20,
      duration: 300,
      timingFunc: Tween['Quad']['easeInOut'],
    }
    gd.font = d.conf.font
    d.mapId = {}
    d.mapPid = {}
    d.stair = []
    d.data.forEach((v) => {
      v.width = Math.ceil(gd.measureText(v.id).width) + 15
      d.mapId[v.id] = v
      d.mapPid[v.pid] = d.mapPid[v.pid] || []
      d.mapPid[v.pid].push(v)
    })

    // 检测多叉树有多少 根节点
    {
      const mapVisited = {}

      d.roots = []
      d.data.forEach((v) => {
        let node = v

        while (node) {
          if (mapVisited[v.id]) return
          mapVisited[v.id] = true

          node = d.mapId[node.pid]

          if (!node) {
            d.roots.push(v)
            break
          }
        }
      })

      if (d.roots.length > 1) {
        console.error('当前多叉树有 ' + d.roots.length + ' 个根节点', d.roots)
      }

      d.root = d.roots[0]
    }

    const setDepth = (node, depth = 0) => {
      d.stair[depth] = d.stair[depth] || []
      d.stair[depth].push(node)
      node.hIndex = d.stair[depth].length - 1
      node.depth = depth

      d.mapPid[node.id]?.forEach((v) => {
        setDepth(v, depth + 1)
      })
    }
    setDepth(d.root)

    this.d = d
    this.setLayout()
    this.render()
  }
  getPrev(node) {
    node = node.id ? node : this.d.mapId[node]
    return this.d.stair[node.depth][node.hIndex - 1]
  }
  getNext(node) {
    node = node.id ? node : this.d.mapId[node]
    return this.d.stair[node.depth][node.hIndex + 1]
  }
  getChildren(node) {
    const d = this.d
    const result = []

    node = node.id ? node : this.d.mapId[node]

    const getChildren = (node) => {
      result.push(node)
      d.mapPid[node.id]?.forEach(getChildren)
    }

    getChildren(node)

    return result
  }
  getDis(node) {
    const d = this.d
    const children = this.getChildren(node)
    let dis = Infinity

    node = node.id ? node : d.mapId[node]

    children.forEach((v) => {
      const prev = this.getPrev(v)
      if (!prev || children.includes(prev)) return
      dis = Math.min(dis, v.x - (prev.x + prev.width))
    })

    return dis === Infinity ? 0 : dis
  }
  translate(node, x = 0, y = 0) {
    const translate = (node) => {
      node.x += x
      node.y += y
      this.d.mapPid[node.id]?.forEach(translate)
    }
    translate(node)
  }
  contains(p, c) {
    const d = this.d

    p = p.id ? p : d.mapId[p]
    c = c.id ? c : d.mapId[c]

    while (c) {
      if (c === p) return true
      c = d.mapId[c.pid]
    }
    return false
  }
  setCanvasSize() {
    const d = this.d
    let iLeft = Infinity
    let iRight = -Infinity
    let iTop = -Infinity
    let canvasWidth = 0
    let canvasHeight = 0

    d.stair.forEach((row) => {
      row.forEach((v) => {
        iLeft = Math.min(iLeft, v.x)
        iRight = Math.max(iRight, v.x + v.width)
        iTop = Math.max(iTop, v.y + d.conf.nodeHeight)
      })
    })

    this.translate(d.root, -iLeft)

    canvasWidth = iRight - iLeft + d.conf.padding * 2
    // canvasHeight = (d.stair.length - 1) * d.conf.stairHeight + d.conf.padding * 2 + d.conf.nodeHeight
    canvasHeight = iTop + d.conf.padding * 2

    d.canvas.width = canvasWidth * d.conf.scale
    d.canvas.height = canvasHeight * d.conf.scale

    d.canvas.style.width = canvasWidth + 'px'
    d.canvas.style.height = canvasHeight + 'px'
  }
  async setLayout() {
    const d = this.d

    d.stair.forEach((row) => {
      row.forEach((v) => {
        const prev = this.getPrev(v)

        v.x = prev ? (prev.x + prev.width) : 0
        v.y = v.depth * d.conf.stairHeight
      })
    })

    for (let i = d.stair.length - 1; i >= 0; i--) {
      const row = d.stair[i]

      for (let j = 0; j < row.length; j++) {
        const node = row[j]
        const prev = this.getPrev(node)
        const children = d.mapPid[node.id]

        if (!children?.length) {
          // 叶子节点
          node.x = prev ? prev.x + prev.width : 0
          continue
        }

        const l = children.first()
        const r = children.last()
        node.x = (l.x + r.x + r.width) / 2 - node.width / 2
        const dis = this.getDis(node)
        dis !== 0 && this.translate(node, -dis)

        {
          const leafNodes = []
          let prev = this.getPrev(node)

          while (prev && !d.mapPid[prev.id]?.length && prev.pid === node.pid) {
            leafNodes.push(prev)
            prev = this.getPrev(prev)
          }

          if (prev && leafNodes.length > 0) {
            if (prev.pid === node.pid) {
              // 等间分布
              leafNodes.forEach((v) => {
                v.fillStyle = 'orange'
              })

              const totalSpace = node.x - prev.x - prev.width - leafNodes.reduce((t, v) => t += v.width, 0)
              const space = totalSpace / (leafNodes.length + 1)
              leafNodes.forEach((v) => {
                v.x = this.getNext(v).x - v.width - space
              })
            } else {
              // 向右拉
              leafNodes.forEach((v) => {
                v.x = this.getNext(v).x - v.width
              })
            }
          }
        }
      }
    }

    this.setCanvasSize()
  }
  render() {
    const d = this.d
    const {canvas, gd} = d

    const renderLine = () => {
      const renderLine = (node) => {
        d.mapPid[node.id]?.forEach(renderLine)

        const nodeP = d.mapId[node.pid]

        if (!nodeP) return

        const x1 = nodeP.x + nodeP.width / 2
        const y1 = nodeP.y + d.conf.nodeHeight / 2

        const x4 = node.x + node.width / 2
        const y4 = node.y + d.conf.nodeHeight / 2

        const x2 = x1
        const y2 = (y1 + y4) / 2

        const x3 = x4
        const y3 = y2

        gd.moveTo(x1, y1)
        gd.bezierCurveTo(
          x2, y2,
          x3, y3,
          x4, y4,
        )
      }

      gd.beginPath()
      renderLine(d.root)
      gd.strokeStyle = 'rgba(128, 128, 128, 1)'
      gd.lineWidth = 1
      gd.stroke()
    }

    const renderNode = () => {
      const renderNode = (node) => {
        gd.beginPath()
        gd.rect(node.x + 1, node.y, node.width - 2, d.conf.nodeHeight)
        gd.fillStyle = node.fillStyle || 'rgba(0, 170, 255, .75)'
        gd.fill()

        gd.font = d.conf.font
        gd.fillStyle = '#fff'
        gd.textAlign = 'center'
        gd.textBaseline = 'middle'
        gd.fillText(node.id, node.x + node.width / 2, node.y + d.conf.nodeHeight / 2)

        d.mapPid[node.id]?.forEach(renderNode)
      }
      renderNode(d.root)
    }

    gd.fillStyle = '#fff'
    gd.fillRect(0, 0, canvas.width, canvas.height)
    gd.save()
    gd.scale(d.conf.scale, d.conf.scale)
    gd.translate(d.conf.padding, d.conf.padding)
    renderLine()
    renderNode()

    gd.restore()
  }
}

const mulTree = new MulTree({
  canvas: document.getElementById('canvas'),
  data: treeData,
})