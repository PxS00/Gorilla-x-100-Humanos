// === Configurações Iniciais ===

const VIDA_MAXIMA = 100;
const TOTAL_HUMANOS = 100;

let vidaGorila = VIDA_MAXIMA;
let humanos = Array.from({ length: TOTAL_HUMANOS }, () => ({ vivo: true }));
let ataquesFeitos = 0;
let nickname = "";
let reducaoDano = 0;

const displayVida = document.getElementById("vida-gorila");
const displayHumanos = document.getElementById("humanos-restantes");
const logBatalha = document.getElementById("log-texto");
const imagemGorila = document.getElementById("imagem-gorila");

const sons = {
  cura: new Audio("assets/audio/cura.wav"),
  defesa: new Audio("assets/audio/defesa.ogg"),
  soco: new Audio("assets/audio/soco.wav")
};

// === Funções Visuais ===

function configurarImagens() {
  if (imagemGorila) {
    Object.assign(imagemGorila.style, {
      width: "300px",
      height: "auto",
      display: "block",
      margin: "20px auto",
      transition: "transform 0.3s ease"
    });
  }
}

function animarGorila(imagem, escala = 1.1, tempo = 300) {
  if (!imagemGorila) return;
  imagemGorila.src = imagem;
  imagemGorila.style.transform = `scale(${escala})`;
  setTimeout(() => imagemGorila.style.transform = "scale(1)", tempo);
  setTimeout(() => imagemGorila.src = "assets/img/gorilla.png", 1000);
}

// === Controle do Jogo ===

function iniciarComNickname() {
  const containerReiniciar = document.getElementById("container-reiniciar");
  if (containerReiniciar) containerReiniciar.remove();

  nickname = prompt("Digite seu nick (até 3 letras):")?.toUpperCase().slice(0, 3) || "AAA";
  limparTodosSaves();
  carregarEstado(nickname);
  configurarEventos();
  configurarImagens();
}

function iniciarNovoJogo() {
  document.querySelectorAll("button[onclick='reiniciarJogo()']").forEach(btn => btn.remove());
  vidaGorila = VIDA_MAXIMA;
  humanos = Array.from({ length: TOTAL_HUMANOS }, () => ({ vivo: true }));
  ataquesFeitos = 0;
  adicionarLog("🎮 Novo jogo iniciado!");
  atualizarStatus();
}

function reiniciarJogo() {
  document.getElementById("container-reiniciar")?.remove();
  vidaGorila = VIDA_MAXIMA;
  humanos = Array.from({ length: TOTAL_HUMANOS }, () => ({ vivo: true }));
  ataquesFeitos = 0;
  reducaoDano = 0;
  logBatalha.innerHTML = "";
  atualizarStatus();
  ativarBotoes();
  adicionarLog("🔄 Jogo reiniciado!");
}

// === Utilitários ===

function atualizarStatus() {
  if (displayVida) displayVida.textContent = vidaGorila;
  if (displayHumanos) displayHumanos.textContent = humanos.filter(h => h.vivo).length;
}

function adicionarLog(mensagem) {
  if (!logBatalha) return;
  logBatalha.innerHTML += `<p>${mensagem}</p>`;
  logBatalha.scrollTop = logBatalha.scrollHeight;
}

function ativarBotoes() {
  document.getElementById("btn-atacar").disabled = false;
  document.getElementById("btn-defender").disabled = false;
  document.getElementById("btn-curar").disabled = false;
}

function desativarBotoes() {
  document.getElementById("btn-atacar").disabled = true;
  document.getElementById("btn-defender").disabled = true;
  document.getElementById("btn-curar").disabled = true;
}

// === Ações do Gorila ===

