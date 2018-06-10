var Util = {}

Util.listRand = function (list) {
  if (!list || list.length === 0) {
    return null
  }
  return list[Math.floor(Math.random() * list.length)]
}

Util.createBoolMap = function (width, height) {
  var map = []
  for (var r = 0; r < height; r++) {
    var row = []
    for (var c = 0; c < width; c++) {
      row.push(false)
    }
    map.push(row)
  }
  return map
}
