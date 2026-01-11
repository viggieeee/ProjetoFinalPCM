// AudioProcessor SIMPLIFICADO mas compatível com seu QMD
class AudioProcessor {
  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.waveformData = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Propriedades necessárias para o QMD
    this.isPlaying = false;
    this.isPaused = false;
    this.audioElement = null;
    this.source = null;
    this.gainNode = null;
    this.duration = 0;
    this.currentTime = 0;
    this.isSeeking = false;
    this.isLoaded = false;
    this.pendingSeekTime = null;
    
    // Inicializar buffers
    this.frequencyData.fill(0);
    this.waveformData.fill(128);
  }
  
  // Método ESSENCIAL para o QMD - não mudar a assinatura!
  async loadPredefinedAudio(url) {
  // Parar áudio atual
  this.stop();
  
  // Criar elemento áudio
  this.audioElement = new Audio();
  
  try {
    // Carregar arquivo
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Converter para blob e criar URL
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Configurar áudio
    this.audioElement.src = blobUrl;
    
    // Esperar carregar
    await new Promise((resolve, reject) => {
      this.audioElement.onloadedmetadata = () => {
        this.duration = this.audioElement.duration;
        this.isLoaded = true;
        URL.revokeObjectURL(blobUrl); // Limpar memória
        resolve();
      };
      
      this.audioElement.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error("Falha ao carregar áudio"));
      };
      
      // Timeout de segurança
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error("Timeout ao carregar áudio"));
      }, 10000);
    });
    
    // Conectar ao Web Audio API para análise
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    
    console.log(`Áudio carregado: ${this.duration.toFixed(1)}s`);
    return true;
    
  } catch (error) {
    console.error("Erro:", error.message);
    this.stop();
    throw error;
  }
}
  
  // MÉTODO CORRIGIDO - o problema estava aqui!
// Método togglePlayPause CORRIGIDO:
togglePlayPause() {
  return new Promise((resolve, reject) => {
    if (!this.audioElement) {
      reject(new Error("Nenhum áudio carregado"));
      return;
    }
    
    const wasPlaying = this.isPlaying && !this.isPaused;
    
    if (wasPlaying) {
      // PAUSAR
      this.pause();
      console.log("Pausando áudio");
      resolve({ action: "pause", success: true });
    } else {
      // TOCAR ou RETOMAR
      this.play().then(success => {
        if (success) {
          console.log("Tocando/retomando áudio");
          resolve({ action: "play", success: true });
        } else {
          reject(new Error("Falha ao iniciar reprodução"));
        }
      }).catch(reject);
    }
  });
}

// Método play corrigido
play() {
  if (!this.audioElement) return Promise.resolve(false);
  
  return this.audioElement.play().then(() => {
    this.isPlaying = true;
    this.isPaused = false;
    
    // Ativar contexto se necessário
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    return true;
  }).catch(error => {
    console.error("Erro ao tocar:", error);
    this.isPlaying = false;
    this.isPaused = false;
    return false;
  });
}

// Método pause corrigido
pause() {
  if (this.audioElement && this.isPlaying) {
    this.audioElement.pause();
    this.isPlaying = false;
    this.isPaused = true;
    return true;
  }
  return false;
}
  
  seekTo(time) {
    if (this.audioElement && this.duration > 0) {
      const validTime = Math.max(0, Math.min(time, this.duration));
      this.isSeeking = true;
      this.audioElement.currentTime = validTime;
      this.currentTime = validTime;
      
      setTimeout(() => { this.isSeeking = false; }, 100);
      return true;
    }
    return false;
  }
  
  restart() {
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
      this.currentTime = 0;
      return true;
    }
    return false;
  }
  
  getProgress() {
    if (this.duration > 0) {
      return (this.currentTime / this.duration) * 100;
    }
    return 0;
  }
  
  getCurrentTime() {
    return this.currentTime || 0;
  }
  
  isAudioLoaded() {
    return this.isLoaded && this.audioElement !== null;
  }
  
  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.isLoaded = false;
  }
  
  update() {
    if (this.isPlaying && this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      this.analyser.getByteTimeDomainData(this.waveformData);
    } else {
      this.frequencyData.fill(0);
      this.waveformData.fill(128);
    }
  }
  
  calculateAudioLevel() {
    if (!this.frequencyData.length) return 0;
    
    let total = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      total += this.frequencyData[i];
    }
    return Math.round((total / this.frequencyData.length / 255) * 100);
  }
}

export { AudioProcessor };