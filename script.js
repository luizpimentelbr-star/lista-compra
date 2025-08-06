document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('item-form');
    const list = document.getElementById('shopping-list');
    const themeToggle = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const clearListBtn = document.getElementById('clear-list-btn');
    const totalPrice = document.getElementById('total-price');
    const dateInput = document.getElementById('date');
    let items = JSON.parse(localStorage.getItem('shoppingList')) || [];

    // Definir data atual
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Carregar tema salvo
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Alternar Tema';
    }

    // Renderizar lista e calcular total
    function renderList() {
        console.log('Renderizando lista:', items); // Log para depuração
        list.innerHTML = '';
        let total = 0;
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('list-item');
            li.innerHTML = `
                <span><i class="fas fa-shopping-basket"></i> ${item.product} - R$${parseFloat(item.price).toFixed(2)} - ${item.supermarket} - ${item.date}</span>
                <div>
                    <button class="edit-btn" onclick="editItem(${index})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn" onclick="deleteItem(${index})"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            `;
            list.appendChild(li);
            total += parseFloat(item.price || 0);
        });
        totalPrice.textContent = `Total: R$${total.toFixed(2)}`;
        localStorage.setItem('shoppingList', JSON.stringify(items));
    }

    // Adicionar item
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const product = document.getElementById('product').value;
        const price = parseFloat(document.getElementById('price').value).toFixed(2);
        const supermarket = document.getElementById('supermarket').value;
        const date = document.getElementById('date').value;
        const item = { product, price, supermarket, date };
        console.log('Adicionando item:', item); // Log para depuração
        items.push(item);
        form.reset();
        document.getElementById('price').value = '0.00';
        document.getElementById('date').value = today;
        renderList();
    });

    // Editar item
    window.editItem = (index) => {
        const item = items[index];
        document.getElementById('product').value = item.product;
        document.getElementById('price').value = item.price;
        document.getElementById('supermarket').value = item.supermarket;
        document.getElementById('date').value = item.date;
        items.splice(index, 1); // Remove item para edição
        renderList();
    };

    // Excluir item
    window.deleteItem = (index) => {
        items.splice(index, 1);
        console.log('Item excluído:', index); // Log para depuração
        renderList();
    };

    // Limpar toda a lista
    clearListBtn.addEventListener('click', () => {
        if (items.length === 0) {
            alert('A lista já está vazia!');
            return;
        }
        if (confirm('Tem certeza que deseja limpar toda a lista? Esta ação não pode ser desfeita.')) {
            items = [];
            localStorage.setItem('shoppingList', JSON.stringify(items));
            renderList();
            console.log('Lista limpa'); // Log para depuração
        }
    });

    // Alternar tema
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        themeToggle.innerHTML = document.body.classList.contains('dark') 
            ? '<i class="fas fa-sun"></i> Alternar Tema' 
            : '<i class="fas fa-moon"></i> Alternar Tema';
    });

    // Exportar lista com data no nome do arquivo
    exportBtn.addEventListener('click', () => {
        const date = new Date().toISOString().split('T')[0]; // Ex.: 2025-08-06
        const dataStr = JSON.stringify(items);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lista_compras_${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('Lista exportada:', items); // Log para depuração
    });

    // Importar lista
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    items = JSON.parse(event.target.result);
                    console.log('Lista importada:', items); // Log para depuração
                    renderList();
                } catch (error) {
                    console.error('Erro ao importar arquivo:', error);
                    alert('Erro ao importar arquivo. Verifique o formato.');
                }
            };
            reader.readAsText(file);
        }
    });

    // Inicializar lista
    renderList();
});