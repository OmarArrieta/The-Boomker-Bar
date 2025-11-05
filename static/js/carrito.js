// carrito.js
document.addEventListener("DOMContentLoaded", () => {
    const botonesAgregar = document.querySelectorAll(".agregar-carrito");
    const carritoCount = document.querySelector(".carrito-count");

    // Cargar carrito desde localStorage o crear uno vacío
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Función para actualizar el contador (suma las cantidades)
    function actualizarContador() {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        carritoCount.textContent = totalItems;
    }

    // Inicializar contador al cargar la página
    actualizarContador();

    // Función para guardar carrito en localStorage
    function guardarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarContador();
    }

    // Agregar producto al carrito
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();

            const nombre = boton.dataset.nombre;
            const precio = parseFloat(boton.dataset.precio);
            const img = boton.dataset.img;

            // Verificar si ya existe el producto en el carrito
            const itemExistente = carrito.find(item => item.nombre === nombre);

            if (itemExistente) {
                itemExistente.cantidad += 1;
            } else {
                carrito.push({ nombre, precio, img, cantidad: 1 });
            }

            guardarCarrito();

            // Mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Agregado!',
                text: `${nombre} se agregó al carrito`,
                timer: 1000,
                showConfirmButton: false
            });
        });
    });

    // Opcional: función para vaciar carrito (si quieres un botón "vaciar")
    window.vaciarCarrito = () => {
        carrito = [];
        guardarCarrito();
        Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            timer: 1000,
            showConfirmButton: false
        });
    };
});
