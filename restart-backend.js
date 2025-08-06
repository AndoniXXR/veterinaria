const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting backend server...');

// Kill existing node processes (Windows)
const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe'], { stdio: 'inherit' });

killProcess.on('close', (code) => {
  console.log('🛑 Previous processes terminated');
  
  // Wait a moment then start the backend
  setTimeout(() => {
    console.log('🚀 Starting backend server...');
    
    const backend = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit',
      shell: true
    });
    
    backend.on('error', (err) => {
      console.error('❌ Error starting backend:', err);
    });
    
  }, 1000);
});