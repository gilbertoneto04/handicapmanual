function calcular(operation) {
  let stake = parseFloat(document.getElementById("stake").value);
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
  document.getElementById("results").style.display = "block";
}
