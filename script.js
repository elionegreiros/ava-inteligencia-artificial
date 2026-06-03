// ================================================================
// SISTEMA ANTI-TRAPAÇA - CONTADOR DE INFRAÇÕES
// 3 tentativas = AVALIAÇÃO BLOQUEADA
// ================================================================

const STORAGE_KEY = 'infracoesQuiz';
const MAX_INFRACOES = 3;

// ⚠️ CONFIGURE AQUI O CÓDIGO DE DESBLOQUEIO
const CODIGO_DESBLOQUEIO = "25123";

let totalInfracoes = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
let quizBloqueado = false;

// ================================================================
// LISTA DE EXTENSÕES CONHECIDAS DE CÓPIA (AMPLIADA)
// ================================================================

const EXTENSOES_SUSPEITAS = [
    // Extensões básicas
    'allow-copy', 'enable-copy', 'copy-helper', 'super-copy',
    'copy-text', 'right-click', 'context-menu', 'copy-plus',
    'copyanywhere', 'easy-copy', 'absolute-enable-right-click',
    'copy-selected', 'copy-link', 'copy-title', 'copy-url',
    'enable-copy-paste', 'ecp', 'copy-paste', 'permitir-copia',
    'allow-copy-plus', 'enable-right-click', 'copy-paste', 'enablecopy',
    'allowcopy', 'copy_enable', 'right-click-enable', 'context-menu-enable',
    'copy-everywhere', 'permitir-copiar', 'copiar-permitido', 'desbloquear-copia',
    'liberar-copia', 'copiar-facil', 'copiar-texto',
    // Novas extensões
    'copy-protection', 'disable-copy', 'copy-killer', 'copy-block',
    'copy-anywhere', 'copy-plus-pro', 'copy-safe', 'copy-assist',
    'text-copy', 'easy-select', 'select-text', 'allow-select',
    'copy-master', 'copy-king', 'copy-wizard', 'copy-genius'
];

// ================================================================
// PROTEÇÃO 1: BLOQUEIO DE ARRASTAR PARA SELECIONAR
// ================================================================

// Bloqueio via CSS já existe, mas reforçamos via JS
document.addEventListener('mousedown', function(e) {
    if (quizBloqueado) return;
    // Previne início de seleção por arrasto
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
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
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
    }
});

// Impede seleção via mouse com Shift
document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        registrarInfracao('Tentativa de seleção com Shift + setas');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 2: DETECÇÃO ATIVA DE EXTENSÕES (Scanning)
// ================================================================

function detectarExtensoesAtivas() {
    if (quizBloqueado) return;
    
    // 1. Verifica elementos suspeitos no DOM
    const todosElementos = document.querySelectorAll('*');
    let extensoesEncontradas = [];
    
    for (let i = 0; i < todosElementos.length; i++) {
        const el = todosElementos[i];
        const classes = (el.className || '').toString().toLowerCase();
        const id = (el.id || '').toLowerCase();
        const atributos = el.attributes;
        
        // Verifica classes e IDs suspeitos
        for (let j = 0; j < EXTENSOES_SUSPEITAS.length; j++) {
            const ext = EXTENSOES_SUSPEITAS[j].toLowerCase();
            if (classes.includes(ext) || id.includes(ext)) {
                extensoesEncontradas.push(ext);
            }
        }
        
        // Verifica atributos personalizados suspeitos
        for (let k = 0; k < atributos.length; k++) {
            const attrName = atributos[k].name.toLowerCase();
            for (let j = 0; j < EXTENSOES_SUSPEITAS.length; j++) {
                if (attrName.includes(EXTENSOES_SUSPEITAS[j].toLowerCase())) {
                    extensoesEncontradas.push(EXTENSOES_SUSPEITAS[j]);
                }
            }
        }
    }
    
    if (extensoesEncontradas.length > 0 && !quizBloqueado) {
        registrarInfracao('Extensão de cópia detectada: ' + extensoesEncontradas[0]);
        return true;
    }
    
    // 2. Verifica se as proteções CSS foram removidas
    const styleSheets = document.styleSheets;
    let protecaoRemovida = false;
    
    try {
        for (let i = 0; i < styleSheets.length; i++) {
            const rules = styleSheets[i].cssRules || styleSheets[i].rules;
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.style && rule.style.userSelect === 'text') {
                        protecaoRemovida = true;
                    }
                }
            }
        }
    } catch(e) { /* Erro de CORS ignorado */ }
    
    if (protecaoRemovida && !quizBloqueado) {
        registrarInfracao('Extensão tentou remover proteção CSS');
        // Reaplica proteção
        const styleAntiCopy = document.createElement('style');
        styleAntiCopy.textContent = `
            * { user-select: none !important; -webkit-user-select: none !important; }
            input, textarea { user-select: text !important; -webkit-user-select: text !important; }
        `;
        document.head.appendChild(styleAntiCopy);
    }
    
    return false;
}

