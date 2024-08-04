// Calcular handicaps (Nada a mexer por enquanto)
function todosCamposPreenchidosHandicap() {
  let stake = document.getElementById("stakeHandicap").value.trim();
  let oddempate = document.getElementById("oddempate").value.trim();
  let oddml = document.getElementById("oddml").value.trim();

  return stake !== "" && oddempate !== "" && oddml !== "";
}

function calcular(operation) {
  errormessage = document.getElementById("errormessagehandicap");
  if (!todosCamposPreenchidosHandicap()) {
    document.getElementById("resultsHandicap").style.display = "none";
    errormessage.innerText = "Preencha todos os campos corretamente.";
    return;
  }
  errormessage.style.display = "none";
  let stake = parseFloat(document.getElementById("stakeHandicap").value);
  let oddempate = parseFloat(document.getElementById("oddempate").value);
  let oddml = parseFloat(document.getElementById("oddml").value);

  let oddfinal, stakeempate, stakeml;

  switch (operation) {
    case "dc":
      oddfinal = (oddempate * oddml) / (oddempate + oddml);
      stakeempate = (stake * oddml) / (oddempate + oddml);
      stakeml = stake - stakeempate;
      break;
    case "dnb":
      stakeempate = stake / oddempate;
      stakeml = stake - stakeempate;
      oddfinal = (stakeml * oddml) / stake;
      break;
    case "mais025":
      let x = (100 * oddml + 100) / (2 * oddempate + oddml) / 100;
      stakeempate = stake * x;
      stakeml = stake - stakeempate;
      oddfinal = (stakeml * oddml) / stake;
      break;
    case "menos025":
      stakeempate = stake / 2 / oddempate;
      stakeml = stake - stakeempate;
      oddfinal = (stakeml * oddml) / stake;
      break;
    default:
      return;
  }

  // Exibindo resultados
  document.getElementById("oddfinal").innerText = oddfinal.toFixed(3);
  document.getElementById("stakeempate").innerText = stakeempate.toFixed(2);
  document.getElementById("stakeml").innerText = stakeml.toFixed(2);

  // Mostrando a seção de resultados
  document.getElementById("resultsHandicap").style.display = "block";
}

// Seção de gols

let isOver = true;

// Botão Over/Under
function toggleOption() {
  isOver = !isOver;
  document.getElementById("toggle-text").innerText = isOver ? "Over" : "Under"; //Altera o texto do botão
  document.getElementById("toggle").classList.toggle("under", !isOver); // Altera a classe do botão para mudar a cor
  atualizarMercado();
  let goals = parseFloat(document.getElementById("goals").innerText);
  atualizarValorExato(goals);
  chamarCalculo();
}

// Aumentar/Diminuir linha de gols - Parâmetro é -0.25 ou +0.25
function changeGoals(amount) {
  let goals = parseFloat(document.getElementById("goals").innerText); // goals = valor de gols atual (muda conforme o usuário aperta o botão)
  goals = Math.max(0.5, goals + amount).toFixed(2); //0.5 menor linha possível
  document.getElementById("goals").innerText = goals;

  atualizarValorExato(goals);
  chamarCalculo();
}

function atualizarValorExato(numero) {
  let parteDecimal = numero % 1; //Divide por ele mesmo, o resto (%) vai ser a parte decimal
  let valorExato;
  let mercado = isOver ? "Mais" : "Menos";
  // Linhas abaixo: Se o gol terminar em 0.5 ou 0.75, a linha será +1
  // Ex: linha 3.75 = Exatamente/Mais de 4
  if (mercado == "Mais") {
    if (parteDecimal === 0.5 || parteDecimal === 0.75) {
      valorExato = Math.floor(numero) + 1;
    } else {
      valorExato = Math.floor(numero);
    }
  } else {
    if (parteDecimal === 0.75) {
      valorExato = Math.floor(numero) + 1;
    } else {
      valorExato = Math.floor(numero);
    }
  }

  document.getElementById("exato-gols").innerText = valorExato; // alterar qtd gols do label da odd exatamente
  document.getElementById("exato-gols-resultado").innerText = valorExato; // alterar qtd gols do label da odd exatamente
  document.getElementById("mais-gols").innerText = valorExato; // alterar qtd gols do label da odd over/under
  document.getElementById("mais-gols-resultado").innerText = valorExato; // alterar qtd gols do label da odd over/under
  document.getElementById(
    "oddExatamente"
  ).placeholder = `Insira aqui a odd do "Exatamente ${valorExato} gols"`; // alterar qtd gols do placeholder da odd exatamente
  atualizarMercado();
}

