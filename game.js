var DEBUG = false

var PLAYER_START_X = 590
var PLAYER_START_Y = 610
var PLAYER_MOVE_RATE = 0.5
var PLAYER_HEIGHT = 100
var PLAYER_WIDTH = 60
var PLAYER_MAX_SPEED_MOD = 1.0
var PLAYER_ACCEL_RATE = 0.015
var PLAYER_DECEL_RATE = 0.005

var ENEMY_HEIGHT = 60
var ENEMY_WIDTH = 21
var ENEMY_STICKY_FACTOR = 0.20

var KEY_SPACE = 32
var KEY_UP = 38
var KEY_DOWN = 40
var KEY_LEFT = 37
var KEY_RIGHT = 39
var KEY_F2 = 113
var KEY_F9 = 120

var Enemy = (function() {
    
    function Enemy(x, y) {
        this._x = x
        this._y = y
        this._image = new Image()
        this._image.src = "enemy.png"
        this._dead_image = new Image()
        this._dead_image.src = "enemy_dead.png"
        this.alive = true
    }
    
    Enemy.prototype.get_shape = function() {
        var polygon = new Polygon({'x': this._x, 'y': this._y}, "red")
        polygon.addPoint({'x': 0, 'y': 0})
        polygon.addPoint({'x': ENEMY_WIDTH, 'y': 0})
        polygon.addPoint({'x': ENEMY_WIDTH, 'y': ENEMY_HEIGHT})
        polygon.addPoint({'x': 0, 'y': ENEMY_HEIGHT})
        return polygon
    }
    
    Enemy.prototype.get_debug_shape = function(state) {
        var polygon = new Polygon({'x': this._x, 'y': this._y-(state.player_y-PLAYER_START_Y)}, "red")
        polygon.addPoint({'x': 0, 'y': 0})
        polygon.addPoint({'x': ENEMY_WIDTH, 'y': 0})
        polygon.addPoint({'x': ENEMY_WIDTH, 'y': ENEMY_HEIGHT})
        polygon.addPoint({'x': 0, 'y': ENEMY_HEIGHT})
        return polygon
    }
    
    Enemy.prototype.collide_player = function() {
        this.alive = false
    }
    
    Enemy.prototype.update = function(state, d) {
        if(!state.paused) {
            
        }
    }
    
    Enemy.prototype.draw = function(state, context, d) {
        if(this.alive){
            context.drawImage(this._image, this._x, this._y-(state.player_y-PLAYER_START_Y))
        }else{
            context.drawImage(this._dead_image, this._x, this._y-(state.player_y-PLAYER_START_Y))
        }
        
        if(DEBUG){
            this.get_debug_shape(state).draw(context)
        }
    }
    
    return Enemy

})()

var Player = (function() {
    
    function Player(x, y) {
        this._x = x
        this._y = y
        this._image = new Image()
        this._image.src = "car.png"
        this._maxSpeed = PLAYER_MAX_SPEED_MOD
        this._speed = 0
        
    }
    
    Player.prototype.collide_enemy = function() {
        this._maxSpeed -= ENEMY_STICKY_FACTOR
        if(this._maxSpeed < 0){
            this._maxSpeed = 0
        }
        if(this._speed > this._maxSpeed){
            this._speed = this._maxSpeed
        }
    }
    
    Player.prototype.get_shape = function() {
        var polygon = new Polygon({'x': this._x, 'y': this._y}, "green")
        polygon.addPoint({'x': 0, 'y': 0})
        polygon.addPoint({'x': PLAYER_WIDTH, 'y': 0})
        polygon.addPoint({'x': PLAYER_WIDTH, 'y': PLAYER_HEIGHT})
        polygon.addPoint({'x': 0, 'y': PLAYER_HEIGHT})
        return polygon
    }
    
    Player.prototype.get_debug_shape = function(state) {
        var polygon = new Polygon({'x': this._x, 'y': this._y-(state.player_y-PLAYER_START_Y)}, "green")
        polygon.addPoint({'x': 0, 'y': 0})
        polygon.addPoint({'x': PLAYER_WIDTH, 'y': 0})
        polygon.addPoint({'x': PLAYER_WIDTH, 'y': PLAYER_HEIGHT})
        polygon.addPoint({'x': 0, 'y': PLAYER_HEIGHT})
        return polygon
    }
    
    Player.prototype.update = function(state, d) {
        if(!state.paused) {
        
            if(state.is_down(KEY_RIGHT)){
                this._x += PLAYER_MOVE_RATE * d
                if(this._x + PLAYER_WIDTH >= state.width){
                    this._x = state.width - PLAYER_WIDTH
                }
            }
            if(state.is_down(KEY_LEFT)){
                this._x -= PLAYER_MOVE_RATE * d
                if(this._x <= 0){
                    this._x = 0
                }
            }
            if(state.is_down(KEY_SPACE)){
                this._speed += PLAYER_ACCEL_RATE
                if(this._speed > this._maxSpeed){
                    this._speed = this._maxSpeed
                }
            }else{
                this._speed -= PLAYER_DECEL_RATE
                if(this._speed < 0){
                    this._speed = 0
                }
            }
            
            if(this._speed > 0){
                this._y -= this._speed * d
            }
        }
        
        if(DEBUG){
            var debug_out = document.getElementById("debug-out")
            var msg = "Player:<br/>Location: "+this._x+","+this._y+"<br/>Speed: "+this._speed+"<br/>Max Speed: "+this._maxSpeed+"</br>"
            debug_out.innerHTML = debug_out.innerHTML + msg
        }
    }
    
    Player.prototype.draw = function(state, context, d) {
        context.drawImage(this._image, this._x, PLAYER_START_Y)
        if(DEBUG){
            this.get_debug_shape(state).draw(context)
        }
    }
    
    return Player
    
})()