function atacar() {
  const vivos = humanos.filter(h => h.vivo);
  if (vivos.length === 0 || vidaGorila <= 0) return;

  animarGorila("assets/img/soco.png");
  const quantidade = Math.floor(Math.random() * 6) + 3;
  let eliminados = 0;

  for (let humano of humanos) {
    if (eliminados >= quantidade) break;
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

  setTimeout(humanosAtacam, 1000);
}

function defender() {
  animarGorila("assets/img/defendendo.png");
  reducaoDano = Math.floor(Math.random() * 6) + 2;
  adicionarLog(`🛡️ Gorila se defendeu e reduzirá ${reducaoDano} de dano no próximo ataque!`);
  atualizarStatus();
  salvarEstado();
  setTimeout(humanosAtacam, 1000);
}

function curar() {
  animarGorila("assets/img/curando.jpeg");
  const cura = Math.floor(Math.random() * 8) + 5;
  const antes = vidaGorila;
  vidaGorila = Math.min(VIDA_MAXIMA, vidaGorila + cura);
  adicionarLog(`❤️ Gorila se curou e recuperou ${vidaGorila - antes} de vida!`);
  atualizarStatus();
  salvarEstado();
  setTimeout(humanosAtacam, 1000);
}

// === Ações dos Humanos ===

function humanosAtacam() {
  const vivos = humanos.filter(h => h.vivo);
  if (!vivos.length || vidaGorila <= 0) return;

  let dano = 0;
  const chance = Math.min(0.08, vivos.length * 0.008);

  for (let h of vivos) {
    if (Math.random() < chance) {
      dano += Math.floor(Math.random() * 2) + 1;
    }
  }

  dano = Math.min(dano, 13);
  const final = Math.max(0, dano - reducaoDano);
  vidaGorila = Math.max(0, vidaGorila - final);

  if (dano > 0) {
    adicionarLog(`⚔️ Humanos causaram ${dano} de dano total!`);
    if (reducaoDano > 0) {
      adicionarLog(`🛡️ Defesa reduziu ${reducaoDano} de dano!`);
      adicionarLog(`💥 Gorila sofreu ${final} de dano!`);
    }
  }

  reducaoDano = 0;
  atualizarStatus();
  salvarEstado();
  verificarFimDeJogo();
}

// === Verificações e Salvamento ===

function verificarFimDeJogo() {
  const vivos = humanos.filter(h => h.vivo).length;

  if (vidaGorila <= 0) {
    adicionarLog("💀 O gorila foi derrotado! Fim de jogo.");
    desativarBotoes();
    mostrarReinicio();
  } else if (vivos === 0) {
    adicionarLog("🏆 O gorila venceu! Todos os humanos foram eliminados.");
    desativarBotoes();
    mostrarReinicio();
  }
}

function salvarEstado() {
  if (!nickname) return;
  if (vidaGorila > 0 && humanos.some(h => h.vivo)) {
    localStorage.setItem("gorila_" + nickname, JSON.stringify({
      vida: vidaGorila,
      humanos,
      ataques: ataquesFeitos,
    }));
  } else {
    localStorage.removeItem("gorila_" + nickname);
  }
}

function carregarEstado(n) {
  const dados = localStorage.getItem("gorila_" + n);
  if (!dados) return iniciarNovoJogo();

  try {
    const estado = JSON.parse(dados);
    if (estado && typeof estado.vida === "number" && Array.isArray(estado.humanos)) {
      vidaGorila = estado.vida;
      humanos = estado.humanos;
      ataquesFeitos = estado.ataques;
      nickname = n;
      adicionarLog("🔁 Jogo carregado de " + n);
      atualizarStatus();
    } else {
      iniciarNovoJogo();
    }
  } catch {
    iniciarNovoJogo();
  }
}

function limparTodosSaves() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("gorila_")) {
      localStorage.removeItem(key);
    }
  });
}

// === Interface de Reinício ===

function mostrarReinicio() {
  const antigo = document.getElementById("container-reiniciar");
  if (antigo) antigo.remove();

  const novo = document.createElement("div");
  novo.id = "container-reiniciar";
  Object.assign(novo.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "1000"
  });

  const btn = document.createElement("button");
  btn.textContent = "🔁 Reiniciar jogo";
  btn.onclick = reiniciarJogo;
  Object.assign(btn.style, {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px"
  });

  novo.appendChild(btn);
  document.body.appendChild(novo);
}

// === Eventos ===

function configurarEventos() {
  document.getElementById("btn-atacar").addEventListener("click", () => {
    sons.soco.play();
    atacar();
  });

  document.getElementById("btn-defender").addEventListener("click", () => {
    sons.defesa.play();
    defender();
  });

  document.getElementById("btn-curar").addEventListener("click", () => {
    sons.cura.play();
    curar();
  });
}

window.onload = iniciarComNickname;
