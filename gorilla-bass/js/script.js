// Estado inicial
let vidaGorila = 100;
const vidaMaxima = 100;
let humanos = Array.from({ length: 100 }, () => ({ vivo: true, temItem: Math.random() < 0.2 }));
let ataquesFeitos = 0;
let nickname = "";
const maxSaves = 3;

// Elementos do DOM
const spanVida = document.getElementById("vida-gorila");
const spanHumanos = document.getElementById("humanos-restantes");
const logDiv = document.getElementById("log-texto");

// Atualizar status
function atualizarStatus() {
    spanVida.textContent = vidaGorila;
    spanHumanos.textContent = humanos.filter(h => h.vivo).length;
}

// Log da batalha
function log(msg) {
    logDiv.innerHTML += `<p>${msg}</p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Ataque do gorila
function atacar() {
    const vivos = humanos.filter(h => h.vivo);
    if (vivos.length === 0 || vidaGorila <= 0) return;

    let eliminados = Math.floor(Math.random() * 5) + 2;
    let cont = 0;
    for (let h of humanos) {
        if (cont >= eliminados) break;
        if (h.vivo) {
            h.vivo = false;
            cont++;
        }
    }

    ataquesFeitos++;
    log(`🦍 Gorila atacou e eliminou ${cont} humano(s)!`);
    atualizarStatus();
    salvarEstado();
    verificarFimDeJogo();
}

// Defender
function defender() {
    const sucesso = Math.random() < 0.5;
    if (sucesso) {
        vidaGorila += 5;
        if (vidaGorila > vidaMaxima) vidaGorila = vidaMaxima;
        log("🛡️ Gorila defendeu e recuperou 5 de vida!");
    } else {
        log("🛡️ Defesa falhou!");
    }
    atualizarStatus();
    salvarEstado();
}

// Curar
function curar() {
    if (vidaGorila < vidaMaxima) {
        const cura = Math.floor(Math.random() * 10) + 5;
        vidaGorila = Math.min(vidaGorila + cura, vidaMaxima);
        log(`💊 Gorila se curou em ${cura} pontos!`);
    } else {
        log("💤 Vida cheia!");
    }
    atualizarStatus();
    salvarEstado();
}

// Humanos atacam com itens às vezes
function humanosAtacam() {
    let vivos = humanos.filter(h => h.vivo);
    if (vivos.length > 0 && vidaGorila > 0) {
        let danoTotal = 0;
        for (let h of vivos) {
            if (Math.random() < 0.05) {
                let dano = h.temItem ? Math.floor(Math.random() * 8 + 5) : Math.floor(Math.random() * 3);
                danoTotal += dano;
            }
        }
        vidaGorila = Math.max(0, vidaGorila - danoTotal);
        log(`⚔️ Humanos causaram ${danoTotal} de dano ao gorila!`);
        atualizarStatus();
        salvarEstado();
        verificarFimDeJogo();
    }
}

// Fim de jogo
function verificarFimDeJogo() {
    const humanosVivos = humanos.filter(h => h.vivo).length;
    if (vidaGorila <= 0) {
        log("💀 O gorila foi derrotado! Fim de jogo.");
        desativarBotoes();
        mostrarReinicio();
    } else if (humanosVivos === 0) {
        log("🏆 O gorila venceu! Todos os humanos foram eliminados.");
        desativarBotoes();
        mostrarReinicio();
    }
}

// Salvar com nickname
function salvarEstado() {
    if (!nickname) return;
    localStorage.setItem("gorila_" + nickname, JSON.stringify({
        vida: vidaGorila,
        humanos: humanos,
        ataques: ataquesFeitos
    }));
}

// Carregar
function carregarEstado(nick) {
    const data = localStorage.getItem("gorila_" + nick);
    if (data) {
        const obj = JSON.parse(data);
        vidaGorila = obj.vida;
        humanos = obj.humanos;
        ataquesFeitos = obj.ataques;
        nickname = nick;
        log("🔁 Jogo carregado de " + nick);
        atualizarStatus();
    }
}

// Escolher nickname no início
function iniciarComNick() {
    nickname = prompt("Digite seu nick (até 3 letras):").toUpperCase().slice(0, 3);
    if (!nickname) nickname = "AAA";
    carregarEstado(nickname);
    configurarEventos();
}

// Reiniciar jogo
function mostrarReinicio() {
    const botao = document.createElement("button");
    botao.textContent = "🔁 Reiniciar jogo";
    botao.onclick = () => location.reload();
    document.body.appendChild(botao);
}

// Botões
function desativarBotoes() {
    document.getElementById("btn-atacar").disabled = true;
    document.getElementById("btn-defender").disabled = true;
    document.getElementById("btn-curar").disabled = true;
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
        setTimeout(humanosAtacam, 1000);
    });
}

// Início
window.onload = iniciarComNick;