// Executa detecção a cada 2 segundos (mais frequente)
setInterval(function() {
    if (!quizBloqueado) {
        detectarExtensoesAtivas();
    }
}, 2000);

// Executa detecção imediatamente
detectarExtensoesAtivas();

// ================================================================
// PROTEÇÃO 3: BLOQUEIO DE ATALHOS ADICIONAIS
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
    
    // Bloqueia Ctrl+G (localizar próximo)
    if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        registrarInfracao('Tentativa de localizar (Ctrl+G)');
        return false;
    }
    
    // Bloqueia Ctrl+H (histórico)
    if (e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        registrarInfracao('Tentativa de abrir histórico');
        return false;
    }
    
    // Bloqueia Ctrl+J (downloads/histórico)
    if (e.ctrlKey && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        registrarInfracao('Tentativa de abrir downloads');
        return false;
    }
    
    // Bloqueia Ctrl+D (favoritos)
    if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        registrarInfracao('Tentativa de favoritar página');
        return false;
    }
    
    // Bloqueia Ctrl+N (nova janela)
    if (e.ctrlKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        registrarInfracao('Tentativa de abrir nova janela');
        return false;
    }
    
    // Bloqueia Ctrl+T (nova aba)
    if (e.ctrlKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        registrarInfracao('Tentativa de abrir nova aba');
        return false;
    }
    
    // Bloqueia Ctrl+W (fechar aba)
    if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        registrarInfracao('Tentativa de fechar aba');
        return false;
    }
    
    // Bloqueia Ctrl+Tab (trocar aba)
    if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        registrarInfracao('Tentativa de trocar de aba');
        return false;
    }
    
    // Bloqueia Alt+Tab (trocar janela) - não é possível bloquear totalmente, mas registramos
    if (e.altKey && e.key === 'Tab') {
        registrarInfracao('Tentativa de trocar de janela (Alt+Tab)');
    }
    
    // Bloqueia Windows/Command + Shift + S (screenshot parcial)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        registrarInfracao('Tentativa de captura de tela parcial');
        return false;
    }
    
    // Bloqueia Windows + PrintScreen (screenshot automática)
    if (e.metaKey && (e.key === 'PrintScreen' || e.key === 'Print')) {
        e.preventDefault();
        registrarInfracao('Tentativa de captura de tela automática');
        return false;
    }
});

// ================================================================
// PROTEÇÃO 4: DETECÇÃO DE PERDA DE FOCO (mudança de aba/janela)
// ================================================================

let perdaFocoCount = 0;
let ultimoFocoTime = Date.now();

document.addEventListener('visibilitychange', function() {
    if (quizBloqueado) return;
    
    if (document.hidden) {
        // Aluno saiu da aba
        ultimoFocoTime = Date.now();
        console.log('⚠️ Aluno mudou de aba');
    } else {
        // Aluno voltou
        const tempoFora = Date.now() - ultimoFocoTime;
        if (tempoFora > 500) { // Mais de 0.5 segundos
            perdaFocoCount++;
            registrarInfracao(`Mudança de aba detectada (${perdaFocoCount}x) - suspeita de consulta`);
        }
    }
});

