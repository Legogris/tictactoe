var CM = function() {
	var fbUser;
	try {
		fbUser=JSON.parse($('fbUser').get('text'));
	} catch(e) {
		fbUser=null;
	}
	
  var Init = function() {
    CM.UIManager.InitUI();
    CM.Components.Init();
    DNode(CM.NetMan).connect(function (remote) {
      CM.DN = remote;

			// null == guest
			if (fbUser) {
				CM.DN.auth({
					username: fbUser.username,
					imageUrl: "http://graph.facebook.com/"+fbUser.username+"/picture"
				});
			}
    });
  };
  return {
		FBUserInfo: fbUser,
    DN: {},
    Components: {},
    UIManager: {},
    Settings: {},
    Strings: {},
    KeyboardListener: {},
    State: {
			PlayerID: null,
      Rooms: {},
      Board: {},
      OnlinePlayers: {},
			Turn: false,
			Opponent: undefined,
			GameStarted: false,
			GameState: 0,
			ActiveCow: null,
			CowCount: undefined
    },
    DebugA: null,
    DebugB: null,

    Init: Init
  };
} ();


CM.NetMan = function() {
  return {
    playerJoined: function(user) {
      CM.State.OnlinePlayers[user.id] = user;
      CM.UIManager.UpdatePlayerList();
    },
		userUpdated: function(user) {
	    CM.State.OnlinePlayers[user.id] = user;
	    CM.UIManager.UpdatePlayerList();
	  },
    playerParted: function(user) {
			delete CM.State.OnlinePlayers[user.id];
      CM.UIManager.UpdatePlayerList();
    },
    updatePlayerList: function(players) {
			console.log("players", players);
      CM.State.OnlinePlayers = players;
      CM.UIManager.UpdatePlayerList();
    },

    updateRoom: function(room) {
      console.log('room update:', room);
      CM.State.Rooms[room.name] = room;
      CM.UIManager.UpdateRoomList();
    },
    removeRoom: function(roomID) {
      console.log('remove room:', roomID);

      delete CM.State.Rooms[roomID];
      CM.UIManager.UpdateRoomList();
    },
    updateRoomList: function(rooms) {
      CM.State.Rooms = rooms;
      console.log('rooms update:', rooms);
      CM.UIManager.UpdateRoomList();
    },
    said: function(sender, msg) {
      $('chatLog').grab(new Element('div').set('html', sender.name + ': ' + msg), 'bottom');
    },
    joinRoom: function(roomName, opponent) {
			CM.State.Opponent = opponent;
      CM.UIManager.UpdateUIJoinedRoom(roomName);
	    $('chatLog').grab(new Element('hr'));
			$('chatLog').grab(new Element('div').set('html', '<em>* now speaking in <b>'+roomName+'</b></em>'));
    },
    partRoom: function() {
      CM.UIManager.UpdateUIPartedRoom();
    },
    invalidRequest: function(msg) {
      alert("warning: " + msg);
    },
    startGame: function(boardOptions, opponent) {
			CM.State.GameState = CM.Board.GameStates.PLACE;
			CM.State.Opponent = opponent;
      CM.State.Board = new CM.Board(boardOptions);
			CM.State.PlayerID = boardOptions.playerID;
      CM.UIManager.InitGameUI();
    },
		placeCow: function(position, player) {
			console.log(position + ', ' + player);
			CM.State.Board.placeCow(position, player);
		},
		removeCow: function(position) {
			CM.State.Board.removeCow(position);
		},
		moveCow: function(fromPos, toPos) {
			CM.State.Board.moveCow(fromPos, toPos);
		},
		startTurn: function(gameState, cowCount) {
			CM.State.Turn = true;
			CM.State.CowCount = cowCount;
			CM.UIManager.UpdateGameLabels();
			CM.State.GameState = gameState;
			switch(gameState) {
				case 0: //STOPPED
					break;
				case 1: //PLACE
					break;
				case 2: //SHOOT
					$('turnState').set('html','Time to kill! Pick a cow to shoot.');
					break;
				case 3: //MOVE
						$('turnState').set('html','Move a piece! Pick a pieace and move it to a free nearby slot.');
					break;
				case 4: //FLY
						$('turnState').set('html','Time to fly! You only have three pieces left so you have the fine opportunity to move any piece Wherever you want to.');
					break;
			}
		},
		endTurn: function(cowCount) {
			CM.State.Turn = false;
			CM.State.CowCount = cowCount;
			CM.UIManager.UpdateGameLabels();
		},
		win: function() {
			alert('You win!');
			CM.State.GameState = CM.Board.GameStates.STOPPED;
		},
		lose: function() {
			alert('All your cows got shot and you will surely starve!');
			CM.State.GameState = CM.Board.GameStates.STOPPED;
		},
		draw: function() {
			alert('Oopsie daisie, game ended!');
			CM.State.GameState = CM.Board.GameStates.STOPPED;
		},
		opponentParted: function() {
			delete CM.State.opponent;
		},
		opponentJoined: function(player) {
			CM.State.opponent = player;
		},
  }
}();

