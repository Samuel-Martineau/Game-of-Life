//Définitions des classes
class Square {

  updateColor() {
    document.getElementById(this.X + "," + this.Y).style.backgroundColor = this.color
  }

  constructor(x, y) {
    this.color = "white"
    this.X = x
    this.Y = y
    watch(this, "color", function() {
      this.updateColor()
    })

  }

}
class GridClass {
  generateGrid() {
    var rowHtml = ''
    var html = ''


    var y = 0

    while (y < this.nbY) {
      var rowHtml = ''
      var x = 0
      var X = []
      while (x < this.nbX) {
        X.push(new Square(x, y))
        rowHtml += '<div class="square" id="' + x + "," + y + '"></div>'
        x++
      }
      this.grid.push(X)
      rowHtml = '<div class="row" style="width: ' + (22 * this.nbX) + 'px">' + rowHtml + "</div>"
      html += rowHtml
      y++
    }
    $("game").html(html)


  }

  constructor(nbX, nbY) {
    this.nbY = nbY
    this.nbX = nbX
    this.maxX = this.nbX - 1
    this.maxY = this.nbY - 1
    this.minX = 0
    this.minY = 0
    this.grid = []
    this.generateGrid()
  }

  calculateNeighboringcells(x, y){
    var neighboringCells = []

    if(x - 1 >= this.minX){
      neighboringCells.push(this.grid[y][x - 1])
      if (y + 1 <= this.maxY) {
        neighboringCells.push(this.grid[y + 1][x - 1])
      }
      if (y - 1 >= this.minY) {
        neighboringCells.push(this.grid[y - 1][x - 1])
      }
    }
    if (x + 1 <= this.maxX) {
      neighboringCells.push(this.grid[y][x + 1])
      if (y + 1 <= this.maxY) {
        neighboringCells.push(this.grid[y + 1][x + 1])
      }
      if (y - 1 >= this.minY) {
        neighboringCells.push(this.grid[y - 1][x + 1])
      }
    }

    if (y - 1 >= this.minY) {
      neighboringCells.push(this.grid[y - 1][x])
    }
    if (y + 1 <= this.maxY) {
      neighboringCells.push(this.grid[y + 1][x])
    }

    return neighboringCells
  }

  checkForCells(){
    if (Game.phase != "Game is done") {
      var cellsToBorn = []
      var cellsToDye = []
      for (var y = 0; y < this.grid.length; y++) {
        for (var x = 0; x < this.grid[y].length; x++) {
          var howManyLivingCells = 0
          for (var i = 0; i < this.calculateNeighboringcells(x, y).length; i++) {
            if (this.calculateNeighboringcells(x, y)[i].color == "black") {
              howManyLivingCells ++
            }
          }
          if (this.grid[y][x].color == "white" && howManyLivingCells == 3) {
            cellsToBorn.push(this.grid[y][x])
          }else if (this.grid[y][x].color == "black") {
            if (howManyLivingCells != 2 && howManyLivingCells != 3) {
              cellsToDye.push(this.grid[y][x])
            }
          }
        }
      }
      for (var i = 0; i < cellsToBorn.length; i++) {
        cellsToBorn[i].color = "black"
      }
      for (var i = 0; i < cellsToDye.length; i++) {
        cellsToDye[i].color = "white"
      }
      if (cellsToBorn.length == 0 && cellsToDye.length == 0) {
        Game.phase = "Game is done"
      }else {
        Game.numberOfTimes ++
      }
    }

  }

  updateCells(cellsToUpdate){
    for (var i = 0; i < cellsToUpdate.length; i++) {
      //X, Y
      this.grid[cellsToUpdate[i][1]][cellsToUpdate[i][0]].color = "black"
    }
  }

  saveGrid() {
    var coloriedCell = []
    for (var y = 0; y < this.grid.length; y++) {
      for (var x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x].color == "black") {
          coloriedCell.push([this.grid[y][x].X, this.grid[y][x].Y])
        }
      }
    }
    var json = {nbY: this.nbY,nbX: this.nbX,maxX: this.maxX,maxY: this.maxY,minX: this.minX,minY: this.minY,coloriedCell: coloriedCell}
    json = JSON.stringify(json)
    var blob = new Blob([json], {type: "application/json"})
    saveAs(blob, prompt("Entrez le nom sous lequel vous voulez sauvegarder la grille"))
  }

}

//Définition de l'objet JEU
let Game = {
  phase: "Setting up the grid",
  numberOfTimes : 0
}
watch(Game, "phase", function() {
  if (Game.phase == "Game is start") {
    //Début du jeu

  }
})
watch(Game, "numberOfTimes", function() {
  $("#numberOfTimes").html(Game.numberOfTimes)
})

//Création de la grille
var Grid = new GridClass(200, 200)

//Actions des bouttons

$("#infoBtn").click(function() {
  alert("Informations:\n- Phase du jeu : " + Game.phase + "\n- Nombre d'itérations : " + Game.numberOfTimes + "\n- Raccourcis claviers :\n       -Escape : Recommencer\n       -Enter : Passer à la prochaine itération\n       -S : Sauvegarder la grille en JSON\n       -Shift : Passer d'itérations à itérations automatiquement")
})
$("#jsonGrid").click(function() {
  let json = JSON.parse(prompt("Collez le JSON d'une grille que vous avez préalablement téléchargé"))
  Grid = new GridClass(json.nbX, json.nbY)
  Grid.updateCells(json.coloriedCell)
  $(".square").click(function() {
		  if (Game.phase != "Setting up the grid") return
      var idString = $(this).attr('id')
      var coor = idString.split(',')
      switch (Grid.grid[coor[1]][coor[0]].color) {
        case 'black':
          Grid.grid[coor[1]][coor[0]].color = "white"
          break;
        case 'white':
          Grid.grid[coor[1]][coor[0]].color = "black"
          break;
        default:

      }
  })
})
$(".square").click(function() {
    if (Game.phase != "Setting up the grid") return
    var idString = $(this).attr('id')
    var coor = idString.split(',')
    switch (Grid.grid[coor[1]][coor[0]].color) {
      case 'black':
        Grid.grid[coor[1]][coor[0]].color = "white"
        break;
      case 'white':
        Grid.grid[coor[1]][coor[0]].color = "black"
        break;
      default:

    }
})

//Système de raccourcis claviers
document.addEventListener('keydown', function(event) {
    if(event.keyCode == 27) {
      location.reload()
    }
    else if(event.keyCode == 13) {
      if (Game.phase == "Setting up the grid") {
        Game.phase = "Game is start"
      }
      Grid.checkForCells()
    }
    else if(event.keyCode == 83){
      Grid.saveGrid()
    }
    else if(event.keyCode == 16){
      Game.phase = "Game is start"
      window.setInterval(function() {
        Grid.checkForCells()
      }, prompt("Définissez le nombre de milisecondes entre chaque itération"))
    }
});
