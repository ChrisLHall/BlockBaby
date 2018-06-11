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
  window.uiGroup.add(this.nameText)
  this.subText = this.scene.add.text(128, 21, "says: hullo", {
    fontSize: '12px',
    align: 'center',
    color: '#ffffff',
    wordWrap: { width: 250 }
  }).setOrigin(.5, 0),
  window.uiGroup.add(this.subText)
  this.whelpReviews = []
  this.reviewText = this.scene.add.text(128, 158, "Your shop is rated 5⭐ on Whelp (1 review)", {
    fontSize: '12px',
    align: 'center',
    color: '#cfcfcf',
    wordWrap: { width: 250 }
  }).setOrigin(.5, 0)
  window.uiGroup.add(this.reviewText)
  this.feedbackText = this.scene.add.text(128, 226, "hiyo", {
    fontSize: '55px',
    align: 'center',
    color: '#ffffff',
    backgroundColor: '#ff8faf',
  }).setOrigin(.5, 0).setAlpha(0)
  window.uiGroup.add(this.feedbackText)
  this.feedbackTween = null
  this.reviewAnimCountdown = 0
  this.reviewColorIdx = 0
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
  for (var key in window.inventory) {
    if (window.inventory.hasOwnProperty(key)) {
      window.inventory[key] = 0
    }
  }
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
  this.setSize(1)
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
  var feedback = '"Yuck"'
  if (totalScore > 0) {
    feedback = '"Mmm."'
  }
  if (totalScore > 10) {
    feedback = '"Yum!"'
  }
  if (totalScore > 30) {
    feedback = '"Wow!!!"'
  }

  var newSize = 1 + Math.max(totalScore / 30, -.5)
  this.setSize(newSize)
  this.updateAnim()
  this.updateText()

  if (this.finished) {
    // add review
    var rating = 1
    for (var j = 0; j < Customer.SCORES_FOR_RATINGS.length; j++) {
      var scoreCap = Customer.SCORES_FOR_RATINGS[j]
      if (totalScore <= scoreCap) {
        break
      } else {
        rating = j + 2 // if score is above highest maximum, get a 6* rating
      }
    }
    var thanks = (rating > 3 ? "Thanks!" : "Bye.")
    feedback += "\n" + thanks + "\n" + rating.toString() + "⭐"
    this.whelpReviews.push(rating)
    this.updateReviews()
    this.tweenNewCustomer()
  }
  this.tweenFeedbackText(feedback)
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
  if (this.feedbackTween) {
    this.feedbackTween.stop()
  }
  this.feedbackText.setDepth(10000).setText(text).setAlpha(0)
  this.feedbackTween = this.scene.tweens.add({
    targets: this.feedbackText,
    alpha: 1,
    delay: 0,
    duration: 200,
    hold: 800,
    ease: 'Power2.easeOut',
    yoyo: true,
  })
}

Customer.prototype.tweenNewCustomer = function () {
  var _this = this
  window.doorChimeSfx.play()
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

    var colorList = Customer.COLORS_FOR_RATINGS[Math.floor(totalScore) - 1]
    this.reviewColorIdx++
    if (this.reviewColorIdx >= colorList.length) {
      this.reviewColorIdx = 0
    }
    color = colorList[this.reviewColorIdx]
  }
  this.reviewText.setText(str)
  this.reviewText.setColor(color)
}

Customer.TYPES = {
  "hen": {
    animIdx: 0,
    names: ["Georgina", "Monique", "Alex", "Ellen", "Helga", "Claudette", "Meep"],
  },
  "rooster": {
    animIdx: 3,
    names: ["Roberto", "Matt Damon", "Morty", "Maurice", "Ali", "Rufus"],
  },
  "butterfly": {
    animIdx: 6,
    names: ["Bag", "McGowan", "Naseem", "Marcus", "Isabella", "Jen"],
  },
  "frog": {
    animIdx: 9,
    names: ["Springer", "Summer", "Bernice", "Cody", "Fred", "Ted", "Zed", "Ned"],
  },
}

Customer.TYPE_LIST = ["hen", "rooster", "butterfly", "frog"]

Customer.ADJECTIVES = [
  "{0} the Dazzling",
  "Majestic {0}",
  "{0} the Respected",
  "Baby-faced {0}",
  "{0} the Eternal",
  "{0} the Annoying",
  "Steadfast {0}",
  "Beautiful, perfect {0}",
  "The Exuberant {0}",
  "Dr. {0}, M.D.",
  "Dr. {0}, Ph.D.",
]

Customer.LIKES_HATES = [
  "Well, {0} is yummy but I can't stand {1}.",
  "I like {0} but not {1}.",
  "Uhh...can I get a sandwich with uhh... {0}? Also NO {1}!",
  "{0}? YUP. {1}? NOPE.",
  "Gimme that {0}, hold the {1}.",
  "...........Just {0} without {1} please.",
  "I CRAVE {0}. I DESPISE {1}.",
]

Customer.DEMANDS = [
  "ON THE DOUBLE",
  "Hurry. I'm late for a meeting!",
  "I'll be here I guess...",
  "SEND HELP!",
  "I'll just watch your every move.",
  "Get to it!",
  "Uhh...yeah.",
  "3 2 1 GO!",
]

// max score for 1* thru 5* (can get up to 6*)
Customer.SCORES_FOR_RATINGS = [
  0,
  2,
  5,
  30,
  60
]

// shuffle colors for 1* thru 6* (which means, ALL 6 star ratings)
Customer.COLORS_FOR_RATINGS = [
  ['#afafaf'],
  ['#cfcfcf'],
  ['#cf2f2f'],
  ['#dfdf5f'],
  ['#5fff5f', '#dfdf6f'],
  ['#5fffff', '#ff5fff', '#3f3fff']
]
