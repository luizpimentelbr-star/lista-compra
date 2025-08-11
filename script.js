document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('item-form');
    const list = document.getElementById('shopping-list');
    const themeToggle = document.getElementById('theme-toggle');
    const saveListBtn = document.getElementById('save-list-btn');
    const loadListSelect = document.getElementById('load-list-select');
    const deleteListSelect = document.getElementById('delete-list-select');
    const clearListBtn = document.getElementById('clear-list-btn');
    const scanBtn = document.getElementById('scan-btn');
    const cancelScanBtn = document.getElementById('cancel-scan-btn');
    const totalPrice = document.getElementById('total-price');
    const itemCount = document.getElementById('item-count');
    const dateInput = document.getElementById('date');
    const productInput = document.getElementById('product');
    const quantityInput = document.getElementById('quantity');
    const unitInput = document.getElementById('unit');
    const priceInput = document.getElementById('price');
    const supermarketInput = document.getElementById('supermarket');
    const scannerContainer = document.getElementById('scanner-container');
    const video = document.getElementById('scanner-video');
    let items = JSON.parse(localStorage.getItem('currentList')) || [];
    let savedLists = JSON.parse(localStorage.getItem('savedLists')) || [];
    let exportCounter = parseInt(localStorage.getItem('exportCounter')) || 0;
    let productCache = JSON.parse(localStorage.getItem('productCache')) || {};
    let stream = null;
    let scanning = false;

    // Definir data atual
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Carregar tema salvo
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Alternar Tema';
    }

    // Atualizar selects de carregar e excluir listas salvas
    function updateListSelects() {
        loadListSelect.innerHTML = '<option value="">Carregar</option>';
        deleteListSelect.innerHTML = '<option value="">Excluir</option>';
        savedLists.forEach(list => {
            const optionLoad = document.createElement('option');
            optionLoad.value = list.name;
            optionLoad.textContent = list.name;
            loadListSelect.appendChild(optionLoad);

            const optionDelete = document.createElement('option');
            optionDelete.value = list.name;
            optionDelete.textContent = list.name;
            deleteListSelect.appendChild(optionDelete);
        });
    }

    // Renderizar lista e calcular total
    function renderList() {
        console.log('Renderizando lista:', items);
        list.innerHTML = '';
        let total = 0;
        items.forEach((item, index) => {
            const itemTotal = (parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2);
            console.log(`Calculando item ${index}: ${item.price} × ${item.quantity} = ${itemTotal}`);
            const li = document.createElement('li');
            li.classList.add('list-item');
            li.innerHTML = `
                <span><i class="fas fa-shopping-basket"></i> ${item.product} (${item.quantity} ${item.unit}) - R$${itemTotal} - ${item.supermarket} - ${item.date}</span>
                <div>
                    <button class="edit-btn" onclick="editItem(${index})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn" onclick="deleteItem(${index})"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            `;
            list.appendChild(li);
            total += parseFloat(itemTotal);
        });
        totalPrice.textContent = `Total: R$${total.toFixed(2)}`;
        itemCount.textContent = `Itens: ${items.length}`;
        localStorage.setItem('currentList', JSON.stringify(items));
    }

    // Adicionar item
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const product = productInput.value;
        const quantity = parseFloat(quantityInput.value);
        const unit = unitInput.value;
        const price = parseFloat(priceInput.value).toFixed(2);
        const supermarket = supermarketInput.value;
        const date = dateInput.value;
        if (quantity <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }
        const item = { product, quantity, unit, price, supermarket, date };
        console.log('Adicionando item:', item);
        items.push(item);
        form.reset();
        quantityInput.value = '1';
        unitInput.value = 'un';
        priceInput.value = '0.00';
        dateInput.value = today;
        renderList();
        productInput.focus();
    });

    // Editar item
    window.editItem = (index) => {
        const item = items[index];
        productInput.value = item.product;
        productInput.select();
        quantityInput.value = item.quantity;
        quantityInput.select();
        unitInput.value = item.unit || 'un';
        priceInput.value = item.price;
        priceInput.select();
        supermarketInput.value = item.supermarket;
        supermarketInput.select();
        dateInput.value = item.date;
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

    // Limpar lista atual
    clearListBtn.addEventListener('click', () => {
        if (items.length === 0) {
            alert('A lista já está vazia!');
            return;
        }
        if (confirm('Tem certeza que deseja limpar a lista atual? Esta ação não pode ser desfeita.')) {
            items = [];
            localStorage.setItem('currentList', JSON.stringify(items));
            renderList();
            console.log('Lista atual limpa!');
        }
    });

    // Salvar lista atual
    saveListBtn.addEventListener('click', () => {
        const name = prompt('Digite o nome para salvar esta lista (ex.: Lista Semanal):');
        if (name) {
            const existingIndex = savedLists.findIndex(list => list.name === name);
            if (existingIndex > -1) {
                if (confirm('Uma lista com esse nome já existe. Sobrescrever?')) {
                    savedLists[existingIndex].items = [...items];
                } else {
                    return;
                }
            } else {
                savedLists.push({ name, items: [...items] });
            }
            localStorage.setItem('savedLists', JSON.stringify(savedLists));
            updateListSelects();
            alert('Lista salva com sucesso!');
        }
    });

    // Carregar lista salva
    loadListSelect.addEventListener('change', (e) => {
        const name = e.target.value;
        if (name) {
            const savedList = savedLists.find(list => list.name === name);
            if (savedList) {
                items = [...savedList.items];
                renderList();
                alert(`Lista "${name}" carregada com sucesso!`);
            }
            e.target.value = '';
        }
    });

    // Excluir lista salva
    deleteListBtn.addEventListener('click', () => {
        const name = deleteListSelect.value;
        if (name) {
            const index = savedLists.findIndex(list => list.name === name);
            if (index > -1) {
                savedLists.splice(index, 1);
                localStorage.setItem('savedLists', JSON.stringify(savedLists));
                updateListSelects();
                alert('Lista excluída com sucesso!');
            } else {
                alert('Lista não encontrada.');
            }
            deleteListSelect.value = '';
        } else {
            alert('Selecione uma lista para excluir.');
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

    // Função para buscar nome do produto na Open Food Facts
    async function fetchProductName(barcode) {
        // Verificar cache primeiro
        if (productCache[barcode]) {
            console.log('Produto encontrado no cache:', productCache[barcode]);
            return productCache[barcode];
        }

        // Verificar conectividade
        if (!navigator.onLine) {
            console.log('Offline: Nenhum acesso à API Open Food Facts.');
            return null;
        }

        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
                headers: { 'User-Agent': 'ListaComprasApp/1.0' }
            });
            const data = await response.json();
            if (data.status === 1 && data.product && data.product.product_name) {
                const productName = data.product.product_name;
                // Salvar no cache
                productCache[barcode] = productName;
                localStorage.setItem('productCache', JSON.stringify(productCache));
                console.log('Produto encontrado na API:', productName);
                return productName;
            } else {
                console.log('Produto não encontrado na API Open Food Facts.');
                return null;
            }
        } catch (error) {
            console.error('Erro ao buscar produto na API:', error);
            return null;
        }
    }

    // Função para parar o escaneamento
    function stopScanning() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        scannerContainer.style.display = 'none';
        video.srcObject = null;
        scanning = false;
        productInput.focus();
    }

    // Escanear código de barras
    scanBtn.addEventListener('click', async () => {
        if (scanning) return;
        scanning = true;
        scannerContainer.style.display = 'flex';

        if ('BarcodeDetector' in window) {
            // Usar Barcode Detection API
            const barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'upc_a', 'qr_code', 'code_128'] });
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                video.play();

                const scan = async () => {
                    if (!scanning) return;
                    const canvas = document.getElementById('scanner-canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    try {
                        const barcodes = await barcodeDetector.detect(canvas);
                        if (barcodes.length > 0) {
                            const barcode = barcodes[0].rawValue;
                            const productName = await fetchProductName(barcode);
                            productInput.value = productName || barcode;
                            stopScanning();
                            if (productName) {
                                alert(`Produto encontrado: ${productName}`);
                            } else if (navigator.onLine) {
                                alert(`Produto não encontrado. Edite o campo para o nome do produto: ${barcode}`);
                            } else {
                                alert(`Sem internet. Edite o campo para o nome do produto ou use o último nome salvo: ${barcode}`);
                            }
                        } else {
                            requestAnimationFrame(scan);
                        }
                    } catch (error) {
                        console.error('Erro ao detectar código de barras:', error);
                        requestAnimationFrame(scan);
                    }
                };
                requestAnimationFrame(scan);
            } catch (error) {
                console.error('Erro ao acessar a câmera:', error);
                alert('Erro ao acessar a câmera. Verifique as permissões ou use Chrome/Edge.');
                stopScanning();
            }
        } else {
            // Fallback para ZXing
            const codeReader = new ZXing.BrowserMultiFormatReader();
            try {
                codeReader.decodeFromVideoDevice(null, 'scanner-video', async (result, err) => {
                    if (result && scanning) {
                        const barcode = result.getText();
                        const productName = await fetchProductName(barcode);
                        productInput.value = productName || barcode;
                        codeReader.reset();
                        stopScanning();
                        if (productName) {
                            alert(`Produto encontrado: ${productName}`);
                        } else if (navigator.onLine) {
                            alert(`Produto não encontrado. Edite o campo para o nome do produto: ${barcode}`);
                        } else {
                            alert(`Sem internet. Edite o campo para o nome do produto ou use o último nome salvo: ${barcode}`);
                        }
                    }
                    if (err && scanning) {
                        console.error('Erro ao escanear com ZXing:', err);
                    }
                });
            } catch (error) {
                console.error('Erro ao acessar a câmera com ZXing:', error);
                alert('Erro ao acessar a câmera com ZXing. Verifique as permissões ou use Chrome/Edge.');
                stopScanning();
            }
        }
    });

    // Cancelar escaneamento
    cancelScanBtn.addEventListener('click', () => {
        stopScanning();
    });

    // Parar a câmera ao fechar a página
    window.addEventListener('beforeunload', () => {
        stopScanning();
    });

    // Inicializar lista
    updateListSelects();
    renderList();
});
