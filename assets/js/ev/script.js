document.addEventListener("DOMContentLoaded", function () {
  const quantidadeOddsInput = document.getElementById("quantidadeOdds")
  const oddsContainer = document.getElementById("oddsContainer")
  const limparOddsButton = document.getElementById("limparOdds")

  // Função para gerar os inputs de odds
  function gerarInputsOdds(quantidade) {
      const existingInputs = Array.from(oddsContainer.querySelectorAll(".odd-input-group"))
      const quantidadeAtual = existingInputs.length

      // Remove apenas os campos excedentes
      if (quantidadeAtual > quantidade) {
          for (let i = quantidadeAtual; i > quantidade; i--) {
              oddsContainer.removeChild(existingInputs[i - 1])
          }
          calcularFairOdds() // Recalcula as fair odds após remover campos
      }
      // Adiciona novos campos se necessário
      else if (quantidadeAtual < quantidade) {
          for (let i = quantidadeAtual + 1; i <= quantidade; i++) {
              const div = document.createElement("div")
              div.className = "odd-input-group"

              // Label e input para a odd
              const label = document.createElement("label")
              label.setAttribute("for", `odd${i}`)
              label.innerText = `Odd ${i}:`

              const inputOdd = document.createElement("input")
              inputOdd.type = "number"
              inputOdd.id = `odd${i}`
              inputOdd.name = `odd${i}`
              inputOdd.placeholder = "Insira aqui a odd"
              inputOdd.autocomplete = "off"
              inputOdd.addEventListener("input", function () {
                  atualizarVisibilidade(inputOdd, i)
                  calcularFairOdds()
              })

              // Span para exibir a fair odd
              const spanFairOdd = document.createElement("span")
              spanFairOdd.id = `fairOdd${i}`
              spanFairOdd.className = "fair-odd"
              spanFairOdd.innerText = "Fair Odd: -"
              spanFairOdd.style.display = "none" // Inicialmente oculto

              // Input para a odd apostada
              const inputOddApostada = document.createElement("input")
              inputOddApostada.type = "number"
              inputOddApostada.id = `oddApostada${i}`
              inputOddApostada.name = `oddApostada${i}`
              inputOddApostada.placeholder = "Odd apostada"
              inputOddApostada.autocomplete = "off"
              inputOddApostada.style.display = "none" // Inicialmente oculto
              inputOddApostada.addEventListener("input", calcularFairOdds)

              // Span para exibir a margem
              const spanMargem = document.createElement("span")
              spanMargem.id = `margem${i}`
              spanMargem.className = "margem"
              spanMargem.innerText = "" // Inicialmente vazio
              spanMargem.style.display = "none" // Inicialmente oculto

              // Adiciona os elementos ao grupo
              div.appendChild(label)
              div.appendChild(inputOdd)
              div.appendChild(spanFairOdd)
              div.appendChild(inputOddApostada)
              div.appendChild(spanMargem)
              oddsContainer.appendChild(div)
          }
      }
  }

  // Função para atualizar a visibilidade dos elementos
  function atualizarVisibilidade(inputOdd, index) {
      const valor = parseFloat(inputOdd.value)
      const fairOddSpan = document.getElementById(`fairOdd${index}`)
      const inputOddApostada = document.getElementById(`oddApostada${index}`)
      const margemSpan = document.getElementById(`margem${index}`)

      if (!isNaN(valor) && valor > 1) {
          fairOddSpan.style.display = "inline"
          inputOddApostada.style.display = "inline"
          margemSpan.style.display = "inline"
      } else {
          fairOddSpan.style.display = "none"
          inputOddApostada.style.display = "none"
          margemSpan.style.display = "none"
      }
  }

  // Função para limpar todos os campos de odds
function limparOdds() {
  const inputs = oddsContainer.querySelectorAll("input[type='number']")
  const spans = oddsContainer.querySelectorAll("span")

  inputs.forEach(input => {
      input.value = "" // Limpa o valor do input
      if (input.placeholder === "Odd apostada") {
          input.style.display = "none" // Oculta o input de odd apostada
      }
  })

  spans.forEach(span => {
      if (span.classList.contains("fair-odd") || span.classList.contains("margem")) {
          span.innerText = "" // Limpa o texto dos spans
          span.style.display = "none" // Oculta os spans
      }
  })

  calcularFairOdds() // Recalcula as fair odds após limpar os campos
}

  // Gerar inputs iniciais (valor padrão = 2)
  gerarInputsOdds(2)

  // Atualizar inputs quando o usuário alterar a quantidade de odds
  quantidadeOddsInput.addEventListener("input", function () {
      const quantidade = parseInt(quantidadeOddsInput.value)
      if (!isNaN(quantidade) && quantidade >= 2) { // Mínimo de 2 odds
          gerarInputsOdds(quantidade)
      } else {
          quantidadeOddsInput.value = 2 // Força o valor mínimo de 2
      }
  })

  // Adicionar evento ao botão de limpar odds
  limparOddsButton.addEventListener("click", limparOdds)

  // Função para calcular as fair odds e margens
  function calcularFairOdds() {
      const inputs = oddsContainer.querySelectorAll("input[type='number'][placeholder='Insira aqui a odd']")
      const odds = []
      let somaInversos = 0

      // Coletar as odds preenchidas e válidas (acima de 1)
      inputs.forEach(input => {
          const valor = parseFloat(input.value)
          if (!isNaN(valor) && valor > 1) { // Apenas valores acima de 1 são considerados
              odds.push(valor)
              somaInversos += 1 / valor
          }
      })

      // Verificar se há odds válidas
      if (odds.length === 0) {
          inputs.forEach((_, index) => {
              const fairOddSpan = document.getElementById(`fairOdd${index + 1}`)
              fairOddSpan.innerText = "Fair Odd: -"
              const margemSpan = document.getElementById(`margem${index + 1}`)
              margemSpan.innerText = "" // Margem vazia
          })
          return
      }

      // Calcular as fair odds e margens
      inputs.forEach((input, index) => {
          const valor = parseFloat(input.value)
          const fairOddSpan = document.getElementById(`fairOdd${index + 1}`)
          const inputOddApostada = document.getElementById(`oddApostada${index + 1}`)
          const margemSpan = document.getElementById(`margem${index + 1}`)

          if (!isNaN(valor) && valor > 1) { // Apenas valores acima de 1 são considerados
              const probabilidadeJusta = (1 / valor) / somaInversos // Probabilidade justa
              const fairOdd = 1 / probabilidadeJusta // Fórmula correta das fair odds
              fairOddSpan.innerText = `Fair Odd: ${fairOdd.toFixed(3)}`

              const oddApostada = parseFloat(inputOddApostada.value)
              if (!isNaN(oddApostada) && oddApostada > 0) {
                  const margem = (oddApostada / fairOdd) * 100 // Margem em porcentagem
                  margemSpan.innerText = `Margem: ${margem.toFixed(2)}%`

                  // Aplicar cores conforme a margem
                  if (margem > 100) {
                      margemSpan.style.color = "green"
                  } else if (margem === 100) {
                      margemSpan.style.color = "blue"
                  } else {
                      margemSpan.style.color = "red"
                  }
              } else {
                  margemSpan.innerText = "" // Margem vazia se não houver odd apostada
                  margemSpan.style.color = "" // Resetar cor
              }
          } else {
              fairOddSpan.innerText = "Fair Odd: -"
              margemSpan.innerText = "" // Margem vazia
              margemSpan.style.color = "" // Resetar cor
          }
      })
  }
})

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
