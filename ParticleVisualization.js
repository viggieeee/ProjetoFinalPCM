// ParticleVisualization SIMPLIFICADO
class ParticleVisualization {
  constructor(canvas, audioProcessor) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audioProcessor = audioProcessor;
    this.name = "Partículas";
    this.particles = [];
    
    // Criar partículas
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1
      });
    }
  }
  
  draw() {
    // Limpar
    this.ctx.fillStyle = "#121226";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar partículas
    this.drawParticles();
    
    // Desenhar conexões
    this.drawConnections();
  }
  
  drawParticles() {
    const audioLevel = this.audioProcessor.calculateAudioLevel() / 100;
    
    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * (1 + audioLevel), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(76, 201, 240, ${0.5 + audioLevel * 0.5})`;
      this.ctx.fill();
    }
  }
  
  drawConnections() {
    const maxDistance = 100;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = 1 - (distance / maxDistance);
          
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(247, 37, 133, ${opacity * 0.3})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }
  
  update() {
    // Atualizar posição das partículas
    const data = this.audioProcessor.frequencyData;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Mover
      p.x += p.vx;
      p.y += p.vy;
      
      // Rebater nas bordas
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      // Influência do áudio
      const freqIndex = Math.floor((i / this.particles.length) * data.length);
      const intensity = data[freqIndex] / 255;
      
      p.vx += (Math.random() - 0.5) * intensity * 0.5;
      p.vy += (Math.random() - 0.5) * intensity * 0.5;
    }
  }
  
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Reposicionar partículas
    for (const p of this.particles) {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
    }
  }
}

export { ParticleVisualization };