CM.Components = function() {
  return {
    Init: function() {
			Crafty.c('cow', {
				init: function() {
					
					this.requires("2D, DOM, blank, Mouse, SpriteAnimation");
					this.animate('blank', 0, 0, 0).animate('p1', 1, 0, 1).animate('p2', 2, 0, 2);
					this.attr({
						width: CM.Settings.CowWidth,
						height: CM.Settings.CowHeight
					});
					var self=this;
					
					this.isSelected = false;
					this.bind('Click', function(e) {
						console.log("GameState: ", CM.State.GameState);
						switch (CM.State.GameState) {
							case CM.Board.GameStates.PLACE:
							case CM.Board.GameStates.SHOOT:
								CM.DN.clickHole(self.cowId);
								break;
							case CM.Board.GameStates.MOVE:	
							case CM.Board.GameStates.FLY:
								if (CM.State.ActiveCow == null) {
									if (!CM.State.Turn) {
										alert("It's not your turn!");
										break;
									}
									// check that we own this slot
									if (CM.State.Board.field[this.cowId] != CM.State.PlayerID) {
										//alert("You have to move one of your own cows");
										break;
									}
								}
								// @todo check that it's my cow
								if (CM.State.ActiveCow) {
									if (CM.State.ActiveCow == this.cowId) {
										console.log("Deselected cow %s", this.cowId);
										// Deselect this
										this.removeComponent('trans');
										CM.State.ActiveCow = null;
										break;
									}
									console.log("Moving cow %s to %s", CM.State.ActiveCow, this.cowId);
									// Try to move the cow
									CM.DN.moveCow(CM.State.ActiveCow, this.cowId);
									CM.State.ActiveCow = null;
									break;
								}	
								console.log("Selected cow %s", this.cowId);
								// Set this cow as the selected one
								this.addComponent('trans');
								CM.State.ActiveCow = this.cowId;
								break;
						}
						
					});
				}
			});
    }
  };
} ();