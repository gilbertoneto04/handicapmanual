from flask import Flask, render_template, request

app = Flask(__name__)

# Funções de cálculo
def calcular_dc(stake, oddempate, oddml):
    oddDC = (oddempate * oddml) / (oddempate + oddml)
    stakeempate = (stake * oddDC) / oddempate
    stakeml = (stake * oddDC) / oddml
    oddfinal = (stakeml * oddml) / stake
    return oddfinal, stakeempate, stakeml

def calcular_dnb(stake, oddempate, oddml):
    stakeempate = stake / oddempate
    stakeml = stake - stakeempate
    oddfinal = (stakeml * oddml) / stake
    return oddfinal, stakeempate, stakeml

def calcular_mais025(stake, oddempate, oddml):
    x = (((100 * oddml) + 100) / ((2 * oddempate) + oddml)) / 100
    stakeempate = stake * x
    stakeml = stake - stakeempate
    oddfinal = (stakeml * oddml) / stake
    return oddfinal, stakeempate, stakeml

def calcular_menos025(stake, oddempate, oddml):
    stakeempate = (stake / 2) / oddempate
    stakeml = stake - stakeempate
    oddfinal = (stakeml * oddml) / stake
    return oddfinal, stakeempate, stakeml

# Rota principal
@app.route('/', methods=['GET', 'POST'])
def index():
    stake = request.form.get('stake', '')
    oddempate = request.form.get('oddempate', '')
    oddml = request.form.get('oddml', '')
    stakeempate = request.form.get('stakeempate', '')  # Manter valor exato digitado
    stakeml = request.form.get('stakeml', '')          # Manter valor exato digitado
    oddfinal = request.form.get('oddfinal', '')        # Manter valor exato digitado

    if request.method == 'POST':
        if stake and oddempate and oddml:
            # Substituir vírgula por ponto nos valores dos campos de entrada
            stake = request.form['stake'].replace(',', '.')
            oddempate = request.form['oddempate'].replace(',', '.')
            oddml = request.form['oddml'].replace(',', '.')
            operation = request.form['operation']

            # Chamar função de cálculo baseado na operação selecionada
            if operation == 'dc':
                oddfinal, stakeempate, stakeml = calcular_dc(float(stake), float(oddempate), float(oddml))
            elif operation == 'dnb':
                oddfinal, stakeempate, stakeml = calcular_dnb(float(stake), float(oddempate), float(oddml))
            elif operation == 'mais025':
                oddfinal, stakeempate, stakeml = calcular_mais025(float(stake), float(oddempate), float(oddml))
            elif operation == 'menos025':
                oddfinal, stakeempate, stakeml = calcular_menos025(float(stake), float(oddempate), float(oddml))

    return render_template('index.html', stake=stake, oddempate=oddempate, oddml=oddml,
                           stakeempate=stakeempate, stakeml=stakeml, oddfinal=oddfinal)

if __name__ == '__main__':
    app.run(debug=True)
