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

// ============================================
// LOGIN / LOGOUT
// ============================================

const USUARIO_KEY = 'usuario_actual';

function loginCliente() {
    const nombre = prompt('Ingresa tu nombre:');
    if (nombre) {
        const usuario = { tipo: 'cliente', nombre: nombre };
        localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
        window.location.href = '#';
        actualizarEstadoLogin();
        alert('Bienvenido ' + nombre + '!');
    }
}

function loginAdmin() {
    const pass = prompt('Contraseña de administrador:');
    if (pass === 'admin123') {
        const usuario = { tipo: 'admin', nombre: 'Administrador' };
        localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
        window.location.href = '#';
        actualizarEstadoLogin();
        alert('Bienvenido Administrador!');
    } else if (pass !== null) {
        alert('Contraseña incorrecta');
    }
}

function logout() {
    localStorage.removeItem(USUARIO_KEY);
    window.location.href = '#';
    actualizarEstadoLogin();
}

function actualizarEstadoLogin() {
    const datos = localStorage.getItem(USUARIO_KEY);
    let botonLogin = document.querySelector('.btn-login');
    let botonAlta = document.getElementById('btn-flotante-alta');
    let seccionProductosUsuario = document.getElementById('productos-usuario');

    if (datos) {
        const usuario = JSON.parse(datos);
        if (botonLogin) {
            botonLogin.textContent = '👤';
            botonLogin.title = 'Cerrar sesión (' + usuario.nombre + ')';
            botonLogin.onclick = function() {
                if (confirm('Cerrar sesión?')) logout();
            };
        }
        if (usuario.tipo === 'admin') {
            if (botonAlta) botonAlta.style.display = 'block';
            if (seccionProductosUsuario) seccionProductosUsuario.style.display = 'block';
        }
    } else {
        if (botonLogin) {
            botonLogin.textContent = '🔐';
            botonLogin.title = 'Iniciar sesión';
            botonLogin.onclick = function() { window.location.href = '#login-modal'; };
        }
        if (botonAlta) botonAlta.style.display = 'none';
        if (seccionProductosUsuario) seccionProductosUsuario.style.display = 'none';
    }
}

// ============================================
// ALTA DE PRODUCTO
// ============================================

const PRODUCTOS_KEY = 'productos_usuario';

function guardarProducto(event) {
    event.preventDefault();

    const nombre = document.getElementById('prod-nombre').value.trim();
    const descripcion = document.getElementById('prod-descripcion').value.trim();
    const precio = parseFloat(document.getElementById('prod-precio').value);
    const imagen = document.getElementById('prod-imagen').value.trim() || 'https://via.placeholder.com/300x200/3498db/ffffff?text=Nuevo+Producto';

    if (!nombre || !descripcion || isNaN(precio)) return;

    const producto = {
        id: 'user_' + Date.now(),
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        imagen: imagen
    };

    let productos = JSON.parse(localStorage.getItem(PRODUCTOS_KEY) || '[]');
    productos.push(producto);
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));

    document.getElementById('form-alta').reset();
    window.location.href = '#';
    renderizarProductosUsuario();
    alert('Producto "' + nombre + '" agregado correctamente!');
}

function renderizarProductosUsuario() {
    const contenedor = document.getElementById('contenedor-productos-usuario');
    if (!contenedor) return;

    const productos = JSON.parse(localStorage.getItem(PRODUCTOS_KEY) || '[]');
    const seccion = document.getElementById('productos-usuario');
    const titulo = seccion ? seccion.querySelector('h2') : null;

    if (productos.length === 0) {
        contenedor.innerHTML = '<p style="color:#666;text-align:center;width:100%;padding:20px;">Aún no has agregado productos.</p>';
        if (titulo) titulo.textContent = 'Productos Agregados Recientemente';
        return;
    }

    if (titulo) titulo.textContent = 'Productos Agregados (' + productos.length + ')';

    let html = '';
    productos.forEach(p => {
        html += `
            <article style="background:white;border-radius:10px;padding:20px;width:280px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center;">
                <img src="${p.imagen}" alt="${p.nombre}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:15px;background:#ecf0f1;">
                <h3 style="font-size:18px;color:#2c3e50;margin-bottom:10px;">${p.nombre}</h3>
                <p style="font-size:14px;color:#7f8c8d;margin-bottom:10px;">${p.descripcion}</p>
                <p style="font-size:20px;color:#27ae60;font-weight:bold;margin-bottom:15px;">$${p.precio.toFixed(2)}</p>
                <button class="btn-add" data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio}" style="background:#3498db;color:white;border:none;padding:10px 25px;border-radius:5px;cursor:pointer;">Agregar al carrito</button>
                <button onclick="eliminarProductoUsuario('${p.id}')" style="background:#e74c3c;color:white;border:none;padding:8px 20px;border-radius:5px;cursor:pointer;margin-top:8px;font-size:13px;">Eliminar</button>
            </article>
        `;
    });

    contenedor.innerHTML = html;
}

function eliminarProductoUsuario(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    let productos = JSON.parse(localStorage.getItem(PRODUCTOS_KEY) || '[]');
    const producto = productos.find(p => p.id === id);
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
    renderizarProductosUsuario();
    if (producto) alert('Producto "' + producto.nombre + '" eliminado.');
}

// Inicializar estado de login y productos de usuario
actualizarEstadoLogin();
renderizarProductosUsuario();
