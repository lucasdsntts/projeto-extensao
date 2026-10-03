// ==========================================
// 1. INICIALIZAÇÃO SEGURA DO SUPABASE
// ==========================================
const SUPABASE_URL = 'https://kadwgzugdbzcxvpdkqjt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_u-rQbesVCkrU1Ep0ciInBA_aLEqQR0A';

window.supabaseApp = window.supabaseApp || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. CONTROLO DE EVENTOS GLOBAIS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    carregarEstoque();
    carregarFamilias();
    carregarEntregas();
    carregarSelectFamilias();

    const formFamilia = document.getElementById('form-familia');
    if (formFamilia) {
        formFamilia.addEventListener('submit', async (e) => {
            e.preventDefault();
            await cadastrarFamilia();
        });
    }

    const btnAtualizarEstoque = document.getElementById('btn-atualizar-estoque');
    if (btnAtualizarEstoque) {
        btnAtualizarEstoque.addEventListener('click', async () => {
            await atualizarEstoque();
        });
    }

    const formEntrega = document.getElementById('form-entrega');
    if (formEntrega) {
        formEntrega.addEventListener('submit', async (e) => {
            e.preventDefault();
            await registarEntrega();
        });
    }

    // Eventos para os botões de relatório em entregas.html
    const btnExcel = document.getElementById('btn-exportar-excel');
    if (btnExcel) {
        btnExcel.addEventListener('click', exportarParaExcel);
    }

    const btnPdf = document.getElementById('btn-exportar-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', exportarParaPdf);
    }
});

// ==========================================
// 3. FUNÇÕES DE ESTOQUE
// ==========================================
async function carregarEstoque() {
    const elEstoque = document.getElementById('qtd-estoque');
    if (!elEstoque) return;

    try {
        const { data, error } = await window.supabaseApp
            .from('estoque')
            .select('quantidade')
            .eq('id', 1)
            .single();

        if (error) throw error;
        elEstoque.textContent = data ? data.quantidade : 0;
    } catch (err) {
        console.error('Erro ao carregar estoque:', err.message);
    }
}

async function atualizarEstoque() {
    const inputQtd = document.getElementById('input-nova-qtd');
    if (!inputQtd) return;

    const novaQuantidade = parseInt(inputQtd.value);
    if (isNaN(novaQuantidade)) {
        Swal.fire('Atenção', 'Digite um número válido para o estoque.', 'warning');
        return;
    }

    try {
        const { error } = await window.supabaseApp
            .from('estoque')
            .update({ quantidade: novaQuantidade })
            .eq('id', 1);

        if (error) throw error;

        Swal.fire('Sucesso!', 'Estoque atualizado com sucesso.', 'success');
        carregarEstoque();
        inputQtd.value = '';
    } catch (err) {
        console.error('Erro ao atualizar estoque:', err.message);
        Swal.fire('Erro', 'Não foi possível atualizar o estoque.', 'error');
    }
}

// ==========================================
// 4. FUNÇÕES DE FAMÍLIAS, PESQUISA E EDIÇÃO
// ==========================================
let todasAsFamilias = [];

async function carregarFamilias() {
    const listaFamilias = document.getElementById('lista-familias');
    if (!listaFamilias) return;

    try {
        const { data, error } = await window.supabaseApp
            .from('familias')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        todasAsFamilias = data || [];
        renderizarListaFamilias(todasAsFamilias);
    } catch (err) {
        console.error('Erro ao carregar famílias:', err.message);
    }
}

