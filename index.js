let skierSpriteNormal, skierSpriteEsquerda, skierSpriteDireita;
let skier, terrain, obstacles, score, gameOver;
let leftPressed = false, rightPressed = false;
let gameSpeed = 2; // Velocidade inicial do jogo
let treeSprite1, treeSprite2;

function preload() {
  skierSpriteNormal = loadImage('assets/esquiadorNormal.png');
  skierSpriteEsquerda = loadImage('assets/esquiadorEsquerda.png');
  skierSpriteDireita = loadImage('assets/esquiadorDireita.png');
  treeSprite1 = loadImage('assets/arvore1.png'); // Sprite da árvore 1
  treeSprite2 = loadImage('assets/arvore2.png'); // Sprite da árvore 2
}

function setup() {
  createCanvas(400, 600);
  skier = new Skier();
  terrain = [];
  obstacles = [];
  score = 0;
  gameOver = false;
  generateTerrain();
}

class Skier {
  constructor() {
    this.x = 200;
    this.y = 100;
    this.direction = 0;
    this.width = 20;
    this.height = 30;
  }

  move(left, right) {
    if (left) {
      this.direction = -1;
    } else if (right) {
      this.direction = 1;
    } else {
      this.direction = 0; 
    }

    this.x += this.direction * 3;
    this.x = constrain(this.x, 50, 350);
  }

  draw() {
    // Escolhe o sprite com base na direção
    if (this.direction === -1) {
      image(skierSpriteEsquerda, this.x, this.y, this.width, this.height);
    } else if (this.direction === 1) {
      image(skierSpriteDireita, this.x, this.y, this.width, this.height);
    } else {
      image(skierSpriteNormal, this.x, this.y, this.width, this.height);
    }
  }
}

class Obstacle {
  constructor(type, x, y) {
    this.type = type; // 0 para árvores, 1 para outro obstáculo
    this.x = x;
    this.y = y;
    this.size = 30; // Largura do obstáculo
    this.height = 50; // Altura do obstáculo (aumentada para árvores)
    this.sprite = null;

    // Escolhe a sprite para árvores (tipo 0)
    if (this.type === 0) {
      this.sprite = random([treeSprite1, treeSprite2]);
    }
  }

  draw() {
    if (this.type === 0 && this.sprite) {
      image(this.sprite, this.x, this.y, this.size, this.height); // Altura ajustada
    } else {
      fill(139, 137, 137); // Cor para o tipo 1
      rect(this.x, this.y, this.size, this.size); // Desenha o obstáculo
    }
  }
}

function draw() {
  if (!gameOver) {
    background(135, 206, 235); // Fundo azul claro
    
    // Atualiza o terreno e desenha
    updateTerrain();
    drawTerrain();
    
    // Atualiza o movimento do esquiador
    skier.move(leftPressed, rightPressed);

    // Desenha o esquiador
    skier.draw();
    
    // Atualiza e desenha os obstáculos
    updateObstacles();
    checkCollisions();
    
    // Exibe a pontuação (metros percorridos)
    score++;
    fill(0); 
    textSize(16); 
    textAlign(LEFT, TOP); 
    text(`Metros percorridos: ${Math.floor(score / 10)}`, 10, 10); 
  } else {
    gameOverScreen();
  }
}

function generateTerrain() {
  for (let y = 0; y < height; y += 50) {
    terrain.push({
      x: random(-50, 50),
      y: y,
      width: width + 100,
      height: 50
    });
  }
}

function updateTerrain() {
  for (let i = 0; i < terrain.length; i++) {
    terrain[i].y -= gameSpeed;
    
    if (terrain[i].y < -50) {
      terrain[i].y = height;
      terrain[i].x = random(-50, 50);
      
      if (random() < 0.3) {
        obstacles.push(new Obstacle(
          floor(random(2)),
          random(50, width - 50),
          terrain[i].y
        ));
      }
    }
  }
}

function drawTerrain() {
  fill(255);
  for (let tile of terrain) {
    rect(tile.x, tile.y, tile.width, tile.height);
  }
}

function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y -= gameSpeed;

    // Desenha o obstáculo
    obstacles[i].draw();

    // Remove o obstáculo se sair da tela
    if (obstacles[i].y < -30) {
      obstacles.splice(i, 1);
    }
  }
}

function checkCollisions() {
  for (let obs of obstacles) {
    if (collisionRectRect(
      skier.x, skier.y, skier.width, skier.height,
      obs.x, obs.y, obs.size, obs.size
    )) {
      gameOver = true;
    }
  }
}

function collisionRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}

function keyPressed() {
    if (!gameOver) {
      if (keyCode === LEFT_ARROW) leftPressed = true;
      if (keyCode === RIGHT_ARROW) rightPressed = true;
    }
  }
  
  function keyReleased() {
    if (keyCode === LEFT_ARROW) leftPressed = false;
    if (keyCode === RIGHT_ARROW) rightPressed = false;
  }

function mouseClicked() {
  if (gameOver) resetGame();
}

function gameOverScreen() {
    textSize(32);
    fill(255, 0, 0);
    text("GAME OVER", 120, 300);
    textSize(16);
    fill(0);
    text(`Percorreu ${score / 10} metros`, 140, 340); 
    text("Click para recomeçar", 140, 370);
  }

function resetGame() {
  gameOver = false;
  skier = new Skier();
  terrain = [];
  obstacles = [];
  score = 0;
  generateTerrain();
}