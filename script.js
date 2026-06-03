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
// CONTADOR DE CLIQUE DIREITO (máximo 4 usos)
// ================================================================

let cliqueDireitoCount = 0;
const MAX_CLIQUE_DIREITO = 4;

// ================================================================
// EXTENSÕES ESPECÍFICAS PARA BLOQUEAR
// ================================================================

const EXTENSOES_BLOQUEADAS = [
    'allow-copy', 'allow-copy-plus', 'allowcopy', 'copy-allow',
    'enable-copy-paste', 'enable-copy', 'enablecopy', 'ecp',
    'copy-paste-enable', 'copy-enable', 'paste-enable'
];

// ================================================================
// PROTEÇÃO 1: BLOQUEIO DE SELEÇÃO DE TEXTO (arrastar)
// ================================================================

// Impede seleção de texto com o mouse
document.addEventListener('mousedown', function(e) {
    if (quizBloqueado) return;
    // Permite clicar em inputs e textareas, mas não selecionar texto
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('dragstart', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracao('Tentativa de arrastar para selecionar');
    return false;
});

document.addEventListener('selectstart', function(e) {
    if (quizBloqueado) return;
    // Permite seleção apenas dentro de textareas
    if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
    }
});

// Impede seleção com Shift + setas
document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        registrarInfracao('Tentativa de seleção com Shift + setas');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 2: BLOQUEIO DE COLAR (Ctrl+V)
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    // Bloqueia Ctrl+V (colar)
    if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        registrarInfracao('Tentativa de colar (Ctrl+V)');
        return false;
    }
    
    // Bloqueia Shift+Insert (colar alternativo)
    if (e.shiftKey && e.key === 'Insert') {
        e.preventDefault();
        registrarInfracao('Tentativa de colar (Shift+Insert)');
        return false;
    }
    
    // Bloqueia Ctrl+Shift+V (colar sem formatação)
    if (e.ctrlKey && e.shiftKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        registrarInfracao('Tentativa de colar sem formatação');
        return false;
    }
});

// Bloqueia evento de paste
document.addEventListener('paste', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracao('Tentativa de colar');
    return false;
});

// ================================================================
// PROTEÇÃO 3: CLIQUE DIREITO LIMITADO (máximo 4 usos)
// ================================================================

function verificarCliqueDireito() {
    if (quizBloqueado) return false;
    
    cliqueDireitoCount++;
    const tentativasRestantes = MAX_CLIQUE_DIREITO - cliqueDireitoCount;
    
    if (cliqueDireitoCount >= MAX_CLIQUE_DIREITO) {
        // Bloqueia após 4 cliques
        registrarInfracao(`Clique direito excedeu o limite (${MAX_CLIQUE_DIREITO} usos) - AVALIAÇÃO BLOQUEADA`);
        return false;
    } else {
        alert(`⚠️ CLIQUE DIREITO DETECTADO!\n\nVocê usou ${cliqueDireitoCount} de ${MAX_CLIQUE_DIREITO} cliques permitidos.\nRestam ${tentativasRestantes} tentativa(s).\n\nApós ${MAX_CLIQUE_DIREITO} cliques, a avaliação será bloqueada.`);
        return true;
    }
}

document.addEventListener('contextmenu', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    verificarCliqueDireito();
    return false;
});

// ================================================================
// PROTEÇÃO 4: DETECÇÃO ESPECÍFICA DE EXTENSÕES
// ================================================================

function detectarExtensoesBloqueadas() {
    if (quizBloqueado) return false;
    
    // Verifica elementos no DOM
    const todosElementos = document.querySelectorAll('*');
    
    for (let i = 0; i < todosElementos.length; i++) {
        const el = todosElementos[i];
        const classes = (el.className || '').toString().toLowerCase();
        const id = (el.id || '').toLowerCase();
        const innerText = (el.innerText || '').toLowerCase();
        
        for (let j = 0; j < EXTENSOES_BLOQUEADAS.length; j++) {
            const ext = EXTENSOES_BLOQUEADAS[j].toLowerCase();
            
            if (classes.includes(ext) || id.includes(ext) || innerText.includes(ext)) {
                registrarInfracao(`Extensão bloqueada detectada: ${EXTENSOES_BLOQUEADAS[j]}`);
                return true;
            }
        }
    }
    
    // Verifica estilos computados (extensões que modificam CSS)
    const allElements = document.querySelectorAll('*');
    for (let i = 0; i < Math.min(allElements.length, 50); i++) {
        const el = allElements[i];
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.userSelect === 'text' && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
            // Se encontrou elemento com user-select: text (proibido), provavelmente extensão
            registrarInfracao('Extensão tentou modificar proteção de seleção');
            return true;
        }
    }
    
    return false;
}

// Executa detecção a cada 3 segundos
setInterval(function() {
    if (!quizBloqueado) {
        detectarExtensoesBloqueadas();
    }
}, 3000);

// Executa detecção imediatamente
detectarExtensoesBloqueadas();

