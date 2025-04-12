import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Star, Radio } from 'lucide-react';

// Game states
enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAME_OVER
}

// Player ship
interface PlayerShip {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  isMovingUp: boolean;
  isMovingDown: boolean;
  isFiring: boolean;
  lastFireTime: number;
  fireRate: number;
  shield: boolean;
}

// Enemy
interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  type: 'drifter' | 'zigzagger' | 'hunter' | 'tank' | 'swarm' | 'boss';
  points: number;
  direction: number;
  lastDirectionChange: number;
  directionChangeInterval: number;
}

// Projectile
interface Projectile {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isEnemy: boolean;
}

// Power-up
interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'tripleShot' | 'rapidFire' | 'shield' | 'repair' | 'smartBomb';
  duration: number;
  collected: boolean;
}

// Particle
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  alpha: number;
  life: number;
  maxLife: number;
}

const CosmicDefender: React.FC = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  
  // Game objects
  const playerRef = useRef<PlayerShip>({
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    speed: 5,
    lives: 3,
    isMovingLeft: false,
    isMovingRight: false,
    isMovingUp: false,
    isMovingDown: false,
    isFiring: false,
    lastFireTime: 0,
    fireRate: 300, // ms between shots
    shield: false
  });
  
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const keysRef = useRef<{[key: string]: boolean}>({});
  const lastEnemySpawnRef = useRef<number>(0);
  const enemySpawnIntervalRef = useRef<number>(1500);
  const lastPowerUpSpawnRef = useRef<number>(0);
  const powerUpSpawnIntervalRef = useRef<number>(10000);
  const gameTimeRef = useRef<number>(0);
  const activePowerUpsRef = useRef<{[key: string]: number}>({});
  
  // Initialize game
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('cosmicDefenderHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    // Set up event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);
  
  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent default action for arrow keys and spacebar
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    keysRef.current[e.key] = true;
    
    // Handle specific key actions
    if (e.key === 'Escape') {
      if (gameState === GameState.PLAYING) {
        setGameState(GameState.PAUSED);
      } else if (gameState === GameState.PAUSED) {
        setGameState(GameState.PLAYING);
      }
    }
    
    // Start game on spacebar from menu
    if (e.key === ' ' && gameState === GameState.MENU) {
      startGame();
    }
    
    // Restart on spacebar from game over
    if (e.key === ' ' && gameState === GameState.GAME_OVER) {
      startGame();
    }
    
    // Set player movement flags
    const player = playerRef.current;
    if (e.key === 'ArrowLeft') player.isMovingLeft = true;
    if (e.key === 'ArrowRight') player.isMovingRight = true;
    if (e.key === 'ArrowUp') player.isMovingUp = true;
    if (e.key === 'ArrowDown') player.isMovingDown = true;
    if (e.key === ' ') player.isFiring = true;
  };
  
  // Handle key up events
  const handleKeyUp = (e: KeyboardEvent) => {
    keysRef.current[e.key] = false;
    
    // Clear player movement flags
    const player = playerRef.current;
    if (e.key === 'ArrowLeft') player.isMovingLeft = false;
    if (e.key === 'ArrowRight') player.isMovingRight = false;
    if (e.key === 'ArrowUp') player.isMovingUp = false;
    if (e.key === 'ArrowDown') player.isMovingDown = false;
    if (e.key === ' ') player.isFiring = false;
  };
  
  // Start a new game
  const startGame = () => {
    // Reset game state
    setGameState(GameState.PLAYING);
    setScore(0);
    setLevel(1);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initialize player
    playerRef.current = {
      x: canvas.width / 2 - 25,
      y: canvas.height - 70,
      width: 50,
      height: 50,
      speed: 5,
      lives: 3,
      isMovingLeft: false,
      isMovingRight: false,
      isMovingUp: false,
      isMovingDown: false,
      isFiring: false,
      lastFireTime: 0,
      fireRate: 300,
      shield: false
    };
    
    // Clear game objects
    enemiesRef.current = [];
    projectilesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    
    // Reset timers
    lastEnemySpawnRef.current = 0;
    enemySpawnIntervalRef.current = 1500;
    lastPowerUpSpawnRef.current = 0;
    gameTimeRef.current = 0;
    activePowerUpsRef.current = {};
    
    // Start game loop
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(gameLoop);
    
    toast({
      title: "Cosmic Defender",
      description: "Game started! Defend the cosmos!",
    });
  };
  
  // Main game loop
  const gameLoop = (timestamp: number) => {
    if (gameState !== GameState.PLAYING) {
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Update game time
    const deltaTime = timestamp - (gameTimeRef.current || timestamp);
    gameTimeRef.current = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw starfield background
    drawStarfield(ctx, canvas.width, canvas.height, timestamp);
    
    // Update and draw player
    updatePlayer(deltaTime, canvas.width, canvas.height);
    drawPlayer(ctx);
    
    // Spawn enemies
    if (timestamp - lastEnemySpawnRef.current > enemySpawnIntervalRef.current) {
      spawnEnemy(canvas.width);
      lastEnemySpawnRef.current = timestamp;
      
      // Decrease spawn interval over time (increase difficulty)
      enemySpawnIntervalRef.current = Math.max(300, enemySpawnIntervalRef.current - 10);
    }
    
    // Spawn power-ups
    if (timestamp - lastPowerUpSpawnRef.current > powerUpSpawnIntervalRef.current) {
      spawnPowerUp(canvas.width);
      lastPowerUpSpawnRef.current = timestamp;
    }
    
    // Update and draw enemies
    updateEnemies(deltaTime, canvas.width, canvas.height);
    drawEnemies(ctx);
    
    // Update and draw projectiles
    updateProjectiles(deltaTime, canvas.width, canvas.height);
    drawProjectiles(ctx);
    
    // Update and draw power-ups
    updatePowerUps(deltaTime, canvas.height);
    drawPowerUps(ctx);
    
    // Update and draw particles
    updateParticles(deltaTime);
    drawParticles(ctx);
    
    // Handle player firing
    handlePlayerFiring(timestamp);
    
    // Check collisions
    checkCollisions();
    
    // Check power-up durations
    checkPowerUpDurations(timestamp);
    
    // Update level based on score
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      toast({
        title: "Level Up!",
        description: `Advanced to level ${newLevel}`,
      });
    }
    
    // Draw HUD
    drawHUD(ctx, canvas.width);
    
    // Continue game loop
    frameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Draw starfield background
  const drawStarfield = (ctx: CanvasRenderingContext2D, width: number, height: number, timestamp: number) => {
    // Simple parallax starfield
    ctx.fillStyle = '#050520';
    ctx.fillRect(0, 0, width, height);
    
    // Stars are pre-generated and stored in state for efficiency
    // For this demo, we'll create them on the fly
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = (Math.random() * height + timestamp * 0.01 * (i % 3 + 1)) % height;
      const size = (i % 3 + 1) * 0.8;
      const alpha = Math.random() * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Update player position
  const updatePlayer = (deltaTime: number, canvasWidth: number, canvasHeight: number) => {
    const player = playerRef.current;
    
    // Move player based on input flags
    if (player.isMovingLeft) player.x -= player.speed * deltaTime / 16;
    if (player.isMovingRight) player.x += player.speed * deltaTime / 16;
    if (player.isMovingUp) player.y -= player.speed * deltaTime / 16;
    if (player.isMovingDown) player.y += player.speed * deltaTime / 16;
    
    // Keep player within canvas bounds
    player.x = Math.max(0, Math.min(canvasWidth - player.width, player.x));
    player.y = Math.max(0, Math.min(canvasHeight - player.height, player.y));
  };
  
  // Draw player ship
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    
    // Draw thruster effect
    if (player.isMovingUp || player.isMovingDown || player.isMovingLeft || player.isMovingRight) {
      const thrusterGradient = ctx.createLinearGradient(
        player.x + player.width / 2,
        player.y + player.height,
        player.x + player.width / 2,
        player.y + player.height + 20
      );
      thrusterGradient.addColorStop(0, '#ff9933');
      thrusterGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = thrusterGradient;
      ctx.beginPath();
      ctx.moveTo(player.x + player.width * 0.3, player.y + player.height);
      ctx.lineTo(player.x + player.width * 0.7, player.y + player.height);
      ctx.lineTo(player.x + player.width / 2, player.y + player.height + 20);
      ctx.fill();
    }
    
    // Draw ship body
    ctx.fillStyle = '#3399ff';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.fill();
    
    // Draw cockpit
    ctx.fillStyle = '#99ccff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw shield if active
    if (player.shield) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      
      // Shield glow effect
      const shieldGradient = ctx.createRadialGradient(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width
      );
      shieldGradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
      shieldGradient.addColorStop(0.7, 'rgba(100, 200, 255, 0.1)');
      shieldGradient.addColorStop(1, 'rgba(100, 200, 255, 0.2)');
      
      ctx.fillStyle = shieldGradient;
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Spawn a new enemy
  const spawnEnemy = (canvasWidth: number) => {
    const enemyTypes = ['drifter', 'zigzagger', 'hunter', 'tank', 'swarm', 'boss'] as const;
    const level = Math.floor(score / 1000) + 1;
    
    // Determine available enemy types based on level
    let availableTypes = ['drifter'];
    if (level >= 2) availableTypes.push('zigzagger');
    if (level >= 3) availableTypes.push('hunter');
    if (level >= 4) availableTypes.push('tank', 'swarm');
    
    // Boss appears at specific score thresholds
    const shouldSpawnBoss = score > 0 && score % 5000 < 100 && !enemiesRef.current.some(e => e.type === 'boss');
    
    let type: typeof enemyTypes[number];
    let width: number;
    let height: number;
    let speed: number;
    let health: number;
    let points: number;
    
    if (shouldSpawnBoss) {
      type = 'boss';
      width = 100;
      height = 100;
      speed = 1;
      health = 20;
      points = 500;
    } else {
      type = availableTypes[Math.floor(Math.random() * availableTypes.length)] as typeof enemyTypes[number];
      
      // Set properties based on enemy type
      switch (type) {
        case 'drifter':
          width = 40;
          height = 40;
          speed = 2 + Math.random() * level * 0.5;
          health = 1;
          points = 10;
          break;
        case 'zigzagger':
          width = 35;
          height = 35;
          speed = 2.5 + Math.random() * level * 0.3;
          health = 2;
          points = 20;
          break;
        case 'hunter':
          width = 45;
          height = 30;
          speed = 1.5 + Math.random() * level * 0.4;
          health = 3;
          points = 30;
          break;
        case 'tank':
          width = 60;
          height = 50;
          speed = 1 + Math.random() * level * 0.2;
          health = 5;
          points = 40;
          break;
        case 'swarm':
          width = 20;
          height = 20;
          speed = 3 + Math.random() * level * 0.6;
          health = 1;
          points = 5;
          break;
        default:
          width = 40;
          height = 40;
          speed = 2;
          health = 1;
          points = 10;
      }
    }
    
    // Create new enemy
    const enemy: Enemy = {
      id: Date.now() + Math.random(),
      x: Math.random() * (canvasWidth - width),
      y: -height,
      width,
      height,
      speed,
      health,
      type,
      points,
      direction: type === 'zigzagger' ? (Math.random() > 0.5 ? 1 : -1) : 0,
      lastDirectionChange: 0,
      directionChangeInterval: type === 'zigzagger' ? 1000 : 0
    };
    
    // Spawn multiple enemies for swarm type
    if (type === 'swarm') {
      const swarmSize = 5 + Math.floor(Math.random() * 5);
      const swarmEnemies: Enemy[] = [];
      
      for (let i = 0; i < swarmSize; i++) {
        swarmEnemies.push({
          ...enemy,
          id: Date.now() + Math.random() + i,
          x: Math.max(0, Math.min(canvasWidth - width, enemy.x + (i - swarmSize / 2) * width * 1.5)),
          y: enemy.y - i * 15
        });
      }
      
      enemiesRef.current.push(...swarmEnemies);
    } else {
      enemiesRef.current.push(enemy);
    }
  };
  
  // Update enemies position and behavior
  const updateEnemies = (deltaTime: number, canvasWidth: number, canvasHeight: number) => {
    const player = playerRef.current;
    
    enemiesRef.current.forEach(enemy => {
      // Base movement down the screen
      enemy.y += enemy.speed * deltaTime / 16;
      
      // Type-specific movement
      switch (enemy.type) {
        case 'zigzagger':
          // Change direction periodically
          if (Date.now() - enemy.lastDirectionChange > enemy.directionChangeInterval) {
            enemy.direction *= -1;
            enemy.lastDirectionChange = Date.now();
          }
          enemy.x += enemy.direction * enemy.speed * 0.5 * deltaTime / 16;
          break;
          
        case 'hunter':
          // Move towards player's x position
          if (enemy.x + enemy.width / 2 < player.x + player.width / 2) {
            enemy.x += enemy.speed * 0.3 * deltaTime / 16;
          } else if (enemy.x + enemy.width / 2 > player.x + player.width / 2) {
            enemy.x -= enemy.speed * 0.3 * deltaTime / 16;
          }
          break;
          
        case 'boss':
          // Boss moves in a sine wave pattern
          enemy.x = canvasWidth / 2 - enemy.width / 2 + Math.sin(Date.now() / 1000) * canvasWidth / 3;
          
          // Boss occasionally fires projectiles
          if (Math.random() < 0.02) {
            fireEnemyProjectile(enemy);
          }
          break;
      }
      
      // Keep enemy within horizontal bounds
      enemy.x = Math.max(0, Math.min(canvasWidth - enemy.width, enemy.x));
      
      // Enemy firing
      if ((enemy.type === 'hunter' || enemy.type === 'tank') && Math.random() < 0.005) {
        fireEnemyProjectile(enemy);
      }
    });
    
    // Remove enemies that move off-screen
    enemiesRef.current = enemiesRef.current.filter(enemy => enemy.y < canvasHeight + 100);
  };
  
  // Draw enemies
  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    enemiesRef.current.forEach(enemy => {
      // Draw enemy based on type
      switch (enemy.type) {
        case 'drifter':
          // Simple triangle enemy
          ctx.fillStyle = '#ff5555';
          ctx.beginPath();
          ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
          ctx.lineTo(enemy.x, enemy.y);
          ctx.lineTo(enemy.x + enemy.width, enemy.y);
          ctx.fill();
          break;
          
        case 'zigzagger':
          // Diamond shape
          ctx.fillStyle = '#ffaa00';
          ctx.beginPath();
          ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
          ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
          ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
          ctx.lineTo(enemy.x, enemy.y + enemy.height / 2);
          ctx.fill();
          break;
          
        case 'hunter':
          // Arrow shape
          ctx.fillStyle = '#aa55ff';
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y);
          ctx.lineTo(enemy.x + enemy.width, enemy.y);
          ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
          ctx.fill();
          break;
          
        case 'tank':
          // Rectangular tank
          ctx.fillStyle = '#55aa55';
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
          
          // Tank details
          ctx.fillStyle = '#338833';
          ctx.fillRect(enemy.x + enemy.width * 0.25, enemy.y + enemy.height * 0.4, enemy.width * 0.5, enemy.height * 0.6);
          ctx.fillRect(enemy.x + enemy.width * 0.4, enemy.y, enemy.width * 0.2, enemy.height * 0.4);
          break;
          
        case 'swarm':
          // Small circular enemy
          ctx.fillStyle = '#ff99ff';
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'boss':
          // Large complex enemy
          ctx.fillStyle = '#ff0066';
          
          // Main body
          ctx.beginPath();
          ctx.ellipse(
            enemy.x + enemy.width / 2, 
            enemy.y + enemy.height / 2,
            enemy.width / 2,
            enemy.height / 3,
            0, 0, Math.PI * 2
          );
          ctx.fill();
          
          // Top structure
          ctx.beginPath();
          ctx.ellipse(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 4,
            enemy.width / 3,
            enemy.height / 6,
            0, 0, Math.PI * 2
          );
          ctx.fill();
          
          // Wings
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y + enemy.height / 2);
          ctx.lineTo(enemy.x - enemy.width * 0.3, enemy.y + enemy.height * 0.7);
          ctx.lineTo(enemy.x, enemy.y + enemy.height * 0.7);
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
          ctx.lineTo(enemy.x + enemy.width * 1.3, enemy.y + enemy.height * 0.7);
          ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height * 0.7);
          ctx.fill();
          
          // Engine glow
          const glowGradient = ctx.createRadialGradient(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height * 0.8,
            0,
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height * 0.8,
            enemy.width / 2
          );
          glowGradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
          glowGradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height * 0.8, enemy.width / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      
      // Draw health bar for enemies with more than 1 health
      if (enemy.health > 1) {
        const healthPercentage = enemy.health / (
          enemy.type === 'zigzagger' ? 2 :
          enemy.type === 'hunter' ? 3 :
          enemy.type === 'tank' ? 5 :
          enemy.type === 'boss' ? 20 : 1
        );
        
        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
        
        // Health bar fill
        ctx.fillStyle = enemy.health > 2 ? '#00ff00' : '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercentage, 5);
      }
    });
  };
  
  // Fire a projectile from an enemy
  const fireEnemyProjectile = (enemy: Enemy) => {
    const projectile: Projectile = {
      id: Date.now() + Math.random(),
      x: enemy.x + enemy.width / 2 - 3,
      y: enemy.y + enemy.height,
      width: 6,
      height: 12,
      speed: 5,
      isEnemy: true
    };
    
    // Add projectile to the list
    projectilesRef.current.push(projectile);
  };
  
  // Handle player firing projectiles
  const handlePlayerFiring = (timestamp: number) => {
    const player = playerRef.current;
    if (!player.isFiring) return;
    
    // Check fire rate cooldown
    if (timestamp - player.lastFireTime < (activePowerUpsRef.current.rapidFire ? player.fireRate / 2 : player.fireRate)) {
      return;
    }
    
    // Update last fire time
    player.lastFireTime = timestamp;
    
    // Single or triple shot based on power-up
    if (activePowerUpsRef.current.tripleShot) {
      // Triple shot
      for (let i = -1; i <= 1; i++) {
        const projectile: Projectile = {
          id: Date.now() + Math.random() + i,
          x: player.x + player.width / 2 - 3 + i * 10,
          y: player.y - 10,
          width: 6,
          height: 12,
          speed: 10,
          isEnemy: false
        };
        projectilesRef.current.push(projectile);
      }
    } else {
      // Single shot
      const projectile: Projectile = {
        id: Date.now() + Math.random(),
        x: player.x + player.width / 2 - 3,
        y: player.y - 10,
        width: 6,
        height: 12,
        speed: 10,
        isEnemy: false
      };
      projectilesRef.current.push(projectile);
    }
  };
  
  // Update projectiles position
  const updateProjectiles = (deltaTime: number, canvasWidth: number, canvasHeight: number) => {
    projectilesRef.current.forEach(projectile => {
      if (projectile.isEnemy) {
        projectile.y += projectile.speed * deltaTime / 16;
      } else {
        projectile.y -= projectile.speed * deltaTime / 16;
      }
    });
    
    // Remove off-screen projectiles
    projectilesRef.current = projectilesRef.current.filter(projectile => {
      return projectile.y > -20 && projectile.y < canvasHeight + 20;
    });
  };
  
  // Draw projectiles
  const drawProjectiles = (ctx: CanvasRenderingContext2D) => {
    projectilesRef.current.forEach(projectile => {
      if (projectile.isEnemy) {
        // Enemy projectile (red)
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      } else {
        // Player projectile (blue with glow effect)
        ctx.fillStyle = '#33ccff';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        
        // Add glow effect
        const glowGradient = ctx.createRadialGradient(
          projectile.x + projectile.width / 2,
          projectile.y + projectile.height / 2,
          0,
          projectile.x + projectile.width / 2,
          projectile.y + projectile.height / 2,
          10
        );
        glowGradient.addColorStop(0, 'rgba(100, 200, 255, 0.5)');
        glowGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(
          projectile.x + projectile.width / 2,
          projectile.y + projectile.height / 2,
          10,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  };
  
  // Spawn a power-up
  const spawnPowerUp = (canvasWidth: number) => {
    const powerUpTypes = ['tripleShot', 'rapidFire', 'shield', 'repair', 'smartBomb'] as const;
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    const powerUp: PowerUp = {
      id: Date.now() + Math.random(),
      x: Math.random() * (canvasWidth - 30),
      y: -30,
      width: 30,
      height: 30,
      speed: 2,
      type,
      duration: type === 'repair' || type === 'smartBomb' ? 0 : 10000, // 10 seconds for timed power-ups
      collected: false
    };
    
    powerUpsRef.current.push(powerUp);
  };
  
  // Update power-ups position
  const updatePowerUps = (deltaTime: number, canvasHeight: number) => {
    powerUpsRef.current.forEach(powerUp => {
      if (!powerUp.collected) {
        powerUp.y += powerUp.speed * deltaTime / 16;
      }
    });
    
    // Remove off-screen or collected power-ups
    powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
      return !powerUp.collected && powerUp.y < canvasHeight + 30;
    });
  };
  
  // Draw power-ups
  const drawPowerUps = (ctx: CanvasRenderingContext2D) => {
    powerUpsRef.current.forEach(powerUp => {
      if (powerUp.collected) return;
      
      // Create oscillating effect
      const oscillation = Math.sin(Date.now() / 200) * 2;
      
      // Draw power-up based on type
      switch (powerUp.type) {
        case 'tripleShot':
          // Triple bullet icon
          ctx.fillStyle = '#33ccff';
          for (let i = -1; i <= 1; i++) {
            ctx.fillRect(
              powerUp.x + powerUp.width / 2 - 2 + i * 8, 
              powerUp.y + powerUp.height / 2 - 10 + oscillation, 
              4, 
              10
            );
          }
          break;
          
        case 'rapidFire':
          // Lightning bolt icon
          ctx.fillStyle = '#ffcc00';
          ctx.beginPath();
          ctx.moveTo(powerUp.x + powerUp.width * 0.5, powerUp.y + oscillation);
          ctx.lineTo(powerUp.x + powerUp.width * 0.7, powerUp.y + powerUp.height * 0.5 + oscillation);
          ctx.lineTo(powerUp.x + powerUp.width * 0.5, powerUp.y + powerUp.height * 0.5 + oscillation);
          ctx.lineTo(powerUp.x + powerUp.width * 0.5, powerUp.y + powerUp.height + oscillation);
          ctx.lineTo(powerUp.x + powerUp.width * 0.3, powerUp.y + powerUp.height * 0.5 + oscillation);
          ctx.lineTo(powerUp.x + powerUp.width * 0.5, powerUp.y + powerUp.height * 0.5 + oscillation);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'shield':
          // Shield icon
          ctx.strokeStyle = '#00ffcc';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            powerUp.x + powerUp.width / 2, 
            powerUp.y + powerUp.height / 2 + oscillation, 
            powerUp.width / 2 - 5, 
            0, 
            Math.PI * 2
          );
          ctx.stroke();
          break;
          
        case 'repair':
          // Heart icon
          ctx.fillStyle = '#ff3366';
          ctx.beginPath();
          const heartSize = powerUp.width / 2;
          ctx.moveTo(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + heartSize / 2 + oscillation);
          ctx.bezierCurveTo(
            powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 - 1 + oscillation,
            powerUp.x + powerUp.width / 2 - heartSize, powerUp.y + powerUp.height / 2 - heartSize / 2 + oscillation,
            powerUp.x + powerUp.width / 2 - heartSize / 2, powerUp.y + powerUp.height / 2 - heartSize / 3 + oscillation
          );
          ctx.bezierCurveTo(
            powerUp.x + powerUp.width / 2 - heartSize / 2, powerUp.y + oscillation,
            powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 - heartSize / 4 + oscillation,
            powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 - heartSize / 4 + oscillation
          );
          ctx.bezierCurveTo(
            powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 - heartSize / 4 + oscillation,
            powerUp.x + powerUp.width / 2 + heartSize / 2, powerUp.y + oscillation,
            powerUp.x + powerUp.width / 2 + heartSize / 2, powerUp.y + powerUp.height / 2 - heartSize / 3 + oscillation
          );
          ctx.bezierCurveTo(
            powerUp.x + powerUp.width / 2 + heartSize, powerUp.y + powerUp.height / 2 - heartSize / 2 + oscillation,
            powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 - 1 + oscillation,
            powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + heartSize / 2 + oscillation
          );
          ctx.fill();
          break;
          
        case 'smartBomb':
          // Bomb icon
          ctx.fillStyle = '#ff6600';
          ctx.beginPath();
          ctx.arc(
            powerUp.x + powerUp.width / 2, 
            powerUp.y + powerUp.height / 2 + 5 + oscillation, 
            powerUp.width / 3, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
          
          // Bomb fuse
          ctx.strokeStyle = '#ffcc00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 - powerUp.width / 3 + oscillation);
          ctx.lineTo(powerUp.x + powerUp.width / 2, powerUp.y + 5 + oscillation);
          ctx.stroke();
          
          // Fuse spark
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(
            powerUp.x + powerUp.width / 2, 
            powerUp.y + 5 + oscillation, 
            3, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
          break;
      }
      
      // Draw power-up glow effect
      const glowColor = 
        powerUp.type === 'tripleShot' ? 'rgba(50, 150, 255, 0.3)' :
        powerUp.type === 'rapidFire' ? 'rgba(255, 200, 0, 0.3)' :
        powerUp.type === 'shield' ? 'rgba(0, 255, 200, 0.3)' :
        powerUp.type === 'repair' ? 'rgba(255, 50, 100, 0.3)' :
        'rgba(255, 100, 0, 0.3)';
        
      const glowGradient = ctx.createRadialGradient(
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2 + oscillation,
        0,
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2 + oscillation,
        powerUp.width
      );
      
      glowGradient.addColorStop(0, glowColor);
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2 + oscillation,
        powerUp.width,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  };
  
  // Check for collisions between game objects
  const checkCollisions = () => {
    const player = playerRef.current;
    
    // Player-Enemy collisions
    enemiesRef.current.forEach(enemy => {
      if (checkCollision(player, enemy)) {
        if (player.shield) {
          // Shield absorbs one hit
          player.shield = false;
          delete activePowerUpsRef.current.shield;
          
          // Create shield break effect
          createShieldBreakEffect(player.x + player.width / 2, player.y + player.height / 2);
          
          toast({
            title: "Shield Down!",
            description: "Your shield has been depleted.",
          });
        } else {
          // Player loses a life
          player.lives--;
          
          // Check game over
          if (player.lives <= 0) {
            gameOver();
          } else {
            // Create explosion effect
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#3399ff');
            
            toast({
              title: "Ship Damaged!",
              description: `${player.lives} lives remaining`,
            });
          }
        }
        
        // Create explosion effect for the enemy
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff5555');
        
        // Remove the enemy
        enemiesRef.current = enemiesRef.current.filter(e => e.id !== enemy.id);
      }
    });
    
    // Projectile-Enemy collisions
    projectilesRef.current.forEach(projectile => {
      if (projectile.isEnemy) return; // Skip enemy projectiles
      
      enemiesRef.current.forEach(enemy => {
        if (checkCollision(projectile, enemy)) {
          // Remove projectile
          projectilesRef.current = projectilesRef.current.filter(p => p.id !== projectile.id);
          
          // Decrease enemy health
          enemy.health--;
          
          // Create hit effect
          createHitEffect(projectile.x, projectile.y);
          
          // Check if enemy is destroyed
          if (enemy.health <= 0) {
            // Create explosion effect
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 
              enemy.type === 'drifter' ? '#ff5555' :
              enemy.type === 'zigzagger' ? '#ffaa00' :
              enemy.type === 'hunter' ? '#aa55ff' :
              enemy.type === 'tank' ? '#55aa55' :
              enemy.type === 'swarm' ? '#ff99ff' : '#ff0066'
            );
            
            // Update score
            setScore(prevScore => prevScore + enemy.points);
            
            // Remove enemy
            enemiesRef.current = enemiesRef.current.filter(e => e.id !== enemy.id);
          }
        }
      });
    });
    
    // Player-Projectile collisions (enemy projectiles)
    projectilesRef.current.forEach(projectile => {
      if (!projectile.isEnemy) return; // Skip player projectiles
      
      if (checkCollision(projectile, player)) {
        // Remove projectile
        projectilesRef.current = projectilesRef.current.filter(p => p.id !== projectile.id);
        
        if (player.shield) {
          // Shield absorbs one hit
          createHitEffect(projectile.x, projectile.y);
        } else {
          // Player loses a life
          player.lives--;
          
          // Create hit effect
          createHitEffect(projectile.x, projectile.y);
          
          // Check game over
          if (player.lives <= 0) {
            gameOver();
          } else {
            toast({
              title: "Ship Damaged!",
              description: `${player.lives} lives remaining`,
            });
          }
        }
      }
    });
    
    // Player-PowerUp collisions
    powerUpsRef.current.forEach(powerUp => {
      if (!powerUp.collected && checkCollision(powerUp, player)) {
        // Mark as collected
        powerUp.collected = true;
        
        // Apply power-up effect
        applyPowerUp(powerUp);
        
        // Create collection effect
        createPowerUpCollectionEffect(powerUp);
      }
    });
  };
  
  // Check if two objects are colliding
  const checkCollision = (obj1: { x: number, y: number, width: number, height: number }, 
                         obj2: { x: number, y: number, width: number, height: number }) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };
  
  // Apply power-up effect
  const applyPowerUp = (powerUp: PowerUp) => {
    const player = playerRef.current;
    
    switch (powerUp.type) {
      case 'tripleShot':
        activePowerUpsRef.current.tripleShot = Date.now() + powerUp.duration;
        toast({
          title: "Triple Shot!",
          description: "Fire three projectiles at once.",
        });
        break;
        
      case 'rapidFire':
        activePowerUpsRef.current.rapidFire = Date.now() + powerUp.duration;
        toast({
          title: "Rapid Fire!",
          description: "Increased firing rate.",
        });
        break;
        
      case 'shield':
        player.shield = true;
        activePowerUpsRef.current.shield = Date.now() + powerUp.duration;
        toast({
          title: "Shield Activated!",
          description: "Protected from one hit.",
        });
        break;
        
      case 'repair':
        if (player.lives < 3) {
          player.lives++;
          toast({
            title: "Repair Kit!",
            description: `Ship repaired. Lives: ${player.lives}`,
          });
        } else {
          toast({
            title: "Ship at Full Health",
            description: "Repair kit not needed.",
          });
        }
        break;
        
      case 'smartBomb':
        // Create explosion effect for all enemies
        enemiesRef.current.forEach(enemy => {
          createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
            enemy.type === 'drifter' ? '#ff5555' :
            enemy.type === 'zigzagger' ? '#ffaa00' :
            enemy.type === 'hunter' ? '#aa55ff' :
            enemy.type === 'tank' ? '#55aa55' :
            enemy.type === 'swarm' ? '#ff99ff' : '#ff0066'
          );
          
          // Add to score
          setScore(prevScore => prevScore + enemy.points);
        });
        
        // Clear all enemies
        enemiesRef.current = [];
        
        toast({
          title: "Smart Bomb!",
          description: "All enemies destroyed.",
        });
        break;
    }
  };
  
  // Check power-up durations and remove expired ones
  const checkPowerUpDurations = (timestamp: number) => {
    Object.entries(activePowerUpsRef.current).forEach(([powerUpType, expiryTime]) => {
      if (timestamp > expiryTime) {
        // Power-up has expired
        delete activePowerUpsRef.current[powerUpType];
        
        if (powerUpType === 'shield') {
          playerRef.current.shield = false;
        }
        
        toast({
          title: `${powerUpType.charAt(0).toUpperCase() + powerUpType.slice(1)} Expired`,
          description: "Power-up effect has ended.",
        });
      }
    });
  };
  
  // Create explosion particle effect
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      const size = Math.random() * 5 + 2;
      const life = Math.random() * 30 + 10;
      
      const particle: Particle = {
        id: Date.now() + Math.random() + i,
        x,
        y,
        size,
        color,
        speed,
        angle,
        alpha: 1,
        life,
        maxLife: life
      };
      
      particlesRef.current.push(particle);
    }
  };
  
  // Create shield break effect
  const createShieldBreakEffect = (x: number, y: number) => {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const size = Math.random() * 4 + 1;
      const life = Math.random() * 20 + 10;
      
      const particle: Particle = {
        id: Date.now() + Math.random() + i,
        x,
        y,
        size,
        color: '#00ffcc',
        speed,
        angle,
        alpha: 1,
        life,
        maxLife: life
      };
      
      particlesRef.current.push(particle);
    }
  };
  
  // Create hit effect
  const createHitEffect = (x: number, y: number) => {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      const size = Math.random() * 3 + 1;
      const life = Math.random() * 10 + 5;
      
      const particle: Particle = {
        id: Date.now() + Math.random() + i,
        x,
        y,
        size,
        color: '#ffff99',
        speed,
        angle,
        alpha: 1,
        life,
        maxLife: life
      };
      
      particlesRef.current.push(particle);
    }
  };
  
  // Create power-up collection effect
  const createPowerUpCollectionEffect = (powerUp: PowerUp) => {
    const color = 
      powerUp.type === 'tripleShot' ? '#33ccff' :
      powerUp.type === 'rapidFire' ? '#ffcc00' :
      powerUp.type === 'shield' ? '#00ffcc' :
      powerUp.type === 'repair' ? '#ff3366' :
      '#ff6600';
      
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      const size = Math.random() * 4 + 2;
      const life = Math.random() * 20 + 10;
      
      const particle: Particle = {
        id: Date.now() + Math.random() + i,
        x: powerUp.x + powerUp.width / 2,
        y: powerUp.y + powerUp.height / 2,
        size,
        color,
        speed,
        angle,
        alpha: 1,
        life,
        maxLife: life
      };
      
      particlesRef.current.push(particle);
    }
  };
  
  // Update particles
  const updateParticles = (deltaTime: number) => {
    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += Math.cos(particle.angle) * particle.speed * deltaTime / 16;
      particle.y += Math.sin(particle.angle) * particle.speed * deltaTime / 16;
      
      // Update life and alpha
      particle.life -= deltaTime / 16;
      particle.alpha = particle.life / particle.maxLife;
    });
    
    // Remove dead particles
    particlesRef.current = particlesRef.current.filter(particle => particle.life > 0);
  };
  
  // Draw particles
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(particle => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Reset global alpha
    ctx.globalAlpha = 1;
  };
  
  // Draw HUD (Heads Up Display)
  const drawHUD = (ctx: CanvasRenderingContext2D, canvasWidth: number) => {
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 30);
    
    // High score
    ctx.textAlign = 'right';
    ctx.fillText(`High Score: ${Math.max(highScore, score)}`, canvasWidth - 20, 30);
    
    // Level
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${level}`, canvasWidth / 2, 30);
    
    // Lives
    for (let i = 0; i < playerRef.current.lives; i++) {
      // Draw small ship icons for lives
      const x = 20 + i * 30;
      const y = 60;
      
      ctx.fillStyle = '#3399ff';
      ctx.beginPath();
      ctx.moveTo(x + 10, y);
      ctx.lineTo(x + 20, y + 15);
      ctx.lineTo(x, y + 15);
      ctx.fill();
    }
    
    // Active power-ups
    let powerUpIndex = 0;
    Object.entries(activePowerUpsRef.current).forEach(([powerUpType, expiryTime]) => {
      const timeLeft = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
      const x = canvasWidth - 20;
      const y = 60 + powerUpIndex * 25;
      
      // Icon + time remaining
      const icon = 
        powerUpType === 'tripleShot' ? '⟪⟫' :
        powerUpType === 'rapidFire' ? '⚡' :
        powerUpType === 'shield' ? '⊙' : '?';
        
      ctx.fillStyle = 
        powerUpType === 'tripleShot' ? '#33ccff' :
        powerUpType === 'rapidFire' ? '#ffcc00' :
        powerUpType === 'shield' ? '#00ffcc' : '#ffffff';
        
      ctx.textAlign = 'right';
      ctx.fillText(`${icon} ${timeLeft}s`, x, y);
      
      powerUpIndex++;
    });
    
    // Draw pause/game over/menu screens
    switch (gameState) {
      case GameState.PAUSED:
        drawPauseScreen(ctx, canvasWidth);
        break;
        
      case GameState.GAME_OVER:
        drawGameOverScreen(ctx, canvasWidth);
        break;
        
      case GameState.MENU:
        drawMenuScreen(ctx, canvasWidth);
        break;
    }
  };
  
  // Draw pause screen
  const drawPauseScreen = (ctx: CanvasRenderingContext2D, canvasWidth: number) => {
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, ctx.canvas.height);
    
    // Pause text
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvasWidth / 2, ctx.canvas.height / 2 - 50);
    
    // Instructions
    ctx.font = '20px Arial';
    ctx.fillText('Press ESC to continue', canvasWidth / 2, ctx.canvas.height / 2);
  };
  
  // Draw game over screen
  const drawGameOverScreen = (ctx: CanvasRenderingContext2D, canvasWidth: number) => {
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, ctx.canvas.height);
    
    // Game over text
    ctx.fillStyle = '#ff3333';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvasWidth / 2, ctx.canvas.height / 2 - 80);
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, canvasWidth / 2, ctx.canvas.height / 2 - 30);
    
    // High score
    if (score > highScore) {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('New High Score!', canvasWidth / 2, ctx.canvas.height / 2 + 10);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`High Score: ${highScore}`, canvasWidth / 2, ctx.canvas.height / 2 + 10);
    }
    
    // Instructions
    ctx.font = '20px Arial';
    ctx.fillText('Press SPACE to restart', canvasWidth / 2, ctx.canvas.height / 2 + 60);
  };
  
  // Draw menu screen
  const drawMenuScreen = (ctx: CanvasRenderingContext2D, canvasWidth: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Clear canvas and draw starfield background
    ctx.clearRect(0, 0, canvasWidth, canvas.height);
    drawStarfield(ctx, canvasWidth, canvas.height, Date.now());
    
    // Game title
    ctx.fillStyle = '#3399ff';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('COSMIC DEFENDER', canvasWidth / 2, canvas.height / 2 - 100);
    
    // Instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Arrow Keys to Move', canvasWidth / 2, canvas.height / 2);
    ctx.fillText('Space to Fire', canvasWidth / 2, canvas.height / 2 + 40);
    
    // Start prompt
    const promptY = canvas.height / 2 + 120;
    const pulseFactor = (Math.sin(Date.now() / 300) + 1) / 4 + 0.75; // 0.75-1.25 range
    
    ctx.font = `${Math.floor(30 * pulseFactor)}px Arial`;
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseFactor})`;
    ctx.fillText('Press SPACE to Start', canvasWidth / 2, promptY);
    
    // High score
    if (highScore > 0) {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText(`High Score: ${highScore}`, canvasWidth / 2, canvas.height - 40);
    }
  };
  
  // Game over
  const gameOver = () => {
    setGameState(GameState.GAME_OVER);
    
    // Check for new high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('cosmicDefenderHighScore', score.toString());
      
      toast({
        title: "New High Score!",
        description: `You achieved ${score} points!`,
      });
    }
  };
  
  // Set up the canvas on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions to fill the container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Reinitialize player position if game is not running
        if (gameState !== GameState.PLAYING) {
          playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
          playerRef.current.y = canvas.height - 70;
        }
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Draw the menu screen on initial load
    const ctx = canvas.getContext('2d');
    if (ctx && gameState === GameState.MENU) {
      drawMenuScreen(ctx, canvas.width);
      
      // Set up animation loop for the menu
      const menuLoop = () => {
        if (gameState === GameState.MENU) {
          drawMenuScreen(ctx, canvas.width);
          requestAnimationFrame(menuLoop);
        }
      };
      
      requestAnimationFrame(menuLoop);
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState]);
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-card/80 backdrop-blur-sm p-4 border-b border-border">
        <h1 className="text-3xl font-bold text-primary text-center">Cosmic Defender</h1>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        {/* Game Canvas */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Controls Overlay - Only visible on mobile or when paused */}
        {gameState === GameState.MENU && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <Button 
              className="px-8 py-6 text-xl bg-primary hover:bg-primary/80" 
              onClick={startGame}
            >
              Start Game
            </Button>
          </div>
        )}
        
        {/* Mobile Controls */}
        <div className="md:hidden absolute bottom-0 w-full flex justify-between p-4">
          <div className="flex gap-2">
            <Button 
              className="size-14 rounded-full"
              onTouchStart={() => playerRef.current.isMovingLeft = true}
              onTouchEnd={() => playerRef.current.isMovingLeft = false}
            >
              ←
            </Button>
            <Button 
              className="size-14 rounded-full"
              onTouchStart={() => playerRef.current.isMovingRight = true}
              onTouchEnd={() => playerRef.current.isMovingRight = false}
            >
              →
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="size-14 rounded-full"
              onTouchStart={() => playerRef.current.isMovingUp = true}
              onTouchEnd={() => playerRef.current.isMovingUp = false}
            >
              ↑
            </Button>
            <Button 
              className="size-14 rounded-full"
              onTouchStart={() => playerRef.current.isMovingDown = true}
              onTouchEnd={() => playerRef.current.isMovingDown = false}
            >
              ↓
            </Button>
          </div>
          
          <Button 
            className="size-14 rounded-full"
            onTouchStart={() => playerRef.current.isFiring = true}
            onTouchEnd={() => playerRef.current.isFiring = false}
          >
            🔥
          </Button>
        </div>
      </div>
      
      {/* Power-up indicators */}
      <div className="absolute top-16 right-4 flex flex-col gap-2">
        {Object.entries(activePowerUpsRef.current).map(([type, expiryTime]) => {
          const timeLeft = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
          return (
            <div key={type} className="bg-card/80 backdrop-blur-sm p-2 rounded-md flex items-center gap-2">
              {type === 'tripleShot' && <Star className="text-blue-400" />}
              {type === 'rapidFire' && <Zap className="text-yellow-400" />}
              {type === 'shield' && <Shield className="text-emerald-400" />}
              <span>{timeLeft}s</span>
            </div>
          );
        })}
      </div>
      
      {/* Game instructions */}
      <div className="absolute bottom-4 left-4 md:block hidden">
        <div className="bg-card/80 backdrop-blur-sm p-2 rounded-md text-sm">
          <p>Arrow Keys: Move</p>
          <p>Spacebar: Fire</p>
          <p>Esc: Pause</p>
        </div>
      </div>
    </div>
  );
};

export default CosmicDefender;
