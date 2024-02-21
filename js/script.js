let state = {
      route: 'login',
      username: '',
      startTime: null,
      elapsedTime: 0,
      lives: 5,
      monstersEncountered: 0,
      trapsEncountered: 0,
      gameInterval: null,
      monsterInterval: null,
      trapInterval: null,
      playerPosition: { x: 0, y: 0 },
      monsters: [],
      traps: [],
      gamePaused: false
    };

    function updateState(newState) {
      state = { ...state, ...newState };
      render();
    }

    function render() {
      const app = document.getElementById('app');
      app.innerHTML = '';

      switch (state.route) {
        case 'login':
          renderLogin();
          break;
        case 'game':
          renderGame();
          break;
        case 'results':
          renderResults();
          break;
      }
    }

    const finishPointRadius = 10;
    const finishPosition = { x: 780, y: 380 };
    const finishPoint = { x: finishPosition.x + finishPointRadius, y: finishPosition.y + finishPointRadius };

    function renderLogin() {
      const login = document.createElement('div');
      login.innerHTML = `
        <h1>Welcome to the Game</h1>
        <form id="login-form" onsubmit="startGame(event)">
          <input type="text" id="username" placeholder="Enter your name" required>
          <button type="submit">Start Game</button>
        </form>
      `;
      app.appendChild(login);
    }

    function startGame(event) {
      event.preventDefault();
      clearIntervals();
      const username = document.getElementById('username').value;
      updateState({
        route: 'game',
        username,
        startTime: new Date(),
        elapsedTime: 0,
        lives: 5,
        monstersEncountered: 0,
        trapsEncountered: 0,
        monsters: [],
        traps: [],
        playerPosition: { x: 0, y: 0 },
        gameInterval: setInterval(updateElapsedTime, 1000),
        monsterInterval: setInterval(() => {
          spawnMonster();
          moveMonsters();
        }, 1000),
        trapInterval: setInterval(spawnTrap, 3000),
        gamePaused: false
      });
      renderPlayer();
    }

    function clearIntervals() {
      clearInterval(state.gameInterval);
      clearInterval(state.monsterInterval);
      clearInterval(state.trapInterval);
    }

    let pauseStartTime = null;

    function togglePause() {
      state.gamePaused = !state.gamePaused;
      if (state.gamePaused) {
        pauseStartTime = new Date();
      } else {
        const pauseDuration = new Date() - pauseStartTime;
        state.startTime = new Date(state.startTime.getTime() + pauseDuration);
      }
      updateElapsedTime();
    }

    function updateElapsedTime() {
      const currentTime = state.gamePaused ? pauseStartTime : new Date();
      const elapsedTime = Math.floor((currentTime - state.startTime) / 1000);
      const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
      const seconds = (elapsedTime % 60).toString().padStart(2, '0');
      document.getElementById('time').textContent = `Time: ${minutes}:${seconds}`;
      document.getElementById('game-info').textContent = `Name: ${state.username} | Lives: ${state.lives}`;
      checkFinish();
    }

    function updateMonsterPositionTowardsPlayer(monster) {
      if (Math.random() < 0.1) {
        const randomAngle = Math.random() * 2 * Math.PI;
        const normalizedDirectionX = Math.cos(randomAngle);
        const normalizedDirectionY = Math.sin(randomAngle);

        monster.x += normalizedDirectionX * 100;
        monster.y += normalizedDirectionY * 100;
      }
    }

    function moveMonsters() {
      if (!state.gamePaused) {
        state.monsters.forEach(monster => {
          updateMonsterPositionTowardsPlayer(monster);
        });
        renderMonsters();
      }
    }

    function renderMonsters() {
      state.monsters.forEach(monster => {
        const monsterElement = document.getElementById(`monster-${monster.id}`);
        monsterElement.style.left = monster.x + 'px';
        monsterElement.style.top = monster.y + 'px';
      });
    }

    state.monsterInterval = setInterval(() => {
      moveMonsters();
    }, 1000);

    function spawnMonster() {
      if (state.monsters.length < 10 && !state.gamePaused) {
        for (let i = 0; i < 10; i++) {
          const monster = {
            id: state.monsters.length + 1,
            x: Math.random() * 780,
            y: Math.random() * 380
          };
          state.monsters.push(monster);
          renderMonster(monster);
        }
      }
    }

    function renderMonster(monster) {
      const monsterElement = document.createElement('div');
      monsterElement.className = 'monster';
      monsterElement.id = `monster-${monster.id}`;
      monsterElement.style.left = monster.x + 'px';
      monsterElement.style.top = monster.y + 'px';
      document.getElementById('game-screen').appendChild(monsterElement);
    }

    function spawnTrap() {
      if (state.traps.length < 2 && !state.gamePaused) {
        for (let i = 0; i < 2; i++) {
          const trap = {
            id: state.traps.length + 1,
            x: Math.random() * 780,
            y: Math.random() * 380
          };
          state.traps.push(trap);
          renderTrap(trap);
        }
      }
    }

    function renderTrap(trap) {
      const trapElement = document.createElement('div');
      trapElement.className = 'trap';
      trapElement.id = `trap-${trap.id}`;
      trapElement.style.left = trap.x + 'px';
      trapElement.style.top = trap.y + 'px';
      document.getElementById('game-screen').appendChild(trapElement);
    }

