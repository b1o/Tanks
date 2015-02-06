Tank = function (index, game, player, bullets) {
	var x = game.world.randomX;
	var y = game.world.randomY;


	this.game = game;
	this.health = 3;
	this.enemy = player;
    
	this.bullets = bullets;
	this.fireRate = 1000;
	this.nextFire = 0;
	this.alive = true;
	this.currentSpeed = 100;
    this.timer = game.time.create(false);
    this.TURN_RATE = 4;
    this.turretTurnRate = 8;
    this.targetAngle;
    
	this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.add.sprite(x, y, 'enemy', 'turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.immovable = false;
    this.tank.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);
    this.tank.body.drag.set(0.2);
    this.tank.body.collideWorldBounds = true;
    this.tank.name = index.toString();
    //this.tank.angle = game.rnd.angle();
   
    
    game.time.events.loop(2000, this.turn, this);
};




Tank.prototype.radar = function() {

    if(this.game.physics.arcade.distanceBetween(this.tank, this.enemy) < 250) {

        return true, this.tank.x, this.tank.y;
    }
    return false;
}

Tank.prototype.removeMessage = function(value) {
    value.destroy();
}

Tank.prototype.increment = function(value){
    this.tank.angle += value;
    //console.log(this.index, this.tank.angle);
};

Tank.prototype.decrement = function(value){
    this.tank.angle -= value;
    //console.log(this.index, this.tank.angle);
};

Tank.prototype.stopTimer = function() {
    this.timer.stop();
};

Tank.prototype.turn = function() {
    var direction = Math.floor((Math.random() * 2) + 1);
    var seconds = Math.floor((Math.random() * 700) + 500);

    if (direction === 2) {
        this.timer.loop(10, this.increment, this, 4);
        this.timer.start();
        this.timer.add(seconds, this.stopTimer, this);
    } else {     
        this.timer.loop(10, this.decrement, this, 4);
        this.timer.start();
        this.timer.add(seconds, this.stopTimer, this);
    }
};


Tank.prototype.damage = function() {
	this.health -= 1;
	if (this.health <= 0) {
		this.alive = false;

		this.shadow.kill();
		this.tank.kill();
		this.turret.kill();

		return true;
	}
	return false;
}

Tank.prototype.chase = function() {
    this.targetAngle = Math.atan2(this.enemy.y - this.tank.y, this.enemy.x - this.tank.x);

        //TANK ROTATION
        if (this.tank.rotation !== this.targetAngle) {
            var delta = this.targetAngle - this.tank.rotation;

            if (delta > Math.PI) delta -= Math.PI * 2;
            if (delta < -Math.PI) delta += Math.PI * 2;
            
            if (delta > 0) {
                // Turn clockwise
                this.tank.angle += this.TURN_RATE;
            } else {
                // Turn counter-clockwise
                this.tank.angle -= this.TURN_RATE;
            }
        }

                //TURRET ROTATION
        if (this.turret.rotation !== this.targetAngle) {
            var delta = this.targetAngle - this.turret.rotation;

            if (delta > Math.PI) delta -= Math.PI * 2;
            if (delta < -Math.PI) delta += Math.PI * 2;
            
            if (delta > 0) {
                // Turn clockwise
                this.turret.angle += this.turretTurnRate;
            } else {
                // Turn counter-clockwise
                this.turret.angle -= this.turretTurnRate;
            }
        }
        // Just set angle to target angle if they are close

        if (Math.abs(delta) < this.game.math.degToRad(this.turretTurnRate)) {
            this.turret.rotation = this.targetAngle;
        }
}

Tank.prototype.fire = function() {
    //Fire in the calculated fire rate and only if the turret is pointing at the enemy tank
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0 && this.turret.rotation == this.targetAngle) {

        this.nextFire = this.game.time.now + this.fireRate;
        var bullet = this.bullets.getFirstDead();
        bullet.reset(this.turret.x, this.turret.y);
        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.enemy, 500);
    }
}

