function win_load() {
	var ASSETS = ["otterCat_c_arms.png",
		"otterCat_c_idle.png",
		"otterCat_c_modGrenade.png",
		"otterCat_c_run.png",
		"otterCat_k_arms.png",
		"otterCat_k_idle.png",
		"otterCat_k_modGrenade.png",
		"otterCat_k_run.png",
		"otterCat_m_arms.png",
		"otterCat_m_idle.png",
		"otterCat_m_modGrenade.png",
		"otterCat_m_run.png",
		"otterCat_y_arms.png",
		"otterCat_y_idle.png",
		"otterCat_y_modGrenade.png",
		"otterCat_y_run.png",
		"background.png",
		"block.png"],
		SPRITES = [],
		ASSET_ERRORS = 0,
		ASSET_LOADS = 0,
		i,
		j;

	function assets_loaded() {
		var WS = new WebSocket("wss://mewnition.herokuapp.com");
		var BG_HEIGHT = 2304;
		var BG_WIDTH = 1920;
		var BG_COUNT = 3;
		var CANVAS_WIDTH = BG_COUNT * BG_WIDTH;
		var CANVAS_HEIGHT = BG_HEIGHT;
		var VIEW_WIDTH = BG_WIDTH / 2;
		var VIEW_HEIGHT = VIEW_WIDTH * window.screen.height / window.screen.width;
		var VIEW_HWIDTH = VIEW_WIDTH / 2;
		var VIEW_HHEIGHT = VIEW_HEIGHT / 2;
		var TILE_SIZE = 24;
		var TILE_WIDTH = CANVAS_WIDTH / TILE_SIZE;
		var TILE_HEIGHT = CANVAS_HEIGHT / TILE_SIZE;
		var tiles = [];
		var tile_updates = [];
		for( i = 0; i < TILE_HEIGHT; i++ ) {
			tiles.push( [] );
			for( j = 0; j < TILE_WIDTH; j++ ) {
				tiles[ i ].push( false );
			}
		}

		var PLAYER_HEIGHT = 96;
		var PLAYER_HHEIGHT = PLAYER_HEIGHT / 2;
		var PLAYER_WIDTH = 96;
		var PLAYER_HWIDTH = PLAYER_WIDTH / 2;
		var ARM_OFFSET_X = 16;
		var ARM_OFFSET_Y = 16;

		var GRENADE_HEIGHT = 30;
		var GRENADE_HHEIGHT = GRENADE_HEIGHT / 2;
		var GRENADE_WIDTH = 30;
		var GRENADE_HWIDTH = GRENADE_WIDTH / 2;

		var GRAVITY = .006;
		var JUMP_DY = -1.8;
		var PLAYER_DX = .5;
		var SHOT_GRAVITY = .003;
		var SHOT_VELOCITY = 1.4;
		var SHOT_COOLDOWN = 1000 * 5;

		var IDLE_FPS = 120;
		var RUN_FPS = 60;

		var PLAYER_COUNT = 4;
		var ME = 3;

		var A_DOWN = false;
		var D_DOWN = false;
		var SPACE_DOWN = false;

		var LEFT_MB_DOWN = false;
		var MID_MB_DOWN = false;
		var RIGHT_MB_DOWN = false;

		var ANGLES = [];
		for( i = 0; i < 360; i++ ) {
			ANGLES.push( [] );
			ANGLES[ i ].push( i / 180 * Math.PI );
			ANGLES[ i ].push( Math.cos( i / 180 * Math.PI ) );
			ANGLES[ i ].push( Math.sin( i / 180 * Math.PI ) );
		}

		function Player( pid ) {
			this.x = pid * BG_WIDTH / 2;
			this.y = CANVAS_HEIGHT - PLAYER_HEIGHT;
			this.dx = 0;
			this.dy = 0;
			this.anim = "idle";
			this.frame = 0;
			this.last_frame = -1;
			this.arm = 0;
			this.running = false;
			this.right = true;
			this.hitboxes = [];
			this.jumping = false;
			this.last_shot = -1;
		}

		function Grenade() {
			this.x = 0;
			this.y = 0;
			this.dx = 0;
			this.dy = 0;
			this.active = false;
			this.hitboxes = [];
		}

		function Boss() {
			this.x = 0;
			this.y = 0;
			this.hitboxes = [];
		}

		function Anvil() {
			this.x = 0;
			this.y = 0;
			this.hitboxes = [];
		}

		var players = [];
		players.push( new Player( 0 ) );
		players.push( new Player( 1 ) );
		players.push( new Player( 2 ) );
		players.push( new Player( 3 ) );

		var grenades = [];
		grenades.push( new Grenade() );
		grenades.push( new Grenade() );
		grenades.push( new Grenade() );
		grenades.push( new Grenade() );

		var boss = new Boss();

		var anvil = new Anvil();

		var CANVAS_BG = document.createElement( "canvas" );
		CANVAS_BG.width = CANVAS_WIDTH;
		CANVAS_BG.height = CANVAS_HEIGHT;
		var CTX_BG = CANVAS_BG.getContext( "2d" );

		for( i = 0; i < BG_COUNT; i++ ) {
			CTX_BG.drawImage( SPRITES[ 16 ], 0, 0, BG_WIDTH, BG_HEIGHT, i * BG_WIDTH, 0, BG_WIDTH, BG_HEIGHT );
		}

		var CANVAS_TILE = document.createElement( "canvas" );
		CANVAS_TILE.width = CANVAS_WIDTH;
		CANVAS_TILE.height = CANVAS_HEIGHT;
		var CTX_TILE = CANVAS_TILE.getContext( "2d" );
		var TILE_IMG = SPRITES[ 17 ];

		var CANVAS_ENT = document.createElement( "canvas" );
		CANVAS_ENT.width = CANVAS_WIDTH;
		CANVAS_ENT.height = CANVAS_HEIGHT;
		var CTX_ENT = CANVAS_ENT.getContext( "2d" );

		var CANVAS_VIEW = document.getElementById( "viewport" );
		CANVAS_VIEW.width = VIEW_WIDTH;
		CANVAS_VIEW.height = VIEW_HEIGHT;
		var CTX_VIEW = CANVAS_VIEW.getContext( "2d" );
		var view_x = 0;
		var view_y = 0;
		var cursor_vx = 0;
		var cursor_vy = 0;
		var cursor_x = 0;
		var cursor_y = 0;

		var HB_PLAYER_TOP = 21;
		var HB_PLAYER_BOT = 96;
		var HB_PLAYER_RLEFT = 36;
		var HB_PLAYER_RRIGHT = 63;
		var HB_PLAYER_LLEFT = 33;
		var HB_PLAYER_LRIGHT = 60;

		var HB_GRENADE_TOP = 0;
		var HB_GRENADE_BOT = 30;
		var HB_GRENADE_LEFT = 0;
		var HB_GRENADE_RIGHT = 30;

		var last_ts = -1, ticks, curr_ts;
		function update_player( id ) {
			var p, new_x, new_y, new_dx = 0, new_dy = 0;
			if( PLAYER_COUNT > id ) {
				p = players[ id ];
				new_x = p.x;
				new_y = p.y;
				new_dx = p.dx;
				new_dy = p.dy;
				var last_running = p.running;
				var last_jumping = p.jumping;
				if( id == ME ) {
					if( A_DOWN && !D_DOWN ) {
						p.running = true;
						new_dx = -PLAYER_DX;
					} else if( !A_DOWN && D_DOWN ) {
						p.running = true;
						new_dx = PLAYER_DX;
					} else p.running = false;
					if( !p.jumping && SPACE_DOWN ) {
						if( p.dy == 0 ) {
							p.jumping = true;
							new_dy = JUMP_DY;
						}
					}
				}
				new_dy += ticks * GRAVITY;
				if( p.running ) {
					p.anim = "run";
				} else {
					new_dx = 0;
					p.anim = "idle";
				}
				var right = HB_PLAYER_LRIGHT;
				var left = HB_PLAYER_LLEFT;
				if( p.right ) {
					right = HB_PLAYER_RRIGHT;
					left = HB_PLAYER_RLEFT;
				}
				var done = false;
				new_x += new_dx * ticks;
				if( new_x > p.x ) {
					var boundary = ( ( new_x + right ) / TILE_SIZE ) | 0;
					var axis = ( ( p.y + HB_PLAYER_TOP ) / TILE_SIZE ) | 0;
					var axis2 = ( ( p.y + PLAYER_HEIGHT ) / TILE_SIZE ) | 0;
					for( i = ( ( p.x + right ) / TILE_SIZE ) | 0; i <= boundary; i++ ) {
						for( j = axis; j < axis2; j++ ) {
							if( tiles[ j ][ i % TILE_WIDTH ] ) {
								new_x = i * TILE_SIZE - right;
								new_dx = 0;
								done = true;
								break;
							}
						}
						if( done ) break;
					}
				} else if( new_x < p.x ) {
					var boundary = ( ( new_x + left ) / TILE_SIZE ) | 0;
					var axis = ( ( p.y + HB_PLAYER_TOP ) / TILE_SIZE ) | 0;
					var axis2 = ( ( p.y + PLAYER_HEIGHT ) / TILE_SIZE ) | 0;
					for( i = ( ( p.x + left ) / TILE_SIZE ) | 0; i >= boundary; i-- ) {
						for( j = axis; j < axis2; j++ ) {
							if( tiles[ j ][ i ] ) {
								new_x = ( i + 1 ) * TILE_SIZE - left;
								new_dx = 0;
								done = true;
								break;
							}
						}
						if( done ) break;
					}
				}
				new_x = new_x % CANVAS_WIDTH;
				if( new_x < 0 ) new_x = CANVAS_WIDTH - 1;
				new_y += new_dy * ticks;
				done = false;
				if( new_y + PLAYER_HEIGHT > CANVAS_HEIGHT ) {
					new_y = CANVAS_HEIGHT - PLAYER_HEIGHT;
					new_dy = 0;
					p.jumping = false;
				} else if( new_y < 0 ) {
					new_y = 0;
					new_dy = 0;
				} else {
					if( new_y > p.y ) {
						var boundary = ( ( new_y + PLAYER_HEIGHT ) / TILE_SIZE ) | 0;
						var axis = ( ( p.x + left ) / TILE_SIZE ) | 0;
						var axis2 = ( ( p.x + right - 1 ) / TILE_SIZE ) | 0;
						for( j = ( ( p.y + PLAYER_HEIGHT ) / TILE_SIZE ) | 0; j <= boundary; j++ ) {
							for( i = axis; i <= axis2; i++ ) {
								if( tiles[ j ][ i % TILE_WIDTH ] ) {
									new_y = j * TILE_SIZE - PLAYER_HEIGHT;
									new_dy = 0;
									p.jumping = false;
									done = true;
									break;
								}
							}
							if( done ) break;
						}
					} else if( new_y < p.y ) {
						var boundary = ( ( new_y + HB_PLAYER_TOP ) / TILE_SIZE ) | 0;
						var axis = ( ( p.x + left ) / TILE_SIZE ) | 0;
						var axis2 = ( ( p.x + right - 1 ) / TILE_SIZE ) | 0;
						for( j = ( p.y / TILE_SIZE ) | 0; j >= boundary; j-- ) {
							for( i = axis; i <= axis2; i++ ) {
								if( tiles[ j ][ i ] ) {
									new_y = ( j + 1 ) * TILE_SIZE - HB_PLAYER_TOP;
									new_dy = 0;
									done = true;
									break;
								}
							}
							if( done ) break;
						}
					}
				}
				p.dx = new_dx;
				p.dy = new_dy;
				p.x = new_x;
				p.y = new_y;
				if( ME == id && ( last_running && !p.running || !last_running && p.running ) ) {
					WS.send( String.fromCharCode( 0x2 ) + String.fromCharCode( ME ) + JSON.stringify( players[ ME ] ) );
				} else if( last_jumping && !p.jumping || !last_jumping && p.jumping ) {
					WS.send( String.fromCharCode( 0x2 ) + String.fromCharCode( ME ) + JSON.stringify( players[ ME ] ) );
				}
			}
		}

		function update_grenade( id ) {
			var p, g, new_x = 0, new_y = 0, new_dx = 0, new_dy = 0;
			if( PLAYER_COUNT > id ) {
				g = grenades[ id ];
				p = players[ id ];
				if( g.active ) {
					new_x = g.x;
					new_y = g.y;
					new_dx = g.dx;
					new_dy = g.dy;
					new_dy += SHOT_GRAVITY * ticks;
					new_x += new_dx * ticks;
					new_y += new_dy * ticks;
				} else if( id == ME ) {
					if( LEFT_MB_DOWN ) {
						var passed;
						if( p.last_shot == -1 ) p.last_shot = curr_ts - SHOT_COOLDOWN;
						passed = curr_ts - p.last_shot;
						if( passed >= SHOT_COOLDOWN ) {
							new_dx = ANGLES[ p.arm ][ 1 ];
							new_dy = ANGLES[ p.arm ][ 2 ];
							new_x = p.x + 32 + new_dx * 20;
							new_y = p.y + 38 + new_dy * 20;
							new_dx *= SHOT_VELOCITY;
							new_dy *= SHOT_VELOCITY;
							g.active = true;
							p.last_shot = curr_ts;
						}
					}
				}
				new_x %= CANVAS_WIDTH;
				if( new_x < 0 ) new_x += CANVAS_WIDTH;
				if( new_y < 0 ) new_y += CANVAS_HEIGHT;
				var tile_ul_x = ( new_x / TILE_SIZE ) | 0, tile_ul_y = ( new_y / TILE_SIZE ) | 0;
				var tile_ur_x = ( ( new_x + GRENADE_WIDTH ) / TILE_SIZE ) | 0, tile_ur_y = ( new_y / TILE_SIZE ) | 0;
				var tile_br_x = ( ( new_x + GRENADE_WIDTH ) / TILE_SIZE ) | 0, tile_br_y = ( ( new_y + GRENADE_HEIGHT ) / TILE_SIZE ) | 0;
				var tile_bl_x = ( new_x / TILE_SIZE ) | 0, tile_bl_y = ( ( new_y + GRENADE_HEIGHT ) / TILE_SIZE ) | 0;
				var explode = false, explode_x = ( ( new_x + GRENADE_HWIDTH ) / TILE_SIZE ) | 0, explode_y = ( ( new_y + GRENADE_HWIDTH ) / TILE_SIZE ) | 0;
				if( new_y + GRENADE_HEIGHT >= CANVAS_HEIGHT ) {
					g.active = false;
					explode = true;
					explode_y = TILE_HEIGHT - 1;
				} else if( tiles[ tile_ul_y ][ tile_ul_x ] ) {
					g.active = false;
					explode = true;
				} else if( tiles[ tile_ur_y ][ tile_ur_x ] ) {
					g.active = false;
					explode = true;
				} else if( tiles[ tile_br_y ][ tile_br_x ] ) {
					g.active = false;
					explode = true;
				} else if( tiles[ tile_bl_y ][ tile_bl_x ] ) {
					g.active = false;
					explode = true;
				} else if( new_y <= 0 ) {
					g.active = false;
					explode = true;
				}
				var rad;
				if( explode ) {
					for( j = explode_y - 3; j <= explode_y + 3; j++ ) {
						rad = Math.max( Math.abs( explode_y - j ) - 1, 0 );
						for( i = explode_x - ( 3 - rad ); i <= explode_x + ( 3 - rad ); i++ ) {
							if( j >= 0 && j < TILE_HEIGHT ) {
								new_x = i;
								new_x %= TILE_WIDTH;
								if( new_x < 0 ) new_x += TILE_WIDTH;
								tile_updates.push( [ new_x, j, false ] );
							}
						}
					}
				}
				if( g.active ) {
					g.x = new_x;
					g.y = new_y;
					g.dx = new_dx;
					g.dy = new_dy;
				}
			}
		}

		function draw_player( id ) {
			var p, a, offset = 0;
			if( PLAYER_COUNT > id ) {
				p = players[ id ];
				if( p.last_frame == -1 ) p.last_frame = curr_ts;
				if( p.anim == "idle" ) {
					if( curr_ts - p.last_frame > IDLE_FPS ) {
						p.frame += 1;
						p.last_frame = curr_ts;
					}
					p.frame %= 4;
					a = SPRITES[ id * 4 + 1 ];
					if( p.frame == 0 ) offset = 3;
				} else {
					if( curr_ts - p.last_frame > RUN_FPS ) {
						p.frame += 1;
						p.last_frame = curr_ts;
					}
					p.frame %= 6;
					a = SPRITES[ id * 4 + 3 ];
					if( p.frame == 2 || p.frame == 5 ) offset = 6;
				}
				var difference = ( p.x + PLAYER_WIDTH - CANVAS_WIDTH ) | 0;
				if( difference > 0 ) {
					if( p.right ) {
						CTX_ENT.translate( -PLAYER_WIDTH + difference, p.y | 0 );
						CTX_ENT.drawImage( a, p.frame * PLAYER_WIDTH, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 0, 0, PLAYER_WIDTH, PLAYER_HEIGHT );
						CTX_ENT.translate( 42, 60 + offset );
						CTX_ENT.rotate( p.arm / 180 * Math.PI );
						CTX_ENT.translate( -36, -66 );
						CTX_ENT.drawImage( SPRITES[ id * 4 ], 0, 0 );
						CTX_ENT.setTransform( 1, 0, 0, 1, 0, 0 );
					} else {
						CTX_ENT.scale( -1, 1 );
						CTX_ENT.translate( -difference, p.y | 0 );
						CTX_ENT.drawImage( a, p.frame * PLAYER_WIDTH, 0, difference, PLAYER_HEIGHT, 0, 0, difference, PLAYER_HEIGHT );
						CTX_ENT.translate( 42, 60 + offset );
						CTX_ENT.rotate( ( 180 - p.arm ) / 180 * Math.PI );
						CTX_ENT.translate( -36, -66 );
						CTX_ENT.drawImage( SPRITES[ id * 4 ], 0, 0 );
						CTX_ENT.setTransform( 1, 0, 0, 1, 0, 0 );
					}
				}
				if( p.right ) {
					CTX_ENT.translate( p.x | 0, p.y | 0 );
				} else {
					CTX_ENT.translate( ( p.x | 0 ) + PLAYER_WIDTH, p.y | 0 );
					CTX_ENT.scale( -1, 1 );
				}
				CTX_ENT.drawImage( a, p.frame * PLAYER_WIDTH, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 0, 0, PLAYER_WIDTH, PLAYER_HEIGHT );
				CTX_ENT.translate( 42, 60 + offset );
				if( p.right ) {
					CTX_ENT.rotate( p.arm / 180 * Math.PI );
				} else {
					CTX_ENT.rotate( ( 180 - p.arm ) / 180 * Math.PI );
				}
				CTX_ENT.translate( -36, -66 );
				CTX_ENT.drawImage( SPRITES[ id * 4 ], 0, 0 );
				CTX_ENT.setTransform( 1, 0, 0, 1, 0, 0 );
			}
		}

		function draw_grenade( id ) {
			var g, a, offset = 0;
			if( PLAYER_COUNT > id ) {
				g = grenades[ id ];
				if( g.active ) {
					CTX_ENT.drawImage( SPRITES[ id * 4 + 2 ], g.x | 0, g.y | 0 );
				}
			}
		}

		function game_loop( ts ) {
			curr_ts = ts;
			if( last_ts == -1 ) last_ts = ts;
			ticks = ts - last_ts;

			var me = players[ ME ];

			cursor_x = ( cursor_vx + me.x - VIEW_HWIDTH + PLAYER_HWIDTH ) % CANVAS_WIDTH;
			if( cursor_x < 0 ) cursor_x += CANVAS_WIDTH;
			cursor_y = ( cursor_vy + me.y - VIEW_HHEIGHT + PLAYER_HHEIGHT ) % CANVAS_HEIGHT;
			if( cursor_y < 0 ) cursor_x += CANVAS_WIDTH;

			var tile_update, tile_x, tile_y, tile_val;
			if( RIGHT_MB_DOWN ) {
				tile_x = ( cursor_x / TILE_SIZE ) | 0;
				tile_y = ( cursor_y / TILE_SIZE ) | 0;
				if( tile_y == TILE_HEIGHT - 1 ) {
					tile_val = true;
				} else if( tile_y >= 35 ) {
					tile_val = tiles[ tile_y ][ ( tile_x + 1 ) % TILE_WIDTH ];
					tile_val = tile_val || tiles[ tile_y ][ tile_x == 0 ? TILE_WIDTH - 1 : tile_x - 1 ];
					tile_val = tile_val || tiles[ tile_y - 1 ][ tile_x ];
					tile_val = tile_val || tiles[ tile_y + 1 ][ tile_x ];
				}
				if( tile_val ) tile_updates.push( [ tile_x, tile_y, true ] );
			}

			while( tile_updates.length > 0 ) {
				tile_update = tile_updates.pop();
				tile_x = tile_update[ 0 ];
				tile_y = tile_update[ 1 ];
				tile_val = tile_update[ 2 ];
				tiles[ tile_y ][ tile_x ] = tile_val;
				if( !tile_val ) {
					CTX_TILE.clearRect( tile_x * TILE_SIZE, tile_y * TILE_SIZE, TILE_SIZE, TILE_SIZE );
				} else {
					CTX_TILE.drawImage( TILE_IMG, tile_x * TILE_SIZE, tile_y * TILE_SIZE );
				}
			}

			update_player( 0 );
			update_player( 1 );
			update_player( 2 );
			update_player( 3 );

			update_grenade( 0 );
			update_grenade( 1 );
			update_grenade( 2 );
			update_grenade( 3 );

			CTX_ENT.clearRect( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT );
			draw_grenade( 0 );
			draw_grenade( 1 );
			draw_grenade( 2 );
			draw_grenade( 3 );

			draw_player( 0 );
			draw_player( 1 );
			draw_player( 2 );
			draw_player( 3 );

			var p = players[ ME ];
			view_x = ( p.x | 0 ) + PLAYER_HWIDTH - VIEW_HWIDTH;
			view_y = ( p.y | 0 ) + PLAYER_HHEIGHT - VIEW_HHEIGHT;

			CTX_VIEW.clearRect( 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
			if( view_x < 0 ) {
				CTX_VIEW.drawImage( CANVAS_BG, CANVAS_WIDTH + view_x, view_y, -view_x, VIEW_HEIGHT, 0, 0, -view_x, VIEW_HEIGHT );
				CTX_VIEW.drawImage( CANVAS_TILE, CANVAS_WIDTH + view_x, view_y, -view_x, VIEW_HEIGHT, 0, 0, -view_x, VIEW_HEIGHT );
				CTX_VIEW.drawImage( CANVAS_ENT, CANVAS_WIDTH + view_x, view_y, -view_x, VIEW_HEIGHT, 0, 0, -view_x, VIEW_HEIGHT );
			}
			CTX_VIEW.drawImage( CANVAS_BG, view_x, view_y, VIEW_WIDTH, VIEW_HEIGHT, 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
			CTX_VIEW.drawImage( CANVAS_TILE, view_x, view_y, VIEW_WIDTH, VIEW_HEIGHT, 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
			CTX_VIEW.drawImage( CANVAS_ENT, view_x, view_y, VIEW_WIDTH, VIEW_HEIGHT, 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
			var extra = view_x + VIEW_WIDTH;
			if( extra > CANVAS_WIDTH ) {
				extra -= CANVAS_WIDTH;
				CTX_VIEW.drawImage( CANVAS_BG, 0, view_y, extra, VIEW_HEIGHT, VIEW_WIDTH - extra, 0, extra, VIEW_HEIGHT );
				CTX_VIEW.drawImage( CANVAS_TILE, 0, view_y, extra, VIEW_HEIGHT, VIEW_WIDTH - extra, 0, extra, VIEW_HEIGHT );
				CTX_VIEW.drawImage( CANVAS_ENT, 0, view_y, extra, VIEW_HEIGHT, VIEW_WIDTH - extra, 0, extra, VIEW_HEIGHT );
			}

			last_ts = ts;
			window.requestAnimationFrame( game_loop );
		}

		function keydown( e ) {
			switch( e.keyCode ) {
				case 87: // w
					break;
				case 65: // a
					A_DOWN = true;
					break;
				case 83: // s
					break;
				case 68: // d
					D_DOWN = true;
					break;
				case 32: // space
					SPACE_DOWN = true;
					break;
			}
		}

		function keyup( e ) {
			switch( e.keyCode ) {
				case 87: // w
					break;
				case 65: // a
					A_DOWN = false;
					break;
				case 83: // s
					break;
				case 68: // d
					D_DOWN = false;
					break;
				case 32: // space
					SPACE_DOWN = false;
					break;
			}
		}

		function mousemove( e ) {
			var rect = this.getBoundingClientRect(),
			p = players[ ME ];
			cursor_vx = ( ( e.clientX - rect.left ) / rect.width * VIEW_WIDTH ) | 0;
			cursor_vy = ( ( e.clientY - rect.top ) / rect.height * VIEW_HEIGHT ) | 0;
			p.arm = ( ( ( 5 * Math.PI / 2 - Math.atan2( cursor_vx - VIEW_HWIDTH, cursor_vy - VIEW_HHEIGHT ) ) % ( 2 * Math.PI ) / Math.PI ) * 180 ) | 0;
			if( p.arm >= 90 && p.arm <= 270 ) {
				p.right = false;
			} else {
				p.right = true;
			}
		}

		function mousedown( e ) {
			switch( e.which ) {
				case 1: // left
					LEFT_MB_DOWN = true;
					break;
				case 2: // middle
					MID_MB_DOWN = true;
					break;
				case 3: // right
					RIGHT_MB_DOWN = true;
					break;
			}
		}

		function mouseup( e ) {
			switch( e.which ) {
				case 1: // left
					LEFT_MB_DOWN = false;
					break;
				case 2: // middle
					MID_MB_DOWN = false;
					break;
				case 3: // right
					RIGHT_MB_DOWN = false;
					break;
			}
		}

		function contextmenu( e ) {
			e.preventDefault();
			return false;
		}

		function ws_open() {
			WS.send( String.fromCharCode( 0x01 ) );
		}

		function ws_msg( e ) {
			var msg = e.data;
			var data;
			switch( msg.charCodeAt( 0 ) ) {
				case 0x00:
					PLAYER_COUNT = msg.charCodeAt( 1 );
					console.log( PLAYER_COUNT );
					document.addEventListener( "keydown", keydown );
					document.addEventListener( "keyup", keyup );

					CANVAS_VIEW.addEventListener( "mousemove", mousemove );
					CANVAS_VIEW.addEventListener( "mousedown", mousedown );
					CANVAS_VIEW.addEventListener( "mouseup", mouseup );
					CANVAS_VIEW.addEventListener( "contextmenu", contextmenu );

					window.requestAnimationFrame( game_loop );
					break;
				case 0x01:
					ME = msg.charCodeAt( 1 );
					console.log( ME );
					break;
				case 0x02:
					if( msg.charCodeAt( 1 ) != ME ) {
						data = JSON.parse( msg.substring( 2 ) );
						players[ msg.charCodeAt( 1 ) ] = data;
					}
					break;
				case 0xFFF:
					WS.send( String.fromCharCode( 0xF ) );
					break;
				case 0xFFFF:
					console.log( "keep alive" );
					break;
			}
		}

		function ws_close( e ) {

		}

		WS.onopen = ws_open;
		WS.onmessage = ws_msg;
		WS.onclose = ws_close;
		
	}

	function asset_load() {
		ASSET_LOADS += 1;
		if( ASSET_ERRORS + ASSET_LOADS == ASSETS.length ) {
			assets_loaded();
		}
	}

	function asset_error() {
		ASSET_ERRORS += 1;
		if( ASSET_ERRORS + ASSET_LOADS == ASSETS.length ) {
			assets_loaded();
		}
	}

	for( i = 0; i < ASSETS.length; i++ ) {
		SPRITES.push( new Image() );
		SPRITES[ i ].addEventListener( "load", asset_load );
		SPRITES[ i ].addEventListener( "error", asset_error );
		SPRITES[ i ].src = "assets/" + ASSETS[ i ];
	}

}

window.addEventListener( "load", win_load );