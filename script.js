// ================================================================
// CONFIGURAÇÃO DO GOOGLE FORMS
// ================================================================

// ID do seu Google Forms
const FORM_ID = "1FAIpQLSfg3o9glfFPFnGjR5I3jVT9nm1SvOoSO-sUwxxmJjgJdh-l5g";

// ENTRY IDs dos campos
const ENTRY_NOME = "entry.968658997";
const ENTRY_MATRICULA = "entry.548467812";
const ENTRY_NOTA = "entry.343607871";
const ENTRY_DATA = "entry.585047661";

// URL para envio
const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

// ================================================================
// SISTEMA ANTI-TRAPAÇA - CONTADOR DE INFRAÇÕES
// 3 tentativas = AVALIAÇÃO BLOQUEADA
// ================================================================

const STORAGE_KEY = 'infracoesQuiz';
const MAX_INFRACOES = 3;

// ⚠️ CÓDIGO DE DESBLOQUEIO
const CODIGO_DESBLOQUEIO = "25123";

let totalInfracoes = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
let quizBloqueado = false;

// ================================================================
// EXTENSÕES ESPECÍFICAS PARA BLOQUEAR
// ================================================================

const EXTENSOES_BLOQUEADAS = [
    'allow-copy', 'allow-copy-plus', 'allowcopy', 'copy-allow',
    'enable-copy-paste', 'enable-copy', 'enablecopy', 'ecp',
    'copy-paste-enable', 'copy-enable', 'paste-enable'
];

// ================================================================
// PROTEÇÃO 1: BLOQUEIO DE ATUALIZAÇÃO DA PÁGINA
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.key === 'F5') {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de atualizar página (F5)');
        return false;
    }
    
    if (e.ctrlKey && e.key === 'F5') {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de atualização forçada (Ctrl+F5)');
        return false;
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de atualizar página (Ctrl+R)');
        return false;
    }
    
    if (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de atualização forçada (Ctrl+Shift+R)');
        return false;
    }
});

history.pushState(null, null, location.href);
window.addEventListener('popstate', function() {
    if (!quizBloqueado) {
        registrarInfracaoImediata('Tentativa de usar voltar/avançar no navegador');
        history.pushState(null, null, location.href);
    }
});

// ================================================================
// PROTEÇÃO 2: BLOQUEIO DE CÓPIA (Ctrl+C)
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de copiar (Ctrl+C)');
        return false;
    }
});

document.addEventListener('copy', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracaoImediata('Tentativa de copiar');
    return false;
});

// ================================================================
// PROTEÇÃO 3: BLOQUEIO DE SELECIONAR TUDO (Ctrl+A)
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de selecionar tudo (Ctrl+A)');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 4: BLOQUEIO DE COLAR (Ctrl+V)
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de colar (Ctrl+V)');
        return false;
    }
    
    if (e.shiftKey && e.key === 'Insert') {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de colar (Shift+Insert)');
        return false;
    }
    
    if (e.ctrlKey && e.shiftKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de colar sem formatação');
        return false;
    }
});

document.addEventListener('paste', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracaoImediata('Tentativa de colar');
    return false;
});

// ================================================================
// PROTEÇÃO 5: BLOQUEIO DE RECORTAR (Ctrl+X)
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de recortar (Ctrl+X)');
        return false;
    }
});

document.addEventListener('cut', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracaoImediata('Tentativa de recortar');
    return false;
});

// ================================================================
// PROTEÇÃO 6: CLIQUE DIREITO - BLOQUEIO IMEDIATO
// ================================================================

document.addEventListener('contextmenu', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracaoImediata('Tentativa de clique direito');
    return false;
});

// ================================================================
// PROTEÇÃO 7: BLOQUEIO DE SELEÇÃO DE TEXTO (APENAS NA TENTATIVA DE CÓPIA)
// ================================================================

let selecaoAtiva = false;
let selecaoTimeout = null;

