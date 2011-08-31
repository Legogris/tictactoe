CM.Board = new Class({
	Implements: [Options],
	holes: ['a7', 'd7', 'g7', 'b6', 'd6', 'f6', 'c5', 'd5', 'e5', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'c3', 'd3', 'e3', 'b2', 'd2', 'f2', 'a1', 'd1', 'g1'],
	letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
	entities: {},
	length: 7,
	field: {},
	options: {
		onUpdate: function(options) {
			this.setOptions(options);
		}
	},
	initialize: function(options) {
		var self = this;
		self.setOptions(options);
		self.holes.each(function(position) {
			self.field[position] = {};
		});
	},
	placeCow: function(position, player) {
		this.field[position] = player;
		this.entities[position].animate('p'+player, 1);
		this.entities[position].removeComponent('trans');
	},
	removeCow: function(position) {
		delete this.field[position];
		this.entities[position].animate('blank', 1);
		this.entities[position].removeComponent('trans');
	},
	moveCow: function(fromPos, toPos) {
		this.placeCow(toPos, this.field[fromPos]);
		this.removeCow(fromPos);
		CM.State.ActiveCow=null;
	},
	isOccupied: function(position) {
		return !!this.field[position];
	}
});


CM.Board.extend({
	GameStates: {
		STOPPED: 0,
		PLACE: 1,
		SHOOT: 2,
		MOVE: 3,
		FLY: 4
	}
});