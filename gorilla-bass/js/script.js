// Variáveis do estado do jogo
let vidaGorila = 100;
const VIDA_MAXIMA = 100;
let humanos = Array.from({ length: 100 }, () => ({ vivo: true }));
let ataquesFeitos = 0;
let nickname = "";
let reducaoDano = 0; // Variável para armazenar a redução de dano atual

// Elementos do DOM
const displayVida = document.getElementById("vida-gorila");
const displayHumanos = document.getElementById("humanos-restantes");
const logBatalha = document.getElementById("log-texto");
const imagemGorila = document.getElementById("imagem-gorila");

// Configuração inicial das imagens
function configurarImagens() {
  if (imagemGorila) {
    imagemGorila.style.width = "300px";
    imagemGorila.style.height = "auto";
    imagemGorila.style.display = "block";
    imagemGorila.style.margin = "20px auto";
    imagemGorila.style.transition = "transform 0.3s ease";
  }
}

/**
 * Reinicia o jogo com os valores iniciais
 */
function reiniciarJogo() {
  // Remove o container do botão de reiniciar
  const containerReiniciar = document.getElementById("container-reiniciar");
  if (containerReiniciar) {
    containerReiniciar.remove();
  }

  vidaGorila = VIDA_MAXIMA;
  humanos = Array.from({ length: 100 }, () => ({ vivo: true }));
  ataquesFeitos = 0;
  reducaoDano = 0;
  logBatalha.innerHTML = ""; // Limpa o log
  atualizarStatus();
  ativarBotoes();
  adicionarLog("🔄 Jogo reiniciado!");
}

/**
 * Ativa os botões do jogo
 */
function ativarBotoes() {
  document.getElementById("btn-atacar").disabled = false;
  document.getElementById("btn-defender").disabled = false;
}

/**
 * Atualiza o status do jogo
 */
function atualizarStatus() {
  displayVida.textContent = vidaGorila;
  displayHumanos.textContent = humanos.filter((h) => h.vivo).length;
}

/**
 * Adiciona uma mensagem ao log de batalha
 * @param {string} mensagem - A mensagem a ser exibida
 */
function adicionarLog(mensagem) {
  logBatalha.innerHTML += `<p>${mensagem}</p>`;
  logBatalha.scrollTop = logBatalha.scrollHeight;
}

/**
 * Gorila ataca e elimina humanos aleatórios
 */
function atacar() {
  const humanosVivos = humanos.filter((h) => h.vivo);
  if (humanosVivos.length === 0 || vidaGorila <= 0) return;

  // Muda a imagem para o soco
  if (imagemGorila) {
    imagemGorila.src = "assets/img/soco.png";
    imagemGorila.style.transform = "scale(1.1)";
    setTimeout(() => {
      imagemGorila.style.transform = "scale(1)";
    }, 300);
  }

  // Aumenta a quantidade de humanos eliminados por ataque
  const quantidadeEliminados = Math.floor(Math.random() * 6) + 3; // Agora elimina 3-8 humanos
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
  salvarEstado();
  verificarFimDeJogo();

  // Volta para a imagem normal após 1 segundo
  setTimeout(() => {
    if (imagemGorila) {
      imagemGorila.src = "assets/img/gorilla.png";
    }
  }, 1000);
}

/**
 * Gorila tenta defender e reduzir o dano recebido
 */
function defender() {
  // Muda a imagem para a defesa
  if (imagemGorila) {
    imagemGorila.src = "assets/img/defendendo.png";
    imagemGorila.style.transform = "scale(1.1)";
    setTimeout(() => {
      imagemGorila.style.transform = "scale(1)";
    }, 300);
  }

  // Ajusta a quantidade de dano que pode ser reduzido
  reducaoDano = Math.floor(Math.random() * 6) + 2; // Agora reduz 2-7 de dano
  adicionarLog(
    `🛡️ Gorila se defendeu e reduzirá ${reducaoDano} de dano no próximo ataque!`
  );
  atualizarStatus();
  salvarEstado();

  // Volta para a imagem normal após 1 segundo
  setTimeout(() => {
    if (imagemGorila) {
      imagemGorila.src = "assets/img/gorilla.png";
    }
  }, 1000);
}

