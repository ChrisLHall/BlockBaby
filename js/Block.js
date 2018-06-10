var Block = function (group, xIndex, yIndex, type) {
  Block.allBlocks.push(this)
  this.x = xIndex
  this.y = yIndex
  this.type = type
  this.info = Block.TYPES[type]

  this.group = group
  this.scene = group.scene
  var pos = Block.getWorldPos(xIndex, yIndex)
  this.gameObj = this.group.create(pos.x, pos.y, 'block')
  var shape = new Phaser.Geom.Rectangle(0, 0, 16, 16)
  this.gameObj.setInteractive(shape, Phaser.Geom.Rectangle.Contains).setScale(2).setOrigin(0.5)
  this.gameObj.obj = this
  this.gameObj.anims.load('all', this.info.frame)

  this.scene.input.setDraggable(this.gameObj);


  this.scene.events.on('update', Block.prototype.update, this)
  /*
  this.input.on('dragstart', function (pointer, gameObject) {

      this.children.bringToTop(gameObject);

  }, this);

  this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

      gameObject.x = dragX;
      gameObject.y = dragY;

  });
  */
}

Block.NUM_BLOCKS = {x: 7, y: 7}
Block.OFFSET = {x: 32, y: 180}

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
    blockAtPos.tweenToPos()
    this.x = newPos.x
    this.y = newPos.y
    Block.scanForSandwiches()
  }
}

Block.prototype.dragEnd = function () {
  window.dragging = false
  this.tweenToPos()
}

Block.prototype.tweenToPos = function () {
  var newPos = Block.getWorldPos(this.x, this.y)
  //this.gameObj.x = newPos.x
  //this.gameObj.y = newPos.y
  this.scene.tweens.add({
    targets: [this.gameObj],
    x: newPos.x,
    y: newPos.y,
    delay: 0,
    duration: 50,
    ease: 'Power0',
  });
}

Block.prototype.destroy = function () {
  this.group.remove(this.gameObj, true, true)
  this.scene.events.off('update', this.update, this)
  Block.allBlocks.splice(Block.allBlocks.indexOf(this), 1)
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
  // first, vertical sandwiches
  var sandwiches = []
  var map = Block.createBlockTypeMap()
  var marked = Util.createBoolMap(Block.NUM_BLOCKS.x, Block.NUM_BLOCKS.y)
  for (var y = 0; y < Block.NUM_BLOCKS.y - 3; y++) {
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
  // next, horizontal sandwiches
  window.outlines.clear()
  window.outlines.lineStyle(2, 0xFF004F, 1);
  for (var j = 0; j < sandwiches.length; j++) {
    var sandwich = sandwiches[j]
    var origin = Block.getWorldPos(sandwich.x, sandwich.y)
    window.outlines.strokeRect(origin.x - 16, origin.y - 16, sandwich.width * 32, sandwich.height * 32)
  }
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
  console.log("marking a sandwich @ x:" + x + " y: " + y + " height:" + height)
  for (var j = 0; j < width; j++) {
    for (var k = 0; k < height; k++) {
      marked[y + k][x + j] = true
    }
  }
}

Block.TYPES = {
  "bread": {
    frame: 0,
  },
  "leaf": {
    frame: 1,
  },
  "meat": {
    frame: 2,
  },
  "egg": {
    frame: 3,
  },
  "bug": {
    frame: 4,
  },
}

Block.TYPE_LIST = ["bread", "leaf", "meat", "egg", "bug"]
