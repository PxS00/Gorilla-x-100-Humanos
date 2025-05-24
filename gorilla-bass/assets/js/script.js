// JavaScript estruturado com classe .ativo para imagens do gorila

document.addEventListener("DOMContentLoaded", () => {
  const VIDA_MAXIMA = 100;
  let vidaGorila = VIDA_MAXIMA;
  let humanos = Array.from({ length: 100 }, () => ({ vivo: true }));
  let ataquesFeitos = 0;
  let reducaoDano = 0;
  let jogoEncerrado = false;

  const displayVida = document.getElementById("vida-gorila");
  const displayHumanos = document.getElementById("humanos-restantes");
  const logBatalha = document.getElementById("log-texto");

  const imgGorila = document.getElementById("imagem-gorila");
  const imgSoco = document.getElementById("imagem-gorila-soco");
  const imgDefendendo = document.getElementById("imagem-gorila-defendendo");
  const imgCurando = document.getElementById("imagem-gorila-curando");

  const somCura = new Audio("assets/audio/cura.wav");
  const somDefesa = new Audio("assets/audio/defesa.ogg");
  const somSoco = new Audio("assets/audio/soco.wav");

  function atualizarStatus() {
    displayVida.textContent = vidaGorila;
    displayHumanos.textContent = humanos.filter(h => h.vivo).length;
    verificarFimDeJogo();
  }

  function adicionarLog(msg) {
    logBatalha.innerHTML += `<p>${msg}</p>`;
    logBatalha.scrollTop = logBatalha.scrollHeight;
  }

  function trocarImagem(ativa) {
    [imgGorila, imgSoco, imgDefendendo, imgCurando].forEach(img => {
      img.classList.remove("ativo");
    });
    ativa.classList.add("ativo");
  }

  function atacar() {
    if (jogoEncerrado) return;
    somSoco.play();
    trocarImagem(imgSoco);
    setTimeout(() => trocarImagem(imgGorila), 1000);

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
    setTimeout(humanosAtacam, 1000);
  }

  function defender() {
    if (jogoEncerrado) return;
    somDefesa.play();
    trocarImagem(imgDefendendo);
    setTimeout(() => trocarImagem(imgGorila), 1000);

    reducaoDano = Math.floor(Math.random() * 6) + 2;
    adicionarLog(`🛡️ Gorila reduzirá ${reducaoDano} de dano no próximo ataque.`);
    atualizarStatus();
    setTimeout(humanosAtacam, 1000);
  }

  function curar() {
    if (jogoEncerrado) return;
    somCura.play();
    trocarImagem(imgCurando);
    setTimeout(() => trocarImagem(imgGorila), 1000);

    const cura = Math.floor(Math.random() * 8) + 5;
    const vidaAntes = vidaGorila;
    vidaGorila = Math.min(VIDA_MAXIMA, vidaGorila + cura);
    const recuperado = vidaGorila - vidaAntes;
    adicionarLog(`❤️ Gorila se curou e recuperou ${recuperado} de vida.`);
    atualizarStatus();
    setTimeout(humanosAtacam, 1000);
  }

  function humanosAtacam() {
    if (jogoEncerrado) return;

    const vivos = humanos.filter(h => h.vivo);
    if (vivos.length === 0 || vidaGorila <= 0) return;

    let danoTotal = 0;
    const chanceAtaque = Math.min(0.08, vivos.length * 0.008);

    for (let h of vivos) {
      if (Math.random() < chanceAtaque) {
        danoTotal += Math.floor(Math.random() * 2) + 1;
      }
    }

    danoTotal = Math.min(danoTotal, 13);
    const danoFinal = Math.max(0, danoTotal - reducaoDano);
    vidaGorila = Math.max(0, vidaGorila - danoFinal);

    if (danoTotal > 0) {
      adicionarLog(`⚔️ Humanos causaram ${danoTotal} de dano total.`);
      if (reducaoDano > 0) {
        adicionarLog(`🛡️ Defesa reduziu ${reducaoDano} de dano.`);
        adicionarLog(`💥 Gorila sofreu ${danoFinal} de dano.`);
      }
    }

    reducaoDano = 0;
    atualizarStatus();
  }

  function verificarFimDeJogo() {
    const humanosVivos = humanos.filter(h => h.vivo).length;

    if (!jogoEncerrado) {
      if (vidaGorila <= 0) {
        jogoEncerrado = true;
        adicionarLog("💀 Gorila derrotado! Fim do jogo.");
      } else if (humanosVivos === 0) {
        jogoEncerrado = true;
        adicionarLog("🏆 Todos os humanos foram eliminados! O gorila venceu.");
      }
    }
  }

  document.getElementById("btn-atacar").addEventListener("click", atacar);
  document.getElementById("btn-defender").addEventListener("click", defender);
  document.getElementById("btn-curar").addEventListener("click", curar);

  atualizarStatus();
});