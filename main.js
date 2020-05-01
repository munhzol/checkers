$(document).ready(function () {
  var gameKey = "";
  var username = "";
  var userType = "";

  var dbRef = firebase.database();
  var gamesRef = dbRef.ref("games");
  var myGamesRef;

  var game;

  feather.replace();

  $(document).on("click", "#btnSaveUsername", function () {
    if ($("#username").val() === "") {
      alert("Please insert your username");
      $("#username").addClass("required");
      $("#username").focus();
      $("#username").select();
    } else {
      $("#username").removeClass("required");
      $("#frmUsername").hide();
      $(".aRowWithUsername").show();
      username = $("#username").val();
      $("#theUsername").html(username);
      $(".aRowWithoutUsername").hide();
    }
  });

  $(document).on("click", "#btnShowSetUsername", function () {
    $("#frmUsername").show();
    $(".aRowWithoutUsername").hide();
  });

  $(document).on("click", "#btnEditUsername", function () {
    $("#frmUsername").show();
    $(".aRowWithoutUsername").hide();
    $(".aRowWithUsername").hide();
  });

  $(document).on("click", "#btnCancelUsername", function () {
    $("#frmUsername").hide();
    $(".aRowWithoutUsername").show();
  });

  $(document).on("click", "#btnCreateGame", function () {
    if (username === "") {
      alert("Please set your username");
    } else {
      game = new Checker("host", username);
    }
  });

  $(document).on("dblclick", ".playWith", function () {
    if (username === "") {
      alert("Please set your Username");
      return;
    }
    gameKey = $(".playWith").attr("gameKey");

    game = new Checker("player", username, gameKey);
  });

  $(document).on("dblclick", ".reset", function () {
    // var gameRef = dbRef.ref('games/' + $('.reset').attr('gameKey'));
    // gameRef.once('value').then(function (snapshot) {
    //     var game = snapshot.val();
    //     gameRef.set({
    //         host: game.host,
    //         // player: username,
    //         status: 'waiting'
    //     });
    //     myGamesRef = null;
    // });
  });

  gamesRef.on(
    "value",
    function (snapshot) {
      $("#gamesWaiting").html("");
      $("#gamesPlaying").html("");
      $("#gamesPast").html("");
      var cntWaiting = 0;
      var cntPlaying = 0;
      snapshot.forEach(function (child) {
        var obj = child.val();
        if (obj.status === "waiting") {
          $("#gamesWaiting").append(
            '<li class="list-group-item list-group-item-action playWith" gameKey="' +
              child.key +
              '">Play with ' +
              obj.host +
              "</li>"
          );
          cntWaiting++;
          $("#cntWaiting").html(cntWaiting);
        } else if (obj.status === "playing") {
          $("#gamesPlaying").append(
            '<li class="list-group-item list-group-item-action reset" gameKey="' +
              child.key +
              '">' +
              obj.host +
              " vs " +
              obj.player +
              "</li>"
          );
          cntPlaying++;
          $("#cntPlaying").html(cntPlaying);
        } else if (obj.status === "past") {
          $("#gamesPast").append(
            '<li class="list-group-item list-group-item-action" gameKey="' +
              child.key +
              '">' +
              obj.host +
              " vs " +
              obj.player +
              "</li>"
          );
        }
      });
    },
    function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );

  $(document).on("click", "#btnPlay", function () {
    myGamesRef = dbRef.ref("games/" + gameKey);

    userType = getQueryString("type") === null ? "host" : "player";

    if (userType === "player") {
      $("#board").addClass("playerBoard");
    }
  });

  // select checker
  $(document).on("click", ".checker", function (e) {
    var seld = {
      x: parseInt($(e.target).attr("x")),
      y: parseInt($(e.target).attr("y")),
    };

    console.log(seld);

    if (game.userType === "host" && game.checkers[seld.y][seld.x] !== 2) {
      return;
    } else if (
      game.userType !== "host" &&
      game.checkers[seld.y][seld.x] !== 1
    ) {
      return;
    }

    if (game.turn === "host" && game.checkers[seld.y][seld.x] === 2) {
      return;
    } else if (game.turn !== "host" && game.checkers[seld.y][seld.x] === 1) {
      return;
    }

    // if (checkers[seld.y][seld.x] === whoseTurn) {
    game.seldChecker = seld;
    $(".seld").removeClass("seld");
    $(e.target).addClass("seld");
    // }
  });

  // move checker
  $(document).on("click", ".node", function (e) {
    // check any checker has selected
    if ($(".seld").length > 0) {
      var direction = 1;
      if ($(".seld").hasClass("white")) {
        direction = -1;
      }

      var moveTo = {
        x: parseInt($(e.target).attr("x")),
        y: parseInt($(e.target).attr("y")),
      };

      // Check is the moveto node empty
      if (game.checkers[moveTo.y][moveTo.x] !== 0) {
        return false;
      }

      // Check eats
      if (
        Math.abs(game.seldChecker.y - moveTo.y) == 2 &&
        Math.abs(game.seldChecker.x - moveTo.x) == 2
      ) {
        var victim = {
          x: game.seldChecker.x + (game.seldChecker.x < moveTo.x ? 1 : -1),
          y: game.seldChecker.y + (game.seldChecker.y < moveTo.y ? 1 : -1),
        };
        if (
          game.checkers[victim.y][victim.x] !=
            game.checkers[game.seldChecker.y][game.seldChecker.x] &&
          game.checkers[victim.y][victim.x] > 0
        ) {
          game.checkers[victim.y][victim.x] = 0;
          game.checkers[moveTo.y][moveTo.x] =
            game.checkers[game.seldChecker.y][game.seldChecker.x];
          game.checkers[game.seldChecker.y][game.seldChecker.x] = 0;
          game.updateChecker();
        }
      } else if (game.seldChecker.y + direction != moveTo.y) {
        // Check is the moveto node empty
        return false;
      } else {
        game.checkers[moveTo.y][moveTo.x] =
          game.checkers[game.seldChecker.y][game.seldChecker.x];
        game.checkers[game.seldChecker.y][game.seldChecker.x] = 0;

        game.updateChecker();
      }
    }
  });


  // $( window ).unload(function() {    
  //   return "Handler for .unload() called.";
  // });


});

var getQueryString = function (field, url) {
  var href = url ? url : window.location.href;
  var reg = new RegExp("[?&]" + field + "=([^&#]*)", "i");
  var string = reg.exec(href);
  return string ? string[1] : null;
};