function atualizarMercado() {
  let mercado = isOver ? "Mais" : "Menos";
  document.getElementById("mercado").innerText = mercado;
  document.getElementById("mercado-resultado").innerText = mercado;
  // let valorExato = parseFloat(document.getElementById("goals").innerText);
  // atualizarValorExato(goals);
  let valorExato = document.getElementById("exato-gols").innerText;
  document.getElementById(
    "oddOU"
  ).placeholder = `Insira aqui a odd do "${mercado} de ${valorExato} gols"`; // alterar qtd gols do placeholder da odd over/under
}

function todosCamposPreenchidosGols() {
  let stake = document.getElementById("stakeGols").value.trim();
  let oddExatamente = document.getElementById("oddExatamente").value.trim();
  let oddOU = document.getElementById("oddOU").value.trim();

  return stake !== "" && oddExatamente !== "" && oddOU !== "";
}

function chamarCalculo() {
  errormessage = document.getElementById("errormessagegols");
  if (!todosCamposPreenchidosGols()) {
    document.getElementById("resultsHandicap").style.display = "none";
    errormessage.innerText = "Preencha todos os campos corretamente.";
    return;
  }
  errormessage.style.display = "none";

  let goals = parseFloat(document.getElementById("goals").innerText);
  let finalValue = goals % 1;

  // Lógica para verificar o valor final dos gols e o mercado
  if (finalValue === 0) {
    calcularGols("linha0");
  } else if (finalValue === 0.25) {
    calcularGols(isOver ? "over025" : "under025");
  } else if (finalValue === 0.75) {
    calcularGols(isOver ? "over075" : "under075");
  } else if (finalValue === 0.5) {
    calcularGols("linha05");
  } else {
    console.error("Linha de gols não reconhecida.");
  }
}

function calcularGols(linhaSelecionada) {
  let stake = parseFloat(document.getElementById("stakeGols").value);
  let oddExatamente = parseFloat(
    document.getElementById("oddExatamente").value
  );
  let oddOU = parseFloat(document.getElementById("oddOU").value);
  let stakeexatamente, stakeOU, oddfinal;
  let x = (100 * oddOU + 100) / (2 * oddExatamente + oddOU) / 100;

  switch (linhaSelecionada) {
    case "linha0":
      stakeexatamente = stake / oddExatamente;
      stakeOU = stake - stakeexatamente;
      oddfinal = (stakeOU * oddOU) / stake;
      break;
    case "over025":
      stakeexatamente = stake / 2 / oddExatamente;
      stakeOU = stake - stakeexatamente;
      oddfinal = (stakeOU * oddOU) / stake;
      break;
    case "over075":
      stakeexatamente = stake * x;
      stakeOU = stake - stakeexatamente;
      oddfinal = (stakeOU * oddOU) / stake;
      break;
    case "under025":
      stakeexatamente = stake * x;
      stakeOU = stake - stakeexatamente;
      oddfinal = (stakeOU * oddOU) / stake;
      break;
    case "under075":
      stakeexatamente = stake / 2 / oddExatamente;
      stakeOU = stake - stakeexatamente;
      oddfinal = (stakeOU * oddOU) / stake;
      break;
    case "linha05":
      oddfinal = (oddExatamente * oddOU) / (oddExatamente + oddOU);
      stakeexatamente = (stake * oddOU) / (oddExatamente + oddOU);
      stakeOU = stake - stakeexatamente;

      break;
    default:
      console.error("Opção de linha não reconhecida.");
      return;
  }

  // Exibindo resultados
  document.getElementById("gols-oddfinal").innerText = oddfinal.toFixed(3);
  document.getElementById("stakeexatamente").innerText =
    stakeexatamente.toFixed(2);
  document.getElementById("stakeOU").innerText = stakeOU.toFixed(2);

  // Mostrando a seção de resultados
  document.getElementById("resultsGols").style.display = "block";
}
