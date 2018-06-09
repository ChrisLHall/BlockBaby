var Block = function (group, xIndex, yIndex, type) {
  Block.allBlocks.push(this)
  this.x = xIndex
  this.y = yIndex
  this.group = group
  this.scene = group.scene
  var pos = Block.getWorldPos(xIndex, yIndex)
  this.gameObj = this.group.create(pos.x, pos.y, 'block')
  var shape = new Phaser.Geom.Rectangle(0, 0, 16, 16)
  this.gameObj.setInteractive(shape, Phaser.Geom.Rectangle.Contains).setScale(2)
  this.gameObj.obj = this
  this.gameObj.anims.load('all', Math.floor(Math.random() * 5))

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
