#!/usr/bin/env node

/**
 * Script para actualizar la versión del proyecto automáticamente
 * Se ejecuta antes de cada commit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionFilePath = path.join(__dirname, '..', 'public', 'version.json');

try {
  // Leer el archivo de versión actual
  const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
  
  // Obtener información de Git
  const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  const date = new Date().toISOString().split('T')[0];
  
  // Incrementar el número de build
  const buildNumber = parseInt(versionData.build) || 0;
  const newBuildNumber = buildNumber + 1;
  
  // Actualizar versión
  const updatedVersion = {
    version: versionData.version,
    build: newBuildNumber.toString(),
    date: date,
    commit: commit,
    branch: branch
  };
  
  // Escribir el archivo actualizado
  fs.writeFileSync(versionFilePath, JSON.stringify(updatedVersion, null, 2), 'utf8');
  
  // Agregar el archivo al commit actual
  execSync('git add public/version.json');
  
  console.log(`✅ Versión actualizada: v${updatedVersion.version} (build ${updatedVersion.build})`);
  console.log(`📝 Commit: ${updatedVersion.commit}`);
  console.log(`📅 Fecha: ${updatedVersion.date}`);
  
} catch (error) {
  console.error('❌ Error al actualizar la versión:', error.message);
  process.exit(0); // No fallar el commit si hay error
}