document.addEventListener('mouseup', function(e) {
    if (quizBloqueado) return;
    
    const selecao = window.getSelection();
    if (selecao && selecao.toString().length > 0) {
        selecaoAtiva = true;
        if (selecaoTimeout) clearTimeout(selecaoTimeout);
        selecaoTimeout = setTimeout(() => {
            selecaoAtiva = false;
        }, 3000);
    }
});

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        const selecao = window.getSelection();
        if (selecao && selecao.toString().length > 0) {
            e.preventDefault();
            registrarInfracaoImediata('Tentativa de copiar texto selecionado (Ctrl+C)');
            return false;
        }
    }
});

document.addEventListener('copy', function(e) {
    if (quizBloqueado) return;
    
    const selecao = window.getSelection();
    if (selecao && selecao.toString().length > 0) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de copiar texto selecionado');
        return false;
    }
});

document.addEventListener('contextmenu', function(e) {
    if (quizBloqueado) return;
    
    const selecao = window.getSelection();
    if (selecao && selecao.toString().length > 0) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de copiar via menu de contexto');
        return false;
    } else {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('dragstart', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    return false;
});

document.addEventListener('selectstart', function(e) {
    if (quizBloqueado) return;
    if (e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});

// ================================================================
// PROTEÇÃO 8: DETECÇÃO DE MUDANÇA DE ABA
// ================================================================

let ultimoFocoTime = Date.now();

document.addEventListener('visibilitychange', function() {
    if (quizBloqueado) return;
    
    if (document.hidden) {
        ultimoFocoTime = Date.now();
        registrarInfracaoImediata('Mudança de aba detectada');
    }
});

window.addEventListener('blur', function() {
    if (quizBloqueado) return;
    ultimoFocoTime = Date.now();
    setTimeout(() => {
        if (document.hidden) {
            registrarInfracaoImediata('Janela perdeu foco (mudança de aba)');
        }
    }, 100);
});

// ================================================================
// PROTEÇÃO 9: BLOQUEIO DE BUSCAR (Ctrl+F e F3)
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de buscar (Ctrl+F)');
        return false;
    }
    
    if (e.key === 'F3') {
        e.preventDefault();
        registrarInfracaoImediata('Tentativa de buscar (F3)');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 10: BLOQUEIO DE ATALHOS DE EXTENSÕES
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        registrarInfracaoImediata('Atalho de extensão (Ctrl+Shift+C)');
        return false;
    }
    
    if (e.ctrlKey && e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        registrarInfracaoImediata('Atalho de extensão (Ctrl+Alt+C)');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 11: DETECÇÃO DE EXTENSÕES
// ================================================================

function detectarExtensoesBloqueadas() {
    if (quizBloqueado) return false;
    
    const todosElementos = document.querySelectorAll('*');
    
    for (let i = 0; i < todosElementos.length; i++) {
        const el = todosElementos[i];
        const classes = (el.className || '').toString().toLowerCase();
        const id = (el.id || '').toLowerCase();
        
        for (let j = 0; j < EXTENSOES_BLOQUEADAS.length; j++) {
            const ext = EXTENSOES_BLOQUEADAS[j].toLowerCase();
            if (classes.includes(ext) || id.includes(ext)) {
                registrarInfracaoImediata(`Extensão bloqueada detectada: ${EXTENSOES_BLOQUEADAS[j]}`);
                return true;
            }
        }
    }
    return false;
}

setInterval(function() {
    if (!quizBloqueado) {
        detectarExtensoesBloqueadas();
    }
}, 3000);

detectarExtensoesBloqueadas();

// ================================================================
// LIMPEZA DO CLIPBOARD
// ================================================================

async function limparClipboard() {
    try {
        await navigator.clipboard.writeText('');
        console.log('Clipboard limpo automaticamente');
    } catch(e) { console.log('Não foi possível limpar clipboard'); }
}

if (navigator.clipboard) {
    const originalWrite = navigator.clipboard.writeText;
    navigator.clipboard.writeText = function(text) {
        if (!quizBloqueado) {
            registrarInfracaoImediata('Tentativa de escrever no clipboard');
        }
        return originalWrite.call(this, '');
    };
}

// ================================================================
// REAPLICAÇÃO CONSTANTE DE PROTEÇÕES CSS
// ================================================================

const styleAntiCopy = document.createElement('style');
styleAntiCopy.textContent = `
    * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        -webkit-touch-callout: none !important;
    }
    input, textarea {
        user-select: text !important;
        -webkit-user-select: text !important;
    }
`;
document.head.appendChild(styleAntiCopy);

setInterval(function() {
    if (quizBloqueado) return;
    
    const newStyle = document.createElement('style');
    newStyle.textContent = `
        * { user-select: none !important; -webkit-user-select: none !important; }
        input, textarea { user-select: text !important; -webkit-user-select: text !important; }
    `;
    document.head.appendChild(newStyle);
    
    const styles = document.querySelectorAll('style');
    if (styles.length > 10) {
        for (let i = 0; i < styles.length - 5; i++) {
            if (styles[i].textContent.includes('user-select')) {
                styles[i].remove();
            }
        }
    }
}, 2000);

// ================================================================
// FUNÇÃO PRINCIPAL DE REGISTRO DE INFRAÇÃO
// ================================================================

function registrarInfracaoImediata(tipo) {
    if (quizBloqueado) return;
    
    totalInfracoes++;
    localStorage.setItem(STORAGE_KEY, totalInfracoes);
    
    limparClipboard();
    
    const tentativasRestantes = MAX_INFRACOES - totalInfracoes;
    
    if (totalInfracoes >= MAX_INFRACOES) {
        bloquearAvaliacao(tipo);
    } else {
        alert(`⚠️ INFRAÇÃO DETECTADA!\n\nAção bloqueada: ${tipo}\n\nVocê cometeu ${totalInfracoes} de ${MAX_INFRACOES} infrações.\nRestam ${tentativasRestantes} tentativa(s) antes do bloqueio.\n\nATENÇÃO: A próxima infração bloqueará sua avaliação!`);
    }
    
    console.log(`⚠️ INFRAÇÃO: ${tipo} | Total: ${totalInfracoes}/${MAX_INFRACOES}`);
}

// ================================================================
// BLOQUEIO DA AVALIAÇÃO
// ================================================================

function bloquearAvaliacao(tipo) {
    quizBloqueado = true;
    
    const container = document.getElementById('questionsContainer');
    if (container) {
        container.innerHTML = `
            <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 1.5rem; padding: 2rem; text-align: center; margin: 1rem 0;">
                <div style="font-size: 4rem;">🚫</div>
                <h2 style="color: #991b1b; margin: 1rem 0;">AVALIAÇÃO BLOQUEADA</h2>
                <p style="color: #7f1d1d; margin-bottom: 1rem;">Você excedeu o número máximo de infrações (${MAX_INFRACOES}).</p>
                <p style="color: #7f1d1d;">Motivo do bloqueio: ${tipo}</p>
                <hr style="margin: 1rem 0; border-color: #fecaca;">
                <p style="font-size: 0.8rem; color: #991b1b;">Infrações registradas: ${totalInfracoes}</p>
                <p style="font-size: 0.8rem; color: #991b1b;">Data do bloqueio: ${new Date().toLocaleString()}</p>
                <button id="btnSolicitarDesbloqueio" style="background: #059669; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 2rem; margin-top: 1.5rem; cursor: pointer; font-weight: bold;">
                    🔓 Solicitar Desbloqueio ao Professor
                </button>
                <p style="font-size: 0.7rem; color: #991b1b; margin-top: 1rem;">Caso tenha sido bloqueado injustamente, solicite o código ao professor.</p>
            </div>
        `;
        
        const btnDesbloquear = document.getElementById('btnSolicitarDesbloqueio');
        if (btnDesbloquear) {
            btnDesbloquear.addEventListener('click', mostrarModalDesbloqueio);
        }
    }
    
    const finalizeBtn = document.getElementById('finalizeBtn');
    if (finalizeBtn) {
        finalizeBtn.disabled = true;
        finalizeBtn.style.opacity = '0.5';
        finalizeBtn.style.cursor = 'not-allowed';
    }
    
    const allInputs = document.querySelectorAll('input, textarea, button');
    allInputs.forEach(input => {
        if (input.id !== 'btnSolicitarDesbloqueio') {
            input.disabled = true;
        }
    });
    
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => { radio.disabled = true; });
    
    localStorage.setItem('quizBloqueado', 'true');
    
    alert(`🚫 AVALIAÇÃO BLOQUEADA!\n\nMotivo: ${tipo}\n\nVocê atingiu o limite de ${MAX_INFRACOES} infrações.\n\nProcure o professor para desbloquear.`);
}

// ================================================================
// MODAL DE DESBLOQUEIO
// ================================================================

function mostrarModalDesbloqueio() {
    const modalExistente = document.getElementById('modalDesbloqueio');
    if (modalExistente) modalExistente.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'modalDesbloqueio';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        backdrop-filter: blur(5px);
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 25px 50px -12px black;
    `;
    
    modal.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔐</div>
        <h3 style="color: #064e3b; margin-bottom: 0.5rem;">Desbloqueio de Avaliação</h3>
        <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1rem;">Digite o código de desbloqueio fornecido pelo professor:</p>
        
        <input type="password" id="codigoDesbloqueioInput" placeholder="Digite o código" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 1rem; font-size: 1rem; text-align: center; margin-bottom: 1rem; outline: none;">
        
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="btnConfirmarDesbloqueio" style="background: #059669; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 2rem; font-weight: 600; cursor: pointer;">Desbloquear</button>
            <button id="btnCancelarDesbloqueio" style="background: #64748b; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 2rem; font-weight: 600; cursor: pointer;">Cancelar</button>
        </div>
        
        <p style="color: #94a3b8; font-size: 0.7rem; margin-top: 1rem;">Caso não tenha o código, entre em contato com o professor.</p>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const input = document.getElementById('codigoDesbloqueioInput');
    const btnConfirmar = document.getElementById('btnConfirmarDesbloqueio');
    const btnCancelar = document.getElementById('btnCancelarDesbloqueio');
    
    if (input) input.focus();
    
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', function() {
            const codigoDigitado = input ? input.value.trim() : '';
            verificarCodigoDesbloqueio(codigoDigitado, overlay);
        });
    }
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            overlay.remove();
        });
    }
    
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const codigoDigitado = input.value.trim();
                verificarCodigoDesbloqueio(codigoDigitado, overlay);
            }
        });
    }
}

function verificarCodigoDesbloqueio(codigo, overlay) {
    if (codigo === CODIGO_DESBLOQUEIO) {
        localStorage.removeItem('infracoesQuiz');
        localStorage.removeItem('quizBloqueado');
        localStorage.removeItem('quizRespostasSalvas');
        
        if (overlay) overlay.remove();
        
        alert('🔓 AVALIAÇÃO DESBLOQUEADA COM SUCESSO!\n\nA página será recarregada. Você poderá refazer a avaliação.');
        location.reload();
    } else {
        const erroDiv = document.createElement('div');
        erroDiv.style.cssText = `
            background: #fee2e2;
            color: #dc2626;
            padding: 0.5rem;
            border-radius: 0.75rem;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            text-align: center;
        `;
        erroDiv.textContent = '❌ Código incorreto! Verifique com o professor.';
        
        const modal = overlay ? overlay.querySelector('div') : null;
        if (modal) {
            const existingError = modal.querySelector('.erro-desbloqueio');
            if (existingError) existingError.remove();
            erroDiv.className = 'erro-desbloqueio';
            modal.appendChild(erroDiv);
            
            setTimeout(() => {
                if (erroDiv && erroDiv.remove) erroDiv.remove();
            }, 3000);
        }
        
        const input = document.getElementById('codigoDesbloqueioInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

// ================================================================
// DESBLOQUEIO VIA URL
// ================================================================

const urlParams = new URLSearchParams(window.location.search);
const urlSenha = urlParams.get('desbloquear');

if (urlSenha === CODIGO_DESBLOQUEIO) {
    localStorage.removeItem('infracoesQuiz');
    localStorage.removeItem('quizBloqueado');
    localStorage.removeItem('quizRespostasSalvas');
    console.log('🔓 Desbloqueio via URL realizado!');
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => {
        alert('🔓 Avaliação desbloqueada via link especial!');
        location.reload();
    }, 500);
}

window.addEventListener('load', function() {
    const estavaBloqueado = localStorage.getItem('quizBloqueado') === 'true';
    if (estavaBloqueado && !quizBloqueado) {
        totalInfracoes = MAX_INFRACOES;
        quizBloqueado = true;
        bloquearAvaliacao('Bloqueio persistente');
    }
});

// ================================================================
// LÓGICA PRINCIPAL DO QUIZ
// ================================================================

let selectedAnswers = new Array(multipleChoiceQuestions.length).fill(null);
let questionLocked = new Array(multipleChoiceQuestions.length).fill(false);
let essayAnswers = new Array(essayQuestions.length).fill("");

const container = document.getElementById('questionsContainer');
const finalizeBtn = document.getElementById('finalizeBtn');
const progressSpan = document.getElementById('progressCounter');
const studentNameInput = document.getElementById('studentName');
const studentIdInput = document.getElementById('studentId');

function updateProgress() {
    if (quizBloqueado) return;
    const mcAnswered = selectedAnswers.filter(idx => idx !== null).length;
    const essayAnswered = essayAnswers.filter(ans => ans.trim() !== "").length;
    const totalAnswered = mcAnswered + essayAnswered;
    progressSpan.innerText = `${totalAnswered} / ${TOTAL_QUESTIONS} respondidas`;
}

function calculateScore() {
    let correctCount = 0;
    for (let i = 0; i < multipleChoiceQuestions.length; i++) {
        if (selectedAnswers[i] !== null && selectedAnswers[i] === multipleChoiceQuestions[i].correta) {
            correctCount++;
        }
    }
    const mcScore = (correctCount / multipleChoiceQuestions.length) * 6;
    const essayAnsweredCount = essayAnswers.filter(ans => ans.trim() !== "").length;
    const essayScore = (essayAnsweredCount / essayQuestions.length) * 4;
    return mcScore + essayScore;
}

function finalizarAvaliacao() {
    if (quizBloqueado) {
        alert("🚫 Avaliação bloqueada! Não é possível finalizar.");
        return false;
    }
    
    const nome = studentNameInput.value.trim();
    if (nome === "") {
        alert("⚠️ Por favor, digite seu nome antes de finalizar a avaliação.");
        return false;
    }
    
    const allMcAnswered = selectedAnswers.every(idx => idx !== null);
    if (!allMcAnswered) {
        alert(`❌ Você respondeu apenas ${selectedAnswers.filter(i=>i!==null).length} de ${multipleChoiceQuestions.length} questões. Responda todas antes de finalizar.`);
        return false;
    }
    
    const nota = calculateScore();
    const notaFormatada = nota.toFixed(1);
    const matricula = studentIdInput.value.trim() || "Não informado";
    const dataHora = new Date().toLocaleString();
    const mcAcertos = selectedAnswers.filter((ans, idx) => ans === multipleChoiceQuestions[idx].correta).length;
    
    // ============================================================
    // ENVIA OS DADOS DIRETAMENTE PARA O GOOGLE FORMS
    // ============================================================
    try {
        const params = new URLSearchParams();
        params.append(ENTRY_NOME, nome);
        params.append(ENTRY_MATRICULA, matricula);
        params.append(ENTRY_NOTA, `${notaFormatada} / 10`);
        params.append(ENTRY_DATA, dataHora);
        
        const urlCompleta = `${FORM_URL}?${params.toString()}`;
        
        // Envia os dados (abre em nova aba)
        window.open(urlCompleta, '_blank');
        
        console.log('✅ Dados enviados para o Google Forms');
    } catch(e) {
        console.log('❌ Erro ao enviar para o Forms:', e);
    }
    
    // ============================================================
    // MOSTRA RESULTADO PARA O ALUNO
    // ============================================================
    const containerQuestoes = document.getElementById('questionsContainer');
    if (containerQuestoes) containerQuestoes.style.display = 'none';
    
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        text-align: center;
        margin: 1rem 0;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
    `;
    resultDiv.innerHTML = `
        <div style="font-size: 3rem;">📊</div>
        <h2 style="color: #064e3b; margin: 1rem 0;">Avaliação Finalizada!</h2>
        <p style="font-size: 1.2rem; margin-bottom: 1rem;"><strong>${escapeHtml(nome)}</strong></p>
        <div style="background: #f0fdf4; border-radius: 1rem; padding: 1rem; margin: 1rem 0;">
            <p style="font-size: 2rem; font-weight: bold; color: #059669;">${notaFormatada} / 10</p>
            <p>✅ Múltipla escolha: ${mcAcertos} de ${multipleChoiceQuestions.length} acertos</p>
            <p>📝 Dissertativas: ${essayAnswers.filter(a=>a.trim()!=="").length} de ${essayQuestions.length} respondidas</p>
        </div>
        <p style="color: #64748b; font-size: 0.8rem;">✅ Resultado enviado ao professor automaticamente!<br>📅 Data: ${dataHora}</p>
        <button id="btnReiniciar" style="background: #059669; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 2rem; margin-top: 1rem; cursor: pointer;">⟳ Fazer Novamente</button>
    `;
    
    containerQuestoes.parentNode.insertBefore(resultDiv, containerQuestoes.nextSibling);
    
    finalizeBtn.disabled = true;
    finalizeBtn.style.opacity = "0.6";
    finalizeBtn.style.cursor = "not-allowed";
    
    const btnReiniciar = document.getElementById('btnReiniciar');
    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', function() {
            localStorage.clear();
            location.reload();
        });
    }
    
    return true;
}

