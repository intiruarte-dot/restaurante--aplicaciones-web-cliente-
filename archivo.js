// Array global para almacenar los productos en memoria
        let carrito = [];

        // Escuchar clics en todos los botones que tengan la clase 'btn-add'
        document.querySelectorAll('.btn-add').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const nombre = e.target.getAttribute('data-nombre');
                const precio = parseFloat(e.target.getAttribute('data-precio'));

                agregarAlCarrito(id, nombre, precio);
            });
        });

        function agregarAlCarrito(id, nombre, precio) {
            // Verificar si el producto ya existe en el carrito
            const itemExistente = carrito.find(item => item.id === id);

            if (itemExistente) {
                itemExistente.cantidad++;
            } else {
                carrito.push({ id, nombre, precio, cantidad: 1 });
            }

            actualizarInterfaz();
            
            // Animación sencilla o aviso al usuario
            alert(`"${nombre}" se agregó correctamente al carrito.`);
        }

        function cambiarCantidad(id, cambio) {
            const item = carrito.find(item => item.id === id);
            if (item) {
                item.cantidad += cambio;
                if (item.cantidad <= 0) {
                    // Si llega a cero, lo removemos del array
                    carrito = carrito.filter(i => i.id !== id);
                }
            }
            actualizarInterfaz();
        }

        function actualizarInterfaz() {
            // 1. Actualizar contador del botón flotante
            const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            document.getElementById('contador-carrito').innerText = totalItems;

            // 2. Renderizar la lista del carrito dentro del modal
            const listaHTML = document.getElementById('lista-carrito');
            if (carrito.length === 0) {
                listaHTML.innerHTML = `<p style="color:#777;">El carrito está vacío.</p>`;
                document.getElementById('total-precio').innerText = "0.00";
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
                            <small>$${item.precio} c/u</small>
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
            document.getElementById('total-precio').innerText = subtotalGral.toFixed(2);
        }

        function procesarPago(event) {
            event.preventDefault(); // Evita que la página recargue el formulario

            if(carrito.length === 0) {
                alert("Tu carrito está vacío. Agrega productos antes de pagar.");
                window.location.href = "#";
                return;
            }

            // Simulación de pasarela de pago (Ej. lo que haría Stripe o Mercado Pago en background)
            // Genera un número de pedido randomizado
            const numPedidoRandom = Math.floor(100000 + Math.random() * 900000);
            document.getElementById('num-pedido').innerText = numPedidoRandom;

            // Redireccionar al modal de éxito de forma nativa mediante el hash id
            window.location.href = "#ventana-exito";
        }

        function vaciarCarrito() {
            carrito = [];
            actualizarInterfaz();
            document.getElementById('checkout-form').reset();
            window.location.href = "#"; // Cierra cualquier ventana modal regresando al Inicio
        }