function renderizarListaFamilias(lista) {
    const listaFamilias = document.getElementById('lista-familias');
    if (!listaFamilias) return;

    listaFamilias.innerHTML = '';
    
    if (lista.length === 0) {
        listaFamilias.innerHTML = `<li class="py-3 text-center text-xs text-slate-400">Nenhuma família encontrada.</li>`;
        return;
    }

    lista.forEach(familia => {
        const li = document.createElement('li');
        li.className = "py-3 flex items-center justify-between text-xs";
        li.innerHTML = `
            <div>
                <span class="font-bold text-slate-800 block">${familia.nome_responsavel}</span>
                <span class="text-slate-500">CPF: ${familia.cpf || '-'} | Tel: ${familia.telefone || '-'}</span>
            </div>
            <div class="flex items-center gap-1.5">
                <button onclick="editarFamilia(${familia.id})" class="bg-amber-500 text-white px-2.5 py-1 rounded-lg hover:bg-amber-600 transition">Editar</button>
                <button onclick="deletarFamilia(${familia.id})" class="bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition">Excluir</button>
            </div>
        `;
        listaFamilias.appendChild(li);
    });
}

document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'input-busca') {
        const termo = e.target.value.toLowerCase();
        const filtradas = todasAsFamilias.filter(fam => 
            (fam.nome_responsavel && fam.nome_responsavel.toLowerCase().includes(termo)) ||
            (fam.cpf && fam.cpf.toLowerCase().includes(termo))
        );
        renderizarListaFamilias(filtradas);
    }
});

async function cadastrarFamilia() {
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    try {
        const { error } = await window.supabaseApp
            .from('familias')
            .insert([{ nome_responsavel: nome, cpf, telefone, endereco }]);

        if (error) throw error;

        Swal.fire('Sucesso!', 'Família cadastrada com sucesso!', 'success');
        document.getElementById('form-familia').reset();
        carregarFamilias();
        carregarSelectFamilias();
    } catch (err) {
        console.error('Erro ao cadastrar família:', err.message);
        Swal.fire('Erro', 'Não foi possível cadastrar a família.', 'error');
    }
}

