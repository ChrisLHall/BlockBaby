var Block = function (group, xIndex, yIndex, type) {
  Block.allBlocks.push(this)
  this.x = xIndex
  this.y = yIndex
  this.type = type
  this.info = Block.TYPES[type]

  this.group = group
  this.scene = group.scene
  var pos = Block.getWorldPos(xIndex, yIndex)
  this.gameObj = this.group.create(pos.x, pos.y - 100, 'block')
  var shape = new Phaser.Geom.Rectangle(0, 0, 16, 16)
  this.gameObj.setInteractive(shape, Phaser.Geom.Rectangle.Contains).setScale(2).setOrigin(0.5).setAlpha(.1)
  this.gameObj.obj = this
  this.gameObj.anims.load('all', this.info.frame)

  this.scene.input.setDraggable(this.gameObj);


  //this.scene.events.on('update', this.update, this)

  this.tweenToPos(500 + Math.random() * 200)
}

Block.NUM_BLOCKS = {x: 7, y: 7}
Block.OFFSET = {x: 32, y: 202}

Block.prototype.update = function () {

}

Block.prototype.dragStart = function () {
  window.dragging = true
}

Block.prototype.drag = function (dragX, dragY) {
  this.gameObj.x = dragX
  this.gameObj.y = dragY

  var newPos = Block.getBlockPos(dragX, dragY)
  if (newPos.x !== this.x || newPos.y !== this.y) {
    var blockAtPos = Block.find(newPos.x, newPos.y)
    blockAtPos.x = this.x
    blockAtPos.y = this.y
    blockAtPos.tweenToPos(100)
    this.x = newPos.x
    this.y = newPos.y
    window.slideSfx.play()
    var sandwiches = Block.scanForSandwiches()
    Block.drawSandwichOutlines(sandwiches)
  }
}

Block.prototype.dragEnd = function () {
  window.dragging = false
  this.tweenToPos(100)
  window.dingSfx.play()
  var sandwiches = Block.scanForSandwiches()
  Block.scoreSandwiches(sandwiches)
  Block.destroySandwiches(sandwiches)
  if (sandwiches.length > 0) {
    window.customer.sandwichesScored()
  }
  Block.drawSandwichOutlines([])
}

Block.prototype.tweenToPos = function (duration) {
  var newPos = Block.getWorldPos(this.x, this.y)
  //this.gameObj.x = newPos.x
  //this.gameObj.y = newPos.y
  this.scene.tweens.add({
    targets: this.gameObj,
    x: newPos.x,
    y: newPos.y,
    alpha: 1,
    delay: 0,
    duration: duration,
    ease: 'Power1',
  });
}

Block.prototype.destroy = function () {
  this.group.remove(this.gameObj, true, true)
  this.scene.events.off('update', this.update, this)
  Block.allBlocks.splice(Block.allBlocks.indexOf(this), 1)
}

Block.prototype.tweenDestroy = function () {
  this.x = -1
  this.y = -1
  var duration = 1000
  var delay = Math.random() * 100
  var _this = this
  this.scene.tweens.add({
    targets: this.gameObj,
    x: { value: 70, delay: delay, duration: duration, ease: 'Power4.easeIn' },
    y: { value: 120, delay: delay, duration: duration, ease: 'Power4.easeIn' },
    scaleX: { value: 0, delay: delay, duration: duration, ease: 'Power4.easeOut' },
    scaleY: { value: 0, delay: delay, duration: duration, ease: 'Power4.easeOut' },
    onComplete: function () {
      window.popSfx.play()
      _this.destroy()
    },
  })
}

Block.allBlocks = []

Block.find = function (x, y) {
  for (var j = 0; j < Block.allBlocks.length; j++) {
    var b = Block.allBlocks[j]
    if (b.x === x && b.y === y) {
      return b
    }
  }
  return null
}

Block.getBlockPos = function (px, py) {
  var x = Math.floor((px + 16 - Block.OFFSET.x) / 32)
  var y = Math.floor((py + 16 - Block.OFFSET.y) / 32)
  x = Phaser.Math.Clamp(x, 0, Block.NUM_BLOCKS.x - 1)
  y = Phaser.Math.Clamp(y, 0, Block.NUM_BLOCKS.y - 1)
  return {x: x, y: y}
}

Block.getWorldPos = function (blockX, blockY) {
  var x = blockX * 32 + Block.OFFSET.x
  var y = blockY * 32 + Block.OFFSET.y
  return {x: x, y: y}
}

Block.createBlockTypeMap = function () {
  var map = []
  for (var r = 0; r < Block.NUM_BLOCKS.y; r++) {
    var row = []
    for (var c = 0; c < Block.NUM_BLOCKS.x; c++) {
      row.push(Block.find(c, r).type)
    }
    map.push(row)
  }
  return map
}

Block.scanForSandwiches = function () {
  var sandwiches = []
  var map = Block.createBlockTypeMap()
  var marked = Util.createBoolMap(Block.NUM_BLOCKS.x, Block.NUM_BLOCKS.y)
  for (var y = 0; y <= Block.NUM_BLOCKS.y - 3; y++) {
    for (var x = 0; x < Block.NUM_BLOCKS.x; x++) {
      for (var width = Block.NUM_BLOCKS.x - x; width >= 1; width--) {
        for (var height = 3; height <= Block.NUM_BLOCKS.y - y; height++) {
          var sandwich = {x: x, y: y, width: width, height: height}
          if (Block.checkSandwich(map, marked, sandwich)) {
            Block.markSandwich(marked, sandwich)
            sandwiches.push(sandwich)
          }
        }
      }
    }
  }
  return sandwiches
}

