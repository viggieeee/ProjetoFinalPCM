// UIManager.js - VERSÃO BÁSICA
class UIManager {
  constructor(app) {
    this.app = app;

    // Esperar DOM carregar
    setTimeout(() => {
      this.setupBasicUI();
    }, 100);
  }

  setupBasicUI() {
    console.log("Configurando UI básica...");

    // Botões de visualização (já configurados no HTML)
    // Não precisa fazer nada extra

    // Atualizar status inicial
    this.updateAudioInfo({ status: "Pronto para tocar", level: 0 });
  }

  updateAudioInfo(info) {
    // Atualizar status se existir o elemento
    if ($("#audioStatus").length) {
      $("#audioStatus").text(info.status || "Pronto");
    }

    // Atualizar nível se fornecido
    if (info.level !== undefined) {
      this.updateLevelMeter(info.level);
    }
  }

  updateLevelMeter(nivel) {
    // Encontrar e atualizar a barra de nível ativa
    $(".level-bar").each(function () {
      if ($(this).css("width") === "0%") {
        $(this).css("width", nivel + "%");

        // Mudar cor baseado no nível
        if (nivel > 50) {
          $(this).css("background", "#f72585");
        } else if (nivel > 20) {
          $(this).css("background", "#ffaa00");
        } else {
          $(this).css("background", "#4cc9f0");
        }
        return false; // Só atualizar a primeira
      }
    });
  }

  showError(mensagem) {
    console.error("Erro:", mensagem);

    // Mostrar alerta simples
    const errorDiv = $("<div>")
      .css({
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "#f72585",
        color: "white",
        padding: "10px 15px",
        borderRadius: "5px",
        zIndex: "9999",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      })
      .text(mensagem);

    $("body").append(errorDiv);

    // Remover após 3 segundos
    setTimeout(() => errorDiv.remove(), 3000);
  }
}

export { UIManager };