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
		"background.png"],
		SPRITES = [],
		ASSET_ERRORS = 0,
		ASSET_LOADS = 0,
		i;

	function assets_loaded() {
		var BG_HEIGHT = 768;
		var BG_WIDTH = 640;
		var BG_COUNT = 3;
		var CANVAS_WIDTH = BG_COUNT * BG_WIDTH;
		var CANVAS_HEIGHT = BG_HEIGHT;
		//var VIEW_WIDTH = BG_WIDTH / 2;
		//var VIEW_HEIGHT = VIEW_WIDTH * window.screen.height / window.screen.width;
		VIEW_WIDTH = CANVAS_WIDTH;
		VIEW_HEIGHT = CANVAS_HEIGHT;
		var VIEW_HWIDTH = VIEW_WIDTH / 2;
		var VIEW_HHEIGHT = VIEW_HEIGHT / 2;

		var PLAYER_HEIGHT = 32;
		var PLAYER_HHEIGHT = PLAYER_HEIGHT / 2;
		var PLAYER_WIDTH = 32;
		var PLAYER_HWIDTH = PLAYER_WIDTH / 2;

		var IDLE_FPS = 120;
		var RUN_FPS = 60;

		var PLAYER_COUNT = 1;
		var ME = 0;

		function Player( pid ) {
			this.x = CANVAS_WIDTH - PLAYER_WIDTH;
			this.y = CANVAS_HEIGHT - PLAYER_HEIGHT;
			this.anim = "idle";
			this.frame = 0;
			this.last_frame = -1;
		}

		function Grenade() {
			this.x = 0;
			this.y = 0;
		}

		function Boss() {
			this.x = 0;
			this.y = 0;
		}

		function Anvil() {
			this.x = 0;
			this.y = 0;
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

		var last_ts = -1, ticks, curr_ts;
		function game_loop( ts ) {
			curr_ts = ts;
			if( last_ts == -1 ) last_ts = ts;
			ticks = ts - last_ts;

			var p, a, left_view;
			if( PLAYER_COUNT > 0 ) {
				p = players[ 0 ];
				if( p.last_frame == -1 ) p.last_frame = ts;
				if( p.anim == "idle" ) {
					if( ts - p.last_frame > IDLE_FPS ) {
						p.frame = ( p.frame + 1 ) % 4;
						p.last_frame = ts;
					}
					a = SPRITES[ 1 ];
				} else {
					if( ts - p.last_frame > RUN_FPS ) {
						p.frame = ( p.frame + 1 ) % 6;
						p.last_frame = ts;
					}
					a = SPRITES[ 3 ];
				} 
			}
			CTX_ENT.clearRect( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT );
			CTX_ENT.drawImage( a, p.frame * PLAYER_WIDTH, 0, PLAYER_WIDTH, PLAYER_HEIGHT, p.x, p.y, PLAYER_WIDTH, PLAYER_HEIGHT );

			//view_x = p.x + PLAYER_HWIDTH - VIEW_HWIDTH;
			view_y = 0;
			view_x = 0;
			//view_y = p.y + PLAYER_HHEIGHT - VIEW_HHEIGHT;

			CTX_VIEW.clearRect( 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
			if( view_x < 0 ) {
				CTX_VIEW.drawImage( CANVAS_BG, CANVAS_WIDTH + view_x, view_y, -view_x, VIEW_HEIGHT, 0, 0, -view_x, VIEW_HEIGHT );
				CTX_VIEW.drawImage( CANVAS_ENT, CANVAS_WIDTH + view_x, view_y, -view_x, VIEW_HEIGHT, 0, 0, -view_x, VIEW_HEIGHT );
			}
			CTX_VIEW.drawImage( CANVAS_BG, view_x, view_y, VIEW_WIDTH, VIEW_HEIGHT, 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
			CTX_VIEW.drawImage( CANVAS_ENT, view_x, view_y, VIEW_WIDTH, VIEW_HEIGHT, 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
			var extra = view_x + VIEW_WIDTH;
			if( extra > CANVAS_WIDTH ) {
				extra -= CANVAS_WIDTH;
				CTX_VIEW.drawImage( CANVAS_BG, 0, view_y, extra, VIEW_HEIGHT, VIEW_WIDTH - extra, 0, extra, VIEW_HEIGHT );
				CTX_VIEW.drawImage( CANVAS_ENT, 0, view_y, extra, VIEW_HEIGHT, VIEW_WIDTH - extra, 0, extra, VIEW_HEIGHT );
			}

			last_ts = ts;
			window.requestAnimationFrame( game_loop );
		}

		window.requestAnimationFrame( game_loop );
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