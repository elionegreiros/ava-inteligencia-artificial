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
// LISTA DE EXTENSÕES CONHECIDAS DE CÓPIA
// ================================================================

const EXTENSOES_SUSPEITAS = [
    'allow-copy', 'enable-copy', 'copy-helper', 'super-copy',
    'copy-text', 'right-click', 'context-menu', 'copy-plus',
    'copyanywhere', 'easy-copy', 'absolute-enable-right-click',
    'copy-selected', 'copy-link', 'copy-title', 'copy-url',
    'enable-copy-paste', 'ecp', 'copy-paste', 'permitir-copia',
    'allow-copy-plus', 'enable-right-click', 'copy-paste', 'enablecopy',
    'allowcopy', 'copy_enable', 'right-click-enable', 'context-menu-enable',
    'copy-everywhere', 'permitir-copiar', 'copiar-permitido', 'desbloquear-copia',
    'liberar-copia', 'copiar-facil', 'copiar-texto'
];

// ================================================================
// PROTEÇÃO CONTRA EXTENSÕES DE CÓPIA
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

const originalExecCommand = document.execCommand;
document.execCommand = function(command, showUI, value) {
    if (command === 'copy' || command === 'cut' || command === 'paste') {
        if (!quizBloqueado) {
            registrarInfracao('Tentativa de copiar via execCommand');
        }
        return false;
    }
    return originalExecCommand.call(document, command, showUI, value);
};

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
            registrarInfracao('Tentativa de escrever no clipboard via API');
        }
        return originalWrite.call(this, '');
    };
}

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target;
            if (target.style && target.style.userSelect === 'text' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                target.style.userSelect = 'none';
                target.style.webkitUserSelect = 'none';
                
                let extensaoDetectada = false;
                const elementoStr = (target.className + ' ' + (target.id || '')).toLowerCase();
                
                EXTENSOES_SUSPEITAS.forEach(function(ext) {
                    if (elementoStr.includes(ext.toLowerCase())) {
                        extensaoDetectada = true;
                    }
                });
                
                if (extensaoDetectada && !quizBloqueado) {
                    registrarInfracao('Extensão de cópia detectada');
                }
            }
        }
    });
});

observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['style', 'class']
});

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

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        registrarInfracao('Atalho de extensão de cópia (Ctrl+Shift+C)');
        return false;
    }
    
    if (e.ctrlKey && e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        registrarInfracao('Atalho de extensão de cópia (Ctrl+Alt+C)');
        return false;
    }
});

setInterval(function() {
    if (quizBloqueado) return;
    
    const elementos = document.querySelectorAll('*');
    for (let i = 0; i < Math.min(elementos.length, 100); i++) {
        const el = elementos[i];
        if (el && el.style && el.style.userSelect === 'text' && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
            el.style.userSelect = 'none';
            el.style.webkitUserSelect = 'none';
        }
    }
}, 5000);

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
    
    console.log(`⚠️ Infração: ${tipo} | Total: ${totalInfracoes}/${MAX_INFRACOES}`);
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
// PROTEÇÕES DE TECLAS E CLIQUE
// ================================================================

document.addEventListener('contextmenu', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracao('Tentativa de clique direito');
    return false;
});

document.addEventListener('keydown', function(e) {
    if (quizBloqueado) return;
    
    if (e.key === 'F5') {
        e.preventDefault();
        registrarInfracao('Tentativa de atualizar página (F5)');
        return false;
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        registrarInfracao('Tentativa de atualizar página (Ctrl+R)');
        return false;
    }
    
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        registrarInfracao(`Tentativa de ${e.key === 'c' || e.key === 'C' ? 'copiar' : (e.key === 'v' || e.key === 'V' ? 'colar' : 'recortar')}`);
        return false;
    }
    
    if (e.key === 'F12') {
        e.preventDefault();
        registrarInfracao('Tentativa de abrir DevTools (F12)');
        return false;
    }
    
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        registrarInfracao('Tentativa de abrir DevTools');
        return false;
    }
    
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        registrarInfracao('Tentativa de ver código fonte');
        return false;
    }
    
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        registrarInfracao('Tentativa de imprimir página');
        return false;
    }
    
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        registrarInfracao('Tentativa de salvar página');
        return false;
    }
});

document.addEventListener('keyup', function(e) {
    if (quizBloqueado) return;
    if (e.key === 'PrintScreen' || e.key === 'Print' || e.keyCode === 44) {
        registrarInfracao('Captura de tela (Print Screen)');
    }
});

document.addEventListener('dragstart', function(e) {
    if (quizBloqueado) return;
    e.preventDefault();
    registrarInfracao('Tentativa de arrastar texto');
    return false;
});

window.onbeforeprint = function() {
    if (quizBloqueado) return;
    registrarInfracao('Tentativa de imprimir página');
    return false;
};

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
    const mcAcertos = selectedAnswers.filter((ans, idx) => ans === multipleChoiceQuestions[idx].correta).length;
    
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
        <p style="color: #64748b; font-size: 0.8rem;">Data: ${new Date().toLocaleString()}</p>
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

console.log('✅ Sistema anti-trapaça ativado | Limite: ' + MAX_INFRACOES + ' infrações');
console.log('🔑 Código de desbloqueio: ' + CODIGO_DESBLOQUEIO);
console.log('📋 Extensões monitoradas: ' + EXTENSOES_SUSPEITAS.length + ' padrões');