Block.checkSandwich = function(map, marked, sandwich) {
  var x = sandwich.x
  var y = sandwich.y
  var width = sandwich.width
  var height = sandwich.height
  if (width < 1) {
    return false
  }
  if (height < 3) {
    return false
  }

  var halfWidth = Math.floor(width / 2)
  for (var j = 0; j <= halfWidth; j++) {
    var halfHeight = Math.floor(height / 2)
    for (var k = 0; k <= halfHeight; k++) {
      var topLeft = map[y + k][x + j]
      var topLeftMarked = marked[y + k][x + j]
      var bottomLeft = map[y + height - 1 - k][x + j]
      var bottomLeftMarked = marked[y + height - 1 - k][x + j]
      var topRight = map[y + k][x + width - 1 - j]
      var topRightMarked = marked[y + k][x + width - 1 - j]
      var bottomRight = map[y + height - 1 - k][x + width - 1 - j]
      var bottomRightMarked = marked[y + height - 1 - k][x + width - 1 - j]
      if (topLeftMarked || bottomLeftMarked || topRightMarked || bottomRightMarked) {
        return false
      }
      // Bread required at the top and prevented in the middle
      if (k === 0) {
        if (topLeft !== "bread" || bottomLeft !== "bread"
            || topRight !== "bread" || bottomRight !== "bread") {
          return false
        }
      } else {
        if (topLeft !== bottomLeft || topRight !== bottomRight
          || topLeft !== topRight || bottomLeft !== bottomRight
          || topLeft === "bread" || bottomLeft === "bread"
          || topRight === "bread" || bottomRight === "bread") {
          return false
        }
      }
    }
  }
  return true
}

Block.markSandwich = function (marked, sandwich) {
  var x = sandwich.x
  var y = sandwich.y
  var width = sandwich.width
  var height = sandwich.height
  for (var j = 0; j < width; j++) {
    for (var k = 0; k < height; k++) {
      marked[y + k][x + j] = true
    }
  }
}

Block.drawSandwichOutlines = function (sandwiches) {
  window.outlines.clear()
  window.outlines.lineStyle(2, 0xFF004F, 1);
  for (var j = 0; j < sandwiches.length; j++) {
    var sandwich = sandwiches[j]
    var origin = Block.getWorldPos(sandwich.x, sandwich.y)
    window.outlines.strokeRect(origin.x - 16, origin.y - 16, sandwich.width * 32, sandwich.height * 32)
  }
}

Block.scoreSandwiches = function (sandwiches) {
  var map = Block.createBlockTypeMap()
  for (var s = 0; s < sandwiches.length; s++) {
    var sandwich = sandwiches[s]
    var centerJ = Math.floor(sandwich.width / 2)
    var centerK = Math.floor(sandwich.height / 2)
    var maxCenterDist = centerJ + centerK - 1
    for (var j = 0; j < sandwich.width; j++) {
      for (var k = 1; k < sandwich.height - 1; k++) {
        // don't count bread
        var type = map[sandwich.y + k][sandwich.x + j]
        var centerDist = Math.abs(j - centerJ) + Math.abs(k - centerK)
        var centerBonus = maxCenterDist - centerDist
        var amount = (1 + centerBonus) * Block.TYPES[type].value
        window.inventory[type] += amount
      }
    }
  }
  // always round the inventory amounts
  for (var key in window.inventory) {
    if (window.inventory.hasOwnProperty(key)) {
      window.inventory[key] = Math.round(window.inventory[key])
    }
  }
}

Block.destroySandwiches = function (sandwiches) {
  for (var s = 0; s < sandwiches.length; s++) {
    var sandwich = sandwiches[s]
    for (var j = 0; j < sandwich.width; j++) {
      for (var k = 0; k < sandwich.height; k++) {
        var x = sandwich.x + j
        var y = sandwich.y + k
        var existing = Block.find(x, y)
        if (existing.type === "bread") {
          existing.destroy()
        } else {
          existing.tweenDestroy()
        }
        var block = new Block(window.blocks, x, y, Util.listRand(Block.TYPE_LIST))
      }
    }
  }
}

Block.destroyAllAndRefresh = function () {
  for (var x = 0; x < Block.NUM_BLOCKS.x; x++) {
    for (var y = 0; y < Block.NUM_BLOCKS.y; y++) {
      var existing = Block.find(x, y)
      existing.destroy()
      var block = new Block(window.blocks, x, y, Util.listRand(Block.TYPE_LIST))
    }
  }
}

Block.TYPES = {
  "bread": {
    frame: 0,
    value: 0,
  },
  "leaf": {
    frame: 1,
    value: 1,
  },
  "meat": {
    frame: 2,
    value: 1,
  },
  "egg": {
    frame: 3,
    value: 1,
  },
  "bug": {
    frame: 4,
    value: 1,
  },
}

Block.TYPE_LIST = ["bread", "bread", "bread", "leaf", "meat", "egg", "bug"]
