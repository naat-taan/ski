let skierSpriteNormal, skierSpriteEsquerda, skierSpriteDireita;
let obstaculoArvore, obstaculoPedra;
let telaInicial;

let skier, terrain, obstacles, score, gameOver;
let leftPressed = false, rightPressed = false;

let gameSpeed = 2;
let terrainOffset = 0;
let gameState = "start";
let imageY;
let imageDirection = 1;
let skiTrails = [];

// Carrega imagens e fontes necessárias
function preload() {
    skierSpriteNormal = loadImage('assets/esquiadorNormal.png');
    skierSpriteEsquerda = loadImage('assets/esquiadorEsquerda.png');
    skierSpriteDireita = loadImage('assets/esquiadorDireita.png');
    obstaculoArvore = loadImage('assets/arvore.png');
    obstaculoPedra = loadImage('assets/obstaculoPedra.png');
    telaInicial = loadImage('assets/telaInicial.png');
}

// Configura o jogo inicial
function setup() {
  createCanvas(400, 500);
  skier = new Skier();
  terrain = [];
  obstacles = [];
  score = 0;
  gameOver = false;
  generateTerrain();
  imageY = 0;
}

// Representa o esquiador e suas ações
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
    // Desenha a sombra
    fill(0, 0, 0, 50); // Cor preta com transparência
    noStroke();
    ellipse(this.x + this.width / 2, this.y + this.height, this.width, this.height / 3);

    // Desenha o personagem
    if (this.direction === 1) {
      image(skierSpriteEsquerda, this.x, this.y, this.width, this.height);
    } else if (this.direction === -1) {
      image(skierSpriteDireita, this.x, this.y, this.width, this.height);
    } else {
      image(skierSpriteNormal, this.x, this.y, this.width, this.height);
    }
  }
}

// Representa os obstáculos no jogo
class Obstacle {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = type === 1 ? 40 : 55;
    this.height = type === 1 ? 35 : 80;
    this.sprite = null;
    this.flipped = false;

    if (this.type === 0) {
      this.sprite = obstaculoArvore;
      this.flipped = random() < 0.5;
    } else if (this.type === 1) {
      this.sprite = obstaculoPedra;
      this.flipped = random() < 0.5;
    }
  }

  draw() {
    // Desenha a sombra
    fill(0, 0, 0, 50); 
    noStroke();
    ellipse(this.x + this.size / 2, this.y + this.height, this.size * 0.8, this.height / 3);

    if (this.sprite) {
        push();
        if (this.flipped) {
            scale(-1, 1);
            image(this.sprite, -this.x - this.size, this.y, this.size, this.height);
        } else {
            image(this.sprite, this.x, this.y, this.size, this.height);
        }
        pop();
    } else {
        fill(139, 137, 137);
        rect(this.x, this.y, this.size, this.size);
    }
  }
}

// Desenha o jogo com base no estado atual
function draw() {
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "playing") {
    if (!gameOver) {
      background(208, 236, 235);

      skiTrails.push({
        left: { x: skier.x + skier.width * 0.3, y: skier.y + skier.height },
        right: { x: skier.x + skier.width * 0.7, y: skier.y + skier.height }
      });

      if (skiTrails.length > 600) { 
        skiTrails.shift(); 
      }

      for (let trail of skiTrails) {
        trail.left.y -= gameSpeed;
        trail.right.y -= gameSpeed;
      }

      stroke(80, 80, 80, 100);
      strokeWeight(3);
      noFill();

      beginShape();
      for (let trail of skiTrails) {
        curveVertex(trail.left.x, trail.left.y);
      }
      endShape();

      beginShape();
      for (let trail of skiTrails) {
        curveVertex(trail.right.x, trail.right.y);
      }
      endShape();

      updateTerrain();
      drawTerrain();
      skier.move(leftPressed, rightPressed);
      skier.draw();
      updateObstacles();
      checkCollisions();
      score++;
      fill(0);
      textSize(16);
      textAlign(LEFT, TOP);
      text(`Metros percorridos: ${Math.floor(score / 10)}`, 10, 10);

      if (score % 500 === 0) {
        gameSpeed += 0.5;
      }
    } else {
      gameOverScreen();
    }
  }
}

// Desenha a tela inicial com animação
function drawStartScreen() {
  background(0);
  imageY += imageDirection * 0.1;
  if (imageY > 0) {
    imageY = 0;
    imageDirection *= -1;
  } else if (imageY < -10) {
    imageY = -10;
    imageDirection *= -1;
  }
  image(telaInicial, 0, imageY, width, height + 20);
}

// Gera o terreno inicial
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

// Atualiza o terreno durante o jogo
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

// Desenha o terreno na tela
function drawTerrain() {
  fill(236, 255, 253);
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

// Atualiza os obstáculos na tela
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y -= gameSpeed;
    obstacles[i].draw();

    if (obstacles[i].y < -80) {
      obstacles.splice(i, 1);
    }
  }
}

// Verifica colisões entre o esquiador e os obstáculos
function checkCollisions() {
  for (let obs of obstacles) {
    if (obs.type === 0) {
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

// Verifica colisão entre um retângulo e um triângulo
function collisionRectTriangle(rx, ry, rw, rh, tx1, ty1, tx2, ty2, tx3, ty3) {
  return (
    pointInTriangle(rx, ry, tx1, ty1, tx2, ty2, tx3, ty3) ||
    pointInTriangle(rx + rw, ry, tx1, ty1, tx2, ty2, tx3, ty3) ||
    pointInTriangle(rx, ry + rh, tx1, ty1, tx2, ty2, tx3, ty3) ||
    pointInTriangle(rx + rw, ry + rh, tx1, ty1, tx2, ty2, tx3, ty3)
  );
}

// Verifica se um ponto está dentro de um triângulo
function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
  const areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
  const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
  const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
  const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - py) * (y3 - py));
  return area1 + area2 + area3 === areaOrig;
}

// Verifica colisão entre dois retângulos
function collisionRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}

// Gerencia as teclas pressionadas
function keyPressed() {
  if (!gameOver) {
    if (keyCode === LEFT_ARROW) leftPressed = true;
    if (keyCode === RIGHT_ARROW) rightPressed = true;
  }
}

// Gerencia as teclas soltas
function keyReleased() {
  if (keyCode === LEFT_ARROW) leftPressed = false;
  if (keyCode === RIGHT_ARROW) rightPressed = false;
}

// Gerencia cliques do mouse na tela inicial e na tela de game over
function mouseClicked() {
  if (gameState === "start") {
    gameState = "playing";
  } else if (gameOver) {
    resetGame();
  }
}

// Desenha a tela de game over
function gameOverScreen() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255, 0, 0);
  text("GAME OVER", width / 2, height / 2 - 50);
  textSize(16);
  fill(0);
  text(`Percorreu ${Math.floor(score / 10)} metros`, width / 2, height / 2);
  text("Clique para recomeçar", width / 2, height / 2 + 30);
}

// Reinicia o jogo
function resetGame() {
  gameState = "playing";
  gameOver = false;
  skier = new Skier();
  terrain = [];
  obstacles = [];
  skiTrails = []; // Limpa os rastros
  score = 0;
  generateTerrain();
}