// ---------- MENU DROPDOWN ----------
function toggleMenu() {
    const menu = document.getElementById('menuDropdown');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// ---------- FORMULÁRIO DE DENÚNCIA ----------
const pessoaSelect = document.getElementById('pessoa');
const idadeContainer = document.getElementById('idadeContainer');
const idadeInput = document.getElementById('idade');
const tipoViolenciaSelect = document.getElementById('tipoViolencia');
const outroTipoContainer = document.getElementById('outroTipoContainer');
const localSelect = document.getElementById('local');
const outroLocalContainer = document.getElementById('outroLocalContainer');
const denunciaForm = document.getElementById('denunciaForm');
const codigoDenunciaDiv = document.getElementById('codigoDenuncia');

// Mostrar idade e ajustar limite de idade conforme seleção
if(pessoaSelect){
    pessoaSelect.addEventListener('change', () => {
        if(pessoaSelect.value === 'crianca'){
            idadeContainer.style.display = 'block';
            idadeInput.value = '';
            idadeInput.min = 1;
            idadeInput.max = 11;
        } else if(pessoaSelect.value === 'adolescente'){
            idadeContainer.style.display = 'block';
            idadeInput.value = '';
            idadeInput.min = 12;
            idadeInput.max = 17;
        } else {
            idadeContainer.style.display = 'none';
            idadeInput.value = '';
        }
    });
}

// Mostrar input de outro tipo de violência
if(tipoViolenciaSelect){
    tipoViolenciaSelect.addEventListener('change', () => {
        outroTipoContainer.style.display = tipoViolenciaSelect.value === 'outro' ? 'block' : 'none';
    });
}

// Mostrar input de outro local
if(localSelect){
    localSelect.addEventListener('change', () => {
        outroLocalContainer.style.display = localSelect.value === 'outro' ? 'block' : 'none';
    });
}

// Função para gerar código único
function gerarCodigo() {
    return 'DEN' + Date.now();
}

// Validar idade conforme categoria
function validarIdade(pessoa, idade){
    idade = parseInt(idade, 10);
    if(pessoa === 'crianca') return idade >= 1 && idade <= 11;
    if(pessoa === 'adolescente') return idade >= 12 && idade <= 17;
    return true;
}

// Submit do formulário
if(denunciaForm){
    denunciaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const pessoa = pessoaSelect.value;
        const idade = idadeInput.value;

        if((pessoa === 'crianca' || pessoa === 'adolescente') && !validarIdade(pessoa, idade)){
            alert('Idade inválida para a categoria selecionada.');
            return;
        }

        const dados = {
            pessoa: pessoa,
            idade: (pessoa === 'crianca' || pessoa === 'adolescente') ? idade : '',
            tipoViolencia: tipoViolenciaSelect.value === 'outro' ? document.getElementById('outroTipo').value : tipoViolenciaSelect.value,
            local: localSelect.value === 'outro' ? document.getElementById('outroLocal').value : localSelect.value,
            descricao: document.getElementById('descricao').value,
            codigo: gerarCodigo(),
            data: new Date().toLocaleString()
        };

        // Salvar no localStorage
        let historico = JSON.parse(localStorage.getItem('historicoDenuncias')) || [];
        historico.push(dados);
        localStorage.setItem('historicoDenuncias', JSON.stringify(historico));

        // Mostrar alerta e código
        alert('Sua denúncia foi enviada com sucesso!');
        codigoDenunciaDiv.innerText = 'Seu código de denúncia é: ' + dados.codigo;

        // Resetar formulário
        denunciaForm.reset();
        idadeContainer.style.display = 'none';
        outroTipoContainer.style.display = 'none';
        outroLocalContainer.style.display = 'none';
    });
}


// ---------- CONSULTAR DENÚNCIA ----------
const consultaForm = document.getElementById('consultaForm');
const resultadoConsulta = document.getElementById('resultadoConsulta');

