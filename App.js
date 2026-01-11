import { AudioProcessor } from "./AudioProcessor.js";
import { VisualizationEngine } from "./VisualizationEngine.js";
import { UIManager } from "./UIManager.js";
import { ExportManager } from "./ExportManager.js";

class App {
  constructor() {
    this.audioProcessor = new AudioProcessor();
    this.visualizationEngine = new VisualizationEngine("audioCanvas");
    this.visualizationEngine.setAudioProcessor(this.audioProcessor);
    this.uiManager = new UIManager(this);
    this.exportManager = new ExportManager(this.visualizationEngine);
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.uiManager.updateAudioInfo({ status: "OFF", level: 0 });
    this.uiManager.setButtonStates(false);
    this.uiManager.updatePropertiesPanel();
    this.startRender();
  }

  // Este método NÃO muda - continua chamando o AudioProcessor
  async loadPredefinedAudio(filename) {
    try {
      this.stopAudio();
      this.uiManager.updateAudioInfo({ status: "LOADING..." });
      
      const audioPath = `audio/${filename}`;
      await this.audioProcessor.loadPredefinedAudio(audioPath);
      
      this.uiManager.updateAudioInfo({ status: `PLAYING: ${filename}` });
      this.uiManager.setButtonStates(true);
      
    } catch (error) {
      this.uiManager.showError(error.message);
      this.uiManager.updateAudioInfo({ status: "OFF", level: 0 });
      this.uiManager.setButtonStates(false);
    }
  }
  
  stopAudio() {
    if (this.audioProcessor.isPlaying) {
      this.audioProcessor.stop();
    }
    this.uiManager.updateAudioInfo({ status: "OFF", level: 0 });
    this.uiManager.setButtonStates(false);
  }

  setVisualization(type) {
    if (this.visualizationEngine.setVisualization(type)) {
      this.uiManager.updatePropertiesPanel();
    }
  }

  startRender() {
    const update = () => {
      this.audioProcessor.update();

      if (this.audioProcessor.isPlaying) {
        const level = this.audioProcessor.calculateAudioLevel();
        this.visualizationEngine.draw();
        this.uiManager.updateAudioInfo({ level: level });
      } else {
        this.visualizationEngine.clearCanvas();
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }
}

export { App };