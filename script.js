let salaAtual = "";
let palavraAlvo = "";

function gerarCodigoSala() {
  return Math.random().toString(36).substr(2, 6);
}

function criarSala() {
  const codigo = gerarCodigoSala();
  salaAtual = codigo;
  palavraAlvo = prompt("Digite sua palavra secreta (5 letras):").toLowerCase();

  firebase.database().ref("salas/" + codigo).set({
    jogador1: {
      palavra: palavraAlvo,
      palpites: []
    }
  });

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  alert("Sala criada! Código: " + codigo);
}

function entrarSala() {
  const codigo = document.getElementById("codigoSala").value;
  salaAtual = codigo;

  firebase.database().ref("salas/" + codigo + "/jogador1/palavra").once("value", snapshot => {
    palavraAlvo = snapshot.val();
    if (!palavraAlvo) {
      alert("Sala não encontrada.");
      return;
    }

    document.getElementById("menu").style.display = "none";
    document.getElementById("jogo").style.display = "block";
  });
}

function enviarPalpite() {
  const palpite = document.getElementById("palpite").value.toLowerCase();
  if (palpite.length !== 5) {
    alert("A palavra deve ter 5 letras.");
    return;
  }

  const linha = document.createElement("div");
  for (let i = 0; i < 5; i++) {
    const letra = document.createElement("span");
    letra.textContent = palpite[i].toUpperCase();

    if (palpite[i] === palavraAlvo[i]) {
      letra.style.backgroundColor = "green";
    } else if (palavraAlvo.includes(palpite[i])) {
      letra.style.backgroundColor = "orange";
    } else {
      letra.style.backgroundColor = "gray";
    }

    letra.style.padding = "10px";
    letra.style.margin = "2px";
    letra.style.color = "white";
    linha.appendChild(letra);
  }

  document.getElementById("tabuleiro").appendChild(linha);
  document.getElementById("palpite").value = "";

  // Salvar palpite no Firebase (opcional)
  firebase.database().ref("salas/" + salaAtual + "/jogador2/palpites").push(palpite);
}