window.addEventListener('blur', function() {
    if (quizBloqueado) return;
    ultimoFocoTime = Date.now();
    console.log('⚠️ Janela perdeu foco');
});

window.addEventListener('focus', function() {
    if (quizBloqueado) return;
    const tempoFora = Date.now() - ultimoFocoTime;
    if (tempoFora > 500 && tempoFora < 30000) {
        registrarInfracao('Janela perdeu foco (possível consulta externa)');
    }
});

// ================================================================
// PROTEÇÃO 5: BLOQUEIO DE SELECTION API (seleção programática)
// ================================================================

// Salva a função original
const originalGetSelection = window.getSelection;
window.getSelection = function() {
    if (!quizBloqueado && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        console.log('⚠️ Tentativa de acesso à seleção');
    }
    return originalGetSelection.call(this);
};

// Bloqueia Range API (seleção avançada)
if (window.Range) {
    const originalSelectNode = Range.prototype.selectNode;
    Range.prototype.selectNode = function(node) {
        if (!quizBloqueado && node.tagName !== 'INPUT' && node.tagName !== 'TEXTAREA') {
            registrarInfracao('Tentativa de seleção programática (Range)');
            return;
        }
        return originalSelectNode.call(this, node);
    };
}

// ================================================================
// PROTEÇÃO 6: DETECÇÃO DE DEVTOOLS E DEBUGGER
// ================================================================

let devToolsAberto = false;

// Detecta DevTools pelo tamanho da janela
setInterval(function() {
    if (quizBloqueado) return;
    
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    // Se a diferença for muito grande, provavelmente DevTools está aberto
    if (widthDiff > 100 || heightDiff > 100) {
        if (!devToolsAberto) {
            devToolsAberto = true;
            registrarInfracao('Ferramentas de desenvolvedor abertas');
        }
    } else {
        devToolsAberto = false;
    }
}, 2000);

// Detecta debugger ativo
let debuggerCount = 0;
setInterval(function() {
    if (quizBloqueado) return;
    const start = Date.now();
    debugger;
    const end = Date.now();
    if (end - start > 50) {
        debuggerCount++;
        registrarInfracao('Debugger ativo detectado');
    }
}, 3000);

// ================================================================
// PROTEÇÃO 7: BLOQUEIO DE CONTEXTO AVANÇADO
// ================================================================

// Bloqueio adicional para mobile (toque longo)
document.addEventListener('touchstart', function(e) {
    if (quizBloqueado) return;
    if (e.touches.length > 1) {
        e.preventDefault();
        registrarInfracao('Toque com múltiplos dedos');
        return false;
    }
});

let touchTimer = null;
document.addEventListener('touchstart', function(e) {
    if (quizBloqueado) return;
    touchTimer = setTimeout(function() {
        registrarInfracao('Toque longo detectado (possível menu de contexto)');
    }, 500);
});

document.addEventListener('touchend', function() {
    if (quizBloqueado) return;
    if (touchTimer) clearTimeout(touchTimer);
});

// ================================================================
// PROTEÇÃO 8: DETECÇÃO DE EXTENSÕES POR REQUISIÇÕES
// ================================================================

// Detecta tentativas de carregar recursos de extensões
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    if (!quizBloqueado && typeof url === 'string') {
        const urlLower = url.toLowerCase();
        for (let i = 0; i < EXTENSOES_SUSPEITAS.length; i++) {
            if (urlLower.includes(EXTENSOES_SUSPEITAS[i].toLowerCase())) {
                registrarInfracao('Extensão tentou carregar recurso: ' + EXTENSOES_SUSPEITAS[i]);
                return Promise.reject(new Error('Bloqueado pelo sistema anti-trapaça'));
            }
        }
    }
    return originalFetch.call(this, url, options);
};

// ================================================================
// PROTEÇÃO 9: REAPLICAÇÃO CONSTANTE DE PROTEÇÕES
// ================================================================

