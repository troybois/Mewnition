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
		"otterCat_y_run.png"],
		SPRITES = [],
		ASSET_ERRORS = 0,
		ASSET_LOADS = 0;

	function assets_loaded() {
		var PLAYERS = 0;

		function Player() {
			this.x = 0;
			this.y = 0;
		}

		function Projectile() {
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
		players.push( new Player() );
		players.push( new Player() );
		players.push( new Player() );
		players.push( new Player() );

		var projs = [];
		projs.push( new Projectile() );
		projs.push( new Projectile() );
		projs.push( new Projectile() );
		projs.push( new Projectile() );

		var boss = new Boss();

		var anvil = new Anvil();

		var CANVAS_TILE = document.createElement( "canvas" );
		var CANVAS_ENT = document.createElement( "canvas" );
		var CANVAS_VIEW = document.getElementById( "viewport" );

		var last_ts = -1, ticks;
		function game_loop( ts ) {
			if( last_ts == -1 ) last_ts = ts;
			ticks = ts - last_ts;

			last_ts = ts;
			window.requestAnimationFrame( game_loop );
		}
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

	for( var i = 0; i < ASSETS.length; i++ ) {
		SPRITES.push( new Image() );
		SPRITES[ i ].addEventListener( "load", asset_load );
		SPRITES[ i ].addEventListener( "error", asset_error );
		SPRITES[ i ].src = "assets/" + ASSETS[ i ];
	}

}

window.addEventListener( "load", win_load );