function lockMCQuestion(questionIdx) {
    const card = document.getElementById(`mc-card-${questionIdx}`);
    if (!card) return;
    const radios = card.querySelectorAll(`input[type="radio"]`);
    radios.forEach(radio => { radio.disabled = true; });
    card.classList.add('answered');
    const options = card.querySelectorAll('.option-item');
    options.forEach(opt => { opt.classList.add('disabled-option'); });
    questionLocked[questionIdx] = true;
}

function updateMCFeedback(questionIdx) {
    const card = document.getElementById(`mc-card-${questionIdx}`);
    if (!card) return;
    const feedbackDiv = card.querySelector('.feedback-message');
    const selected = selectedAnswers[questionIdx];
    if (selected === null) {
        feedbackDiv.classList.add('feedback-hidden');
        return;
    }
    const question = multipleChoiceQuestions[questionIdx];
    const isCorrect = (selected === question.correta);
    const correctLetter = String.fromCharCode(65 + question.correta);
    const correctText = question.opcoes[question.correta];
    let message = '';
    if (isCorrect) {
        message = `<span>✅</span> <strong>Acertou!</strong> ${question.explicacao}`;
    } else {
        message = `<span>❌</span> <strong>Errou!</strong> A resposta correta é ${correctLetter}: "${correctText}".<br> 📚 ${question.explicacao}`;
    }
    feedbackDiv.innerHTML = message;
    feedbackDiv.classList.remove('feedback-hidden');
    feedbackDiv.classList.add('feedback-correct');
}