// ================================================================
// PROTEÇÃO 5: BLOQUEIO DE SELECIONAR TUDO E BUSCAR
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    // Bloqueia Ctrl+A (selecionar tudo)
    if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        registrarInfracao('Tentativa de selecionar tudo (Ctrl+A)');
        return false;
    }
    
    // Bloqueia Ctrl+F (buscar)
    if (e.ctrlKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        registrarInfracao('Tentativa de buscar (Ctrl+F)');
        return false;
    }
    
    // Bloqueia F3 (buscar)
    if (e.key === 'F3') {
        e.preventDefault();
        registrarInfracao('Tentativa de buscar (F3)');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 6: BLOQUEIO DE CÓPIA E RECORTE
// ================================================================

document.addEventListener('copy', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracao('Tentativa de copiar');
    return false;
});

document.addEventListener('cut', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracao('Tentativa de recortar');
    return false;
});

// ================================================================
// PROTEÇÃO 7: BLOQUEIO DE ATALHOS DE EXTENSÕES
// ================================================================

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    // Ctrl+Shift+C (extensões de cópia)
    if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        registrarInfracao('Atalho de extensão (Ctrl+Shift+C)');
        return false;
    }
    
    // Ctrl+Alt+C
    if (e.ctrlKey && e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        registrarInfracao('Atalho de extensão (Ctrl+Alt+C)');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 8: LIMPEZA DO CLIPBOARD
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
            registrarInfracao('Tentativa de escrever no clipboard');
        }
        return originalWrite.call(this, '');
    };
}

// ================================================================
// PROTEÇÃO 9: REAPLICAÇÃO CONSTANTE DE PROTEÇÕES CSS
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

// Reaplica proteção a cada 2 segundos
setInterval(function() {
    if (quizBloqueado) return;
    
    const newStyle = document.createElement('style');
    newStyle.textContent = `
        * { user-select: none !important; -webkit-user-select: none !important; }
        input, textarea { user-select: text !important; -webkit-user-select: text !important; }
    `;
    document.head.appendChild(newStyle);
    
    // Remove estilos antigos para não acumular
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
// PROTEÇÃO 10: DETECÇÃO DE MUDANÇA DE ABA
// ================================================================

let perdaFocoCount = 0;
let ultimoFocoTime = Date.now();

document.addEventListener('visibilitychange', function() {
    if (quizBloqueado) return;
    
    if (document.hidden) {
        ultimoFocoTime = Date.now();
        console.log('⚠️ Aluno mudou de aba');
    } else {
        const tempoFora = Date.now() - ultimoFocoTime;
        if (tempoFora > 500) {
            perdaFocoCount++;
            registrarInfracao(`Mudança de aba detectada - suspeita de consulta`);
        }
    }
});

// ================================================================
// FUNÇÃO PRINCIPAL DE REGISTRO DE INFRAÇÃO
// ================================================================

function registrarInfracao(tipo) {
    if (quizBloqueado) return;
    
    totalInfracoes++;
    localStorage.setItem(STORAGE_KEY, totalInfracoes);
    
    limparClipboard();
    
    const tentativasRestantes = MAX_INFRACOES - totalInfracoes;
    
    if (totalInfracoes >= MAX_INFRACOES) {
        bloquearAvaliacao(tipo);
    } else {
        alert(`⚠️ ${tipo.toUpperCase()} detectado!\n\nVocê cometeu ${totalInfracoes} de ${MAX_INFRACOES} infrações.\nRestam ${tentativasRestantes} tentativa(s) antes do bloqueio.\n\nRespeite as regras da avaliação!`);
    }
    
    console.log(`⚠️ Infração: ${tipo} | Total: ${totalInfracoes}/${MAX_INFRACOES}`);
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
                <p style="color: #7f1d1d;">Motivo: ${tipo}</p>
                <hr style="margin: 1rem 0; border-color: #fecaca;">
                <p style="font-size: 0.8rem; color: #991b1b;">Infrações detectadas: ${totalInfracoes}</p>
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

// Verifica bloqueio ao carregar
window.addEventListener('load', function() {
    const estavaBloqueado = localStorage.getItem('quizBloqueado') === 'true';
    if (estavaBloqueado && !quizBloqueado) {
        totalInfracoes = MAX_INFRACOES;
        quizBloqueado = true;
        bloquearAvaliacao('Bloqueio persistente');
    }
});

// ================================================================
// AQUI CONTINUA O RESTO DO SEU CÓDIGO ORIGINAL
// (renderQuestions, updateProgress, calculateScore, finalizarAvaliacao, etc.)
// ================================================================

// NOTA: Mantenha todas as funções originais do seu script.js a partir daqui
// (as funções de lógica do quiz: renderQuestions, onSelectOption, etc.)

console.log('✅ Sistema anti-trapaça ativado | Limite: ' + MAX_INFRACOES + ' infrações');
console.log('🔑 Código de desbloqueio: ' + CODIGO_DESBLOQUEIO);
console.log('🖱️ Clique direito permitido: ' + MAX_CLIQUE_DIREITO + ' vezes');
console.log('🚫 Extensões bloqueadas: Allow Copy + e Enable Copy Paste - E.C.P');
