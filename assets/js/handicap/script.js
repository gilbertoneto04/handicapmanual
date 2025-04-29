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

//Botão de informação
document.addEventListener("DOMContentLoaded", function () {
  const infoButton = document.getElementById("info-button");
  const infoTooltip = document.getElementById("info-tooltip");

  infoButton.addEventListener("mouseenter", function () {
      infoTooltip.style.display = "block";
  });

  infoButton.addEventListener("mouseleave", function () {
      infoTooltip.style.display = "none";
  });
});
