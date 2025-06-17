let salaAtual = "";
let souJogador1 = false;
let minhaPalavra = "";
let palavraDoAdversario = "";
let jogoJaIniciado = false;

// Gera código da sala (5 caracteres)
function gerarCodigoSala() {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 5 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join('');
}

// Criar sala
function criarSala() {
  const codigo = gerarCodigoSala();
  salaAtual = codigo;
  souJogador1 = true;

  firebase.database().ref(`salas/${codigo}`).set({
    jogador1: { palavraParaJ2: "", palpites: [] },
    jogador2: { palavraParaJ1: "", palpites: [] }
  });

  alert("Sala criada! Código: " + codigo);
  pedirPalavra();
}

// Entrar em uma sala existente
function entrarSala() {
  const codigo = document.getElementById("codigoSala").value.trim();
  salaAtual = codigo;
  souJogador1 = false;

  firebase.database().ref(`salas/${codigo}`).once("value", snapshot => {
    if (!snapshot.exists()) {
      alert("Sala não encontrada.");
      return;
    }
    pedirPalavra();
  });
}

// Jogador define a palavra para o adversário
function pedirPalavra() {
  const palavra = prompt("Digite a palavra que o outro jogador deve adivinhar (5 letras):").toLowerCase();

  if (palavra.length !== 5) {
    alert("A palavra deve ter 5 letras.");
    return pedirPalavra();
  }

  minhaPalavra = palavra;

  const campo = souJogador1 ? "palavraParaJ2" : "palavraParaJ1";
  const jogador = souJogador1 ? "jogador1" : "jogador2";

  firebase.database().ref(`salas/${salaAtual}/${jogador}/${campo}`).set(palavra);
  esperarPalavraDoAdversario();
}

// Espera a palavra do adversário
function esperarPalavraDoAdversario() {
  const campo = souJogador1 ? "palavraParaJ1" : "palavraParaJ2";
  const adversario = souJogador1 ? "jogador2" : "jogador1";
  const ref = firebase.database().ref(`salas/${salaAtual}/${adversario}/${campo}`);

  const listener = ref.on("value", snapshot => {
    const palavra = snapshot.val();

    if (palavra && !palavraDoAdversario) {
      palavraDoAdversario = palavra;
      ref.off("value", listener);
      iniciarJogo(); // só chama uma vez
    }
  });
}

// Início do jogo
function iniciarJogo() {
  if (jogoJaIniciado) return;
  jogoJaIniciado = true;

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";

  const adversario = souJogador1 ? "jogador2" : "jogador1";
  const refPalpites = firebase.database().ref(`salas/${salaAtual}/${adversario}/palpites`);

  refPalpites.off(); // garante que não duplica
  refPalpites.on("child_added", snapshot => {
    mostrarPalpiteAdversario(snapshot.val());
  });
}

// Enviar palpite
function enviarPalpite() {
  const input = document.getElementById("palpite");
  const palpite = input.value.toLowerCase();

  if (palpite.length !== 5) {
    alert("A palavra deve ter 5 letras.");
    return;
  }

  if (!palavraDoAdversario) {
    alert("Ainda não recebemos a palavra do adversário.");
    return;
  }

  mostrarPalpite(palpite);
  input.value = "";

  const jogador = souJogador1 ? "jogador1" : "jogador2";
  firebase.database().ref(`salas/${salaAtual}/${jogador}/palpites`).push(palpite);
}

// Exibe o palpite do adversário
function mostrarPalpiteAdversario(palpite) {
  mostrarPalpiteVisual(palpite, minhaPalavra, "tabuleiroAdversario");
}

// Exibe o próprio palpite
function mostrarPalpite(palpite) {
  mostrarPalpiteVisual(palpite, palavraDoAdversario, "tabuleiro");
}

// Função de exibição visual
function mostrarPalpiteVisual(palpite, palavraCorreta, idTabuleiro) {
  const linha = document.createElement("div");
  linha.style.marginBottom = "25px";

  for (let i = 0; i < 5; i++) {
    const letra = document.createElement("span");
    letra.textContent = palpite[i].toUpperCase();

    if (palpite[i] === palavraCorreta[i]) {
      letra.style.backgroundColor = "green";
    } else if (palavraCorreta.includes(palpite[i])) {
      letra.style.backgroundColor = "orange";
    } else {
      letra.style.backgroundColor = "gray";
    }

    letra.style.color = "white";
    letra.style.padding = "10px";
    letra.style.margin = "2px";
    linha.appendChild(letra);
  }

  document.getElementById(idTabuleiro).appendChild(linha);
}
