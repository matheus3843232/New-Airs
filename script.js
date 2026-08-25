document.addEventListener("DOMContentLoaded", () => {
 
    /* =====================================================
       CONFIGURAÇÕES
    ===================================================== */
 
    const $ = (seletor, elemento = document) =>
        elemento.querySelector(seletor);
 
    const $$ = (seletor, elemento = document) =>
        [...elemento.querySelectorAll(seletor)];
 
 
    /* =====================================================
       MENU DE NAVEGAÇÃO
    ===================================================== */
 
    const botoesMenu = $$("header button[data-secao]");
 
    botoesMenu.forEach((botao) => {
 
        botao.addEventListener("click", () => {
 
            const idSecao = botao.dataset.secao;
            const secao = document.getElementById(idSecao);
 
            if (!secao) {
                mostrarMensagem("⚠️ Essa seção não foi encontrada.");
                return;
            }
 
            secao.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
 
    });
 
 
    /* =====================================================
       BOTÃO BUSCAR VOOS
    ===================================================== */
 
    const btnBuscar = $("#btnBuscar");
 
    if (btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            abrirBusca();
        });
    }
 
 
    /* =====================================================
       CRIAR MODAL DE BUSCA
    ===================================================== */
 
    function abrirBusca(destinoInicial = "") {
 
        // Evita abrir dois modais
        if ($("#janelaBusca")) {
            return;
        }
 
        const janela = document.createElement("div");
 
        janela.id = "janelaBusca";
 
        janela.innerHTML = `
            <div class="fundo-modal">
 
                <div class="modal" role="dialog" aria-modal="true"
                     aria-labelledby="tituloBusca">
 
                    <button
                        type="button"
                        class="fechar-modal"
                        id="fecharBusca"
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
 
                    <h2 id="tituloBusca">
                        ✈️ Buscar voos
                    </h2>
 
                    <p>
                        Encontre uma opção para sua próxima viagem.
                    </p>
 
                    <form id="formBusca">
 
                        <label for="origem">
                            Origem:
                        </label>
 
                        <input
                            type="text"
                            id="origem"
                            placeholder="Ex: São Paulo"
                            autocomplete="address-level2"
                            required
                        >
 
                        <label for="destinoBusca">
                            Destino:
                        </label>
 
                        <input
                            type="text"
                            id="destinoBusca"
                            placeholder="Ex: Fortaleza"
                            autocomplete="address-level2"
                            required
                        >
 
                        <label for="dataViagem">
                            Data:
                        </label>
 
                        <input
                            type="date"
                            id="dataViagem"
                            required
                        >
 
                        <label for="passageiros">
                            Número de passageiros:
                        </label>
 
                        <input
                            type="number"
                            id="passageiros"
                            min="1"
                            max="20"
                            value="1"
                            required
                        >
 
                        <button
                            type="submit"
                            id="realizarBusca"
                        >
                            🔎 Procurar voos
                        </button>
 
                    </form>
 
                    <div id="resultadoBusca"></div>
 
                </div>
 
            </div>
        `;
 
        document.body.appendChild(janela);
 
 
        /* ---------------------------------------------
           ELEMENTOS DO MODAL
        --------------------------------------------- */
 
        const modal = $(".modal", janela);
        const fundo = $(".fundo-modal", janela);
        const fechar = $("#fecharBusca", janela);
        const form = $("#formBusca", janela);
 
        const origem = $("#origem", janela);
        const destino = $("#destinoBusca", janela);
        const data = $("#dataViagem", janela);
        const passageiros = $("#passageiros", janela);
 
 
        /* ---------------------------------------------
           DATA MÍNIMA
        --------------------------------------------- */
 
        definirDataMinima(data);
 
 
        /* ---------------------------------------------
           DESTINO PRÉ-SELECIONADO
        --------------------------------------------- */
 
        if (destinoInicial) {
            destino.value = destinoInicial;
        }
 
 
        /* ---------------------------------------------
           FOCO AUTOMÁTICO
        --------------------------------------------- */
 
        setTimeout(() => {
 
            if (destinoInicial) {
                origem.focus();
            } else {
                origem.focus();
            }
 
        }, 100);
 
 
        /* ---------------------------------------------
           FECHAR MODAL
        --------------------------------------------- */
 
        fechar.addEventListener("click", fecharBusca);
 
 
        /* Clique no fundo fecha o modal */
 
        fundo.addEventListener("click", (evento) => {
 
            if (evento.target === fundo) {
                fecharBusca();
            }
 
        });
 
 
        /* Tecla ESC fecha */
 
        document.addEventListener("keydown", fecharComEsc);
 
 
        function fecharComEsc(evento) {
 
            if (evento.key === "Escape") {
                fecharBusca();
            }
 
        }
 
 
        function fecharBusca() {
 
            document.removeEventListener(
                "keydown",
                fecharComEsc
            );
 
            janela.remove();
 
        }
 
 
        /* ---------------------------------------------
           FORMULÁRIO
        --------------------------------------------- */
 
        form.addEventListener("submit", (evento) => {
 
            evento.preventDefault();
 
            realizarBusca({
                origem: origem.value.trim(),
                destino: destino.value.trim(),
                data: data.value,
                passageiros: Number(passageiros.value),
                resultado: $("#resultadoBusca", janela)
            });
 
        });
 
    }
 
 
    /* =====================================================
       REALIZAR BUSCA
    ===================================================== */
 
    function realizarBusca(dados) {
 
        const {
            origem,
            destino,
            data,
            passageiros,
            resultado
        } = dados;
 
 
        /* ---------------------------------------------
           VALIDAÇÕES
        --------------------------------------------- */
 
        if (!origem) {
 
            mostrarErro(
                resultado,
                "Digite o local de origem."
            );
 
            return;
        }
 
 
        if (!destino) {
 
            mostrarErro(
                resultado,
                "Digite o destino da viagem."
            );
 
            return;
        }
 
 
        if (!data) {
 
            mostrarErro(
                resultado,
                "Escolha uma data para a viagem."
            );
 
            return;
        }
 
 
        if (passageiros < 1 || passageiros > 20) {
 
            mostrarErro(
                resultado,
                "Informe entre 1 e 20 passageiros."
            );
 
            return;
        }
 
 
        /* Verifica se a data já passou */
 
        const dataEscolhida = new Date(`${data}T00:00:00`);
        const hoje = new Date();
 
        hoje.setHours(0, 0, 0, 0);
 
        if (dataEscolhida < hoje) {
 
            mostrarErro(
                resultado,
                "A data da viagem não pode estar no passado."
            );
 
            return;
        }
 
 
        /* ---------------------------------------------
           TELA DE CARREGAMENTO
        --------------------------------------------- */
 
        resultado.innerHTML = `
            <div class="resultado">
 
                <h3>
                    ✈️ Buscando voos...
                </h3>
 
                <p>
                    Estamos procurando as melhores opções
                    para sua viagem.
                </p>
 
                <p>
                    <strong>${escaparHTML(origem)}</strong>
                    →
                    <strong>${escaparHTML(destino)}</strong>
                </p>
 
                <div class="carregando"></div>
 
            </div>
        `;
 
 
        /* ---------------------------------------------
           SIMULAÇÃO DE BUSCA
        --------------------------------------------- */
 
        setTimeout(() => {
 
            const preco = calcularPreco(destino);
 
 
            resultado.innerHTML = `
                <div class="resultado sucesso">
 
                    <h3>
                        🎉 Encontramos opções!
                    </h3>
 
                    <p>
                        Encontramos passagens para
                        <strong>
                            ${escaparHTML(destino)}
                        </strong>.
                    </p>
 
                    <p>
                        📍 Origem:
                        <strong>
                            ${escaparHTML(origem)}
                        </strong>
                    </p>
 
                    <p>
                        📅 Data:
                        <strong>
                            ${formatarData(data)}
                        </strong>
                    </p>
 
                    <p>
                        👥 Passageiros:
                        <strong>
                            ${passageiros}
                        </strong>
                    </p>
 
                    <p>
                        A partir de:
                    </p>
 
                    <h2>
                        R$ ${preco}
                    </h2>
 
                    <button
                        type="button"
                        id="verResultado"
                    >
                        ✈️ Ver ofertas
                    </button>
 
                </div>
            `;
 
 
            const btnResultado = $("#verResultado");
 
            if (btnResultado) {
 
                btnResultado.addEventListener(
                    "click",
                    () => {
 
                        mostrarMensagem(
                            `🎉 Oferta para ${destino} selecionada!`
                        );
 
                    }
                );
 
            }
 
        }, 1800);
 
    }
 
 
    /* =====================================================
       CALCULAR PREÇO SIMULADO
    ===================================================== */
 
    function calcularPreco(destino) {
 
        const destinoNormalizado =
            destino.toLowerCase();
 
        const precos = {
 
            "fortaleza": "2.572",
            "maceió": "2.000",
            "baía da traição": "3.071",
            "dourado": "1.890",
            "rio de janeiro": "189",
            "nordeste": "215",
            "pantanal": "310"
 
        };
 
        return (
            precos[destinoNormalizado] ||
            "2.000"
        );
 
    }
 
 
    /* =====================================================
       DATA MÍNIMA
    ===================================================== */
 
    function definirDataMinima(campoData) {
 
        if (!campoData) {
            return;
        }
 
        const hoje = new Date();
 
        const ano = hoje.getFullYear();
 
        const mes = String(
            hoje.getMonth() + 1
        ).padStart(2, "0");
 
        const dia = String(
            hoje.getDate()
        ).padStart(2, "0");
 
        campoData.min =
            `${ano}-${mes}-${dia}`;
 
    }
 
 
    /* =====================================================
       FORMATAR DATA
    ===================================================== */
 
    function formatarData(data) {
 
        if (!data) {
            return "";
        }
 
        const partes = data.split("-");
 
        if (partes.length !== 3) {
            return data;
        }
 
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
 
    }
 
 
    /* =====================================================
       DESTINOS POPULARES
    ===================================================== */
 
    const botoesDestino =
        $$(".lugares button");
 
 
    botoesDestino.forEach((botao) => {
 
        botao.addEventListener("click", () => {
 
            const destino =
                botao.textContent.trim();
 
            selecionarDestino(destino);
 
        });
 
    });
 
 
    function selecionarDestino(destino) {
 
        mostrarMensagem(
            `✈️ Você selecionou ${destino}!`
        );
 
 
        const cidades =
            $$(".cidade");
 
 
        let encontrado = false;
 
 
        cidades.forEach((cidade) => {
 
            const texto =
                cidade.textContent.toLowerCase();
 
 
            if (
                texto.includes(
                    destino.toLowerCase()
                )
            ) {
 
                encontrado = true;
 
 
                cidade.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
 
 
                cidade.classList.add(
                    "destinoSelecionado"
                );
 
 
                setTimeout(() => {
 
                    cidade.classList.remove(
                        "destinoSelecionado"
                    );
 
                }, 2500);
 
            }
 
        });
 
 
        /*
         Caso o destino não tenha
         um card na página.
        */
 
        if (!encontrado) {
 
            mostrarMensagem(
                `🔎 ${destino} está disponível para busca.`
            );
 
            setTimeout(() => {
 
                abrirBusca(destino);
 
            }, 500);
 
        }
 
    }
 
 
    /* =====================================================
       BOTÕES "VER OFERTAS"
    ===================================================== */
 
    const botoesOferta =
        $$(".cidade .conteudo button");
 
 
    botoesOferta.forEach((botao) => {
 
        botao.addEventListener("click", () => {
 
            const cidade =
                botao.closest(".cidade");
 
 
            if (!cidade) {
                return;
            }
 
 
            const titulo =
                $("h3", cidade);
 
 
            const nomeCidade =
                titulo
                    ? titulo.textContent.trim()
                    : "seu destino";
 
 
            mostrarMensagem(
                `🎉 Oferta selecionada para ${nomeCidade}!`
            );
 
 
            /*
             Abre a busca já com
             o destino preenchido.
            */
 
            setTimeout(() => {
 
                abrirBusca(nomeCidade);
 
            }, 600);
 
        });
 
    });
 
 
    /* =====================================================
       BENEFÍCIOS
    ===================================================== */
 
    const botoesBeneficios =
        $$(".botao button");
 
 
    const mensagensBeneficios = [
 
        "🔎 Busca rápida: encontre opções de viagem em poucos segundos.",
 
        "💰 Menor preço: buscamos opções com melhor custo-benefício.",
 
        "🔒 Compra segura: seus dados devem ser protegidos durante o processo."
 
    ];
 
 
    botoesBeneficios.forEach(
        (botao, index) => {
 
            botao.addEventListener(
                "click",
                () => {
 
                    mostrarMensagem(
                        mensagensBeneficios[index] ||
                        "Benefício selecionado!"
                    );
 
                }
            );
 
        }
    );
 
 
    /* =====================================================
       FAQ
    ===================================================== */
 
    const perguntas = $$(
        ".cobranca, .card1 .preco"
    );
 
 
    perguntas.forEach((pergunta) => {
 
        const resposta =
            pergunta.nextElementSibling;
 
 
        if (!resposta) {
            return;
        }
 
 
        /* Esconde inicialmente */
 
        resposta.style.display = "none";
 
 
        pergunta.setAttribute(
            "role",
            "button"
        );
 
 
        pergunta.setAttribute(
            "tabindex",
            "0"
        );
 
 
        pergunta.setAttribute(
            "aria-expanded",
            "false"
        );
 
 
        pergunta.addEventListener(
            "click",
            () => {
 
                alternarFAQ(
                    pergunta,
                    resposta
                );
 
            }
        );
 
 
        /*
         Permite abrir usando
         Enter ou Espaço.
        */
 
        pergunta.addEventListener(
            "keydown",
            (evento) => {
 
                if (
                    evento.key === "Enter" ||
                    evento.key === " "
                ) {
 
                    evento.preventDefault();
 
                    alternarFAQ(
                        pergunta,
                        resposta
                    );
 
                }
 
            }
        );
 
    });
 
 
    function alternarFAQ(
        pergunta,
        resposta
    ) {
 
        const aberto =
            resposta.style.display !== "none";
 
 
        if (aberto) {
 
            resposta.style.display =
                "none";
 
            pergunta.classList.remove(
                "perguntaAberta"
            );
 
            pergunta.setAttribute(
                "aria-expanded",
                "false"
            );
 
        } else {
 
            resposta.style.display =
                "block";
 
            pergunta.classList.add(
                "perguntaAberta"
            );
 
            pergunta.setAttribute(
                "aria-expanded",
                "true"
            );
 
        }
 
    }
 
 
    /* =====================================================
       SISTEMA DE ESTRELAS
    ===================================================== */
 
    const estrelas =
        $$(".estrelas span");
 
 
    let notaSelecionada = 0;
 
 
    estrelas.forEach(
        (estrela, index) => {
 
            const nota = index + 1;
 
 
            /* Mouse entra */
 
            estrela.addEventListener(
                "mouseenter",
                () => {
 
                    pintarEstrelas(nota);
 
                }
            );
 
 
            /* Mouse sai */
 
            estrela.addEventListener(
                "mouseleave",
                () => {
 
                    pintarEstrelas(
                        notaSelecionada
                    );
 
                }
            );
 
 
            /* Clique */
 
            estrela.addEventListener(
                "click",
                () => {
 
                    notaSelecionada =
                        nota;
 
 
                    pintarEstrelas(
                        notaSelecionada
                    );
 
 
                    mostrarMensagem(
                        `⭐ Você selecionou ${nota} estrela${nota > 1 ? "s" : ""}.`
                    );
 
                }
            );
 
 
            /*
             Acessibilidade
            */
 
            estrela.setAttribute(
                "role",
                "button"
            );
 
            estrela.setAttribute(
                "tabindex",
                "0"
            );
 
 
            estrela.addEventListener(
                "keydown",
                (evento) => {
 
                    if (
                        evento.key === "Enter" ||
                        evento.key === " "
                    ) {
 
                        evento.preventDefault();
 
                        notaSelecionada =
                            nota;
 
                        pintarEstrelas(
                            notaSelecionada
                        );
 
                    }
 
                }
            );
 
        }
    );
 
 
    function pintarEstrelas(nota) {
 
        estrelas.forEach(
            (estrela, index) => {
 
                if (index < nota) {
 
                    estrela.style.color =
                        "gold";
 
                } else {
 
                    estrela.style.color =
                        "#ccc";
 
                }
 
            }
        );
 
    }
 
 
    /* =====================================================
       BOTÃO ENVIAR AVALIAÇÃO
    ===================================================== */
 
    const btnEnviar =
        $("footer > button");
 
 
    if (btnEnviar) {
 
        btnEnviar.addEventListener(
            "click",
            () => {
 
                if (notaSelecionada === 0) {
 
                    mostrarMensagem(
                        "⚠️ Escolha uma quantidade de estrelas antes de enviar."
                    );
 
                    return;
 
                }
 
 
                mostrarMensagem(
                    `❤️ Obrigado pela sua avaliação de ${notaSelecionada}/5!`
                );
 
 
                /*
                 Limpa a avaliação depois
                 de enviar.
                */
 
                setTimeout(() => {
 
                    notaSelecionada = 0;
 
                    pintarEstrelas(0);
 
                }, 1000);
 
            }
        );
 
    }
 
 
    /* =====================================================
       MENSAGEM DO SITE
    ===================================================== */
 
    let timerMensagem;
 
 
    function mostrarMensagem(texto) {
 
        const mensagemAntiga =
            $(".mensagem-site");
 
 
        if (mensagemAntiga) {
            mensagemAntiga.remove();
        }
 
 
        clearTimeout(timerMensagem);
 
 
        const mensagem =
            document.createElement("div");
 
 
        mensagem.className =
            "mensagem-site";
 
 
        mensagem.textContent =
            texto;
 
 
        document.body.appendChild(
            mensagem
        );
 
 
        requestAnimationFrame(() => {
 
            mensagem.classList.add(
                "mostrar"
            );
 
        });
 
 
        timerMensagem =
            setTimeout(() => {
 
                mensagem.classList.remove(
                    "mostrar"
                );
 
 
                setTimeout(() => {
 
                    if (
                        mensagem.parentNode
                    ) {
 
                        mensagem.remove();
 
                    }
 
                }, 300);
 
            }, 3000);
 
    }
 
 
    /* =====================================================
       ERRO NO FORMULÁRIO
    ===================================================== */
 
    function mostrarErro(
        elemento,
        texto
    ) {
 
        elemento.innerHTML = "";
 
 
        const erro =
            document.createElement("p");
 
 
        erro.className = "erro";
 
 
        erro.textContent =
            `⚠️ ${texto}`;
 
 
        elemento.appendChild(
            erro
        );
 
    }
 
 
    /* =====================================================
       PROTEÇÃO CONTRA HTML DIGITADO PELO USUÁRIO
    ===================================================== */
 
    function escaparHTML(texto) {
 
        const div =
            document.createElement("div");
 
 
        div.textContent =
            texto;
 
 
        return div.innerHTML;
 
    }
 
 
    /* =====================================================
       ANIMAÇÃO DOS CARDS
    ===================================================== */
 
    const cidades =
        $$(".cidade");
 
 
    if (
        cidades.length > 0 &&
        "IntersectionObserver" in window
    ) {
 
        const observador =
            new IntersectionObserver(
                (elementos) => {
 
                    elementos.forEach(
                        (elemento) => {
 
                            if (
                                elemento.isIntersecting
                            ) {
 
                                elemento.target.classList.add(
                                    "aparecer"
                                );
 
                                observador.unobserve(
                                    elemento.target
                                );
 
                            }
 
                        }
                    );
 
                },
                {
                    threshold: 0.15
                }
            );
 
 
        cidades.forEach(
            (cidade) => {
 
                observador.observe(
                    cidade
                );
 
            }
        );
 
    } else {
 
        cidades.forEach(
            (cidade) => {
 
                cidade.classList.add(
                    "aparecer"
                );
 
            }
        );
 
    }
 
 
    /* =====================================================
       ANIMAÇÃO DOS CARDS AO CARREGAR
    ===================================================== */
 
    window.addEventListener(
        "load",
        () => {
 
            document.body.classList.add(
                "site-carregado"
            );
 
        }
    );
 
 
    /* =====================================================
       FECHAR MENU/MODAL COM TAB
    ===================================================== */
 
    document.addEventListener(
        "keydown",
        (evento) => {
 
            /*
             Atalho:
             Alt + B = abrir busca
            */
 
            if (
                evento.altKey &&
                evento.key.toLowerCase() === "b"
            ) {
 
                evento.preventDefault();
 
                abrirBusca();
 
            }
 
        }
    );
 
 
    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */
 
    pintarEstrelas(0);
 
    console.log(
        "✈️ New Airs carregado com sucesso!"
    );
 
});