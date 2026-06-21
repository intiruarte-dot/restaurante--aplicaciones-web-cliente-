// Array global para almacenar los productos en memoria
let carrito = [];

// Cargar carrito desde localStorage al iniciar
function cargarCarrito() {
    const datos = localStorage.getItem('carrito');
    if (datos) {
        carrito = JSON.parse(datos);
    }
    actualizarInterfaz();
}

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Escuchar clics usando delegación de eventos (funciona incluso en elementos agregados dinámicamente)
document.addEventListener('click', (e) => {
    const boton = e.target.closest('.btn-add');
    if (boton) {
        const id = boton.getAttribute('data-id');
        const nombre = boton.getAttribute('data-nombre');
        const precio = parseFloat(boton.getAttribute('data-precio'));
        if (id && nombre && !isNaN(precio)) {
            agregarAlCarrito(id, nombre, precio);
        }
    }
});

function agregarAlCarrito(id, nombre, precio) {
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    actualizarInterfaz();
    guardarCarrito();
    alert(`"${nombre}" se agregó correctamente al carrito.`);
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(item => item.id === id);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            carrito = carrito.filter(i => i.id !== id);
        }
    }
    actualizarInterfaz();
    guardarCarrito();
}

function actualizarInterfaz() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        contador.innerText = totalItems;
    }

    const listaHTML = document.getElementById('lista-carrito');
    if (!listaHTML) return;

    if (carrito.length === 0) {
        listaHTML.innerHTML = `<p style="color:#777;">El carrito está vacío.</p>`;
        const total = document.getElementById('total-precio');
        if (total) total.innerText = "0.00";
        return;
    }

    let html = "";
    let subtotalGral = 0;

    carrito.forEach(item => {
        const totalPorProducto = item.precio * item.cantidad;
        subtotalGral += totalPorProducto;

        html += `
            <div class="item-carrito">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small>$${item.precio.toFixed(2)} c/u</small>
                </div>
                <div>
                    <button class="btn-cant" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-cant" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                    <span style="margin-left:15px; font-weight:bold;">$${totalPorProducto.toFixed(2)}</span>
                </div>
            </div>
        `;
    });

    listaHTML.innerHTML = html;
    const total = document.getElementById('total-precio');
    if (total) total.innerText = subtotalGral.toFixed(2);
}

function procesarPago(event) {
    event.preventDefault();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de pagar.");
        window.location.href = "#";
        return;
    }

    const numPedidoRandom = Math.floor(100000 + Math.random() * 900000);
    const numPedido = document.getElementById('num-pedido');
    if (numPedido) numPedido.innerText = numPedidoRandom;

    window.location.href = "#ventana-exito";
}

function vaciarCarrito() {
    carrito = [];
    actualizarInterfaz();
    guardarCarrito();
    const form = document.getElementById('checkout-form');
    if (form) form.reset();
    window.location.href = "#";
}

// Cargar carrito al iniciar
cargarCarrito();

// ============================================
// FUNCIONALIDAD DE BÚSQUEDA
// ============================================

function buscarProductos(termino) {
    termino = termino.toLowerCase().trim();
    if (!termino) {
        // Si el término está vacío, mostrar todos los productos
        document.querySelectorAll('#productos article, .producto-destacado').forEach(el => {
            el.style.display = '';
        });
        return;
    }

    // Buscar en la página actual (productos.html)
    const productos = document.querySelectorAll('#productos article, .producto-destacado');
    let encontrados = 0;

    productos.forEach(producto => {
        const titulo = producto.querySelector('h3');
        const descripcion = producto.querySelector('.descripcion, p');

        let texto = '';
        if (titulo) texto += titulo.textContent.toLowerCase();
        if (descripcion) texto += ' ' + descripcion.textContent.toLowerCase();

        if (texto.includes(termino)) {
            producto.style.display = '';
            encontrados++;
        } else {
            producto.style.display = 'none';
        }
    });

    // Mostrar mensaje si no hay resultados
    const contenedor = document.querySelector('.productos-container, .productos-destacados-container');
    let mensaje = document.getElementById('sin-resultados');
    if (encontrados === 0 && productos.length > 0) {
        if (!mensaje) {
            mensaje = document.createElement('p');
            mensaje.id = 'sin-resultados';
            mensaje.textContent = 'No se encontraron productos con ese término.';
            mensaje.style.cssText = 'text-align:center;padding:40px;font-size:18px;color:#666;width:100%;';
            contenedor.appendChild(mensaje);
        }
    } else if (mensaje) {
        mensaje.remove();
    }
}

function realizarBusqueda() {
    const input = document.querySelector('.busqueda input');
    if (!input) return;
    const termino = input.value.trim();
    const esProductos = window.location.pathname.includes('productos');

    if (esProductos) {
        buscarProductos(termino);
    } else {
        window.location.href = 'productos.html' + (termino ? '?q=' + encodeURIComponent(termino) : '');
    }
}

// Evento al hacer clic en el botón de búsqueda
document.addEventListener('click', (e) => {
    const botonBuscar = e.target.closest('.busqueda button');
    if (botonBuscar) {
        e.preventDefault();
        realizarBusqueda();
    }
});

// Evento al presionar Enter en el input de búsqueda
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = e.target.closest('.busqueda input');
        if (input) {
            e.preventDefault();
            realizarBusqueda();
        }
    }
});

// Al cargar la página, leer parámetro ?q= y buscar automáticamente
(function() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        const input = document.querySelector('.busqueda input');
        if (input) {
            input.value = q;
            buscarProductos(q);
        }
    }
})();
