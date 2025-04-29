// Variável global para armazenar a última operação
let ultimaOperacaoHandicap = null;

// Função que verifica se todos os campos estão preenchidos
function todosCamposPreenchidosHandicap() {
  let stake = document.getElementById("stakeHandicap").value.trim();
  let oddempate = document.getElementById("oddempate").value.trim();
  let oddml = document.getElementById("oddml").value.trim();

  return stake !== "" && oddempate !== "" && oddml !== "";
}

// Função para realizar o cálculo do handicap
function calcular(operation = null) {
  const errormessage = document.getElementById("errormessagehandicap");

  // Verifica se todos os campos estão preenchidos
  if (!todosCamposPreenchidosHandicap()) {
    document.getElementById("resultsHandicap").style.display = "none";
    errormessage.innerText = "Preencha todos os campos corretamente.";
    return;
  }

  errormessage.style.display = "none";
  let stake = parseFloat(document.getElementById("stakeHandicap").value);
  let oddempate = parseFloat(document.getElementById("oddempate").value);
  let oddml = parseFloat(document.getElementById("oddml").value);

  // Se a operação foi passada (via clique no botão), atualiza
  if (operation) {
    ultimaOperacaoHandicap = operation;
  }

  // Se nenhuma operação foi escolhida ainda, não faz nada
  if (!ultimaOperacaoHandicap) return;

  let oddfinal, stakeempate, stakeml;

  // Lógica de cálculos baseada na operação escolhida
  switch (ultimaOperacaoHandicap) {
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

// Adiciona eventos de 'input' para atualizar os valores em tempo real
document.addEventListener("DOMContentLoaded", function () {
  const inputsHandicap = [
    document.getElementById("stakeHandicap"),
    document.getElementById("oddempate"),
    document.getElementById("oddml")
  ];

  // Atualiza os cálculos automaticamente ao digitar nos campos
  inputsHandicap.forEach(input => {
    input.addEventListener("input", () => {
      calcular(); // Recalcula utilizando a última operação
    });
  });

  // Botão de informação
  const infoButton = document.getElementById("info-button");
  const infoBox = document.getElementById("info-box");

  // Exibe a tooltip quando o mouse passa sobre o botão
  infoButton.addEventListener("mouseenter", function () {
    infoBox.style.display = "block";
  });

  // Esconde a tooltip quando o mouse sai do botão
  infoButton.addEventListener("mouseleave", function () {
    infoBox.style.display = "none";
  });
});
