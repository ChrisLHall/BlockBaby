var Block = function (group, startX, startY, type) {
  this.playerID = playerID

  this.gameObj = group.create(startX * 16, startY * 16, 'block')
  this.gameObj.obj = this
  this.gameObj.update = this.update
  this.gameObj.animations.add("fly", [0, 1], 10, true);
  this.gameObj.animations.play("fly")
  //this.gameObj.anchor.setTo(0.5, 0.5)
  this.gameObj.bringToTop()
  //glob.intermittents.push(new IntermittentUpdater(this, function () {
  //  socket.emit('move player', { x: this.targetPos.x, y: this.targetPos.y, angle: this.gameObj.angle })
  //}, 30))

  this.gameObj.body.immovable = true}

Block.prototype.update = function () {
  console.log("test")
}
