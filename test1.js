Enemy = function(){
        this.x = game.world.randomX;
        this.y = game.world.randomY;
        this.minSpeed = -75;
        this.maxSpeed = 75;
        this.vx = Math.random()*(this.maxSpeed - this.minSpeed+1)-this.minSpeed;
        this.vy = Math.random()*(this.maxSpeed - this.minSpeed+1)-this.minSpeed;

        this.enemySprite = game.add.sprite(this.x,this.y,"enemy");
        this.enemySprite.anchor.setTo(0.5, 0.5);
        this.enemySprite.body.collideWorldBounds = true;
        this.enemySprite.body.bounce.setTo(1, 1);
        this.enemySprite.body.velocity.x = this.vx;
        this.enemySprite.body.velocity.y = this.vy;
        this.enemySprite.body.immovable = true;
    }

    var game = new Phaser.Game(600, 400, Phaser.AUTO, '', { preload: preload, create: create, update: update });
    var numOfEnemies = 10;
    var player;
    var enemies;

    function preload() {
        game.load.image('enemy', 'assets/ball.png');
        game.load.spritesheet("player", "assets/player.png", 20, 20, 2);
    }
    function create() {
        game.stage.backgroundColor = 0x8C8C8C;

        player = game.add.sprite(100,100,"player");
        player.name = "Player";
        player.animations.add("pulse");
        player.animations.play("pulse", 20, true);
        player.anchor.setTo(0.5, 0.5);

        enemies = [];
        for (var i=0; i<numOfEnemies; i++) {
            enemies.push( new Enemy() );
        }
    }
    function update() {
        player.x = game.input.x;
        player.y = game.input.y;
        for (var i=0; i<numOfEnemies; i++){
            game.physics.collide(player, enemies[i].enemySprite, killPlayer, null, this)
        }
    }
    function killPlayer() {
        console.log('You Died');
    }


    089 821 7726