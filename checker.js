class Checker {
  constructor(userType, username, gameKey = null) {
    this.username = username;
    this.userType = userType;
    this.gameKey = gameKey;
    this.seldChecker = {};
    this.board = this.board();

    this.checkers = [
      [1, -1, 1, -1, 1, -1, 1, -1],
      [-1, 1, -1, 1, -1, 1, -1, 1],
      [1, -1, 1, -1, 1, -1, 1, -1],
      [-1, 0, -1, 0, -1, 0, -1, 0],
      [0, -1, 0, -1, 0, -1, 0, -1],
      [-1, 2, -1, 2, -1, 2, -1, 2],
      [2, -1, 2, -1, 2, -1, 2, -1],
      [-1, 2, -1, 2, -1, 2, -1, 2],
    ];

    this.dbRef = firebase.database();
    var gamesRef = this.dbRef.ref("games");

    if (userType === "host") {
      var gameObj = gamesRef.push({
        host: this.username,
        status: "waiting",
        turn: "host",
        checkers: this.checkers,
      });
      this.gameKey = gameObj.key;
    } else {
      this.gameKey = gameKey;
    }

    this.gameRef = this.dbRef.ref("games/" + this.gameKey);
    console.log(this.gameRef);
    if (userType !== "host") {
      this.gameRef.update({
        status: "playing",
        player: username,
      });
      $("#board").addClass("playerBoard");
    }

    this.listen();

    this.drawCheckers();
  }
}

Checker.prototype.listen = function () {
  var obj = this;
  this.gameRef.on("value", function (snapshot) {
    var game = snapshot.val();
    if (game.status === "playing") {
      
      obj.host = game.host;
      obj.player = game.player;
      obj.turn = game.turn;
      obj.checkers = game.checkers;

      $("#gamesList").hide();
      $("#gameBoard").show();

      obj.playerName();
      obj.drawCheckers();

    }
  });
};

Checker.prototype.board = function () {
  var brd = "";
  for (var i = 0; i < 8; i++) {
    brd += '<div class="rw">';
    for (var j = 0; j < 8; j++) {
      if ((i + j) % 2 === 0)
        brd += '<div class="cl node" x="' + j + '"  y="' + i + '"></div>';
      else brd += '<div class="cl"></div>';
    }
    brd += "</div>";
  }
  return brd;
};

Checker.prototype.playerName = function () {
  if (this.userType === "host") {
    $(".competitorName").html(this.player);
    if (this.turn === "host") {
      $(".yourName").addClass("bg-success").addClass("text-white");
      $(".yourName").removeClass("bg-success").removeClass("text-white");

      $(".competitorName").addClass("bg-success").addClass("text-white");
      $(".competitorName").removeClass("bg-light");
    } else {
      $(".yourName").addClass("bg-success").addClass("text-white");
      $(".yourName").removeClass("bg-light");

      $(".competitorName").addClass("bg-light");
      $(".competitorName").removeClass("bg-success").removeClass("text-white");
    }
  } else {
    $(".competitorName").html(this.host);
    if (this.turn !== "host") {
      $(".yourName").addClass("bg-success").addClass("text-white");
      $(".yourName").removeClass("bg-success").removeClass("text-white");

      $(".competitorName").addClass("bg-success").addClass("text-white");
      $(".competitorName").removeClass("bg-light");
    } else {
      $(".yourName").addClass("bg-success").addClass("text-white");
      $(".yourName").removeClass("bg-light");

      $(".competitorName").addClass("bg-light");
      $(".competitorName").removeClass("bg-success").removeClass("text-white");
    }
  }
};

Checker.prototype.drawCheckers = function () {
  if (this.userType === "host")
    var boardStart = {
      x: 40,
      y: 80,
    };
  else
    var boardStart = {
      x: 5,
      y: 5,
    };

  var checkerStr = "";
  for (var x = 0; x < 8; x++) {
    for (var y = 0; y < 8; y++) {
      if (this.checkers[y][x] === 1)
        checkerStr +=
          '<div class="checker black" x="' +
          x +
          '" y="' +
          y +
          '" style="top:' +
          (boardStart.y + 50 * y) +
          "px; left:" +
          (boardStart.x + 50 * x) +
          'px;"></div>';
      else if (this.checkers[y][x] === 2)
        checkerStr +=
          '<div class="checker white" x="' +
          x +
          '" y="' +
          y +
          '" style="top:' +
          (boardStart.y + 50 * y) +
          "px; left:" +
          (boardStart.x + 50 * x) +
          'px;"></div>';
    }
  }
  $("#board").html(this.board + checkerStr);
};

Checker.prototype.updateChecker = function () {
  this.gameRef.update({
    checkers: this.checkers,
    turn: this.turn === "host" ? "player" : "host",
  });
};
