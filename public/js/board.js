var CM = function() {
  var Init = function() {
    CM.UIManager.InitUI();
    CM.Components.Init();
  };
  return {
    DN: {},
    Components: {},
    UIManager: {},
    Settings: {},
    Strings: {},
    KeyboardListener: {},
    State: {
      Rooms: {},
      Board: {},
      OnlinePlayers: {},
			Turn: false,
			Opponent: undefined,
			GameStarted: false,
			GameState: 0
    },
    DebugA: null,
    DebugB: null,

    Init: Init
  };
} ();


CM.NetMan = function() {
  return {
  };
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
      Crafty.load([CM.Settings.SpritePath + 'sprites.png'], function() {
        Crafty.scene('main');
      });
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
			
      createRoomButton.addEventListener('click', function(e) {
      });
      joinRoomButton.addEventListener('click', function(e) {
      });
      partRoomButton.addEventListener('click', function(e) {
      });
      lobbyControllers.adopt(playerList, roomNameField, createRoomButton, roomList, joinRoomButton);
      gameControllers.adopt(gameState, turnState, activeRoom, partRoomButton);
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

			$('gameState').set('html', CM.State.Opponent ? 'Playing against ' + CM.State.Opponent.name + '.' : 'Waiting for opponent');
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
    }
  };
} ();
window.addEvent('domready', CM.Init);