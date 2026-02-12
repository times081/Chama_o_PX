// ========================================
// DYNAMIC FORM - SCRIPT.JS
// ========================================
const firebaseConfig = {
    apiKey: "AIzaSyDYZIt-SYc4-otvVs8hE3CoUn-gaFvzVZQ",
    authDomain: "chamaopx.firebaseapp.com",
    projectId: "chamaopx",
    storageBucket: "chamaopx.firebasestorage.app",
    messagingSenderId: "362104677197",
    appId: "1:362104677197:web:691901025ac08c6ed88d04",
    measurementId: "G-7LS6FTWHTW"
};

// Initialize
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // DOM REFERENCES
    // ========================================
    const form = document.getElementById('mainForm');
    const tipoPrestadorInput = document.getElementById('tipoPrestador');
    const btnMotorista = document.getElementById('btnMotorista');
    const btnAjudante = document.getElementById('btnAjudante');
    const motoristaSection = document.getElementById('motoristaSection');
    const ajudanteSection = document.getElementById('ajudanteSection');
    const costSummary = document.getElementById('sectionResumo');
    const tipoVeiculo = document.getElementById('tipoVeiculo');
    const tipoImplemento = document.getElementById('tipoImplemento');
    const outroVeiculoGroup = document.getElementById('outroVeiculoGroup');
    const outroImplementoGroup = document.getElementById('outroImplementoGroup');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // Cost display elements
    const custoVeiculo = document.getElementById('custoVeiculo');
    const custoImplemento = document.getElementById('custoImplemento');
    const custoAtividade = document.getElementById('custoAtividade');
    const custoTotal = document.getElementById('custoTotal');

    // ========================================
    // TOGGLE: MOTORISTA / AJUDANTE
    // ========================================
    btnMotorista.addEventListener('click', () => {
        selectPrestadorType('motorista');
    });

    btnAjudante.addEventListener('click', () => {
        selectPrestadorType('ajudante');
    });

    function selectPrestadorType(type) {
        tipoPrestadorInput.value = type;

        // Toggle button states
        btnMotorista.classList.toggle('active', type === 'motorista');
        btnAjudante.classList.toggle('active', type === 'ajudante');

        // Show/hide sections
        if (type === 'motorista') {
            motoristaSection.classList.add('visible');
            ajudanteSection.classList.remove('visible');
        } else {
            motoristaSection.classList.remove('visible');
            ajudanteSection.classList.add('visible');
        }
        costSummary.style.display = '';

        // Re-animate sections
        animateSections();
        updateProgress();
    }

    // ========================================
    // ANIMATE SECTIONS ON REVEAL
    // ========================================
    function animateSections() {
        const sections = document.querySelectorAll('.visible .form-section');
        sections.forEach((section, index) => {
            section.style.animation = 'none';
            section.offsetHeight; // Trigger reflow
            section.style.animation = `fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.06}s both`;
        });
    }

    // ========================================
    // VEHICLE TYPE: SHOW "OUTRO" FIELD
    // ========================================
    tipoVeiculo.addEventListener('change', () => {
        const val = tipoVeiculo.value;
        if (val.startsWith('outro')) {
            outroVeiculoGroup.classList.add('visible');
        } else {
            outroVeiculoGroup.classList.remove('visible');
        }
        updateCosts();
        updateProgress();
    });

    // ========================================
    // IMPLEMENTO: SHOW "OUTRO" FIELD
    // ========================================
    tipoImplemento.addEventListener('change', () => {
        const val = tipoImplemento.value;
        if (val.startsWith('outro')) {
            outroImplementoGroup.classList.add('visible');
        } else {
            outroImplementoGroup.classList.remove('visible');
        }
        updateCosts();
        updateProgress();
    });

    // ========================================
    // COST CALCULATIONS
    // ========================================
    function updateCosts() {
        const type = tipoPrestadorInput.value;
        const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        if (type === 'motorista') {
            let veiculoCost = 0;
            let implementoCost = 0;
            let atividadeCost = 0;

            const veiculoVal = tipoVeiculo.value;
            if (veiculoVal) {
                const parts = veiculoVal.split('|');
                veiculoCost = parseFloat(parts[1]) || 0;
            }

            const implementoVal = tipoImplemento.value;
            if (implementoVal) {
                const parts = implementoVal.split('|');
                implementoCost = parseFloat(parts[1]) || 0;
            }

            const atividadeChecked = document.querySelector('input[name="atividadeMotorista"]:checked');
            if (atividadeChecked) {
                const parts = atividadeChecked.value.split('|');
                atividadeCost = parseFloat(parts[1]) || 0;
            }

            const dailyTotal = veiculoCost + implementoCost + atividadeCost;

            const dataInicioEl = document.getElementById('dataInicio');
            const dataTerminoEl = document.getElementById('dataTermino');
            const start = dataInicioEl.value ? new Date(dataInicioEl.value) : null;
            const end = dataTerminoEl.value ? new Date(dataTerminoEl.value) : null;
            let days = 0;

            if (start && end) {
                if (end < start) {
                    days = 0;
                } else {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    const diffTime = Math.abs(end - start);
                    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                }
            }

            // Ensure rows are visible and labeled for Motorista
            document.querySelectorAll('.cost-item:not(.total)').forEach(el => el.style.display = 'flex');
            custoAtividade.previousElementSibling.textContent = 'Atividade';

            if (days > 0) {
                const grandTotal = dailyTotal * days;
                animateValue(custoVeiculo, `${formatMoney(veiculoCost)} x ${days}d = ${formatMoney(veiculoCost * days)}`);
                animateValue(custoImplemento, `+ ${formatMoney(implementoCost)} x ${days}d = ${formatMoney(implementoCost * days)}`);
                animateValue(custoAtividade, `+ ${formatMoney(atividadeCost)} x ${days}d = ${formatMoney(atividadeCost * days)}`);
                animateValue(custoTotal, formatMoney(grandTotal));
            } else {
                animateValue(custoVeiculo, `${formatMoney(veiculoCost)}/dia`);
                animateValue(custoImplemento, `+ ${formatMoney(implementoCost)}/dia`);
                animateValue(custoAtividade, `+ ${formatMoney(atividadeCost)}/dia`);
                animateValue(custoTotal, `${formatMoney(dailyTotal)}/dia`);
            }
        }
        else if (type === 'ajudante') {
            const valorDiaria = parseFloat(document.getElementById('valorDiaria_Aj').value) || 0;

            // Hide vehicle/implemento rows
            custoVeiculo.parentElement.style.display = 'none';
            custoImplemento.parentElement.style.display = 'none';

            // Use Atividade row for Daily Rate
            custoAtividade.parentElement.style.display = 'flex';
            custoAtividade.previousElementSibling.textContent = 'Valor Diária';

            const start = document.getElementById('dataInicio_Aj').value ? new Date(document.getElementById('dataInicio_Aj').value) : null;
            const end = document.getElementById('dataTermino_Aj').value ? new Date(document.getElementById('dataTermino_Aj').value) : null;
            let days = 0;

            if (start && end) {
                if (end < start) {
                    days = 0;
                } else {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    const diffTime = Math.abs(end - start);
                    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                }
            }

            if (days > 0) {
                const total = valorDiaria * days;
                animateValue(custoAtividade, `${formatMoney(valorDiaria)} x ${days}d`);
                animateValue(custoTotal, formatMoney(total));
            } else {
                animateValue(custoAtividade, `${formatMoney(valorDiaria)}/dia`);
                animateValue(custoTotal, `${formatMoney(valorDiaria)}/dia`); // Showing daily as total if days not selected
            }
        }
    }

    function animateValue(element, newValue) {
        if (element.textContent !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            element.textContent = newValue;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Listen for activity radio changes
    document.querySelectorAll('input[name="atividadeMotorista"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateCosts();
            updateProgress();
        });
    });

    // ========================================
    // DATE VALIDATION & LISTENERS
    // ========================================
    const dataInicioEl = document.getElementById('dataInicio');
    const dataTerminoEl = document.getElementById('dataTermino');

    dataInicioEl.addEventListener('change', () => {
        // Set min date for Termino
        if (dataInicioEl.value) {
            dataTerminoEl.min = dataInicioEl.value;

            // If Termino is already selected and is before new Inicio, clear it or warn
            if (dataTerminoEl.value && dataTerminoEl.value < dataInicioEl.value) {
                // dataTerminoEl.value = dataInicioEl.value; // Optional: auto-correct
                showToast('A data de término foi ajustada para a data de início.', 'error');
                dataTerminoEl.value = dataInicioEl.value;
            }
        }
        updateCosts();
        updateProgress();
    });

    dataTerminoEl.addEventListener('change', () => {
        if (dataInicioEl.value && dataTerminoEl.value) {
            if (dataTerminoEl.value < dataInicioEl.value) {
                showToast('A data de término não pode ser anterior à data de início.', 'error');
                dataTerminoEl.value = dataInicioEl.value; // Reset to start date
            }
        }
        updateCosts();
        updateProgress();
    });

    // ========================================
    // SELECT ALL FUNCTIONALITY
    // ========================================
    function setupSelectAll(selectAllId, itemClass) {
        const selectAllCheckbox = document.getElementById(selectAllId);
        if (!selectAllCheckbox) return;

        const items = document.querySelectorAll(`.${itemClass}`);

        selectAllCheckbox.addEventListener('change', () => {
            items.forEach(item => {
                item.checked = selectAllCheckbox.checked;
                // Trigger visual feedback
                const parent = item.closest('.toggle-card, .checklist-item');
                if (parent) {
                    parent.style.transition = 'background 0.2s';
                    if (selectAllCheckbox.checked) {
                        parent.style.background = 'var(--blue-50)';
                        setTimeout(() => {
                            parent.style.background = '';
                        }, 300);
                    }
                }
            });
            updateProgress();
        });

        // If individual items are unchecked, uncheck "select all"
        items.forEach(item => {
            item.addEventListener('change', () => {
                const allChecked = Array.from(items).every(i => i.checked);
                selectAllCheckbox.checked = allChecked;
                updateProgress();
            });
        });
    }

    setupSelectAll('selecionarTodosOferece', 'oferece-item');
    setupSelectAll('selecionarTodosEmpresa', 'seg-empresa-item');
    setupSelectAll('selecionarTodosPrestador', 'seg-prestador-item');
    setupSelectAll('selecionarTodosTarefas', 'tarefas-item');

    // Ajudante select all
    setupSelectAll('selectAllOferece_Aj', 'oferece-aj-item');
    setupSelectAll('selectAllSegEmp_Aj', 'seg-emp-aj-item');
    setupSelectAll('selectAllSegPre_Aj', 'seg-pre-aj-item');
    setupSelectAll('selectAllArmazem', 'armazem-item');
    setupSelectAll('selectAllCarga', 'carga-item');
    setupSelectAll('selectAllRota', 'rota-item');

    // Ajudante Listeners
    const valorAj = document.getElementById('valorDiaria_Aj');
    if (valorAj) valorAj.addEventListener('input', updateCosts);

    const dIniAj = document.getElementById('dataInicio_Aj');
    const dFimAj = document.getElementById('dataTermino_Aj');
    if (dIniAj && dFimAj) {
        dIniAj.addEventListener('change', () => {
            if (dIniAj.value) {
                dFimAj.min = dIniAj.value;
                if (dFimAj.value && dFimAj.value < dIniAj.value) dFimAj.value = dIniAj.value;
            }
            updateCosts();
            updateProgress();
        });
        dFimAj.addEventListener('change', () => {
            if (dIniAj.value && dFimAj.value && dFimAj.value < dIniAj.value) {
                showToast('A data de término não pode ser anterior à data de início.', 'error');
                dFimAj.value = dIniAj.value;
            }
            updateCosts();
            updateProgress();
        });
    }

    // ========================================
    // PROGRESS TRACKING
    // ========================================
    function updateProgress() {
        const type = tipoPrestadorInput.value;
        // Motorista has ~18 relevant fields now with address
        let totalFields = 16;

        if (type === 'ajudante') {
            totalFields = 8;
        }

        let filledFields = 0;

        // Basic fields (3 items)
        if (document.getElementById('nomeCompleto').value.trim()) filledFields++;
        if (document.getElementById('unidade').value.trim()) filledFields++;
        if (type) filledFields++;

        if (type === 'motorista') {
            if (document.getElementById('placa').value.trim()) filledFields++;
            if (tipoVeiculo.value) filledFields++;
            if (tipoImplemento.value) filledFields++;
            if (document.getElementById('tipoCarga').value) filledFields++;
            if (document.getElementById('localApresentacao').value) filledFields++;
            if (document.getElementById('dataInicio').value) filledFields++;
            if (document.getElementById('horarioInicio').value) filledFields++;
            if (document.getElementById('dataTermino').value) filledFields++;
            if (document.getElementById('horarioTermino').value) filledFields++;

            // Atividade
            if (document.querySelector('input[name="atividadeMotorista"]:checked')) filledFields++;

            // Local descanso
            if (document.getElementById('localDescanso').value) filledFields++;
        }
        else if (type === 'ajudante') {
            if (document.getElementById('localApresentacao_Aj').value) filledFields++;
            if (document.getElementById('dataInicio_Aj').value) filledFields++;
            if (document.getElementById('horarioInicio_Aj').value) filledFields++;
            if (document.getElementById('dataTermino_Aj').value) filledFields++;
            if (document.getElementById('horarioTermino_Aj').value) filledFields++;
            if (document.getElementById('valorDiaria_Aj').value) filledFields++;
            if (document.getElementById('localDescanso_Aj').value) filledFields++;
        }

        const percentage = Math.round((filledFields / totalFields) * 100);
        const finalPercentage = Math.min(percentage, 100);
        progressFill.style.width = `${finalPercentage}%`;
        progressLabel.textContent = `${finalPercentage}% preenchido`;
    }

    // Listen for input changes to update progress
    document.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], select').forEach(el => {
        el.addEventListener('input', updateProgress);
        el.addEventListener('change', updateProgress);
    });

    // ========================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.form-section').forEach(section => {
        observer.observe(section);
    });

    // ========================================
    // FORM SUBMISSION
    // ========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate required fields
        const nome = document.getElementById('nomeCompleto').value.trim();
        const unidade = document.getElementById('unidade').value.trim();
        const tipo = tipoPrestadorInput.value;

        if (!nome || !unidade || !tipo) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        if (tipo === 'ajudante') {
            const valor = parseFloat(document.getElementById('valorDiaria_Aj').value);
            if (isNaN(valor) || valor < 150) {
                showToast('O valor mínimo por dia de serviço deve ser de R$ 150,00', 'error');
                document.getElementById('valorDiaria_Aj').focus();
                return;
            }
        }

        // Validate "Ciência da Integração" for Motorista
        if (tipo === 'motorista') {
            const cienciaIntegracao = document.getElementById('cienciaIntegracao');
            if (!cienciaIntegracao.checked) {
                const banner = cienciaIntegracao.closest('.info-banner');
                banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                banner.classList.add('error');
                cienciaIntegracao.addEventListener('change', () => {
                    if (cienciaIntegracao.checked) {
                        banner.classList.remove('error');
                    }
                }, { once: true });
                showToast('É necessário confirmar a ciência da integração para continuar.', 'error');
                return;
            }
        }

        // Disable button while saving
        const btnEnviar = document.getElementById('btnEnviar');
        const originalBtnText = btnEnviar.innerHTML;
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = 'Enviando...';

        try {
            // Collect all data
            const formData = collectFormData();

            // SAVE TO FIREBASE FIRESTORE
            await db.collection("solicitacoes").add({
                ...formData,
                status: 'pendente',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userEmail: auth.currentUser ? auth.currentUser.email : 'publico'
            });

            console.log('Dados salvos no Firebase:', formData);

            // Show success toast
            showToast('Solicitação enviada e salva com sucesso! ✅');

            // Generate and download receipt
            generateReceipt(formData);

            // Animate only
            btnEnviar.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btnEnviar.style.transform = '';
            }, 200);

            // Reset only after success if desired, or let receipt finish
            // form.reset(); // Opcional
        } catch (error) {
            console.error("Erro ao salvar no Firestore:", error);
            showToast('Erro ao salvar no banco de dados. Tente novamente.', 'error');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = originalBtnText;
        }
    });

    // ========================================
    // COLLECT FORM DATA
    // ========================================
    function collectFormData() {
        const data = {
            nomeCompleto: document.getElementById('nomeCompleto').value,
            unidade: document.getElementById('unidade').value,
            tipoPrestador: tipoPrestadorInput.value,
        };

        if (tipoPrestadorInput.value === 'motorista') {
            data.placa = document.getElementById('placa').value;
            data.tipoVeiculo = tipoVeiculo.value;
            data.outroVeiculo = document.getElementById('outroVeiculo')?.value || '';
            data.tipoImplemento = tipoImplemento.value;
            data.outroImplemento = document.getElementById('outroImplemento')?.value || '';
            data.tipoCarga = document.getElementById('tipoCarga').value;
            data.dataInicio = document.getElementById('dataInicio').value;
            data.horarioInicio = document.getElementById('horarioInicio').value;
            data.dataTermino = document.getElementById('dataTermino').value;
            data.horarioTermino = document.getElementById('horarioTermino').value;
            data.liberarFeriados = document.getElementById('liberarFeriados').checked;
            data.liberarDomingos = document.getElementById('liberarDomingos').checked;
            data.liberarSabados = document.getElementById('liberarSabados').checked;

            const atividadeChecked = document.querySelector('input[name="atividadeMotorista"]:checked');
            data.atividadeMotorista = atividadeChecked ? atividadeChecked.value : '';

            data.localDescanso = document.getElementById('localDescanso').value;

            // Cursos
            data.cursos = [];
            document.querySelectorAll('[data-curso]').forEach(checkbox => {
                if (checkbox.checked) data.cursos.push(checkbox.dataset.curso);
            });

            data.cienciaIntegracao = document.getElementById('cienciaIntegracao').checked;

            // Empresa oferece
            data.empresaOferece = [];
            document.querySelectorAll('.oferece-item:checked').forEach(item => {
                data.empresaOferece.push(item.id.replace('oferece', ''));
            });

            // Diferenciais
            data.diferenciais = [];
            document.querySelectorAll('[id^="dif"]:checked').forEach(item => {
                data.diferenciais.push(item.id.replace('dif', ''));
            });

            // Segurança - Empresa
            data.segurancaEmpresa = [];
            document.querySelectorAll('.seg-empresa-item:checked').forEach(item => {
                data.segurancaEmpresa.push(item.id);
            });

            // Segurança - Prestador
            data.segurancaPrestador = [];
            document.querySelectorAll('.seg-prestador-item:checked').forEach(item => {
                data.segurancaPrestador.push(item.id);
            });

            // Tarefas
            data.tarefas = [];
            document.querySelectorAll('.tarefas-item:checked').forEach(item => {
                data.tarefas.push(item.id);
            });
        } else if (tipoPrestadorInput.value === 'ajudante') {
            data.localApresentacao = document.getElementById('localApresentacao_Aj').value;
            data.cep = document.getElementById('cep_Aj').value;
            data.estado = document.getElementById('estado_Aj').value;
            data.rua = document.getElementById('rua_Aj').value;
            data.numero = document.getElementById('numero_Aj').value;
            data.dataInicio = document.getElementById('dataInicio_Aj').value;
            data.horarioInicio = document.getElementById('horarioInicio_Aj').value;
            data.dataTermino = document.getElementById('dataTermino_Aj').value;
            data.horarioTermino = document.getElementById('horarioTermino_Aj').value;
            data.valorDiaria = document.getElementById('valorDiaria_Aj').value;
            data.localDescanso = document.getElementById('localDescanso_Aj').value;

            // Flags
            data.liberarFeriados = document.getElementById('liberarFeriados_Aj').checked;
            data.liberarDomingos = document.getElementById('liberarDomingos_Aj').checked;
            data.liberarSabados = document.getElementById('liberarSabados_Aj').checked;

            // Benefits
            data.empresaOferece = [];
            document.querySelectorAll('.oferece-aj-item:checked').forEach(item => {
                // get label text or id
                const label = item.parentElement.previousElementSibling.textContent.trim();
                data.empresaOferece.push(label);
            });

            // Services (consolidated)
            data.ajudanteServicos = [];
            document.querySelectorAll('.armazem-item:checked, .carga-item:checked, .rota-item:checked').forEach(item => {
                const label = item.parentElement.textContent.trim();
                data.ajudanteServicos.push(label);
            });
        }

        return data;
    }

    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;

        if (type === 'error') {
            toast.querySelector('.toast-content').style.background =
                'linear-gradient(135deg, var(--red-700), var(--red-600))';
            toast.querySelector('svg').style.color = '#fbbf24';
        } else {
            toast.querySelector('.toast-content').style.background =
                'linear-gradient(135deg, var(--blue-700), var(--blue-600))';
            toast.querySelector('svg').style.color = '#4ade80';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // ========================================
    // CLEAR FORM
    // ========================================
    document.getElementById('btnLimpar').addEventListener('click', () => {
        // Reset the form
        form.reset();

        // Reset toggle buttons
        btnMotorista.classList.remove('active');
        btnAjudante.classList.remove('active');
        tipoPrestadorInput.value = '';

        // Hide sections
        motoristaSection.classList.remove('visible');
        ajudanteSection.classList.remove('visible');
        outroVeiculoGroup.classList.remove('visible');
        outroImplementoGroup.classList.remove('visible');

        // Show cost summary
        costSummary.style.display = '';

        // Reset costs
        updateCosts();
        updateProgress();

        // Visual feedback
        showToast('Formulário limpo com sucesso!');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========================================
    // KEYBOARD ACCESSIBILITY
    // ========================================
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // ========================================
    // INPUT MASK FOR PLACA
    // ========================================
    const placaInput = document.getElementById('placa');
    placaInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (value.length > 3) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        }

        e.target.value = value;
    });

    // ========================================
    // SMOOTH SCROLL TO SECTIONS
    // ========================================
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ========================================
    // GENERATE RECEIPT PDF
    // ========================================
    function generateReceipt(data) {
        if (!window.jspdf) {
            console.error('jsPDF library not loaded');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Colors
        const blue = '#1e3a5f';
        const gray = '#374151';
        const red = '#c0392b';

        // Header
        doc.setFillColor(30, 58, 95); // blue-600
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Comprovante de Solicitação', 105, 13, { align: 'center' });

        let y = 35;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Data da Emissão: ${new Date().toLocaleString('pt-BR')}`, 20, y);
        y += 10;

        // Section: Solicitante
        doc.setFontSize(12);
        doc.setTextColor(blue);
        doc.setFont('helvetica', 'bold');
        doc.text('Dados do Solicitante', 20, y);
        doc.line(20, y + 2, 190, y + 2); // horizontal line
        y += 10;

        doc.setFontSize(10);
        doc.setTextColor(gray);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nome: ${data.nomeCompleto}`, 20, y);
        y += 6;
        doc.text(`Unidade: ${data.unidade}`, 20, y);
        y += 10;

        // Section: Detalhes
        doc.setFontSize(12);
        doc.setTextColor(blue);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalhes do Serviço', 20, y);
        doc.line(20, y + 2, 190, y + 2);
        y += 10;

        doc.setFontSize(10);
        doc.setTextColor(gray);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tipo de Prestador: ${data.tipoPrestador === 'motorista' ? 'Motorista' : 'Ajudante'}`, 20, y);
        y += 6;

        if (data.tipoPrestador === 'motorista') {
            if (data.placa) { doc.text(`Placa: ${data.placa}`, 20, y); y += 6; }
            if (data.tipoVeiculo) {
                const veiculoName = data.tipoVeiculo.split('|')[0].toUpperCase();
                doc.text(`Veículo: ${veiculoName}`, 20, y); y += 6;
            }
            if (data.tipoImplemento) {
                const impName = data.tipoImplemento.split('|')[0].toUpperCase();
                doc.text(`Implemento: ${impName}`, 20, y); y += 6;
            }
        } else if (data.tipoPrestador === 'ajudante') {
            if (data.ajudanteServicos && data.ajudanteServicos.length > 0) {
                doc.text('Serviços:', 20, y); y += 6;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                // Print services as a comma-separated list or separate lines
                const servicesText = data.ajudanteServicos.join(', ');
                // Wrap text to avoid overflow
                const splitTitle = doc.splitTextToSize(servicesText, 170);
                doc.text(splitTitle, 25, y);
                y += (splitTitle.length * 5) + 2;
                doc.setFontSize(10);
            }
        }

        // Periodo
        if (data.tipoPrestador === 'motorista' && data.dataInicio) {
            doc.text(`Início: ${data.dataInicio.split('-').reverse().join('/')} às ${data.horarioInicio}`, 20, y);
            y += 6;
            if (data.dataTermino) {
                doc.text(`Término: ${data.dataTermino.split('-').reverse().join('/')} às ${data.horarioTermino}`, 20, y);
                y += 6;
            }
        } else if (data.tipoPrestador === 'ajudante') {
            const locAj = document.getElementById('localApresentacao_Aj');
            if (locAj && locAj.value) {
                doc.text(`Local: ${locAj.value}`, 20, y); y += 6;
            }
            const dtAj = document.getElementById('dataInicio_Aj');
            if (dtAj && dtAj.value) {
                doc.text(`Início: ${dtAj.value.split('-').reverse().join('/')}`, 20, y); y += 6;
            }
        }
        y += 4;

        // Section: Valores
        if (data.tipoPrestador === 'motorista' || data.tipoPrestador === 'ajudante') {
            doc.setFontSize(12);
            doc.setTextColor(blue);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumo de Valores', 20, y);
            doc.line(20, y + 2, 190, y + 2);
            y += 10;

            // Get total text from DOM to ensure accuracy with what user saw
            const subtotalText = document.getElementById('custoTotal').textContent;

            doc.setFontSize(10);
            doc.setTextColor(gray);
            doc.setFont('helvetica', 'normal');
            doc.text(`Subtotal Estimado: ${subtotalText}`, 20, y);
            y += 15;

            // DISCLAIMER
            doc.setDrawColor(192, 57, 43); // border red
            doc.setFillColor(254, 242, 242); // bg red-50
            doc.rect(20, y - 5, 170, 20, 'FD'); // Filled and Draw

            doc.setFontSize(9);
            doc.setTextColor(red);
            doc.setFont('helvetica', 'bold');
            doc.text('ATENÇÃO:', 25, y);
            doc.setFont('helvetica', 'normal');
            doc.text('O valor total do fechamento será superior ao subtotal estimado', 25, y + 5);
            doc.text('devido a impostos, encargos trabalhistas e taxa de administração da plataforma.', 25, y + 10);

            y += 25;
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Documento gerado eletronicamente.', 105, 280, { align: 'center' });

        // Save
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        doc.save(`solicitacao_${timestamp}.pdf`);
    }

    // ========================================
    // INITIAL STATE
    // ========================================
    costSummary.style.display = 'none';
    updateProgress();
});
