class MulTreeAnimate {
  constructor(d = {}) {
    const me = this
    me.d = d

    d.conf = {
      itemHeight: 20,
      lineHeight: 50,
      font: '14px Arial',
      scale: 2,
      translate: {
        x: Number(localStorage.translateX) || 0,
        y: Number(localStorage.translateY) || 0,
      }
    }
    d.gd = d.canvas.getContext('2d')

    me.initData()
    me.setLayout()
    me.initEvents()
  }
  initData() {
    const me = this
    const d = me.d
    const gd = d.gd

    gd.font = d.conf.font
    d.mapId = {}
    d.mapPid = {}
    d.stair = []
    d.root = d.data[0]

    d.data.forEach((v) => {
      v.from = {x: 0, y: 0}
      v.to = {x: 0, y: 0}
      v.x = 0
      v.y = 0
      v.width = Math.ceil(gd.measureText(v.id).width + 15)
      d.mapId[v.id] = v
      d.mapPid[v.pid] = d.mapPid[v.pid] || []
      d.mapPid[v.pid].push(v)
    })

    const mapVisited = {}
    const circleNodes = []

    while (d.mapId[d.root?.pid]) {
      const node = d.mapId[d.root.pid]
      if (mapVisited[node.id]) {
        throw new Error('数据带环，会导致死循环~  环数据：' + JSON.stringify(circleNodes.map(v => v.id).join('->')))
      }
      mapVisited[node.id] = true
      d.root = node
      circleNodes.push(d.root)
    }

    const setDepth = (node, depth = 0) => {
      node.depth = depth
      !d.stair[depth] && (d.stair[depth] = [])
      node.hIndex = d.stair[depth].length
      d.stair[depth].push(node)

      d.mapPid[node.id]?.forEach((v) => {
        setDepth(v, depth + 1)
      })
    }
    d.root && setDepth(d.root)
  }
  getPrev(v) {
    return this.d.stair[v?.depth]?.[v?.hIndex - 1]
  }
  getNext(v) {
    return this.d.stair[v?.depth]?.[v?.hIndex + 1]
  }
  getChildren(node) {
    const result = []
    const loop = (node) => {
      result.push(node)
      this.d.mapPid[node.id]?.forEach(loop)
    }
    loop(node)
    return result
  }
  getDis(node, direction = 'l') {
    const children = this.getChildren(node)
    const set = new Set(children)
    const isL = direction === 'l'
    let dis = Infinity

    children.forEach((v) => {
      const tmp = this[isL ? 'getPrev' : 'getNext'](v)
      if (!tmp || set.has(tmp)) return
      dis = (
        isL ?
          Math.min(dis, v.to.x - tmp.to.x - tmp.width) :
          Math.min(dis, tmp.to.x - v.to.x - v.width)
      )
    })

    return dis === Infinity ? 0 : dis
  }
  translate(node, x = 0, y = 0) {
    this.getChildren(node).forEach((v) => {
      v.to.x += x
      v.to.y += y
    })
  }
  async animate(duration = 300) {
    const me = this
    const d = me.d
    const fn = Tween['Cubic']['easeInOut']
    const timeStart = Date.now()

    return new Promise((next) => {
      const loopRender = () => {
        me.timerAni = requestAnimationFrame(() => {
          const timeDis = Date.now() - timeStart
          const scale = fn(timeDis, 0, 1, duration)
          const isStop = timeDis >= duration

          d.data.forEach((v) => {
            if (isStop) {
              v.x = v.from.x = v.to.x
              v.y = v.from.y = v.to.y
            } else {
              v.x = (v.to.x - v.from.x) * scale + v.from.x
              v.y = (v.to.y - v.from.y) * scale + v.from.y
            }
          })

          me.render()
          isStop ? next() : loopRender()
        })
      }
      cancelAnimationFrame(me.timerAni)
      loopRender()
    })
  }
  async setLayout() {
    const me = this
    const d = me.d

    d.stair.forEach((row) => {
      row.forEach((v) => {
        const nodeL = me.getPrev(v)
        v.to.x = nodeL ? nodeL.to.x + nodeL.width : 0
        v.to.y = v.depth * d.conf.lineHeight
      })
    })

    await me.animate(500)

    for (let depth = d.stair.length - 1; depth > -1; depth--) {
      const row = d.stair[depth]

      for (let i = 0; i < row.length; i++) {
        const node = row[i]
        const nodeL = me.getPrev(node)
        const nodeR = me.getNext(node)
        const children = d.mapPid[node.id]
        const oldX = node.to.x

        node.to.y = node.depth * d.conf.lineHeight

        if (!children) {
          node.to.x = nodeL ? nodeL.to.x + nodeL.width : 0
          node.fillStyle = 'rgba(255,0,0,.5)'
          await me.animate(depth === d.stair.length - 1 ? 50 : 300)
          continue
        }

        for (let j = children.length - 2; j > -1; j--) {
          const tmp = children[j]
          const dis = me.getDis(tmp, 'r')

          if (dis !== 0) {
            me.translate(tmp, dis)
            await me.animate()
          }
        }

        const l = children[0]
        const r = children[children.length - 1]

        node.fillStyle = 'rgba(0,200,0,.5)'
        node.to.x = (l.to.x + r.to.x + r.width) / 2 - node.width / 2

        const dis = me.getDis(node)
        const distance = nodeR ? nodeR.to.x - node.to.x - node.width : 0

        if (dis !== 0) {
          await me.animate(500)
          me.translate(node, -dis)

          for (let j = node.hIndex + 1; j < row.length; j++) {
            me.translate(row[j], -dis)
          }
          await me.animate()
        } else if (distance) {
          for (let j = node.hIndex + 1; j < row.length; j++) {
            row[j].to.x += -distance
          }
          await me.animate(500)
        } else {
          await me.animate()
        }

        let leafs = []

        for (let j = 0; j < children.length; j++) {
          const tmp = children[j]

          if (d.mapPid[tmp.id]) {
            if (leafs.length === 0) continue

            const l = me.getPrev(leafs[0])
            const r = me.getNext(leafs[leafs.length - 1])

            if (
              l && l.pid === node.id &&
              r && r.pid === node.id
            ) {
              const space = (r.to.x - l.to.x - l.width - leafs.reduce((total, item) => {
                return total += item.width
              }, 0)) / (leafs.length + 1)

              for (let k = 0; k < leafs.length; k++) {
                const v = leafs[k]
                const nodeL = me.getPrev(v)
                v.to.x = nodeL.to.x + nodeL.width + space
                v.fillStyle = 'rgba(255,200,0,.5)'
                await me.animate()
              }
            }

            leafs = []
          } else {
            leafs.push(tmp)
          }
        }
      }
    }
  }
  initEvents() {
    const me = this
    const d = me.d
    const canvas = d.canvas

    window.onresize = () => {
      const w = d.w = canvas.offsetWidth
      const h = d.h = canvas.offsetHeight

      canvas.width = w * d.conf.scale
      canvas.height = h * d.conf.scale

      me.render()
    }
    window.onresize()

    canvas.onmousedown = (e) => {
      const x1 = e.clientX
      const y1 = e.clientY

      const originX = d.conf.translate.x
      const originY = d.conf.translate.y

      document.onmousemove = (e) => {
        const x2 = e.clientX
        const y2 = e.clientY

        localStorage.translateX = d.conf.translate.x = x2 - x1 + originX
        localStorage.translateY = d.conf.translate.y = y2 - y1 + originY

        me.render()
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
  render() {
    const me = this
    const d = me.d
    const gd = d.gd

    const renderLine = () => {
      gd.beginPath()
      d.data.forEach((v) => {
        const p = d.mapId[v.pid]
        if (!p) return

        const x1 = p.x + p.width / 2
        const y1 = p.y + d.conf.itemHeight / 2

        const x4 = v.x + v.width / 2
        const y4 = v.y + d.conf.itemHeight / 2

        const x2 = x1
        const y2 = (y1 + y4) / 2

        const x3 = x4
        const y3 = (y1 + y4) / 2

        gd.moveTo(x1, y1)
        gd.bezierCurveTo(
          x2, y2,
          x3, y3,
          x4, y4,
        )
      })
      
      gd.strokeStyle = 'rgba(128, 128, 128, 1)'
      gd.stroke()
    }

    const renderNode = () => {
      gd.font = d.conf.font
      gd.textAlign = 'center'
      gd.textBaseline = 'middle'
      d.data.forEach((v) => {
        gd.fillStyle = v.fillStyle || d.conf.fillStyle || 'rgba(0, 170, 255, .5)'
        gd.fillRect(v.x + 1, v.y, v.width - 2, d.conf.itemHeight)

        gd.fillStyle = '#fff'
        gd.fillText(v.id, v.x + v.width / 2, v.y + d.conf.itemHeight / 2)
      })
    }

    gd.clearRect(0, 0, d.w * d.conf.scale, d.h * d.conf.scale)
    gd.save()
    gd.scale(d.conf.scale, d.conf.scale)
    gd.translate(d.conf.translate.x, d.conf.translate.y)
    renderLine()
    renderNode()
    gd.restore()
  }
}

const me = new MulTreeAnimate({
  canvas: document.getElementById('canvas'),
  data: treeData,
})
const d = me.d
const canvas = d.canvas
const gd = d.gd
