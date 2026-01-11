// SpectrumVisualization SIMPLIFICADO
class SpectrumVisualization {
  constructor(canvas, audioProcessor) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audioProcessor = audioProcessor;
    this.name = "Espectro de Frequências";
  }
  
  draw() {
    // Limpar
    this.ctx.fillStyle = "#121226";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Obter dados
    const data = this.audioProcessor.frequencyData;
    const barWidth = this.canvas.width / data.length;
    
    // Desenhar barras
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * this.canvas.height;
      const x = i * barWidth;
      const y = this.canvas.height - barHeight;
      
      // Gradiente azul para rosa
      const gradient = this.ctx.createLinearGradient(0, y, 0, this.canvas.height);
      gradient.addColorStop(0, "#4cc9f0");
      gradient.addColorStop(1, "#f72585");
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }
  
  update() {
    // Atualização automática pelo AudioProcessor
  }
  
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

export { SpectrumVisualization };