var GameState = (function() {

    function GameState() {
        this._keyStates = new Array()
        this._keyClicks = new Array()
        
        for(var i = 0; i <= 222; i++) {
            this._keyStates[i] = 'up'
            this._keyClicks[i] = 'unclicked'
        }
    }
    
    GameState.prototype._key_down = function(self, event) {
        self._keyStates[event.keyCode] = 'down'
        self._keyClicks[event.keyCode] = 'clicked'
    }
    
    GameState.prototype._key_up = function(self, event) {
        self._keyStates[event.keyCode] = 'up'
    }
    
    GameState.prototype.is_clicked = function(keyCode) {
        if(this._keyClicks[keyCode] == 'clicked'){
            this._keyClicks[keyCode] = 'unclicked'
            return true
        }else{
            return false
        }
    }
    
    GameState.prototype.is_down = function(keyCode) {
        if(this._keyStates[keyCode] == 'down'){
            return true
        }else{
            return false
        }
    }

    return GameState

})()

var Game = (function() {
    
    function Game(canvas, target_fps) {
        this._running = false
        this._paused = false
        this._canvas = canvas
        this._context = canvas.getContext("2d")
        this._target_fps = target_fps
        this._enemies = new Array()
        this._state = new GameState()
        this._state.width = canvas.width
        this._state.height = canvas.height
        this._state.paused = false
        
        var state = this._state
        
        var key_down = function(event) {
            state._key_down(state, event)
        }
        
        var key_up = function(event) {
            state._key_up(state, event)
        }
        
        document.addEventListener('keydown', key_down)
        document.addEventListener('keyup', key_up)
        
        this._enemies.push(new Enemy(350, 450))
        this._enemies.push(new Enemy(500, 450))
        this._enemies.push(new Enemy(650, 450))
        this._enemies.push(new Enemy(800, 450))
        this._enemies.push(new Enemy(350, 0))
        this._enemies.push(new Enemy(500, 0))
        this._enemies.push(new Enemy(650, 0))
        this._enemies.push(new Enemy(800, 0))
        this._enemies.push(new Enemy(350, -450))
        this._enemies.push(new Enemy(500, -450))
        this._enemies.push(new Enemy(650, -450))
        this._enemies.push(new Enemy(800, -450))
        this._enemies.push(new Enemy(350, -900))
        this._enemies.push(new Enemy(500, -900))
        this._enemies.push(new Enemy(650, -900))
        this._enemies.push(new Enemy(800, -900))
        this._enemies.push(new Enemy(350, -1350))
        this._enemies.push(new Enemy(500, -1350))
        this._enemies.push(new Enemy(650, -1350))
        this._enemies.push(new Enemy(800, -1350))
        
        this._player = new Player(PLAYER_START_X, PLAYER_START_Y)
    }
    
    Game.prototype._update_and_draw = function(self, last_run) {
        if(DEBUG){
            var debug_out = document.getElementById('debug-out')
            debug_out.innerHTML = "Debug<br/>"
        }
        var start = new Date().getTime()
        var delta =  start - last_run
        
        self._context.fillStyle = "white"
        self._context.fillRect(0, 0, self._canvas.width, self._canvas.height)
        
        if(self._state.is_clicked(KEY_F2)){
            self._paused = !self._paused
            self._state.paused = self._paused
        }
        
        if(self._state.is_clicked(KEY_F9)){
            DEBUG = !DEBUG
        }
        
        self._player.update(self._state, delta)
        self._state.player_x = self._player._x
        self._state.player_y = self._player._y
        for(var i = 0; i < self._enemies.length; i++) {
                self._enemies[i].update(self._state, delta)
        }
        
        for(var i = 0; i < self._enemies.length; i++) {
                if(self._enemies[i].alive &&
                       self._enemies[i].get_shape().intersectsWith(self._player.get_shape())){
                    self._enemies[i].collide_player()
                    self._player.collide_enemy()
                }
        }
        
        for(var i = 0; i < self._enemies.length; i++) {
            self._enemies[i].draw(self._state, self._context, delta)
        }
        self._player.draw(self._state, self._context, delta)
        
        if(self._paused){
            self._context.fillStyle = "red"
            self._context.font = "30px Arial"
            var paused_text = 'Game Paused'
            self._context.fillText(paused_text,
                                   (self._state.width/2)-paused_text.length*8,
                                   (self._state.height/2)-10)
        }
        
        var end = new Date().getTime()
        var run_time = end - start
        
        if(self._running){
            var new_last_run = new Date().getTime()
            var func = function(){
                self._update_and_draw(self, new_last_run)
            }
            window.setTimeout(func, (1000/self._target_fps) - run_time)
        }
    }
    
    Game.prototype.run = function() {
        this._running = true
        this._update_and_draw(this)
    }
    
    return Game
})()