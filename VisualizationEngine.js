// VisualizationEngine SIMPLIFICADO mas compatível com seu QMD
import { SpectrumVisualization } from "./SpectrumVisualization.js";
import { WaveformVisualization } from "./WaveformVisualization.js";
import { ParticleVisualization } from "./ParticleVisualization.js";

class VisualizationEngine {
  constructor(canvas) {
    // Suporta ID ou elemento
    if (typeof canvas === 'string') {
      this.canvas = document.getElementById(canvas);
    } else {
      this.canvas = canvas;
    }
    
    if (!this.canvas) {
      console.error("Canvas não encontrado");
      return;
    }
    
    this.ctx = this.canvas.getContext("2d");
    this.audioProcessor = null;
    this.currentVisualization = null;
    this.visualizations = new Map();
  }
  
  setAudioProcessor(audioProcessor) {
    this.audioProcessor = audioProcessor;
    this.initVisualizations();
    this.setVisualization("spectrum"); // Padrão
  }
  
  initVisualizations() {
    if (!this.canvas || !this.audioProcessor) return;
    
    // Criar as 3 visualizações (simplificadas)
    this.visualizations.set("spectrum", 
      new SpectrumVisualization(this.canvas, this.audioProcessor));
    this.visualizations.set("waveform", 
      new WaveformVisualization(this.canvas, this.audioProcessor));
    this.visualizations.set("particles", 
      new ParticleVisualization(this.canvas, this.audioProcessor));
  }
  
  setVisualization(type) {
    if (this.visualizations.has(type)) {
      this.currentVisualization = this.visualizations.get(type);
      return true;
    }
    return false;
  }
  
  draw() {
    if (this.currentVisualization) {
      this.currentVisualization.update();
      this.currentVisualization.draw();
    }
  }
  
  clearCanvas() {
    this.ctx.fillStyle = "#121226";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Redimensionar todas as visualizações
    this.visualizations.forEach(viz => {
      if (viz.resize) viz.resize(width, height);
    });
  }
}

export { VisualizationEngine };