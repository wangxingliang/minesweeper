;
(function($) {

	window.oncontextmenu = function() {
		return false;
	};

	var LEVEL = {
		L : {
			x : 9,
			y : 9,
			mines : 10,
			name: 'L'
		},
		M : {
			x : 16,
			y : 16,
			mines : 40,
			name: 'M'
		},
		H : {
			x : 30,
			y : 16,
			mines : 99,
			name: 'H'
		}
	};

	var level = LEVEL.L, $gamezone, data = [];
	var isGameOver = false, firstClick = true, timer, s_time = 0;

	var remain_maines = level.mines;

	var eventAction = {
		hoverOn : function() {
			$(this).addClass('hover');
		},

		hoverOff : function() {
			$(this).removeClass('hover');
		},

		quickSweep : function(event) {
			var $this = $(this);
			var id = $this.attr('id');
			var ids = id.split('_');
			var i = parseInt(ids[1], 10), j = parseInt(ids[3], 10);

			if (!$this.hasClass('selected'))
				return;

			var flagedMaines = 0, mines = 0;
			var arround = [ [ i - 1, j - 1 ], [ i - 1, j ], [ i - 1, j + 1 ],
					[ i, j - 1 ],
					// [i,j],
					[ i, j + 1 ], [ i + 1, j - 1 ], [ i + 1, j ],
					[ i + 1, j + 1 ] ];

			$.each(arround, function(index, value) {
				var x = parseInt(value[0], 10), y = parseInt(value[1], 10);
				if (x < 0 || x >= level.y || y < 0 || y >= level.x)
					return;

				if (data[x][y] == -99)
					mines++;
				var tid = "#row_" + x + "_col_" + y;
				if ($(tid).hasClass('maineFlg'))
					flagedMaines++;
			});

			if (mines != flagedMaines)
				return;

			$.each(arround, function(index, value) {
				var x = parseInt(value[0], 10), y = parseInt(value[1], 10);
				var id = "#row_" + x + "_col_" + y;
				$(id).trigger('click.sweep');
			});
			
			core.isWin();
		},

		sweep : function() {

			if (firstClick) {
				firstClick = false;
				timer = setInterval(function() {
					s_time++;
					$('#s_time').text(s_time + '');
				}, 1000);
			}

			var $this = $(this);
			var ids = $this.attr('id').split('_');
			var row = parseInt(ids[1], 10), col = parseInt(ids[3], 10);

			if ($this.hasClass('selected') || $this.hasClass('maineFlg')) {
				return;
			}

			if (data[row][col] == -99) {
				$this.addClass('selected');
				$this.text('BB');
				if (!isGameOver)
					core.gameOver(false);
			} else if (data[row][col] == 0) {
				if (!isGameOver) {
					$this.addClass('selected');
					var txt = data[row][col] || '';
					$this.text(txt);
					core.dispBlankArround(row, col);
				}
			} else {
				if (!isGameOver) {
					$this.addClass('selected');
					var txt = data[row][col] || '';
					$this.text(txt);
				}
			}
			
			core.isWin();

		},

		mark : function(event) {
			if (event.which == 3) {
				if ($(this).hasClass('selected'))
					return;

				if ($(this).hasClass('maineFlg')) {
					$(this).removeClass('maineFlg');
					remain_maines++;
					if (remain_maines > level.mines)
						remain_maines = level.mines;
				} else {
					$(this).addClass('maineFlg');
					remain_maines--;
					if (remain_maines <= 0)
						remain_maines = 0;
				}

				$('#mains').text(remain_maines);
				core.isWin();
			}
		}
	};

	var core = {
		initMaineArround : function(level) {
			for ( var i = 0; i < level.y; i++) {
				for ( var j = 0; j < level.x; j++) {
					core._initMaineArroundByIndex(i, j, level);

				}
			}
		},

		_initMaineArroundByIndex : function(i, j, level) {
			var mines = 0;
			var arround = [ [ i - 1, j - 1 ], [ i - 1, j ], [ i - 1, j + 1 ],
					[ i, j - 1 ], [ i, j ], [ i, j + 1 ], [ i + 1, j - 1 ],
					[ i + 1, j ], [ i + 1, j + 1 ] ];

			$.each(arround, function(index, value) {
				var x = value[0], y = value[1];
				if (x < 0 || x >= level.y || y < 0 || y >= level.x)
					return;

				if (data[x][y] == -99)
					mines++;
			});

			if (data[i][j] != -99)
				data[i][j] = mines;

		},

		// create mines on random
		initMaines : function(level) {
			var mines = 0;
			while (mines < level.mines) {
				var i = Math.floor(Math.random() * (level.y - 1));
				var j = Math.floor(Math.random() * (level.x - 1));
				if (data[i][j] == -1) {
					data[i][j] = -99;
					mines++;
				}

			}
		},

		// create game zone and init map data
		createGameZone : function(level) {
			var tableHtml = '<table id="t_game">';
			for ( var i = 0; i < level.y; i++) {
				tableHtml += '<tr id="row_' + i + '">';
				data[i] = [];
				for ( var j = 0; j < level.x; j++) {
					tableHtml += '<td id="row_' + i + '_col_' + j + '"></td>';
					data[i][j] = -1;
				}
				tableHtml += '</tr>';
			}
			tableHtml += '</table>';

			$gamezone.html(tableHtml);
		},

		dispBlankArround : function(i, j) {
			var arround = [ [ i - 1, j - 1 ], [ i - 1, j ], [ i - 1, j + 1 ],
					[ i, j - 1 ],
					// [i,j],
					[ i, j + 1 ], [ i + 1, j - 1 ], [ i + 1, j ],
					[ i + 1, j + 1 ] ];
			var arround_blank = [];
			$.each(arround, function(index, value) {
				var x = parseInt(value[0], 10), y = parseInt(value[1], 10);
				if (x < 0)
					return;
				if (x >= level.y)
					return;
				if (y < 0)
					return;
				if (y >= level.x)
					return;

				if (data[x][y] != -99) {
					arround_blank.push(value);
				}

			});

			$.each(arround_blank, function(index, value) {
				var x = parseInt(value[0], 10), y = parseInt(value[1], 10);
				var id = "#row_" + x + "_col_" + y;
				$(id).trigger('click.sweep');
			});
		},
		
		isWin: function(){
			if(remain_maines != 0) return false;			
			
			
			for ( var i = 0; i < level.y; i++) {
				for ( var j = 0; j < level.x; j++) {
					var id = "#row_" + i + "_col_" + j;
					if($(id).hasClass('maineFlg')){
						if(data[i][j] != -99) return false;
					}

				}
			}
			core.gameOver(true);
			return true;
		},

		gameOver : function(isWin) {
			if (!isGameOver) {
				isGameOver = true;
				$('td').trigger('click.sweep').off('click.sweep').off(
						'hover.sweep').off('mousedown.sweep').off(
						'dblclick.sweep');
				clearInterval(timer);
				if(isWin){
					alert('you were win!');
				}else{
					alert('you were lost!');
				}
				

			}

		},

		init : function(lvl) {
			$gamezone = $('#gameZone');

			remain_maines = lvl.mines;
			$('#mains').text(remain_maines);

			firstClick = true;
			isGameOver = false;
			clearInterval(timer);
			s_time = 0;
			$('#s_time').text(s_time + "");
			
			$('input[name="level"]').val([lvl.name]);

			$('td').off('click.sweep').off('hover.sweep')
					.off('mousedown.sweep').off('dblclick.sweep');

		},

		gameStart : function(lvl) {

			level = lvl || level;

			core.init(level);
			// create game zone and init map data
			core.createGameZone(level);

			// create mines on random
			core.initMaines(level);

			core.initMaineArround(level);

			$('td').on('hover.sweep', eventAction.hoverOn,
							eventAction.hoverOff);

			$('td').on('dblclick.sweep', eventAction.quickSweep);

			// sweep maine
			$('td').on('click.sweep', eventAction.sweep);

			// right mouse key for mark the maine
			$('td').on('mousedown.sweep', eventAction.mark);
		}

	};

	$(document).ready(function() {
		core.gameStart();
		
		$('input[name="level"]:radio').on('change', function(){
			core.gameStart(LEVEL[$(this).val()]);
		});
	});

})(jQuery);
