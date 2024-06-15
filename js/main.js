document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.querySelector('.products');
    const buttons = document.querySelectorAll('.nav button');
    const carritoBtn = document.querySelector('.carrito');
    const contadorCarrito = document.querySelector('.contador-carrito');
    const carritoPanel = document.querySelector('.carrito-panel');
    const cerrarCarritoBtn = document.querySelector('.cerrar-carrito');
    const carritoBody = document.querySelector('.carrito-body');
    const totalCarrito = document.querySelector('.total-carrito');
    const comprarBtn = document.querySelector('.comprar-btn');

    let productos = [];
    let carrito = [];

    // Cargar productos desde JSON
    fetch('./js/productos.json')
        .then(response => response.json())
        .then(data => {
            productos = data;
            mostrarProductos(productos); // Mostrar todos los productos al cargar la página
            cargarCarritoDesdeLocalStorage(); // Cargar carrito desde localStorage 
        })
        .catch(error => console.error('Error al cargar los productos:', error));

    // Event listener para botones de categorías
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const categoria = button.getAttribute('data-categoria');
            if (categoria === "Todos los productos") {
                mostrarProductos(productos);
            } else {
                const productosFiltrados = productos.filter(producto => producto.categoria.nombre === categoria);
                mostrarProductos(productosFiltrados);
            }
        });
    });

    // Mostrar productos 
    function mostrarProductos(productosAMostrar) {
        productsContainer.innerHTML = ''; // Limpiar productos anteriores
        productosAMostrar.forEach(producto => {
            const productoHTML = `
                <div class="product">
                    <img src="${producto.imagen}" alt="${producto.titulo}" class="product-img">
                    <p class="product-title">${producto.titulo}</p>
                    <p class="product-price">$ ${producto.precio.toFixed(2)}</p>
                    <button class="agregar-btn" data-id="${producto.id}">Agregar</button>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', productoHTML);
        });

        // Event listener para botones de agregar al carrito
        const agregarBotones = document.querySelectorAll('.agregar-btn');
        agregarBotones.forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-id');
                const productoSeleccionado = productos.find(prod => prod.id === productId);
                if (productoSeleccionado) {
                    agregarAlCarrito(productoSeleccionado);
                    guardarCarritoEnLocalStorage();
                }
            });
        });
    }

    // Función para agregar un producto al carrito

    function agregarAlCarrito(producto) {
        Toastify({
            text: "Producto agregado",
            duration: 3000,
            destination: "https://github.com/apvarun/toastify-js",
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #402516, #402516)",
              borderRadius: "0.5rem",
            },
            onClick: function(){} // Callback after click
          }).showToast();
        const encontrado = carrito.find(item => item.id === producto.id);

        if (encontrado) {
            encontrado.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }

        actualizarCarritoUI();
        mostrarCarrito();
    }

    // Función para eliminar un producto del carrito
    function eliminarDelCarrito(productId) {
        const index = carrito.findIndex(item => item.id === productId);

        if (index !== -1) {
            carrito[index].cantidad--;

            if (carrito[index].cantidad === 0) {
                carrito.splice(index, 1);
            }
        }

        actualizarCarritoUI();
        mostrarCarrito();
    }

    // Función para actualizar la interfaz de carrito
    function actualizarCarritoUI() {
        contadorCarrito.textContent = carrito.reduce((total, producto) => total + producto.cantidad, 0).toString();
        guardarCarritoEnLocalStorage();
    }

    // Función para mostrar el carrito
    function mostrarCarrito() {
        carritoBody.innerHTML = '';
        if (carrito.length === 0) {
            carritoBody.innerHTML = '<p>Tu carrito está vacío.</p>';
            totalCarrito.textContent = '';
        } else {
            carrito.forEach(producto => {
                const productoCarrito = document.createElement('div');
                productoCarrito.classList.add('producto-carrito');

                const imagenProducto = document.createElement('img');
                imagenProducto.src = producto.imagen;
                imagenProducto.alt = producto.titulo;
                imagenProducto.classList.add('product-img');
                productoCarrito.appendChild(imagenProducto);

                const infoProducto = document.createElement('div');
                infoProducto.classList.add('producto-info');

                const nombreProducto = document.createElement('h3');
                nombreProducto.textContent = producto.titulo;
                infoProducto.appendChild(nombreProducto);

                const cantidadProducto = document.createElement('p');
                cantidadProducto.textContent = `Cantidad: ${producto.cantidad}`;
                infoProducto.appendChild(cantidadProducto);

                const precioProducto = document.createElement('p');
                precioProducto.textContent = `$ ${(producto.precio * producto.cantidad).toFixed(2)}`;
                infoProducto.appendChild(precioProducto);

                const botonEliminar = document.createElement('button');
                botonEliminar.textContent = 'Eliminar';
                botonEliminar.classList.add('eliminar-btn');
                botonEliminar.addEventListener('click', () => {
                    eliminarDelCarrito(producto.id);
                });
                infoProducto.appendChild(botonEliminar);

                productoCarrito.appendChild(infoProducto);
                carritoBody.appendChild(productoCarrito);
            });

            const total = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
            totalCarrito.textContent = `Total: $ ${total.toFixed(2)}`;
        }

        carritoPanel.classList.add('open');
    }

    // Función para guardar carrito en localStorage
    function guardarCarritoEnLocalStorage() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    // Función para cargar carrito desde localStorage
    function cargarCarritoDesdeLocalStorage() {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            actualizarCarritoUI();
        }
    }

    // Mostrar carrito al hacer clic en el botón de carrito
    carritoBtn.addEventListener('click', () => {
        mostrarCarrito();
    });

    // Cerrar carrito al hacer clic en el botón de cerrar
    cerrarCarritoBtn.addEventListener('click', () => {
        carritoPanel.classList.remove('open');
    });

    // Comprar carrito al hacer clic en el botón de comprar
    comprarBtn.addEventListener('click', () => {
        Swal.fire({
            title: "Compra realizada!",
            text: "Gracias por confiar en nuestros productos",
            imageUrl: "/img/Final.jpg",
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: "Custom image",
            customClass: {
            confirmButton: 'mi-clase-btn-confirm'
            }
          });
        carrito = [];
        actualizarCarritoUI();
        mostrarCarrito();
        carritoPanel.classList.remove('open');
    });
});