CM.UIManager = function() {
  var loadAsset = function(url, onLoaded) {
    if(!Crafty.assets[url]) {
      Crafty.load([url], onLoaded);
    } else {
      onLoaded();
    }
  };

  return {
    InitGameUI: function() {
      var width = CM.Settings.ViewWidth;
      var height = CM.Settings.ViewHeight;
      Crafty.init(width, height);
      Crafty.background('#fff');
      Crafty.scene('main', CM.Scenes.Main);
      Crafty.sprite(50, CM.Settings.SpritePath + 'sprites.png', {'blank': [0, 0], 'p1': [0,1], 'p2': [0,2]});
      Crafty.load([CM.Settings.SpritePath + 'sprites.png'], function() {
        Crafty.scene('main');
      });
			$('turnState').show();
    },

    InitUI: function() {
      var chatField = new Element('input', {id: 'chatField', type: 'text', autocomplete: 'off', placeHolder: 'Chat'});
      var roomNameField = new Element('input', {id: 'roomNameField', type: 'text', autocomplete: 'off', placeholder: 'Room name'});
      var chatLog = new Element('div', {id: 'chatLog'});
      var createRoomButton = new Element('input', {id: 'createRoomButton', type: 'button', value: 'Create room'});
      var playerList = new Element('ul', {id: 'playerList'});
			var roomList = new Element('select', {id: 'roomList'});
      var joinRoomButton = new Element('input', {id: 'joinRoomButton', type: 'button', value: 'Join room'});

      var lobbyControllers = new Element('div', {id:'lobbyControllers'});
      var gameControllers = new Element('div', {id: 'gameControllers'});
			
      var activeRoom = new Element('div', {id: 'activeRoom'});
      var partRoomButton = new Element('input', {id: 'partRoomButton', type: 'button', value: 'Part room'});
			var gameState = new Element('span', {id: 'gameState'});
			var turnState = new Element('span', {id: 'turnState'});
			var cowCount = new Element('span', {id: 'cowCount'});
			
      createRoomButton.addEventListener('click', function(e) {
        CM.DN.joinRoom(roomNameField.value);
      });
      joinRoomButton.addEventListener('click', function(e) {
        CM.DN.joinRoom(roomList.value);
      });
      partRoomButton.addEventListener('click', function(e) {
        CM.DN.partRoom();
      });
      lobbyControllers.adopt(playerList, roomNameField, createRoomButton, roomList, joinRoomButton);
      gameControllers.adopt(gameState, turnState, cowCount, activeRoom, partRoomButton);
			gameControllers.hide();
			turnState.hide();
      $('controlPanel').adopt(lobbyControllers, chatField, chatLog);
      $('gamePanel').adopt(gameControllers);
      var keyboardListener = new Keyboard({
        active: true
      });
      keyboardListener.addEvents({
          'ctrl+shift': function() {
          if(document.activeElement == chatField) {
            chatField.blur();
          } else {
            chatField.focus();
          }
        },
        'enter': function() {
          if(document.activeElement == chatField) {
            CM.DN.say(chatField.value);
            chatField.value = '';
          }
        }
      });
      CM.UIManager.KeyboardListener = keyboardListener;
    },
		UpdateGameLabels: function() {
			if (CM.State.Opponent) {
				$('turnState').set('html', CM.State.Turn ? 'Your turn' : ('Waiting for ' + CM.State.Opponent.name));
			}

			$('gameState').set('html', CM.State.Opponent ? 'Playing against ' + CM.State.Opponent.name + '.' : 'Waiting for opponent')

			if (CM.State.CowCount != undefined) {
				$('cowCount').set('html', 'Cows left: ' + CM.State.CowCount);
			}
		},

    UpdateUIJoinedRoom: function(roomName) {
        $('activeRoom').set('html', 'Now in <span class="roomName">'+roomName+'<span>');
				$('turnState').set('html', '');
        $('lobbyControllers').hide();
        $('gameControllers').show();
				CM.UIManager.UpdateGameLabels();
    },

    UpdateUIPartedRoom: function() {
			location.href="/";
      $('activeRoom').set('html', 'Now in <span class="lobby">lobby</span>');
      $('lobbyControllers').show();
      $('gameControllers').hide();
    },

    UpdatePlayerList: function() {
      var ul = $('playerList');
      ul.empty();
			for (var userID in CM.State.OnlinePlayers) {
				var user = CM.State.OnlinePlayers[userID];
				if (user.imageUrl) {
	      	ul.grab(new Element('li').set('html', '<img src="'+user.imageUrl+'"> ' + user.name));
				} else {
		      ul.grab(new Element('li', {text: user.name}));
				}
			}
    },

    UpdateRoomList: function() {
      var el = $('roomList');
      el.empty();
      for(var i in CM.State.Rooms) {
        var room = CM.State.Rooms[i];
        el.grab(new Element('option', {text: room.name + "("+room.players.length+"/"+room.maxPlayers+")", value:room.name}));
      }
    }
  };
}();


CM.Scenes = function() {
  return {
    Loading: function () {
    },
    Main: function () {
      var bg = Crafty.e("2D, DOM, Image").attr({w: Crafty.viewport.width, h: Crafty.viewport.height, x: 22, y: 22}).image(CM.Settings.StageBackground);
      for(var y = CM.State.Board.length; y > 0; y--) {
        CM.State.Board.letters.each(function(xl, x) {
          var id = xl + y;
          if(CM.State.Board.holes.contains(id)) {
            var xPos = 64 + x*CM.Settings.BoardWidth/CM.State.Board.length;
            var yPos = 56 + (y-1)*CM.Settings.BoardHeight/CM.State.Board.length;
            var h = Crafty.e("cow").attr({x: xPos, y: yPos});
						h.cowId = id;
						CM.State.Board.entities[id] = h;
          }
        });
      }
    }
  };
} ();
window.addEvent('domready', CM.Init);
