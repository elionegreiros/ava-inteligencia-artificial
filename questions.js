// ================================================================
// ATIVIDADE: INTRODUÇÃO À EDUCAÇÃO DIGITAL
// CETI - Antonio Gentil Dantas Sobrinho
// 2ª Série - Desenvolvimento de Sistemas
// Disciplina: Inteligência Artificial - Educação Digital
// ================================================================

// ================================================================
// QUESTÕES DE MÚLTIPLA ESCOLHA (10 questões)
// ================================================================

const multipleChoiceQuestions = [
    { 
        pergunta: "O que é nomofobia?",
        opcoes: [
            "Medo de falar em público",
            "Medo de ficar sem o celular ou sem conexão",
            "Medo de tecnologia",
            "Medo de redes sociais"
        ],
        correta: 1,
        explicacao: "Nomofobia vem do inglês 'no-mobile-phone phobia' e é o medo irracional de ficar sem o celular ou sem conexão com a internet." 
    },
    { 
        pergunta: "De acordo com o texto, qual a porcentagem de adolescentes entre 15 e 17 anos que têm perfil em plataformas digitais?",
        opcoes: [
            "99%",
            "97%",
            "85%",
            "100%"
        ],
        correta: 0,
        explicacao: "Segundo o estudo da TIC Kids Online Brasil (2023), 99% dos adolescentes entre 15 e 17 anos têm perfil em plataformas digitais." 
    },
    { 
        pergunta: "Qual é um dos pilares da Educação Digital segundo a Política Nacional de Educação Digital (Pned)?",
        opcoes: [
            "Programação Avançada",
            "Redes de Computadores",
            "Pensamento Computacional",
            "Engenharia de Software"
        ],
        correta: 2,
        explicacao: "Os pilares da Pned são: Mundo Digital, Cultura Digital, Pensamento Computacional, Direitos Digitais e Tecnologia Assistiva." 
    },
    { 
        pergunta: "O que são competências digitais?",
        opcoes: [
            "Apenas habilidades técnicas para programar computadores",
            "O conjunto de habilidades, conhecimentos e comportamentos para compreender e utilizar ferramentas digitais",
            "Somente a capacidade de usar redes sociais",
            "A habilidade de instalar aplicativos no celular"
        ],
        correta: 1,
        explicacao: "Competências digitais envolvem habilidades tecnológicas práticas, atitudes críticas e responsáveis no uso de informações, além de conhecimentos sobre ética e segurança." 
    },
    { 
        pergunta: "Segundo a pesquisa da Deloitte mencionada no texto, quantos por cento dos Millennials trocariam de emprego se o trabalho voltasse a ser totalmente presencial?",
        opcoes: [
            "76%",
            "77%",
            "80%",
            "65%"
        ],
        correta: 1,
        explicacao: "A pesquisa mostrou que 77% dos Millennials e 76% da Geração Z trocariam de emprego caso o trabalho voltasse a ser totalmente presencial." 
    },
    { 
        pergunta: "Quem é Malala Yousafzai e qual sua defesa em relação à Educação Digital?",
        opcoes: [
            "Uma empresária de tecnologia que criou redes sociais",
            "Uma ativista paquistanesa que defende a inserção da educação digital nos currículos escolares",
            "Uma professora brasileira especialista em tecnologia",
            "Uma engenheira de software que desenvolveu aplicativos educacionais"
        ],
        correta: 1,
        explicacao: "Malala Yousafzai, Prêmio Nobel da Paz, defende que a educação digital deve ser inserida nos currículos escolares para combater a desinformação." 
    },
    { 
        pergunta: "O que são nômades digitais?",
        opcoes: [
            "Pessoas que não usam tecnologia",
            "Profissionais que trabalham remotamente de qualquer lugar do mundo",
            "Estudantes que fazem cursos online",
            "Pessoas que viajam sem celular"
        ],
        correta: 1,
        explicacao: "Nômades digitais são profissionais que adotam um estilo de vida flexível, trabalhando remotamente de qualquer lugar usando tecnologias." 
    },
    { 
        pergunta: "Segundo dados da pesquisa Electronics Hub (2023), qual a porcentagem do tempo acordado que os brasileiros passam em frente a telas?",
        opcoes: [
            "46,5%",
            "56,6%",
            "66,2%",
            "50,1%"
        ],
        correta: 1,
        explicacao: "Os brasileiros passam cerca de 56,6% das horas acordadas em frente a telas de smartphones e computadores, cerca de 9 horas por dia." 
    },
    { 
        pergunta: "Qual é a principal finalidade da Política Nacional de Educação Digital (Pned)?",
        opcoes: [
            "Proibir o uso de celulares nas escolas",
            "Instituir o estudo da Educação Digital nas escolas brasileiras",
            "Criar cursos de programação para adultos",
            "Distribuir computadores para todos os estudantes"
        ],
        correta: 1,
        explicacao: "A Pned, aprovada em 2023, propõe o estudo da Educação Digital nas escolas, preparando os alunos para o uso adequado e crítico das ferramentas digitais." 
    },
    { 
        pergunta: "O que o texto aponta como um dos impactos negativos do uso excessivo de telas?",
        opcoes: [
            "Aumento da produtividade",
            "Melhora nas relações sociais",
            "Impactos na saúde física e mental",
            "Aumento do conhecimento tecnológico"
        ],
        correta: 2,
        explicacao: "O texto afirma que o uso excessivo de celulares pode ter impacto na saúde física e mental das pessoas." 
    }
];

// ================================================================
// QUESTÕES DISSERTATIVAS (5 questões)
// ================================================================

const essayQuestions = [
    { 
        pergunta: "Explique o que é a Educação Digital e quais são seus principais objetivos, conforme abordado no texto. Por que ela é considerada fundamental nos dias atuais?" 
    },
    { 
        pergunta: "De acordo com o texto, quais são as desigualdades digitais no Brasil? Como elas se relacionam com as desigualdades sociais? Dê exemplos." 
    },
    { 
        pergunta: "O que Malala Yousafzai defende sobre a Educação Digital? Por que ela acredita que a educação digital é importante para combater a desinformação?" 
    },
    { 
        pergunta: "Descreva o conceito de 'nômades digitais' apresentado no texto. Quais tecnologias tornam possível esse estilo de trabalho e quais são suas vantagens e desvantagens?" 
    },
    { 
        pergunta: "Com base no texto e em seus conhecimentos, escreva um parágrafo dissertativo-argumentativo defendendo a importância do desenvolvimento de competências digitais para a formação profissional de estudantes da área de Desenvolvimento de Sistemas." 
    }
];

// ================================================================
// NÃO ALTERAR A PARTIR DAQUI
// ================================================================

const TOTAL_MC = multipleChoiceQuestions.length;
const TOTAL_ESSAY = essayQuestions.length;
const TOTAL_QUESTIONS = TOTAL_MC + TOTAL_ESSAY;
