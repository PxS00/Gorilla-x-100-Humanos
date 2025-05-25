// JavaScript estruturado com classe .ativo para imagens do gorila

// Inicialização do jogo quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", () => {
  // Constantes e variáveis globais do jogo
  const VIDA_MAXIMA = 100;
  let vidaGorila = VIDA_MAXIMA;
  let humanos = Array.from({ length: 100 }, () => ({ vivo: true })); // Array de objetos representando os humanos
  let ataquesFeitos = 0;
  let reducaoDano = 0;
  let jogoEncerrado = false;
  let emAcao = false; // Controla se o gorila está realizando uma ação

  // Elementos do DOM
  const displayVida = document.getElementById("vida-gorila");
  const displayHumanos = document.getElementById("humanos-restantes");
  const logBatalha = document.getElementById("log-texto");
  const botoes = document.querySelectorAll("#actions button");
  const btnReiniciar = document.getElementById("btn-reiniciar");
  const restartSection = document.getElementById("restart-section");

  // Imagens do gorila para diferentes estados
  const imgGorila = document.getElementById("imagem-gorila");
  const imgSoco = document.getElementById("imagem-gorila-soco");
  const imgDefendendo = document.getElementById("imagem-gorila-defendendo");
  const imgCurando = document.getElementById("imagem-gorila-curando");

  // Efeitos sonoros
  const somCura = new Audio("assets/audio/cura.wav");
  const somDefesa = new Audio("assets/audio/defesa.ogg");
  const somSoco = new Audio("assets/audio/soco.wav");

  // Função para reiniciar o jogo
  function reiniciarJogo() {
    // Resetar todas as variáveis do jogo
    vidaGorila = VIDA_MAXIMA;
    humanos = Array.from({ length: 100 }, () => ({ vivo: true }));
    ataquesFeitos = 0;
    reducaoDano = 0;
    jogoEncerrado = false;
    emAcao = false;

    // Limpar o log de batalha
    logBatalha.innerHTML = "";

    // Resetar as imagens do gorila
    const todasImagens = document.querySelectorAll(".gorila");
    todasImagens.forEach((img) => {
      img.style.display = "none";
      img.classList.remove("ativo");
    });
    const imgGorilaNormal = document.getElementById("imagem-gorila");
    imgGorilaNormal.style.display = "block";
    imgGorilaNormal.classList.add("ativo");

    // Atualizar interface e esconder botão de reiniciar
    atualizarStatus();
    toggleBotoes(false);
    restartSection.classList.add("hidden");

    adicionarLog("🔄 Jogo reiniciado! A batalha recomeça!");
  }

  // Atualiza os displays de vida e humanos restantes
  function atualizarStatus() {
    displayVida.textContent = vidaGorila;
    displayHumanos.textContent = humanos.filter((h) => h.vivo).length;
    verificarFimDeJogo();
  }

  // Adiciona uma mensagem ao log de batalha
  function adicionarLog(msg) {
    logBatalha.innerHTML += `<p>${msg}</p>`;
    logBatalha.scrollTop = logBatalha.scrollHeight;
  }

  // Troca a imagem do gorila para o estado especificado
  function trocarImagem(ativa) {
    const todasImagens = document.querySelectorAll(".gorila");
    todasImagens.forEach((img) => {
      img.style.display = "none";
      img.classList.remove("ativo");
    });
    ativa.style.display = "block";
    ativa.classList.add("ativo");
  }

  // Habilita ou desabilita os botões de ação
  function toggleBotoes(desabilitar) {
    botoes.forEach((botao) => {
      botao.disabled = desabilitar;
      if (desabilitar) {
        botao.classList.add("desabilitado");
      } else {
        botao.classList.remove("desabilitado");
      }
    });
  }

  // Função de ataque do gorila
  function atacar() {
    if (jogoEncerrado || emAcao) return;

    emAcao = true;
    toggleBotoes(true);

    somSoco.play();
    trocarImagem(imgSoco);

    // Calcula quantos humanos serão eliminados (entre 3 e 8)
    const quantidadeEliminados = Math.floor(Math.random() * 6) + 3;
    let eliminados = 0;
    for (let humano of humanos) {
      if (eliminados >= quantidadeEliminados) break;
      if (humano.vivo) {
        humano.vivo = false;
        eliminados++;
      }
    }
    ataquesFeitos++;
    adicionarLog(`🦍 Gorila atacou e eliminou ${eliminados} humano(s)!`);
    atualizarStatus();

    // Retorna ao estado normal após 1 segundo
    // setTimeout(() => {
    //   trocarImagem(imgGorila);
    //   humanosAtacam();
    // }, 500);
    setTimeout(() => {
    if (!jogoEncerrado) {
      trocarImagem(imgGorila);
    }
    humanosAtacam();
  }, 1000);

  }

  // Função de defesa do gorila
  function defender() {
    if (jogoEncerrado || emAcao) return;

    emAcao = true;
    toggleBotoes(true);

    somDefesa.play();
    trocarImagem(imgDefendendo);

    // Calcula a redução de dano (entre 2 e 7)
    reducaoDano = Math.floor(Math.random() * 6) + 2;
    adicionarLog(
      `🛡️ Gorila reduzirá ${reducaoDano} de dano no próximo ataque.`
    );
    atualizarStatus();

    // Retorna ao estado normal após 1 segundo
    setTimeout(() => {
    if (!jogoEncerrado) {
      trocarImagem(imgGorila);
    }
    humanosAtacam();
  }, 1000);
  }

  // Função de cura do gorila
  function curar() {
    if (jogoEncerrado || emAcao) return;

    emAcao = true;
    toggleBotoes(true);

    somCura.play();
    trocarImagem(imgCurando);

    // Calcula a quantidade de cura (entre 5 e 12)
    const cura = Math.floor(Math.random() * 8) + 5;
    const vidaAntes = vidaGorila;
    vidaGorila = Math.min(VIDA_MAXIMA, vidaGorila + cura);
    const recuperado = vidaGorila - vidaAntes;
    adicionarLog(`❤️ Gorila se curou e recuperou ${recuperado} de vida.`);
    atualizarStatus();

    // Retorna ao estado normal após 1 segundo
    setTimeout(() => {
    if (!jogoEncerrado) {
      trocarImagem(imgGorila);
    }
    humanosAtacam();
  }, 1000);
  }

  // Função que controla o ataque dos humanos
  function humanosAtacam() {
    if (jogoEncerrado) return;

    const vivos = humanos.filter((h) => h.vivo);
    if (vivos.length === 0 || vidaGorila <= 0) {
      emAcao = false;
      toggleBotoes(false);
      return;
    }

    // Calcula o dano total dos humanos
    let danoTotal = 0;
    const chanceAtaque = Math.min(0.08, vivos.length * 0.008);

    for (let h of vivos) {
      if (Math.random() < chanceAtaque) {
        danoTotal += Math.floor(Math.random() * 2) + 1;
      }
    }

    // Limita o dano máximo e aplica a redução de dano
    danoTotal = Math.min(danoTotal, 13);
    const danoFinal = Math.max(0, danoTotal - reducaoDano);
    vidaGorila = Math.max(0, vidaGorila - danoFinal);

    // Registra o dano no log
    if (danoTotal > 0) {
      adicionarLog(`⚔️ Humanos causaram ${danoTotal} de dano total.`);
      if (reducaoDano > 0) {
        adicionarLog(`🛡️ Defesa reduziu ${reducaoDano} de dano.`);
        adicionarLog(`💥 Gorila sofreu ${danoFinal} de dano.`);
      }
    }

    reducaoDano = 0;
    atualizarStatus();

    // Libera os botões após 0.5 segundos
    setTimeout(() => {
      emAcao = false;
      toggleBotoes(false);
    }, 1000);
  }

  // Verifica se o jogo chegou ao fim
  function verificarFimDeJogo() {
    const humanosVivos = humanos.filter((h) => h.vivo).length;

    if (!jogoEncerrado) {
      if (vidaGorila <= 0) {
        // Gorila derrotado
        jogoEncerrado = true;
        emAcao = true;
        toggleBotoes(true);
        trocarImagem(document.getElementById("imagem-gorila-derrota"));
        adicionarLog("💀 Gorila derrotado! Fim do jogo.");
        restartSection.classList.remove("hidden");
      } else if (humanosVivos === 0) {
        // Gorila vitorioso
        jogoEncerrado = true;
        emAcao = true;
        toggleBotoes(true);
        trocarImagem(document.getElementById("imagem-gorila-vitoria"));
        adicionarLog("🏆 Todos os humanos foram eliminados! O gorila venceu.");
        restartSection.classList.remove("hidden");
      }
    }
  }

  // Adiciona os event listeners aos botões
  document.getElementById("btn-atacar").addEventListener("click", atacar);
  document.getElementById("btn-defender").addEventListener("click", defender);
  document.getElementById("btn-curar").addEventListener("click", curar);
  btnReiniciar.addEventListener("click", reiniciarJogo);

  // Inicializa o jogo
  atualizarStatus();
});
