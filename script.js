let salaAtual = "";
let souJogador1 = false;
let minhaPalavra = "";
let palavraDoAdversario = "";

function gerarCodigoSala() {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}
// Cria uma nova sala
function criarSala() {
  const codigo = gerarCodigoSala();
  salaAtual = codigo;
  souJogador1 = true;

  firebase.database().ref("salas/" + codigo).set({
    jogador1: {
      palavraParaJ2: "",
      palpites: []
    },
    jogador2: {
      palavraParaJ1: "",
      palpites: []
    }
  });

  alert("Sala criada! Código: " + codigo);
  pedirPalavra();
}

// Entrar numa sala existente
function entrarSala() {
  const codigo = document.getElementById("codigoSala").value.trim();
  salaAtual = codigo;
  souJogador1 = false;

  firebase.database().ref("salas/" + codigo).once("value", snapshot => {
    if (!snapshot.exists()) {
      alert("Sala não encontrada.");
      return;
    }
    pedirPalavra();
  });
}

// Jogador define a palavra que o outro deve adivinhar
function pedirPalavra() {
  const palavra = prompt("Digite a palavra que o outro jogador deve adivinhar (5 letras):").toLowerCase();

  if (palavra.length !== 5) {
    alert("A palavra deve ter 5 letras.");
    return pedirPalavra();
  }

  minhaPalavra = palavra;

  const campo = souJogador1 ? "palavraParaJ2" : "palavraParaJ1";

  firebase.database().ref(`salas/${salaAtual}/${souJogador1 ? "jogador1" : "jogador2"}/${campo}`)
    .set(palavra);

  // Espera o adversário definir a palavra também
  esperarPalavraDoAdversario();
}

// Espera a palavra do adversário ser enviada
function esperarPalavraDoAdversario() {
  const campo = souJogador1 ? "palavraParaJ1" : "palavraParaJ2";
  const jogadorAdversario = souJogador1 ? "jogador2" : "jogador1";

  firebase.database().ref(`salas/${salaAtual}/${jogadorAdversario}/${campo}`)
    .on("value", snapshot => {
      if (snapshot.exists()) {
        palavraDoAdversario = snapshot.val();
        iniciarJogo();
      }
    });
}

// Começa o jogo
function iniciarJogo() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  const jogadorAdversario = souJogador1 ? "jogador2" : "jogador1";
  firebase.database().ref(`salas/${salaAtual}/${jogadorAdversario}/palpites`)
    .on("child_added", snapshot => {
      const palpiteAdversario = snapshot.val();
      mostrarPalpiteAdversario(palpiteAdversario);
    });
}

// Jogador envia um palpite
function enviarPalpite() {
  const palpite = document.getElementById("palpite").value.toLowerCase();
  if (palpite.length !== 5) {
    alert("A palavra deve ter 5 letras.");
    return;
  }
  if (!palavraDoAdversario) {
  alert("Ainda não recebemos a palavra do adversário.");
  return;
  }
  mostrarPalpite(palpite);
  document.getElementById("palpite").value = "";

  // Salva o palpite no Firebase (opcional)
  const jogador = souJogador1 ? "jogador1" : "jogador2";
  firebase.database().ref(`salas/${salaAtual}/${jogador}/palpites`).push(palpite);
}
function mostrarPalpiteAdversario(palpite) {
  const linha = document.createElement("div");
  linha.style.marginBottom = "10px"
  for (let i = 0; i < 5; i++) {
    const letra = document.createElement("span");
    letra.textContent = palpite[i].toUpperCase();

    if (palpite[i] === minhaPalavra[i]) {
      letra.style.backgroundColor = "green";
    } else if (minhaPalavra.includes(palpite[i])) {
      letra.style.backgroundColor = "orange";
    } else {
      letra.style.backgroundColor = "gray";
    }

    letra.style.color = "white";
    letra.style.padding = "10px";
    letra.style.margin = "2px";
    linha.appendChild(letra);
  }

  document.getElementById("tabuleiroAdversario").appendChild(linha);
}
function mostrarPalpite(palpite) {
  const linha = document.createElement("div");
  linha.style.marginBottom = "10px"
  for (let i = 0; i < 5; i++) {
    const letra = document.createElement("span");
    letra.textContent = palpite[i].toUpperCase();

    if (palpite[i] === palavraDoAdversario[i]) {
      letra.style.backgroundColor = "green";
    } else if (palavraDoAdversario.includes(palpite[i])) {
      letra.style.backgroundColor = "orange";
    } else {
      letra.style.backgroundColor = "gray";
    }

    letra.style.color = "white";
    letra.style.padding = "10px";
    letra.style.margin = "2px";
    linha.appendChild(letra);
  }

  document.getElementById("tabuleiro").appendChild(linha);
}
