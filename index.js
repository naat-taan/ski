let skierSpriteNormal, skierSpriteEsquerda, skierSpriteDireita;
let skier, terrain, obstacles, score, gameOver;
let leftPressed = false, rightPressed = false;
let gameSpeed = 2;
let obstaculoArvore, obstaculoPedra; 
let terrainOffset = 0; 

function preload() {
  skierSpriteNormal = loadImage('assets/esquiadorNormal.png');
  skierSpriteEsquerda = loadImage('assets/esquiadorEsquerda.png');
  skierSpriteDireita = loadImage('assets/esquiadorDireita.png');
  obstaculoArvore = loadImage('assets/arvore.png'); 
  obstaculoPedra = loadImage('assets/obstaculoPedra.png'); 
}

function setup() {
  createCanvas(400, 500); 
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
    if (this.direction === 1) {
      image(skierSpriteEsquerda, this.x, this.y, this.width, this.height);
    } else if (this.direction === -1) {
      image(skierSpriteDireita, this.x, this.y, this.width, this.height);
    } else {
      image(skierSpriteNormal, this.x, this.y, this.width, this.height);
    }
  }
}

class Obstacle {
  constructor(type, x, y) {
    this.type = type; 
    this.x = x;
    this.y = y;
    this.size = type === 1 ? 40 : 55; 
    this.height = type === 1 ? 35 : 80;
    this.sprite = null;
    this.flipped = false; // Indica se a sprite está espelhada

    // Escolhe a sprite com base no tipo
    if (this.type === 0) {
      this.sprite = obstaculoArvore; 
      this.flipped = random() < 0.5;
    } else if (this.type === 1) {
      this.sprite = obstaculoPedra; 
      this.flipped = random() < 0.5; 
    }
  }

  draw() {
    if (this.sprite) {
      push(); // Salva o estado de transformação
      if (this.flipped) {
        scale(-1, 1); // Espelha horizontalmente
        image(this.sprite, -this.x - this.size, this.y, this.size, this.height);
      } else {
        image(this.sprite, this.x, this.y, this.size, this.height);
      }
      pop(); // Restaura o estado de transformação
    } else {
      fill(139, 137, 137); // Cor padrão para outros tipos
      rect(this.x, this.y, this.size, this.size);
    }
  }
}

function draw() {
  if (!gameOver) {
    background(208,236,235); 
    
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

    // Aumenta a velocidade a cada 500 pontos
    if (score % 500 === 0) {
      gameSpeed += 0.5; 
    }
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
  terrainOffset += gameSpeed; 

  for (let i = 0; i < terrain.length; i++) {
    terrain[i].y -= gameSpeed;

    if (terrain[i].y < -50) {
      terrain[i].y = height;
      terrain[i].x = random(-50, 50);

      if (random() < 0.8) {
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
  fill(236,255,253); // Cor do terreno
  noStroke();

  let gridSize = 2.5; 

  for (let y = 0; y < height; y += gridSize) {
    beginShape();
    for (let x = 0; x <= width; x += gridSize) {
      let noiseValue = noise(x * 0.1, (y + terrainOffset) * 0.1);
      let terrainHeight = map(noiseValue, 0, 1, -10, 10);

      vertex(x, y + terrainHeight);
      vertex(x + gridSize, y + terrainHeight);
    }
    vertex(width, y + gridSize);
    vertex(0, y + gridSize);
    endShape(CLOSE);
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
    if (obs.type === 0) {
      // Hitbox triangular para árvores
      const tx1 = obs.x + obs.size / 2;
      const ty1 = obs.y;
      const tx2 = obs.x; 
      const ty2 = obs.y + obs.height; 
      const tx3 = obs.x + obs.size; 
      const ty3 = obs.y + obs.height; 

      if (collisionRectTriangle(
        skier.x, skier.y, skier.width, skier.height,
        tx1, ty1, tx2, ty2, tx3, ty3
      )) {
        gameOver = true;
        return;
      }
    } else {
      // Hitbox retangular para pedras
      if (collisionRectRect(
        skier.x, skier.y, skier.width, skier.height,
        obs.x, obs.y, obs.size, obs.height
      )) {
        gameOver = true;
        return;
      }
    }
  }
}

function collisionRectTriangle(rx, ry, rw, rh, tx1, ty1, tx2, ty2, tx3, ty3) {
  return (
    pointInTriangle(rx, ry, tx1, ty1, tx2, ty2, tx3, ty3) ||
    pointInTriangle(rx + rw, ry, tx1, ty1, tx2, ty2, tx3, ty3) ||
    pointInTriangle(rx, ry + rh, tx1, ty1, tx2, ty2, tx3, ty3) ||
    pointInTriangle(rx + rw, ry + rh, tx1, ty1, tx2, ty2, tx3, ty3)
  );
}

function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
  const areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
  const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
  const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
  const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));
  return area1 + area2 + area3 === areaOrig;
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