Tank.prototype.kill = function() {
    this.shadow.kill();
    this.tank.kill();
    this.turret.kill();
}

Tank.prototype.update = function() {
	this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;


    //Search for target
    if(this.radar()) {
        this.chase();
        this.fire();
    }
        
    this.game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
}


var game = new Phaser.Game(1200, 720, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
	game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
}


var land;

var shadow;
var tank;
var turret;

var enemies;
var enemyBullets;
var enemiesTotal = 15;
var enemiesAlive = 0;
var explosions;
var health = 1;
var canBeDamaged = false;

var logo;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 500;
var nextFire = 0;
function create(){
	game.world.setBounds(-1000, -1000, 2000, 2000);
	//game.stage.disableVisibilityChange  = true;

    land = game.add.tileSprite(0, 0, 1200, 720, 'earth');
	land.fixedToCamera = true;

    tank = game.add.sprite(0, 0, 'tank', 'tank1');
    tank.anchor.setTo(0.5, 0.5);

    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;
    tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    turret = game.add.sprite(0, 0, 'tank', 'turret');
    turret.anchor.setTo(0.3, 0.5);

    shadow = game.add.sprite(0, 0, 'tank', 'shadow');
    shadow.anchor.setTo(0.5, 0.5)

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    enemies = [];

    for (var i = 0; i < 1; i++) {
        enemies.push(new Tank(i, game, tank, enemyBullets));
    }

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    

    tank.bringToTop();
    turret.bringToTop();

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(250, 250, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
}



function update () {

    game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);
    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++)
    {   
        for(var j = 0; j < enemies.length; j++){
            if(j != i){
                //console.log(j, i);
                game.physics.arcade.collide(enemies[j].tank, enemies[i].tank);

            }
        }

        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    if(enemiesAlive == 0) {
        txt = this.game.add.text(game.camera.width / 2, game.camera.height / 2, "You fucking WON m8", {font: "30px Arial", fill: "#ffffff", stroke: '#000000', strokeThickness: 3});
        txt.anchor.setTo(0.5, 0.5);
        txt.fixedToCamera = true;
    }

    time = game.time.totalElapsedSeconds();
    if(Math.floor(time) == 2){
        canBeDamaged = true;
    }

    if (cursors.left.isDown)
    {
        tank.angle -= 4;
    }
    else if (cursors.right.isDown)
    {
        tank.angle += 4;
    }

    if (cursors.up.isDown)
    {
        //  The speed we'll travel at
        currentSpeed = 300;
    }
    else
    {
        if(currentSpeed > 0)
        {
            currentSpeed -= 5;
        }
    }

    if (game.input.activePointer.isDown)
    {
        //  Boom!
        fire();
    }


    if (currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;

    turret.rotation = game.physics.arcade.angleToPointer(turret);

    
}

function damage() {
    

    return false;

}

function bulletHitPlayer (tank, bullet) {
    if(canBeDamaged){
        bullet.kill();
        var destroyed = false;
        health -= 1;

        if (health <= 0)
        {
           // alive = false;
            txt = this.game.add.text(game.camera.width / 2, game.camera.height / 2, "You fucking LOST m8", {font: "30px Arial", fill: "#ffffff", stroke: '#000000', strokeThickness: 3});
            txt.anchor.setTo(0.5, 0.5);
            txt.fixedToCamera = true;
            shadow.kill();
            tank.kill();
            turret.kill();
            bullets.destroy();

            for(i = 0; i < enemies.length; i++){
                enemies[i].kill();
                enemyBullets.destroy();
            }

            
            destroyed = true;
        }

        if (destroyed)
        {
            var explosionAnimation = explosions.getFirstExists(false);
            explosionAnimation.reset(tank.x, tank.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }
    }
}

function bulletHitEnemy (tank, bullet) {

    bullet.kill();

    var destroyed = enemies[tank.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }

}

function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 500, game.input.activePointer);
    }

}

function render(){
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text('Health: ' + health, 32, 52);
}