/**
 * Humanos contra-atacam o gorila
 */
function humanosAtacam() {
  const humanosVivos = humanos.filter((h) => h.vivo);
  if (humanosVivos.length > 0 && vidaGorila > 0) {
    let danoTotal = 0;
    // Ajusta a chance de ataque dos humanos
    const chanceAtaque = Math.min(0.08, humanosVivos.length * 0.0008); // Chance reduzida e aumenta mais lentamente
    for (let humano of humanosVivos) {
      if (Math.random() < chanceAtaque) {
        // Ajusta o dano base dos humanos
        const dano = Math.floor(Math.random() * 2) + 1; // Agora causa 1-2 de dano
        danoTotal += dano;
      }
    }

    // Limita o dano total máximo por turno
    danoTotal = Math.min(danoTotal, 8); // Máximo de 8 de dano por turno

    // Aplica o dano reduzido se o gorila estiver defendendo
    const danoFinal = Math.max(0, danoTotal - reducaoDano);
    vidaGorila = Math.max(0, vidaGorila - danoFinal);

    if (danoTotal > 0) {
      adicionarLog(`⚔️ Humanos causaram ${danoTotal} de dano total!`);
      if (reducaoDano > 0) {
        adicionarLog(`🛡️ Defesa reduziu ${reducaoDano} de dano!`);
        adicionarLog(`💥 Gorila sofreu ${danoFinal} de dano!`);
      }
    }

    reducaoDano = 0; // Reseta a redução de dano após o ataque
    atualizarStatus();
    salvarEstado();
    verificarFimDeJogo();
  }
}

/**
 * Verifica se o jogo terminou e lida com o resultado
 */
function verificarFimDeJogo() {
  const humanosVivos = humanos.filter((h) => h.vivo).length;
  if (vidaGorila <= 0) {
    adicionarLog("💀 O gorila foi derrotado! Fim de jogo.");
    desativarBotoes();
    mostrarReinicio();
  } else if (humanosVivos === 0) {
    adicionarLog("🏆 O gorila venceu! Todos os humanos foram eliminados.");
    desativarBotoes();
    mostrarReinicio();
  }
}

/**
 * Salva o estado atual do jogo
 */
function salvarEstado() {
  if (!nickname) return;
  // Só salva se o jogo ainda estiver em andamento
  if (vidaGorila > 0 && humanos.some((h) => h.vivo)) {
    localStorage.setItem(
      "gorila_" + nickname,
      JSON.stringify({
        vida: vidaGorila,
        humanos: humanos,
        ataques: ataquesFeitos,
      })
    );
  } else {
    // Se o jogo terminou, remove o save
    localStorage.removeItem("gorila_" + nickname);
  }
}

/**
 * Limpa todos os saves existentes
 */
function limparTodosSaves() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("gorila_")) {
      localStorage.removeItem(key);
    }
  }
}

/**
 * Carrega um estado salvo do jogo
 * @param {string} nickname - Nickname do jogador
 */
function carregarEstado(nickname) {
  const dadosSalvos = localStorage.getItem("gorila_" + nickname);
  if (dadosSalvos) {
    try {
      const estadoJogo = JSON.parse(dadosSalvos);
      // Verifica se os dados salvos são válidos
      if (
        estadoJogo &&
        typeof estadoJogo.vida === "number" &&
        Array.isArray(estadoJogo.humanos)
      ) {
        vidaGorila = estadoJogo.vida;
        humanos = estadoJogo.humanos;
        ataquesFeitos = estadoJogo.ataques;
        nickname = nickname;
        adicionarLog("🔁 Jogo carregado de " + nickname);
        atualizarStatus();
      } else {
        // Se os dados forem inválidos, inicia um novo jogo
        iniciarNovoJogo();
      }
    } catch (e) {
      // Se houver erro ao parsear os dados, inicia um novo jogo
      iniciarNovoJogo();
    }
  } else {
    iniciarNovoJogo();
  }
}

/**
 * Inicia um novo jogo com valores iniciais
 */
