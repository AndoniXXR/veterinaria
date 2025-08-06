const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando aplicación veterinaria...\n');

// Configuración de puertos
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3000;

// Función para ejecutar comando con output en tiempo real
function runCommand(command, args, cwd, name, color) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    // Prefijo con color para identificar los procesos
    const prefix = `[${name}]`;
    const colorCode = color === 'blue' ? '\x1b[34m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${colorCode}${prefix}${resetColor} ${line}`);
      });
    });

    process.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${colorCode}${prefix}${resetColor} ${line}`);
      });
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.log(`${colorCode}${prefix}${resetColor} Proceso terminado con código ${code}`);
      }
      resolve(code);
    });

    process.on('error', (error) => {
      console.error(`${colorCode}${prefix}${resetColor} Error: ${error.message}`);
      reject(error);
    });

    return process;
  });
}

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Función principal
async function startDev() {
  try {
    // Verificar si los puertos están en uso
    const backendInUse = await isPortInUse(BACKEND_PORT);
    const frontendInUse = await isPortInUse(FRONTEND_PORT);

    if (backendInUse) {
      console.log(`⚠️  Puerto ${BACKEND_PORT} ya está en uso (Backend)`);
    }
    
    if (frontendInUse) {
      console.log(`⚠️  Puerto ${FRONTEND_PORT} ya está en uso (Frontend)`);
    }

    console.log('📋 Configuración:');
    console.log(`   • Backend: http://localhost:${BACKEND_PORT}`);
    console.log(`   • Frontend: http://localhost:${FRONTEND_PORT}`);
    console.log(`   • API URL: http://localhost:${BACKEND_PORT}/api\n`);

    // Rutas de los proyectos
    const backendPath = path.join(__dirname, 'backend');
    const frontendPath = path.join(__dirname, 'frontend');

    console.log('🔧 Instalando dependencias si es necesario...\n');

    // Iniciar backend
    console.log('🗄️  Iniciando servidor backend...');
    const backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: backendPath,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: BACKEND_PORT }
    });

    // Esperar un poco antes de iniciar el frontend
    setTimeout(() => {
      console.log('🎨 Iniciando aplicación frontend...');
      const frontendProcess = spawn('npm', ['start'], {
        cwd: frontendPath,
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: FRONTEND_PORT, BROWSER: 'none' }
      });

      // Manejar output del frontend
      frontendProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.log(`\x1b[32m[FRONTEND]\x1b[0m ${line}`);
        });
      });

      frontendProcess.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.log(`\x1b[32m[FRONTEND]\x1b[0m ${line}`);
        });
      });

      frontendProcess.on('close', (code) => {
        console.log(`\x1b[32m[FRONTEND]\x1b[0m Proceso terminado con código ${code}`);
      });

    }, 3000); // Esperar 3 segundos

    // Manejar output del backend
    backendProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`\x1b[34m[BACKEND]\x1b[0m ${line}`);
      });
    });

    backendProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`\x1b[34m[BACKEND]\x1b[0m ${line}`);
      });
    });

    backendProcess.on('close', (code) => {
      console.log(`\x1b[34m[BACKEND]\x1b[0m Proceso terminado con código ${code}`);
    });

    // Manejar cierre del script
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Deteniendo servidores...');
      backendProcess.kill('SIGINT');
      // frontendProcess se cerrará automáticamente
      process.exit(0);
    });

    console.log('\n✅ Servidores iniciados!');
    console.log('💡 Presiona Ctrl+C para detener ambos servidores\n');

  } catch (error) {
    console.error('❌ Error al iniciar los servidores:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
startDev();