var Customer = function (group, x, y) {
  this.group = group
  this.scene = group.scene

  this.gameObj = group.create(x, y, 'customer')
  this.gameObj.obj = this
  this.gameObj.setOrigin(.5, .8)

  this.nameText = this.scene.add.text(128, 3, "Yeff", {
    fontSize: '16px',
    align: 'center',
    color: '#ffffdf',
  }).setOrigin(.5, 0),
  this.subText = this.scene.add.text(128, 21, "says: hullo", {
    fontSize: '12px',
    align: 'center',
    color: '#ffffff',
    wordWrap: { width: 250 }
  }).setOrigin(.5, 0),
  this.whelpReviews = []
  this.reviewText = this.scene.add.text(128, 158, "Your shop is rated 5⭐ on Whelp (1 review)", {
    fontSize: '12px',
    align: 'center',
    color: '#cfcfcf',
    wordWrap: { width: 250 }
  }).setOrigin(.5, 0)
  this.reviewAnimCountdown = 0
  this.updateReviews()

  this.initRandomCustomer()

  this.scene.events.on('update', this.update, this)
}

Customer.prototype.update = function () {
  this.reviewAnimCountdown--
  if (this.reviewAnimCountdown <= 0) {
    this.reviewAnimCountdown = 10
    this.updateReviews()
  }
}

Customer.prototype.initRandomCustomer = function () {
  this.type = Util.listRand(Customer.TYPE_LIST)
  this.info = Customer.TYPES[this.type]
  this.age = 0
  var name = Util.listRand(this.info.names)
  var adj = Util.listRand(Customer.ADJECTIVES)
  this.name = adj.replace("{0}", name)
  var blocks = ["meat", "egg", "bug", "leaf"]
  this.likes = Util.listRand(blocks)
  blocks.splice(blocks.indexOf(this.likes), 1)
  this.hates = Util.listRand(blocks)
  this.likeHateText = Util.listRand(Customer.LIKES_HATES).replace("{0}", this.likes).replace("{1}", this.hates)
  this.demandText = Util.listRand(Customer.DEMANDS)

  this.remainingOrders = 4
  this.finished = false
  this.updateAnim()
  this.updateText()
}

Customer.prototype.sandwichesScored = function () {
  if (this.finished) {
    return
  }
  this.age = Math.min(this.age + 1, 2)
  this.remainingOrders = Math.max(this.remainingOrders - 1, 0)
  this.finished = (this.remainingOrders === 0)

  var totalScore = 0
  for (var key in window.inventory) {
    if (window.inventory.hasOwnProperty(key)) {
      var multiplier = 1
      if (key === this.likes) {
        multiplier = 2
      } else if (key === this.hates) {
        multiplier = -1
      }
      totalScore += window.inventory[key] * multiplier
    }
  }
  // TODO big text feedback for whether this was a good score or not
  var newSize = 1 + Math.max(totalScore / 30, -.5)
  this.setSize(newSize)
  this.updateAnim()
  this.updateText()

  if (this.finished) {
    // add review
    this.updateReviews()
    this.tweenNewCustomer()
  }
}

Customer.prototype.setSize = function (newSize) {
  this.scene.tweens.add({
    targets: this.gameObj,
    scaleX: newSize,
    scaleY: newSize,
    duration: 1500,
    ease: 'Back.easeInOut',
  })
}

Customer.prototype.tweenFeedbackText = function (text) {
  // TODO make feedback text
}

Customer.prototype.tweenNewCustomer = function () {
  var _this = this
  this.scene.tweens.add({
    targets: this.gameObj,
    x: -100,
    delay: 1600,
    duration: 1000,
    ease: 'Back.easeInOut',
    yoyo: true,
    onYoyo: function () {
      _this.initRandomCustomer()
    },
  })
}

Customer.prototype.updateAnim = function () {
  var animStart = this.info.animIdx
  this.gameObj.play('customer', false, animStart + this.age)
}

Customer.prototype.updateText = function() {
  this.nameText.setText(this.name)
  var moreOrders = "Make {0} more orders.".replace("{0}", this.remainingOrders)
  if (this.finished) {
    moreOrders = "Finished the orders!"
  }
  this.subText.setText('says: "' + this.likeHateText + " " + this.demandText + '"\n' + moreOrders)
}

Customer.prototype.updateReviews = function () {
  var str = "Your Blockwich shop has {0}⭐ on Whelp ({1})"
  var color = '#cfcfcf'
  if (this.whelpReviews.length === 0) {
    str = "Your Blockwich shop is not rated on Whelp"
  } else {
    var totalScore = 0
    for (var j = 0; j < this.whelpReviews.length; j++) {
      totalScore += this.whelpReviews[j]
    }
    totalScore /= this.whelpReviews.length
    var reviewNumStr = "" + this.whelpReviews.length + " reviews"
    if (this.whelpReviews.length === 1) {
      reviewNumStr = "1 review"
    }
    str = str.replace("{0}", totalScore.toFixed(1)).replace("{1}", reviewNumStr)
  }
  this.reviewText.setText(str)
}

Customer.TYPES = {
  "hen": {
    animIdx: 0,
    names: ["Georgina", "Monique", "Alex", "Ellen"],
  },
  "rooster": {
    animIdx: 3,
    names: ["Roberto", "Matt Damon", "Morty"]
  },
}

Customer.TYPE_LIST = ["hen", "rooster"]

Customer.ADJECTIVES = [
  "{0} the Dazzling", "Majestic {0}", "{0} the Respected", "Baby-faced {0}", "{0} the Eternal"
]

Customer.LIKES_HATES = [
  "Well, {0} is yummy but I can't stand {1}.",
  "I like {0} but not {1}.",
  "Uhh...can I get a sandwich with uhh... {0}? Also NO {1}!"
]

Customer.DEMANDS = [
  "ON THE DOUBLE",
  "Hurry. I'm late for a meeting!",
  "I'll be here I guess"
]