// Reaplica proteções a cada segundo (mais agressivo)
setInterval(function() {
    if (quizBloqueado) return;
    
    // Reaplica proteção CSS
    const styleAntiCopy = document.createElement('style');
    styleAntiCopy.textContent = `
        * { user-select: none !important; -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; }
        input, textarea { user-select: text !important; -webkit-user-select: text !important; }
    `;
    document.head.appendChild(styleAntiCopy);
    
    // Remove estilos conflitantes antigos (mantém apenas os novos)
    const allStyles = document.querySelectorAll('style');
    if (allStyles.length > 10) {
        for (let i = 0; i < allStyles.length - 5; i++) {
            if (allStyles[i].textContent.includes('user-select')) {
                allStyles[i].remove();
            }
        }
    }
}, 1000);

// ================================================================
// PROTEÇÃO 10: IMPEDIR CÓPIA DE TEXTO DAS TEXTAREA (respostas)
// ================================================================

document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('copy', function(e) {
        if (quizBloqueado) return;
        e.preventDefault();
        registrarInfracao('Tentativa de copiar da resposta dissertativa');
        return false;
    });
    
    textarea.addEventListener('cut', function(e) {
        if (quizBloqueado) return;
        e.preventDefault();
        registrarInfracao('Tentativa de recortar da resposta dissertativa');
        return false;
    });
});

// ================================================================
// PROTEÇÕES BÁSICAS COM CONTADOR
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
    
    console.log(`⚠️ Infração: ${tipo} | Total: ${totalInfracoes}/${MAX_INFRACOES} | Data: ${new Date().toLocaleTimeString()}`);
}

function bloquearAvaliacao(tipo) {
    quizBloqueado = true;
    
    const container = document.getElementById('questionsContainer');
    if (container) {
        container.innerHTML = `
            <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 1.5rem; padding: 2rem; text-align: center; margin: 1rem 0;">
                <div style="font-size: 4rem;">🚫</div>
                <h2 style="color: #991b1b; margin: 1rem 0;">AVALIAÇÃO BLOQUEADA</h2>
                <p style="color: #7f1d1d; margin-bottom: 1rem;">Você excedeu o número máximo de tentativas de cópia/captura (${MAX_INFRACOES}).</p>
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
    
    // Mensagem no console
    console.log('🚫 AVALIAÇÃO BLOQUEADA | Motivo: ' + tipo + ' | Data: ' + new Date().toLocaleString());
}

// Função para limpar clipboard
async function limparClipboard() {
    try {
        await navigator.clipboard.writeText('');
        console.log('Clipboard limpo automaticamente');
    } catch(e) { console.log('Não foi possível limpar clipboard'); }
}

// ================================================================
// MODAL DE DESBLOQUEIO PARA O ALUNO
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
// INJEÇÃO DE PROTEÇÃO NO ESTILO (Reforçada)
// ================================================================

const styleProtection = document.createElement('style');
styleProtection.textContent = `
    * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
    }
    input, textarea {
        user-select: text !important;
        -webkit-user-select: text !important;
    }
    img, iframe, canvas {
        pointer-events: none !important;
    }
`;
document.head.appendChild(styleProtection);

// ================================================================
// CONTINUAÇÃO DAS PROTEÇÕES EXISTENTES...
// ================================================================

// Mantém as proteções originais de copy/contextmenu/etc
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

document.addEventListener('contextmenu', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracao('Tentativa de clique direito');
    return false;
});

// ================================================================
// RESTANTE DA LÓGICA ORIGINAL (QUESTÕES, RENDERIZAÇÃO, ETC)
// ================================================================

// ... (mantenha o resto do código original daqui para baixo)
// Incluindo as funções: renderQuestions, updateProgress, calculateScore, 
// finalizarAvaliacao, lockMCQuestion, updateMCFeedback, onSelectOption, 
// onEssayChange, escapeHtml, init, etc.

// NOTA: O código acima substitui APENAS a parte de proteções.
// As funções de lógica do quiz (renderQuestions, finalizarAvaliacao, etc.)
// permanecem as mesmas do seu arquivo original.