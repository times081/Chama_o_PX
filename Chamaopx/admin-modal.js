// admin-modal.js - Função completa para exibir todos os detalhes

// Helper: gera um span clicável que copia o texto ao clicar
function copySpan(value) {
    const text = value || '-';
    if (text === '-') return `<span>-</span>`;
    const escaped = text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `<span class="copyable" title="Clique para copiar" onclick="copyToClipboard('${escaped}', this)">${text}</span>`;
}

// Função global de copiar para a área de transferência
function copyToClipboard(text, el) {
    navigator.clipboard.writeText(text).then(() => {
        // Feedback visual
        const original = el.textContent;
        el.classList.add('copied');
        const tooltip = document.createElement('span');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '✓ Copiado!';
        el.appendChild(tooltip);
        setTimeout(() => {
            el.classList.remove('copied');
            if (tooltip.parentNode) tooltip.remove();
        }, 1500);
    }).catch(() => {
        // Fallback para file://
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        el.classList.add('copied');
        const tooltip = document.createElement('span');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '✓ Copiado!';
        el.appendChild(tooltip);
        setTimeout(() => {
            el.classList.remove('copied');
            if (tooltip.parentNode) tooltip.remove();
        }, 1500);
    });
}

// Injeta estilos de copiar no head
(function injectCopyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .copyable {
            cursor: pointer;
            position: relative;
            padding: 2px 6px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        .copyable:hover {
            background: var(--blue-50);
            color: var(--blue-700);
        }
        .copyable:active {
            transform: scale(0.97);
        }
        .copyable.copied {
            background: #d1fae5;
            color: #065f46;
        }
        .copy-tooltip {
            position: absolute;
            top: -28px;
            left: 50%;
            transform: translateX(-50%);
            background: #065f46;
            color: white;
            padding: 2px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            white-space: nowrap;
            pointer-events: none;
            animation: fadeInUp 0.2s ease-out;
            z-index: 10;
        }
    `;
    document.head.appendChild(style);
})();

function openModal(data) {
    currentDocId = data.id;
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');

    console.log('Dados completos:', data); // Debug

    const createdAtStr = data.createdAt ? data.createdAt.toDate().toLocaleString('pt-BR') : '-';

    let html = `
        <div class="detail-section">
            <h3>Informações do Solicitante</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Nome Completo</label>
                    ${copySpan(data.nomeCompleto)}
                </div>
                <div class="detail-item">
                    <label>Unidade</label>
                    ${copySpan(data.unidade)}
                </div>
                <div class="detail-item">
                    <label>Tipo de Prestador</label>
                    ${copySpan(data.tipoPrestador ? data.tipoPrestador.toUpperCase() : null)}
                </div>
                <div class="detail-item">
                    <label>Status</label>
                    <span class="status-badge status-${data.status}">${data.status}</span>
                </div>
                <div class="detail-item">
                    <label>Solicitado por</label>
                    ${copySpan(data.userEmail || 'publico')}
                </div>
                <div class="detail-item">
                    <label>Data de Criação</label>
                    ${copySpan(createdAtStr)}
                </div>
            </div>
        </div>
    `;

    if (data.tipoPrestador === 'motorista') {
        html += `
            <div class="detail-section">
                <h3>Dados do Veículo</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Placa</label>
                        ${copySpan(data.placa)}
                    </div>
                    <div class="detail-item">
                        <label>Tipo de Veículo</label>
                        ${copySpan(data.tipoVeiculo ? data.tipoVeiculo.split('|')[0] : null)}
                    </div>
                    ${data.outroVeiculo ? `
                    <div class="detail-item">
                        <label>Outro Veículo (Especificar)</label>
                        ${copySpan(data.outroVeiculo)}
                    </div>` : ''}
                    <div class="detail-item">
                        <label>Implemento</label>
                        ${copySpan(data.tipoImplemento ? data.tipoImplemento.split('|')[0] : null)}
                    </div>
                    ${data.outroImplemento ? `
                    <div class="detail-item">
                        <label>Outro Implemento (Especificar)</label>
                        ${copySpan(data.outroImplemento)}
                    </div>` : ''}
                    <div class="detail-item">
                        <label>Tipo de Carga</label>
                        ${copySpan(data.tipoCarga)}
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Período e Local</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Local de Apresentação</label>
                        ${copySpan(data.localApresentacao)}
                    </div>
                    <div class="detail-item">
                        <label>Data Início</label>
                        ${copySpan(data.dataInicio ? data.dataInicio.split('-').reverse().join('/') : null)}
                    </div>
                    <div class="detail-item">
                        <label>Horário Início</label>
                        ${copySpan(data.horarioInicio)}
                    </div>
                    <div class="detail-item">
                        <label>Data Término</label>
                        ${copySpan(data.dataTermino ? data.dataTermino.split('-').reverse().join('/') : null)}
                    </div>
                    <div class="detail-item">
                        <label>Horário Término</label>
                        ${copySpan(data.horarioTermino)}
                    </div>
                    <div class="detail-item">
                        <label>Local de Descanso</label>
                        ${copySpan(data.localDescanso)}
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Atividade e Liberações</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Atividade do Motorista</label>
                        ${copySpan(data.atividadeMotorista ? data.atividadeMotorista.split('|')[0] : null)}
                    </div>
                    <div class="detail-item">
                        <label>Liberar Feriados</label>
                        <span>${data.liberarFeriados ? '✅ Sim' : '❌ Não'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Liberar Domingos</label>
                        <span>${data.liberarDomingos ? '✅ Sim' : '❌ Não'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Liberar Sábados</label>
                        <span>${data.liberarSabados ? '✅ Sim' : '❌ Não'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Ciência da Integração</label>
                        <span>${data.cienciaIntegracao ? '✅ Confirmado' : '❌ Não confirmado'}</span>
                    </div>
                </div>
            </div>
        `;

        if (data.empresaOferece && data.empresaOferece.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Benefícios Oferecidos pela Empresa</h3>
                    <div class="detail-list">
                        ${data.empresaOferece.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (data.diferenciais && data.diferenciais.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Diferenciais do Prestador</h3>
                    <div class="detail-list">
                        ${data.diferenciais.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (data.segurancaEmpresa && data.segurancaEmpresa.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Segurança - Fornecido pela Empresa</h3>
                    <div class="detail-list">
                        ${data.segurancaEmpresa.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (data.segurancaPrestador && data.segurancaPrestador.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Segurança - Fornecido pelo Prestador</h3>
                    <div class="detail-list">
                        ${data.segurancaPrestador.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (data.cursos && data.cursos.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Cursos Necessários</h3>
                    <div class="detail-list">
                        ${data.cursos.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (data.tarefas && data.tarefas.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Tarefas do Motorista</h3>
                    <div class="detail-list">
                        ${data.tarefas.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    } else if (data.tipoPrestador === 'ajudante') {
        html += `
            <div class="detail-section">
                <h3>Endereço</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>CEP</label>
                        ${copySpan(data.cep)}
                    </div>
                    <div class="detail-item">
                        <label>Estado</label>
                        ${copySpan(data.estado)}
                    </div>
                    <div class="detail-item">
                        <label>Rua</label>
                        ${copySpan(data.rua)}
                    </div>
                    <div class="detail-item">
                        <label>Número</label>
                        ${copySpan(data.numero)}
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Período e Local</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Local de Apresentação</label>
                        ${copySpan(data.localApresentacao)}
                    </div>
                    <div class="detail-item">
                        <label>Data Início</label>
                        ${copySpan(data.dataInicio ? data.dataInicio.split('-').reverse().join('/') : null)}
                    </div>
                    <div class="detail-item">
                        <label>Horário Início</label>
                        ${copySpan(data.horarioInicio)}
                    </div>
                    <div class="detail-item">
                        <label>Data Término</label>
                        ${copySpan(data.dataTermino ? data.dataTermino.split('-').reverse().join('/') : null)}
                    </div>
                    <div class="detail-item">
                        <label>Horário Término</label>
                        ${copySpan(data.horarioTermino)}
                    </div>
                    <div class="detail-item">
                        <label>Valor Diária</label>
                        ${copySpan(data.valorDiaria ? 'R$ ' + data.valorDiaria : null)}
                    </div>
                    <div class="detail-item">
                        <label>Local de Descanso</label>
                        ${copySpan(data.localDescanso)}
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Liberações</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Liberar Feriados</label>
                        <span>${data.liberarFeriados ? '✅ Sim' : '❌ Não'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Liberar Domingos</label>
                        <span>${data.liberarDomingos ? '✅ Sim' : '❌ Não'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Liberar Sábados</label>
                        <span>${data.liberarSabados ? '✅ Sim' : '❌ Não'}</span>
                    </div>
                </div>
            </div>
        `;

        if (data.empresaOferece && data.empresaOferece.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Benefícios Oferecidos pela Empresa</h3>
                    <div class="detail-list">
                        ${data.empresaOferece.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        if (data.ajudanteServicos && data.ajudanteServicos.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Serviços Solicitados</h3>
                    <div class="detail-list">
                        ${data.ajudanteServicos.map(item => `<span class="detail-tag copyable" title="Clique para copiar" onclick="copyToClipboard('${item.replace(/'/g, "\\'")}', this)">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    }

    body.innerHTML = html;
    document.getElementById('modalStatus').value = data.status;
    modal.classList.add('active');
}
