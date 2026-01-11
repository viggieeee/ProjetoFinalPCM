class AudioVisualization {
  constructor(canvas, audioProcessor) {
    //impedir que a mae (this) seja instanciada - classe abstrata
    if (this.constructor === AudioVisualization) {
      throw new Error(
        "AudioVisualization é uma classe abstrata e não pode ser instanciada diretamente."
      );
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audioProcessor = audioProcessor;
    this.name = "Visualização";
    this.properties = {
      //porpriedades comuns a todo o tipo de visualizacçoes
      audioSensitivity: { value: 1.0, min: 0.1, max: 2.0, step: 0.1 },
    };
    this.colors = {
      primary: "#4cc9f0",
      secondary: "#f72585",
      background: "#121226",
      useGradient: false,
      colorByLevel: false,
    };

    this.frameCount = 0;

    //DEFAULT/TEST dados de teste para quando não há áudio ativo
    this.testData = new Uint8Array(256);
    for (let i = 0; i < this.testData.length; i++) {
      this.testData[i] = Math.sin(i / 10) * 128 + 128; // Onda senoidal
    }

    //arrays para armazenar dados de áudio em tempo real
    const bufferSize = this.audioProcessor
      ? this.audioProcessor.analyser.frequencyBinCount
      : 256;
    this.frequencyState = new Uint8Array(bufferSize);
    this.waveformState = new Uint8Array(bufferSize);
  }

  draw() {
    //implementaçao obrigatória para subclasses, SpectrumVizualization, waveFormVizualition e particleVizualization
    throw new Error("Método draw() deve ser implementado pela subclasse.");
  }

  update() {
    //  atualizar estado da visualização
    this.frameCount++;
    //obtem os os metodos mais recentes do AudioProcessor em cada frame
    if (this.audioProcessor && this.audioProcessor.isPlaying) {
      this.frequencyState = this.audioProcessor.getFrequencyData(); //DADOS ORIGINAIS (0-255)
      this.waveformState = this.audioProcessor.getWaveformData();
    } else {
      //para quando nao ha audio
      this.frequencyState.fill(0);
      this.waveformState.fill(128); // 128 é o ponto médio para o waveform
    }
  }

  resize(width, height) {
    //Redimensionar visualização (canvas) mantendo proporções
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getProperties() {
    //  obter propriedades da visualização
    return JSON.parse(JSON.stringify(this.properties));
  }

  updateProperty(property, value) {
    //  atualizar propriedade
    if (this.properties.hasOwnProperty(property)) {
      this.properties[property].value = parseFloat(value); // isto atualiza apenas o valor
      return true; //ocorreu a atualização
    }
    return false; //falha na atualização
  }

  clearCanvas() {
    //  limpar canvas
    //this.ctx.fillStyle = "#121226";
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    //  desenhar grelha de fundo
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // DEFINE A COR DO traço com cor branca com uma opacidade de 0.1 para ter efeito de grelha de fundo
    this.ctx.lineWidth = 1; // expessura da linha em pixel
    const width = this.canvas.width; //variavcel com a largura atual do canvas
    const height = this.canvas.height; //variavel com a altura atual do canavas
    const gridSize = 50; // espaçamento entre linhas da grelha

    // linhas horizontais(desenha kinhas de cima para baixo)
    for (let x = 0; x < width; x += gridSize) {
      //começa em  x=0 continua a fazer linhas enquando o x for menor que a largura do canvas e incremebta x em 50 ixels a cada iteração
      this.ctx.beginPath(); // inicio do desenho de uma linha :para começar a desenhar linhas em spots diferentes
      this.ctx.moveTo(x, 0); //define o ponto de partida (x= posiçao atual, y=0 topo do canvas)
      this.ctx.lineTo(x, height); //desenha linha reta do ponto x ate ao fundo do canvas(height)
      this.ctx.stroke(); //contorno da linha
    }
    //linhas verticais
    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  createGradient(colors) {
    //  criar gradiente de cores
    if (this.colors.useGradient) {
      const gradiente = this.ctx.createLinearGradient(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      //array de cores que da acesso a cor atual do indice fornecida
      //adiciona uma cor ao objeto gradiente e a sua posição de transição
      //index / (colors.length - 1: garante que a 1º cor fique 0.0(inicio)e a ultima cor fique em 1.0 (fim) com as cores intermédia isto é normaliza a posição da cor
      //color : cor que de ser colocada na posição calculada
      colors.forEach((color, index) => {
        gradiente.addColorStop(index / (colors.length - 1), color);
      });
      return gradiente;
    } else {
      return colors[0]; //Retornar a primeira cor do array 'colors' (a cor primária dinâmica/manual)
    }
  }

  normalizeData(dadosOriginais) {
    //  normalizar dados de áudio
    if (!dadosOriginais || dadosOriginais.length === 0) return [];
    const normalized = new Array(dadosOriginais.length); // cria um array com o mesmo tamanho dos dados originais (dataArray) para guardar os dados normalizados
    for (let i = 0; i < dadosOriginais.length; i++) {
      //percorre os dados originais
      normalized[i] = dadosOriginais[i] / 255.0; //pega um valor de 0 a 255 e divide por 255 tranformando-o num valor entre 0.0 e 1.0, isto serve para facilitar o desenho e o mapeamentos de cotres ou tamnho do canva
    }
    return normalized; //retorna o array com todos os valores normalizados
  }

  getSensitiveData(data) {
    const normalized = this.normalizeData(data);
    const sensitivity = this.properties.audioSensitivity.value;

    // Aplicar sensibilidade a todos os valores
    for (let i = 0; i < normalized.length; i++) {
      normalized[i] = Math.min(1.0, normalized[i] * sensitivity); //aqui ja normalizado
    }

    return normalized;
  }

  getDynamicColor(audioLevel) {
    if (!this.colors.colorByLevel) {
      return {
        primary: this.colors.primary,
        secondary: this.colors.secondary,
      };
    }
    const level = audioLevel / 100;

    // um intervalo de HUE, por exemplo
    const HUE_START = 100;
    const HUE_END = 90;

    // Interpolação Linear do Matiz (Hue)
    // hue = START + (END - START) * level
    const hue = HUE_START + (HUE_END - HUE_START) * level;
    const saturation = 90;
    const lightness = 60;

    // cor HSL interpolada
    const primaryColor = this.hslToCssString(hue, saturation, lightness);

    return {
      primary: primaryColor,
      secondary: this.colors.secondary,
    };
  }

  hslToCssString(h, s, l) {
    // Garantir que h está no intervalo [0, 360), s e l em [0, 100]
    return `hsl(${h % 360}, ${s}%, ${l}%)`;
  }

  /*getDynamicColor(audioLevel) {
    // VERIFICAR SE colorByLevel ESTÁ ATIVO
    if (!this.colors.colorByLevel) {
      // Se não estiver ativo, retorna as cores manuais
      return {
        primary: this.colors.primary,
        secondary: this.colors.secondary,
      };
    }

    // Array de cores que varia com o nível de áudio (de baixo para alto)
    const colorSpectrum = [
      "#ff00bfff",
      "#b700ffff",
      "#00c3ffff",
      "#00ff77ff",
      "#ffbb00ff",
    ];

    const index = Math.min(
      Math.floor((audioLevel / 100) * colorSpectrum.length),
      colorSpectrum.length - 1
    );

    const primaryColor = colorSpectrum[index];
    const secondaryColor =
      colorSpectrum[Math.min(index + 1, colorSpectrum.length - 1)];

    return {
      primary: primaryColor,
      secondary: secondaryColor,
    };
  }*/
}

export { AudioVisualization };