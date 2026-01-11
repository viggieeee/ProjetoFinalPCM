// WaveformVisualization SIMPLIFICADO
class WaveformVisualization {
  constructor(canvas, audioProcessor) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audioProcessor = audioProcessor;
    this.name = "Forma de Onda";
  }
  
  draw() {
    // Limpar
    this.ctx.fillStyle = "#121226";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar grade de fundo
    this.drawGrid();
    
    // Obter dados
    const data = this.audioProcessor.waveformData;
    
    // Começar linha
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2);
    
    // Desenhar onda
    for (let i = 0; i < data.length; i++) {
      const value = (data[i] - 128) / 128; // Converter para -1 a 1
      const y = this.canvas.height / 2 + (value * this.canvas.height / 2);
      const x = i * (this.canvas.width / data.length);
      
      this.ctx.lineTo(x, y);
    }
    
    // Estilo da linha
    this.ctx.strokeStyle = "#4cc9f0";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  
  drawGrid() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.lineWidth = 1;
    
    // Linhas verticais
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Linhas horizontais
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  update() {
    // Atualização automática
  }
  
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

export { WaveformVisualization };