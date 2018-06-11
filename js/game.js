
var config = {
  type: Phaser.AUTO,
  width: 256,
  height: 455,
  parent: 'gameContainer',
  pixelArt: true,
  zoom: window.innerHeight / 455,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: 'arcade'
  }
};

var game = new Phaser.Game(config)

function preload () {
  this.load.spritesheet('blocks', 'assets/images/blocks.png', { frameWidth: 16, frameHeight: 16 })
  this.load.spritesheet('customer', 'assets/images/customer.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('buttons', 'assets/images/buttons.png', { frameWidth: 32, frameHeight: 32 })
  this.load.image('tilebg', 'assets/images/tilebg.png')
  this.load.image('tut1', 'assets/images/tut1.png')
  this.load.image('tut2', 'assets/images/tut2.png')
  this.load.image('tut3', 'assets/images/tut3.png')

  this.load.audio('slide', 'assets/sounds/slide.ogg')
  this.load.audio('ding', 'assets/sounds/ding.ogg')
  this.load.audio('pop', 'assets/sounds/pop.ogg')
  this.load.audio('doorchime', 'assets/sounds/doorchime.ogg')
}

function create () {
  // set up animations
  this.anims.create({
    key: 'all',
    frames: this.anims.generateFrameNumbers('blocks'),
    frameRate: 0,
  });
  this.anims.create({
    key: 'customer',
    frames: this.anims.generateFrameNumbers('customer'),
    frameRate: 0,
  })
  this.anims.create({
    key: 'buttons',
    frames: this.anims.generateFrameNumbers('buttons'),
    frameRate: 0,
  })
  // end set up animations

  spaceBG = this.add.tileSprite(128, 227.5, 256, 455, 'tilebg')
  /*
  spaceFG = game.add.tileSprite(0, 0, 513, 912, 'spaceFG')
  spaceFG.fixedToCamera = true
  */

  window.blocks = this.add.group();
  for (var r = 0; r < Block.NUM_BLOCKS.y; r++) {
    for (var c = 0; c < Block.NUM_BLOCKS.x; c++) {
      var block = new Block(window.blocks, c, r, Util.listRand(Block.TYPE_LIST))
    }
  }

  window.outlines = this.add.graphics();
  Block.drawSandwichOutlines([])

  window.inventory = {
    "leaf": 0,
    "meat": 0,
    "egg": 0,
    "bug": 0,
  }

  var textX = 240
  var textY = 90
  var textYSpace = 14
  window.uiGroup = this.add.group();
  window.customer = new Customer(window.uiGroup, 70, 144)
  var resetButton = new UIButton(window.uiGroup, 'buttons', 0, 224, 432, function (pointer) {
    Block.destroyAllAndRefresh()
    Block.drawSandwichOutlines([])
  })
  window.mute = false
  var _scene = this
  window.muteButton = new UIButton(window.uiGroup, 'buttons', 1, 184, 432, function (pointer) {
    window.mute = !window.mute
    _scene.sound.setMute(window.mute)
    window.muteButton.gameObj.setAlpha(window.mute ? .5 : 1)
  })

  window.tut = null
  window.tutObj = null
  window.tutButton = new UIButton(window.uiGroup, 'buttons', 2, 144, 432, function (pointer) {
    if (window.tutObj) {
      window.tutObj.destroy()
    }
    if (!window.tut) {
      window.tut = "tut1"
    } else if (window.tut === "tut1") {
      window.tut = "tut2"
    } else if (window.tut === "tut2") {
      window.tut = "tut3"
    } else {
      window.tut = null
    }
    if (window.tut) {
      window.tutButton.gameObj.setTint(0x00ffff)
      window.tutObj = _scene.add.image(0, 0, window.tut).setOrigin(0)
    } else {
      window.tutButton.gameObj.setTint(0xffffff)
    }
  })
  window.uiText = {
    "leaf": this.add.text(textX, textY + 0 * textYSpace, "", {
      fontSize: '12px',
      align: 'right',
      color: '#3fff3f',
    }).setOrigin(1, 0),
    "meat": this.add.text(textX, textY + 1 * textYSpace, "", {
      fontSize: '12px',
      align: 'right',
      color: '#ff3f3f',
    }).setOrigin(1, 0),
    "egg": this.add.text(textX, textY + 2 * textYSpace, "", {
      fontSize: '12px',
      align: 'right',
      color: '#3f3fff',
    }).setOrigin(1, 0),
    "bug": this.add.text(textX, textY + 3 * textYSpace, "", {
      fontSize: '12px',
      align: 'right',
      color: '#df3fff',
    }).setOrigin(1, 0),
  }
  for (var key in window.uiText) {
    if (window.uiText.hasOwnProperty(key)) {
      window.uiGroup.add(window.uiText[key])
    }
  }

  window.slideSfx = this.sound.add('slide')
  window.dingSfx = this.sound.add('ding')
  window.popSfx = this.sound.add('pop')
  window.doorChimeSfx = this.sound.add('doorchime')
  //uiGroup.fixedToCamera = true

  //uiText = uiGroup.create(250, 150, "pressshout")
  //uiText.anchor.setTo(0.5, 0.5)
  //uiText.inputEnabled = true;
  //uiText.events.onInputDown.add(clickShout, uiText);

  this.input.on('dragstart', function (pointer, gameObj) {
    if (gameObj.obj && gameObj.obj.dragStart) {
      gameObj.obj.dragStart()
    }
  }, this);

  this.input.on('drag', function (pointer, gameObj, dragX, dragY) {
    if (gameObj.obj && gameObj.obj.drag) {
      gameObj.obj.drag(dragX, dragY)
    }
  });

  this.input.on('dragend', function (pointer, gameObj) {
    if (gameObj.obj && gameObj.obj.dragEnd) {
      gameObj.obj.dragEnd()
    }
  }, this);

  this.input.on('gameobjectdown', function (pointer, gameObj) {
    if (gameObj.obj && gameObj.obj.onClick) {
      gameObj.obj.onClick(pointer)
    }
  }, this);

  window.clickUsedByUI = false
}

function update () {
  for (var key in window.uiText) {
    if (window.uiText.hasOwnProperty(key)) {
      var str = key
      if (window.customer.likes === key) {
        str += " (likes)"
      } else if (window.customer.hates === key) {
        str += " (hates)"
      }
      str += ": " + window.inventory[key]
      window.uiText[key].setText(str)
    }
  }

  if (!this.input.activePointer.isDown) {
    clickUsedByUI = false
  }
}