function onSelectOption(questionIdx, optionIdx) {
    if (quizBloqueado) {
        alert("🚫 Avaliação bloqueada! Não é possível responder.");
        return;
    }
    if (questionLocked[questionIdx]) {
        alert("🔒 Esta questão já foi respondida e está travada.");
        return;
    }
    if (selectedAnswers[questionIdx] !== null) return;
    selectedAnswers[questionIdx] = optionIdx;
    const radios = document.querySelectorAll(`input[name="mc-q${questionIdx}"]`);
    radios.forEach((radio, idx) => { radio.checked = (idx === optionIdx); });
    updateMCFeedback(questionIdx);
    lockMCQuestion(questionIdx);
    updateProgress();
}

function onEssayChange(questionIdx, value) {
    if (quizBloqueado) return;
    essayAnswers[questionIdx] = value;
    updateProgress();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderQuestions() {
    if (!container) return;
    container.innerHTML = '';
    
    multipleChoiceQuestions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.id = `mc-card-${idx}`;
        const header = document.createElement('div');
        header.className = 'question-header';
        header.innerHTML = `<div class="question-title"><span class="q-num">${idx+1}</span><span class="q-type">Múltipla Escolha</span><span class="question-text">${escapeHtml(q.pergunta)}</span></div>`;
        card.appendChild(header);
        const optionsUl = document.createElement('ul');
        optionsUl.className = 'options-list';
        q.opcoes.forEach((opcao, optIndex) => {
            const li = document.createElement('li');
            li.className = 'option-item';
            const radioId = `mc-q${idx}_opt${optIndex}`;
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `mc-q${idx}`;
            radio.value = optIndex;
            radio.id = radioId;
            radio.className = 'option-radio';
            radio.addEventListener('change', (e) => { if (radio.checked) onSelectOption(idx, optIndex); });
            const label = document.createElement('label');
            label.htmlFor = radioId;
            label.className = 'option-label';
            const prefix = String.fromCharCode(65 + optIndex);
            label.textContent = `${prefix}. ${opcao}`;
            li.appendChild(radio);
            li.appendChild(label);
            optionsUl.appendChild(li);
        });
        card.appendChild(optionsUl);
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-message feedback-hidden';
        card.appendChild(feedbackDiv);
        container.appendChild(card);
    });
    
    essayQuestions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'essay-card';
        const header = document.createElement('div');
        header.className = 'essay-header';
        const questionNum = idx + 11;
        header.innerHTML = `<div class="question-title"><span class="q-num">${questionNum}</span><span class="q-type">Dissertativa</span><span class="question-text">${escapeHtml(q.pergunta)}</span></div>`;
        card.appendChild(header);
        const content = document.createElement('div');
        content.className = 'essay-content';
        content.innerHTML = `<textarea class="essay-textarea" id="essay-${idx}" rows="4" placeholder="Digite sua resposta aqui..."></textarea><div class="essay-status">📝 Capriche na resposta!</div>`;
        card.appendChild(content);
        container.appendChild(card);
        const textarea = document.getElementById(`essay-${idx}`);
        if (textarea) {
            textarea.addEventListener('input', (e) => onEssayChange(idx, e.target.value));
        }
    });
}

function init() {
    renderQuestions();
    if (finalizeBtn) {
        finalizeBtn.addEventListener('click', () => { finalizarAvaliacao(); });
    }
    updateProgress();
}

document.addEventListener('DOMContentLoaded', init);

console.log('✅ SISTEMA ANTI-TRAPAÇA ATIVADO');
console.log('🔒 Limite de infrações: ' + MAX_INFRACOES);
console.log('🔑 Código de desbloqueio: ' + CODIGO_DESBLOQUEIO);
console.log('📊 Resultados enviados automaticamente para o Google Forms');
console.log('📋 Entry IDs configurados: NOME, MATRÍCULA, NOTA, DATA');