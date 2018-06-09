var Block = function (group, xIndex, yIndex, type) {
  Block.allBlocks.push(this)
  this.x = xIndex
  this.y = yIndex
  this.group = group
  this.gameObj = this.group.create(xIndex * 32 + Block.OFFSET.x, yIndex * 32 + Block.OFFSET.y, 'block')
  this.gameObj.setOrigin(0).setScale(2).setInteractive()
  this.gameObj.obj = this
  this.gameObj.anims.load('all', Math.floor(Math.random() * 5))

  this.group.scene.input.setDraggable(this.gameObj);


  this.group.scene.events.on('update', Block.prototype.update, this)
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
Block.OFFSET = {x: 16, y: 180}

Block.prototype.update = function () {

}

Block.prototype.dragStart = function () {

}

Block.prototype.drag = function (dragX, dragY) {
  this.gameObj.x = dragX
  this.gameObj.y = dragY
}

Block.prototype.destroy = function () {
  this.group.remove(this.gameObj, true, true)
  this.group.scene.events.off('update', this.update, this)
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
}

Block.getBlockPos = function (px, py) {
  var x = Math.floor((px - Block.OFFSET.x) / 32)
  var y = Math.floor((py - Block.OFFSET.y) / 32)
  x = Phaser.Math.Clamp(x, 0, Block.NUM_BLOCKS.x)
  y = Phaser.Math.Clamp(y, 0, Block.NUM_BLOCKS.y)
  return {x: x, y: y}
}