function iniciarNovoJogo() {
  // Remove todos os botões de reiniciar existentes
  const botoesReiniciar = document.querySelectorAll(
    "button[onclick='reiniciarJogo()']"
  );
  botoesReiniciar.forEach((botao) => botao.remove());

  vidaGorila = VIDA_MAXIMA;
  humanos = Array.from({ length: 100 }, () => ({ vivo: true }));
  ataquesFeitos = 0;
  adicionarLog("🎮 Novo jogo iniciado!");
  atualizarStatus();
}

/**
 * Mostra o botão de reiniciar quando o jogo termina
 */
function mostrarReinicio() {
  // Remove qualquer container de reiniciar existente
  const containerReiniciar = document.getElementById("container-reiniciar");
  if (containerReiniciar) {
    containerReiniciar.remove();
  }

  // Cria um novo container para o botão
  const container = document.createElement("div");
  container.id = "container-reiniciar";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.left = "50%";
  container.style.transform = "translateX(-50%)";
  container.style.zIndex = "1000";

  const botaoReiniciar = document.createElement("button");
  botaoReiniciar.textContent = "🔁 Reiniciar jogo";
  botaoReiniciar.onclick = reiniciarJogo;
  botaoReiniciar.style.padding = "10px 20px";
  botaoReiniciar.style.fontSize = "16px";
  botaoReiniciar.style.cursor = "pointer";
  botaoReiniciar.style.backgroundColor = "#4CAF50";
  botaoReiniciar.style.color = "white";
  botaoReiniciar.style.border = "none";
  botaoReiniciar.style.borderRadius = "5px";

  container.appendChild(botaoReiniciar);
  document.body.appendChild(container);
}

/**
 * Desativa todos os botões do jogo
 */
function desativarBotoes() {
  document.getElementById("btn-atacar").disabled = true;
  document.getElementById("btn-defender").disabled = true;
}

/**
 * Configura todos os event listeners do jogo
 */
function configurarEventos() {
  document.getElementById("btn-atacar").addEventListener("click", () => {
    atacar();
    setTimeout(humanosAtacam, 1000);
  });
  document.getElementById("btn-defender").addEventListener("click", () => {
    defender();
    setTimeout(humanosAtacam, 1000);
  });
}

/**
 * Inicializa o jogo com o nickname do jogador
 */
function iniciarComNickname() {
  // Remove qualquer container de reiniciar existente
  const containerReiniciar = document.getElementById("container-reiniciar");
  if (containerReiniciar) {
    containerReiniciar.remove();
  }

  nickname = prompt("Digite seu nick (até 3 letras):")
    .toUpperCase()
    .slice(0, 3);
  if (!nickname) nickname = "AAA";
  limparTodosSaves();
  carregarEstado(nickname);
  configurarEventos();
  configurarImagens(); // Configura as imagens ao iniciar o jogo
}

// Inicializa o jogo quando a janela carregar
window.onload = iniciarComNickname;

/**
 * Gorila se cura
 */
function curar() {
  // Muda a imagem para um gesto de cura (se tiver)
  if (imagemGorila) {
    imagemGorila.src = "assets/gif/cura.gif"; // Você pode criar ou adicionar essa imagem
    imagemGorila.style.transform = "scale(1.1)";
    setTimeout(() => {
      imagemGorila.style.transform = "scale(1)";
    }, 300);
  }

  const cura = Math.floor(Math.random() * 8) + 5; // Cura entre 5-12 de vida
  const vidaAntes = vidaGorila;
  vidaGorila = Math.min(VIDA_MAXIMA, vidaGorila + cura);
  const vidaRecuperada = vidaGorila - vidaAntes;

  adicionarLog(`❤️ Gorila se curou e recuperou ${vidaRecuperada} de vida!`);
  atualizarStatus();
  salvarEstado();

  // Humanos atacam depois da cura
  setTimeout(humanosAtacam, 1000);

  // Volta para a imagem normal após 1 segundo
  setTimeout(() => {
    if (imagemGorila) {
      imagemGorila.src = "assets/img/gorilla.png";
    }
  }, 1000);
}

function configurarEventos() {
  document.getElementById("btn-atacar").addEventListener("click", () => {
    atacar();
    setTimeout(humanosAtacam, 1000);
  });
  document.getElementById("btn-defender").addEventListener("click", () => {
    defender();
    setTimeout(humanosAtacam, 1000);
  });
  document.getElementById("btn-curar").addEventListener("click", () => {
    curar();
  });
}