if(consultaForm){
    consultaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const codigo = document.getElementById('codigoConsulta').value.trim();
        const historico = JSON.parse(localStorage.getItem('historicoDenuncias')) || [];
        const denuncia = historico.find(d => d.codigo === codigo);

        if(denuncia){
            resultadoConsulta.innerHTML = `
                <p><strong>Código:</strong> ${denuncia.codigo}</p>
                <p><strong>Pessoa:</strong> ${denuncia.pessoa}</p>
                <p><strong>Idade:</strong> ${denuncia.idade || 'Não aplicável'}</p>
                <p><strong>Tipo de violência:</strong> ${denuncia.tipoViolencia}</p>
                <p><strong>Local:</strong> ${denuncia.local}</p>
                <p><strong>Descrição:</strong> ${denuncia.descricao}</p>
                <p><strong>Data:</strong> ${denuncia.data}</p>
            `;
        } else {
            resultadoConsulta.innerHTML = '<p>Denúncia não encontrada.</p>';
        }
    });
}

// ---------- HISTÓRICO DE DENÚNCIAS (USUÁRIO) ----------
const historicoDiv = document.getElementById('historicoDenuncias');

if(historicoDiv){
    const historico = JSON.parse(localStorage.getItem('historicoDenuncias')) || [];
    historicoDiv.innerHTML = '';
    if(historico.length === 0){
        historicoDiv.innerHTML = '<p>Nenhuma denúncia registrada.</p>';
    } else {
        historico.forEach(d => {
            const div = document.createElement('div');
            div.className = 'card-denuncia';
            div.innerHTML = `
                <p><strong>Código:</strong> ${d.codigo}</p>
                <p><strong>Pessoa:</strong> ${d.pessoa}</p>
                <p><strong>Idade:</strong> ${d.idade || 'Não aplicável'}</p>
                <p><strong>Tipo de violência:</strong> ${d.tipoViolencia}</p>
                <p><strong>Local:</strong> ${d.local}</p>
                <p><strong>Descrição:</strong> ${d.descricao}</p>
                <p><strong>Data:</strong> ${d.data}</p>
            `;
            historicoDiv.appendChild(div);
        });
    }
}

// ---------- PAINEL DE ADMIN ----------
const listaDiv = document.getElementById('listaDenuncias');
const buscarBtn = document.getElementById('buscarBtn');
const codigoAdmInput = document.getElementById('codigoAdm');

function exibirDenuncias(filtrarCodigo = '') {
    if(!listaDiv) return;
    const historico = JSON.parse(localStorage.getItem('historicoDenuncias')) || [];
    listaDiv.innerHTML = '';

    const filtradas = filtrarCodigo
        ? historico.filter(d => d.codigo.includes(filtrarCodigo))
        : historico;

    if(filtradas.length === 0){
        listaDiv.innerHTML = '<p>Nenhuma denúncia encontrada.</p>';
        return;
    }

    filtradas.forEach(d => {
        const div = document.createElement('div');
        div.className = 'card-denuncia';
        div.innerHTML = `
            <p><strong>Código:</strong> ${d.codigo}</p>
            <p><strong>Pessoa:</strong> ${d.pessoa}</p>
            <p><strong>Idade:</strong> ${d.idade || 'Não aplicável'}</p>
            <p><strong>Tipo de violência:</strong> ${d.tipoViolencia}</p>
            <p><strong>Local:</strong> ${d.local}</p>
            <p><strong>Descrição:</strong> ${d.descricao}</p>
            <p><strong>Data:</strong> ${d.data}</p>
            <button class="seguirBtn">Dar Seguimento</button>
        `;
        listaDiv.appendChild(div);

        div.querySelector('.seguirBtn').addEventListener('click', () => {
            alert(`Denúncia ${d.codigo} marcada para seguimento!`);
        });
    });
}

// Inicializa painel
if(listaDiv) exibirDenuncias();
if(buscarBtn){
    buscarBtn.addEventListener('click', () => {
        const codigo = codigoAdmInput.value.trim();
        exibirDenuncias(codigo);
    });
}