function renderGame() {
  const gameScreen = document.createElement('div');
  gameScreen.id = 'game-screen';
  gameScreen.tabIndex = 0;
  gameScreen.onkeydown = handleKeyPress;
  app.appendChild(gameScreen);

  const player = document.createElement('div');
  player.className = 'player';
  player.id = 'player';
  player.style.left = state.playerPosition.x + 'px';
  player.style.top = state.playerPosition.y + 'px';
  gameScreen.appendChild(player);

  const gameInfo = document.createElement('div');
  gameInfo.id = 'game-info';
  gameScreen.appendChild(gameInfo);

  const time = document.createElement('div');
  time.id = 'time';
  gameScreen.appendChild(time);

  const finishPoint = document.createElement('div');
  finishPoint.className = 'finish-point';
  finishPoint.style.left = Math.min(finishPosition.x, 780 - finishPointRadius) + 'px'; // Учитывает границы игрового поля
  finishPoint.style.top = Math.min(finishPosition.y, 380 - finishPointRadius) + 'px'; // Учитывает границы игрового поля
  gameScreen.appendChild(finishPoint);

  updateElapsedTime();
  checkFinish();
}

    function handleKeyPress(event) {
      if (event.key === 'Escape') {
        togglePause();
      }
      if (state.gamePaused) return;

      const step = 10;
      switch (event.key) {
        case 'ArrowUp':
          state.playerPosition.y = Math.max(state.playerPosition.y - step, 0);
          break;
        case 'ArrowDown':
          state.playerPosition.y = Math.min(state.playerPosition.y + step, 380);
          break;
        case 'ArrowLeft':
          state.playerPosition.x = Math.max(state.playerPosition.x - step, 0);
          break;
        case 'ArrowRight':
          state.playerPosition.x = Math.min(state.playerPosition.x + step, 780);
          break;
      }
      renderPlayer();
      checkCollisions();
    }

    function renderPlayer() {
      let playerElement = document.getElementById('player');
      if (!playerElement) {
        playerElement = document.createElement('div');
        playerElement.className = 'player';
        playerElement.id = 'player';
        document.getElementById('game-screen').appendChild(playerElement);
      }
      playerElement.style.left = state.playerPosition.x + 'px';
      playerElement.style.top = state.playerPosition.y + 'px';
      
      checkFinish();
    }

    function checkCollisions() {
      state.monsters = state.monsters.filter(monster => {
        const playerRect = document.getElementById('player').getBoundingClientRect();
        const monsterRect = document.getElementById(`monster-${monster.id}`).getBoundingClientRect();
        if (
          playerRect.x < monsterRect.x + monsterRect.width &&
          playerRect.x + playerRect.width > monsterRect.x &&
          playerRect.y < monsterRect.y + monsterRect.height &&
          playerRect.height + playerRect.y > monsterRect.y
        ) {
          state.lives--;
          state.monstersEncountered++;
          document.getElementById(`monster-${monster.id}`).remove();
          return false;
        }
        return true;
      });

      state.traps = state.traps.filter(trap => {
        const playerRect = document.getElementById('player').getBoundingClientRect();
        const trapRect = document.getElementById(`trap-${trap.id}`).getBoundingClientRect();
        if (
          playerRect.x < trapRect.x + trapRect.width &&
          playerRect.x + playerRect.width > trapRect.x &&
          playerRect.y < trapRect.y + trapRect.height &&
          playerRect.height + playerRect.y > trapRect.y
        ) {
          state.lives--;
          state.trapsEncountered++;
          document.getElementById(`trap-${trap.id}`).remove();
          return false;
        }
        return true;
      });

      renderStats();

      if (state.lives <= 0) {
        endGame();
      }
    }

    function checkFinish() {
      const playerRadius = 10;
      const playerCenterX = state.playerPosition.x + playerRadius;
      const playerCenterY = state.playerPosition.y + playerRadius;

      const distanceX = playerCenterX - finishPoint.x;
      const distanceY = playerCenterY - finishPoint.y;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      const radiiSum = playerRadius + finishPointRadius;
      const radiiSumSquared = radiiSum * radiiSum;

      if (distanceSquared <= radiiSumSquared) {
        updateState({ route: 'results' });
      }
    }

    function renderStats() {
      const gameInfo = document.getElementById('game-info');
      gameInfo.textContent = `Name: ${state.username} | Lives: ${state.lives} | Monsters Encountered: ${state.monstersEncountered} | Traps Encountered: ${state.trapsEncountered}`;
    }

    function endGame() {
      clearInterval(state.gameInterval);
      clearInterval(state.monsterInterval);
      clearInterval(state.trapInterval);
      state.gamePaused = true;
      updateState({ route: 'results' });
    }

    function renderResults() {
      const results = document.createElement('div');
      const elapsedTime = state.elapsedTime;
      const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
      const seconds = (elapsedTime % 60).toString().padStart(2, '0');
      results.innerHTML = `
        <h1>Congratulations!</h1>
        <p>You have completed the map.</p>
        <p>Time Elapsed: ${minutes}:${seconds}</p>
        <p>Monsters Encountered: ${state.monstersEncountered}</p>
        <p>Traps Encountered: ${state.trapsEncountered}</p>
        <p>Lives Remaining: ${state.lives}</p>
        <button onclick="restartGame()">Play Again</button>
      `;
      app.appendChild(results);
    }


    function restartGame() {
      updateState({ route: 'login' });
    }

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
      const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${remainingSeconds}`;
    }

    render();