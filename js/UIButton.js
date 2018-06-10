var UIButton = function (group, animName, frame, screenX, screenY, touchAction) {
  this.group = group
  this.scene = group.scene
  this.touchAction = touchAction

  this.gameObj = group.create(screenX, screenY, animName)
  this.gameObj.obj = this
  this.gameObj.setInteractive().setOrigin(0.5)
  this.gameObj.anims.load(animName, frame)
}

UIButton.prototype.onClick = function(pointer) {
  clickUsedByUI = true // ALWAYS DO THIS FIRST
  this.touchAction.call(this, pointer)
}
