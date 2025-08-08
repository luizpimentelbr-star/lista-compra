document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('item-form');
    const list = document.getElementById('shopping-list');
    const themeToggle = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const clearListBtn = document.getElementById('clear-list-btn');
    const scanBtn = document.getElementById('scan-btn');
    const totalPrice = document.getElementById('total-price');
    const itemCount = document.getElementById('item-count');
    const dateInput = document.getElementById('date');
    const productInput = document.getElementById('product');
    const video = document.getElementById('scanner-video');
    let items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    let exportCounter = parseInt(localStorage.getItem('exportCounter')) || 0;
    let stream = null;

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
        console.log('Renderizando lista:', items);
        list.innerHTML = '';
        let total = 0;
        items.forEach((item, index) => {
            const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
            const li = document.createElement('li');
            li.classList.add('list-item');
            li.innerHTML = `
                <span><i class="fas fa-shopping-basket"></i> ${item.product} (${item.quantity}x) - R$${itemTotal} - ${item.supermarket} - ${item.date}</span>
                <div>
                    <button class="edit-btn" onclick="editItem(${index})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn" onclick="deleteItem(${index})"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            `;
            list.appendChild(li);
            total += parseFloat(itemTotal);
        });
        totalPrice.textContent = `Total: R$${total.toFixed(2)}`;
        itemCount.textContent = `Itens: ${items.length}`; // Exibir contagem de itens
        localStorage.setItem('shoppingList', JSON.stringify(items));
    }

    // Adicionar item
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const product = productInput.value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value).toFixed(2);
        const supermarket = document.getElementById('supermarket').value;
        const date = document.getElementById('date').value;
        const item = { product, quantity, price, supermarket, date };
        console.log('Adicionando item:', item);
        items.push(item);
        form.reset();
        document.getElementById('quantity').value = '1';
        document.getElementById('price').value = '0.00';
        document.getElementById('date').value = today;
        renderList();
        productInput.focus();
    });

    // Editar item
    window.editItem = (index) => {
        const item = items[index];
        productInput.value = item.product;
        document.getElementById('quantity').value = item.quantity;
        document.getElementById('price').value = item.price;
        document.getElementById('supermarket').value = item.supermarket;
        document.getElementById('date').value = item.date;
        items.splice(index, 1);
        renderList();
        productInput.focus();
    };

    // Excluir item
    window.deleteItem = (index) => {
        items.splice(index, 1);
        console.log('Item excluído:', index);
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
            console.log('Lista limpa');
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

    // Exportar lista com numeração sequencial
    exportBtn.addEventListener('click', () => {
        exportCounter++;
        localStorage.setItem('exportCounter', exportCounter);
        const dataStr = JSON.stringify(items);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Lista${exportCounter}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('Lista exportada:', items);
    });

    // Importar lista
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    items = JSON.parse(event.target.result);
                    console.log('Lista importada:', items);
                    renderList();
                } catch (error) {
                    console.error('Erro ao importar arquivo:', error);
                    alert('Erro ao importar arquivo. Verifique o formato.');
                }
            };
            reader.readAsText(file);
        }
    });

    // Escanear código de barras
    scanBtn.addEventListener('click', async () => {
        if ('BarcodeDetector' in window) {
            // Usar Barcode Detection API
            const barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'upc_a', 'qr_code', 'code_128'] });
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                video.style.display = 'block';
                video.play();

                const scan = async () => {
                    const canvas = document.getElementById('scanner-canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const barcodes = await barcodeDetector.detect(canvas);
                    if (barcodes.length > 0) {
                        productInput.value = barcodes[0].rawValue;
                        video.srcObject = null;
                        stream.getTracks().forEach(track => track.stop());
                        video.style.display = 'none';
                        productInput.focus();
                    } else {
                        requestAnimationFrame(scan);
                    }
                };
                requestAnimationFrame(scan);
            } catch (error) {
                console.error('Erro ao acessar a câmera:', error);
                alert('Erro ao acessar a câmera. Verifique as permissões.');
            }
        } else {
            // Fallback para ZXing
            const codeReader = new ZXing.BrowserMultiFormatReader();
            try {
                const result = await codeReader.decodeFromVideoDevice(null, 'scanner-video', (result, err) => {
                    if (result) {
                        productInput.value = result.getText();
                        codeReader.reset();
                        video.style.display = 'none';
                        productInput.focus();
                    }
                    if (err) {
                        console.error('Erro ao escanear com ZXing:', err);
                    }
                });
                video.style.display = 'block';
            } catch (error) {
                console.error('Erro ao acessar a câmera com ZXing:', error);
                alert('Erro ao acessar a câmera com ZXing. Verifique as permissões.');
            }
        }
    });

    // Parar a câmera ao fechar a página
    window.addEventListener('beforeunload', () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });

    // Inicializar lista
    renderList();
});