async function editarFamilia(id) {
    const familia = todasAsFamilias.find(f => f.id === id);
    if (!familia) return;

    const { value: formValues } = await Swal.fire({
        title: 'Editar Família',
        html: `
            <input id="swal-nome" class="swal2-input text-xs" placeholder="Nome do Responsável" value="${familia.nome_responsavel || ''}">
            <input id="swal-cpf" class="swal2-input text-xs" placeholder="CPF" value="${familia.cpf || ''}">
            <input id="swal-telefone" class="swal2-input text-xs" placeholder="Telefone" value="${familia.telefone || ''}">
            <input id="swal-endereco" class="swal2-input text-xs" placeholder="Endereço" value="${familia.endereco || ''}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar Alterações',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nome_responsavel: document.getElementById('swal-nome').value,
                cpf: document.getElementById('swal-cpf').value,
                telefone: document.getElementById('swal-telefone').value,
                endereco: document.getElementById('swal-endereco').value
            }
        }
    });

    if (formValues) {
        try {
            const { error } = await window.supabaseApp
                .from('familias')
                .update(formValues)
                .eq('id', id);

            if (error) throw error;

            Swal.fire('Atualizado!', 'Os dados da família foram alterados com sucesso.', 'success');
            carregarFamilias();
            carregarSelectFamilias();
        } catch (err) {
            console.error('Erro ao atualizar:', err.message);
            Swal.fire('Erro', 'Não foi possível atualizar os dados.', 'error');
        }
    }
}

async function deletarFamilia(id) {
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não poderá ser revertida!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
        try {
            const { error } = await window.supabaseApp
                .from('familias')
                .delete()
                .eq('id', id);

            if (error) throw error;

            Swal.fire('Excluído!', 'A família foi removida.', 'success');
            carregarFamilias();
            carregarSelectFamilias();
        } catch (err) {
            console.error('Erro ao excluir:', err.message);
            Swal.fire('Erro', 'Não foi possível excluir o registo.', 'error');
        }
    }
}

// ==========================================
// 5. FUNÇÕES DE ENTREGAS
// ==========================================
async function carregarSelectFamilias() {
    const select = document.getElementById('select-familia');
    if (!select) return;

    try {
        const { data: familias, error: errFam } = await window.supabaseApp
            .from('familias')
            .select('id, nome_responsavel')
            .order('nome_responsavel', { ascending: true });

        if (errFam) throw errFam;

        const { data: entregas, error: errEnt } = await window.supabaseApp
            .from('entregas')
            .select('familia_id');

        if (errEnt) throw errEnt;

        const idsComEntrega = new Set(entregas.map(e => e.familia_id));
        const familiasDisponiveis = familias.filter(fam => !idsComEntrega.has(fam.id));

        select.innerHTML = '<option value="">Selecione uma família...</option>';
        
        if (familiasDisponiveis.length === 0) {
            select.innerHTML = '<option value="">Todas as famílias já receberam cesta!</option>';
            return;
        }

        familiasDisponiveis.forEach(fam => {
            select.innerHTML += `<option value="${fam.id}">${fam.nome_responsavel}</option>`;
        });
    } catch (err) {
        console.error('Erro ao carregar select de famílias:', err.message);
    }
}

async function registarEntrega() {
    const familiaId = document.getElementById('select-familia').value;
    const observacao = document.getElementById('observacao').value;

    if (!familiaId) {
        Swal.fire('Atenção', 'Selecione uma família para a entrega.', 'warning');
        return;
    }

    try {
        const { data: estoqueData, error: estoqueError } = await window.supabaseApp
            .from('estoque')
            .select('quantidade')
            .eq('id', 1)
            .single();

        if (estoqueError) throw estoqueError;

        if (!estoqueData || estoqueData.quantidade <= 0) {
            Swal.fire('Sem Estoque', 'Não existem cestas básicas disponíveis no estoque!', 'error');
            return;
        }

        const { error: entregaError } = await window.supabaseApp
            .from('entregas')
            .insert([{ familia_id: familiaId, observacao }]);

        if (entregaError) throw entregaError;

        const novaQtd = estoqueData.quantidade - 1;
        const { error: updateError } = await window.supabaseApp
            .from('estoque')
            .update({ quantidade: novaQtd })
            .eq('id', 1);

        if (updateError) throw updateError;

        Swal.fire('Sucesso!', 'Entrega registada e baixa efetuada no estoque!', 'success');
        document.getElementById('form-entrega').reset();
        carregarEstoque();
        carregarEntregas();
        carregarSelectFamilias();
    } catch (err) {
        console.error('Erro ao registar entrega:', err.message);
        Swal.fire('Erro', 'Não foi possível concluir o registo da entrega.', 'error');
    }
}

async function carregarEntregas() {
    const listaEntregas = document.getElementById('lista-entregues-mes');
    if (!listaEntregas) return;

    try {
        const { data, error } = await window.supabaseApp
            .from('entregas')
            .select(`
                id,
                created_at,
                observacao,
                familias ( nome_responsavel )
            `)
            .order('id', { ascending: false });

        if (error) throw error;

        listaEntregas.innerHTML = '';

        if (!data || data.length === 0) {
            listaEntregas.innerHTML = `<li class="py-3 text-center text-xs text-slate-400">Nenhuma entrega registada.</li>`;
            return;
        }

        data.forEach(entrega => {
            const nomeFamilia = entrega.familias ? entrega.familias.nome_responsavel : 'Família Removida';
            const dataFormatada = new Date(entrega.created_at).toLocaleDateString('pt-PT');
            
            const li = document.createElement('li');
            li.className = "py-3 flex items-center justify-between text-xs";
            li.innerHTML = `
                <div>
                    <span class="font-bold text-slate-800 block">${nomeFamilia}</span>
                    <span class="text-slate-500">Obs: ${entrega.observacao || 'Nenhuma'}</span>
                </div>
                <span class="text-slate-400 font-medium">${dataFormatada}</span>
            `;
            listaEntregas.appendChild(li);
        });
    } catch (err) {
        console.error('Erro ao carregar entregas:', err.message);
    }
}

// ==========================================
// 6. FUNÇÕES DE EXPORTAÇÃO (PDF E EXCEL)
// ==========================================
async function exportarParaExcel() {
    try {
        const { data, error } = await window.supabaseApp
            .from('entregas')
            .select(`
                id,
                created_at,
                observacao,
                familias ( nome_responsavel, cpf, telefone, endereco )
            `)
            .order('id', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
            Swal.fire('Atenção', 'Não há dados de entregas para exportar.', 'info');
            return;
        }

        let csvContent = "\uFEFFID;Responsável;CPF;Telefone;Endereço;Data;Observação\n";

        data.forEach(item => {
            const id = item.id;
            const nome = item.familias ? item.familias.nome_responsavel : 'Removida';
            const cpf = item.familias ? (item.familias.cpf || '') : '';
            const tel = item.familias ? (item.familias.telefone || '') : '';
            const end = item.familias ? (item.familias.endereco || '').replace(/;/g, ',') : '';
            const dataF = new Date(item.created_at).toLocaleDateString('pt-PT');
            const obs = (item.observacao || 'Nenhuma').replace(/;/g, ',');

            csvContent += `${id};"${nome}";"${cpf}";"${tel}";"${end}";${dataF};"${obs}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_entregas_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire('Sucesso!', 'Relatório Excel descarregado com sucesso!', 'success');
    } catch (err) {
        console.error('Erro ao exportar Excel:', err.message);
        Swal.fire('Erro', 'Não foi possível exportar para Excel.', 'error');
    }
}

async function exportarParaPdf() {
    try {
        const { data, error } = await window.supabaseApp
            .from('entregas')
            .select(`
                id,
                created_at,
                observacao,
                familias ( nome_responsavel, cpf, telefone )
            `)
            .order('id', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
            Swal.fire('Atenção', 'Não há dados de entregas para gerar o PDF.', 'info');
            return;
        }

        let janelaPrint = window.open('', '', 'height=700,width=900');
        janelaPrint.document.write('<html><head><title>Relatório de Entregas</title>');
        janelaPrint.document.write('<style>');
        janelaPrint.document.write('body { font-family: Arial, sans-serif; padding: 20px; color: #333; }');
        janelaPrint.document.write('h2 { text-align: center; color: #1e293b; }');
        janelaPrint.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }');
        janelaPrint.document.write('th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }');
        janelaPrint.document.write('th { background-color: #f1f5f9; color: #0f172a; }');
        janelaPrint.document.write('</style></head><body>');
        
        janelaPrint.document.write('<h2>Relatório Geral de Entregas de Cestas Básicas</h2>');
        janelaPrint.document.write(`<p><b>Data de geração:</b> ${new Date().toLocaleDateString('pt-PT')}</p>`);
        janelaPrint.document.write('<table>');
        janelaPrint.document.write('<tr><th>ID</th><th>Responsável</th><th>CPF</th><th>Telefone</th><th>Data</th><th>Observação</th></tr>');

        data.forEach(item => {
            const nome = item.familias ? item.familias.nome_responsavel : 'Removida';
            const cpf = item.familias ? (item.familias.cpf || '-') : '-';
            const tel = item.familias ? (item.familias.telefone || '-') : '-';
            const dataF = new Date(item.created_at).toLocaleDateString('pt-PT');
            const obs = item.observacao || 'Nenhuma';

            janelaPrint.document.write(`<tr><td>${item.id}</td><td><b>${nome}</b></td><td>${cpf}</td><td>${tel}</td><td>${dataF}</td><td>${obs}</td></tr>`);
        });

        janelaPrint.document.write('</table>');
        janelaPrint.document.write('</body></html>');
        janelaPrint.document.close();
        janelaPrint.focus();

        setTimeout(() => {
            janelaPrint.print();
        }, 500);

    } catch (err) {
        console.error('Erro ao gerar PDF:', err.message);
        Swal.fire('Erro', 'Não foi possível gerar o PDF.', 'error');
    }
}