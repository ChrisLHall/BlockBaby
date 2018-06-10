
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
  console.log("preload")
}

function create () {
  console.log(this)
  Kii.initializeWithSite("u3hcavh35j65", "2d2df3c7956c4a22911e586523c9e469", KiiSite.US)
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

function onConfirmID (data) {
  console.log("confirmed my ID: " + data.playerID)
  window.localStorage.setItem("preferredID", data.playerID)

  tryKiiLogin(data.playerID, function () {
    player = new LocalPlayer(data.playerID, playerGroup, startX, startY, Player.generateNewInfo(data.playerID))

    game.camera.follow(player.gameObj, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT, 0.3, 0.3)
    game.camera.focusOnXY(startX, startY)

    queryPlayerInfo(player, player.playerID)
    queryAllPlanets()
  })
}

function tryKiiLogin (playerID, successCallback) {
  var username = playerID;
  var password = "password9001";
  KiiUser.authenticate(username, password).then(function (user) {
    console.log("Kii User authenticated: " + JSON.stringify(user));
    successCallback()
  }).catch(function (error) {
    var errorString = error.message;
    console.log("Unable to authenticate user: " + errorString + "...attempting signup");
    var user = KiiUser.userWithUsername(username, password);
    user.register().then(function (user) {
      console.log("User registered: " + JSON.stringify(user));
      successCallback()
    }).catch(function(error) {
      var errorString = "" + error.code + error.message;
      console.log("Unable to register user: " + errorString + "... reload I guess?");
    });
  });
}


function queryPlayerInfo (playerObj, playerID) {
  if (null == playerObj) {
    return
  }
  var queryObject = KiiQuery.queryWithClause(KiiClause.equals("playerid", playerID));
  queryObject.sortByDesc("_created");

  var bucket = Kii.bucketWithName("PlayerInfo");
  bucket.executeQuery(queryObject).then(function (params) {
    var queryPerformed = params[0];
    var result = params[1];
    var nextQuery = params[2]; // if there are more results
    if (result.length > 0) {
      if (result.length > 1) {
        console.log("Multiple PlayerInfos for " + playerID)
      }
      console.log(playerID + ": PlayerInfo query successful")
      playerObj.setInfo(result[0]["_customInfo"])
    } else {
      console.log(playerID + ": PlayerInfo query failed, returned no objects")
    }
  }).catch(function (error) {
    var errorString = "" + error.code + ":" + error.message;
    console.log(playerID + ": PlayerInfo query failed, unable to execute query: " + errorString);
  });
}

function queryPlanetInfo(planetObj, planetID) {
  if (null == planetObj) {
    return
  }
  var queryObject = KiiQuery.queryWithClause(KiiClause.equals("planetid", planetID));
  queryObject.sortByDesc("_created");

  var bucket = Kii.bucketWithName("Planets");
  bucket.executeQuery(queryObject).then(function (params) {
    var queryPerformed = params[0];
    var result = params[1];
    var nextQuery = params[2]; // if there are more results
    if (result.length > 0) {
      if (result.length > 1) {
        console.log("Multiple Planets for " + planetID)
      }
      console.log(planetID + ": Planet query successful")
      planetObj.setInfo(result[0]._customInfo)
    } else {
      console.log(planetID + ": Planet query failed, returned no objects")
    }
  }).catch(function (error) {
    var errorString = "" + error.code + ":" + error.message;
    console.log(planetID + ": Planet query failed, unable to execute query: " + errorString);
  });
}

var MAXCOUNT = 20
var countdown = MAXCOUNT
var MAXKEYCOUNT = 8
var keyCountdown = MAXKEYCOUNT
var ZERO_POINT = new Phaser.Geom.Point(0, 0)
function update () {
  //this.events.emit('update')
  updateUI.call(this)
}

function updateUI () {
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
