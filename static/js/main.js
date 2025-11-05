/* ===== NAVBAR, BUSCAR Y CARRITO ===== */
const navbar = document.querySelector(".navbar");
const buscarFormulario = document.querySelector(".buscar-formulario");
const cartaItem = document.querySelector(".carta-items-contenedor");

document.querySelector("#menu-btn").onclick = () => toggleMenu(navbar);
document.querySelector("#buscar-btn").onclick = () => toggleMenu(buscarFormulario);
document.querySelector("#carrito-btn").onclick = () => toggleMenu(cartaItem);

window.onscroll = () => closeAll();

function toggleMenu(element) {
  element.classList.toggle("active");
  [navbar, buscarFormulario, cartaItem].forEach(el => { if (el !== element) el.classList.remove("active"); });
}

function closeAll() {
  [navbar, buscarFormulario, cartaItem].forEach(el => el.classList.remove("active"));
}

/* ===== LOGIN MODAL ===== */
const loginModal = document.querySelector("#login-modal");
document.querySelector("#login-btn").onclick = e => {
  e.preventDefault();
  loginModal.classList.toggle("active");
};
loginModal.onclick = e => { if (e.target === loginModal) loginModal.classList.remove("active"); };

/* ===== CARRITO ===== */
const carritoContenedor = document.querySelector(".carta-items-contenedor");
const pagarBtn = carritoContenedor.querySelector(".btn-pse");
const carritoCount = document.querySelector(".carrito-count");
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Contenedor del total
const totalContainer = document.createElement("div");
totalContainer.classList.add("carrito-total");
carritoContenedor.insertBefore(totalContainer, pagarBtn);

// Guardar carrito en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Actualizar carrito en el DOM
function actualizarCarritoUI() {
  carritoContenedor.querySelectorAll(".carta-item").forEach(item => item.remove());
  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const div = document.createElement("div");
    div.classList.add("carta-item");
    div.innerHTML = `
      <span class="fas fa-times"></span>
      <img src="${item.img}" alt="${item.nombre}">
      <div class="contenido">
        <h3>${item.nombre}</h3>
        <div class="precio">$${subtotal.toFixed(2)}</div>
        <div class="cantidad">${item.cantidad}</div>
      </div>
    `;

    div.querySelector(".fa-times").onclick = () => {
      if(item.cantidad > 1) item.cantidad--;
      else carrito = carrito.filter(i => i.nombre !== item.nombre);
      guardarCarrito();
      actualizarCarritoUI();
    };

    carritoContenedor.insertBefore(div, pagarBtn);
  });

  carritoCount.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  totalContainer.textContent = `Total: $${total.toFixed(2)}`;
}

// Agregar producto al carrito
function agregarAlCarrito(nombre, precioStr, img) {
  Swal.fire({
    title: "Agregar al carrito?",
    icon: "question",
    iconHtml: '<i class="fas fa-shopping-cart" style="font-size:30px;color:#ff6600;"></i>',
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    showCancelButton: true,
    showCloseButton: true,
    background: "#333",
    color: "#fff",
    confirmButtonColor: "#ff6600",
    cancelButtonColor: "#aaa"
  }).then(result => {
    if (result.isConfirmed) {
      const precio = parseFloat(precioStr.replace("$","").replace(/\./g,"").replace(/,/g,".")) || 0;
      const itemExistente = carrito.find(i => i.nombre === nombre);
      if (itemExistente) itemExistente.cantidad++;
      else carrito.push({nombre, precio, img, cantidad:1});
      guardarCarrito();
      actualizarCarritoUI();
      Swal.fire({title:"Agregado al carrito", icon:"success", background:"#000", color:"#fff", timer:1200, showConfirmButton:false});
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({title:"Cancelado", text:"No se agregó al carrito", icon:"info", background:"#000", color:"#fff", timer:1000, showConfirmButton:false});
    }
  });
}

// Botones agregar
document.querySelectorAll(".agregar-carrito").forEach(btn =>
  btn.addEventListener("click", e => {
    e.preventDefault();
    agregarAlCarrito(btn.dataset.nombre, btn.dataset.precio, btn.dataset.img);
  })
);

// Inicializar carrito al cargar
document.addEventListener("DOMContentLoaded", actualizarCarritoUI);

// === MODAL PSE ===
const modalPSE = document.getElementById("modal-pse");
const btnPSE = document.querySelector(".btn-pse");
const cerrarPSE = document.getElementById("cerrar-pse");
const totalPSE = document.getElementById("total-pse");

// === MODAL FACTURA ===
const modalFactura = document.getElementById("modal-factura");
const btnCerrarFactura = document.getElementById("btn-cerrar-factura");
const btnCerrarFactura2 = document.getElementById("btn-cerrar-factura2");

// Traer carrito desde localStorage
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

function calcularTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

// === Abrir modal PSE ===
btnPSE?.addEventListener("click", (e) => {
  e.preventDefault();
  const total = calcularTotal();
  if (total <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Tu carrito está vacío",
      text: "Agrega productos antes de pagar",
      confirmButtonColor: "#ff6600"
    });
    return;
  }
  document.getElementById("total-pse").textContent = total.toFixed(2);
  modalPSE.style.display = "block";
  modalPSE.setAttribute("aria-hidden", "false");
});

// === Cerrar modal PSE ===
cerrarPSE?.addEventListener("click", () => {
  modalPSE.style.display = "none";
  modalPSE.setAttribute("aria-hidden", "true");
});

// === Elegir banco ===
document.querySelectorAll(".opcion-banco").forEach(boton => {
  boton.addEventListener("click", () => {
    const banco = boton.dataset.banco;
    generarFactura(banco);
    modalPSE.style.display = "none";
  });
});

// === Generar factura ===
function generarFactura(banco) {
  const carrito = obtenerCarrito();
  const total = calcularTotal();
  const facturaItems = document.getElementById("factura-items");
  facturaItems.innerHTML = "";

  carrito.forEach(item => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>$${item.precio}</td>
      <td>${item.cantidad}</td>
      <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
    `;
    facturaItems.appendChild(fila);
  });

  document.getElementById("factura-total").textContent = total.toFixed(2);
  document.getElementById("factura-cliente").textContent = "Cliente invitado";
  document.getElementById("factura-fecha").textContent = new Date().toLocaleString();

  modalFactura.style.display = "block";
  modalFactura.setAttribute("aria-hidden", "false");

  Swal.fire({
    icon: "success",
    title: 'Pago exitoso con ${banco}',
    text: "Tu factura ha sido generada.",
    confirmButtonColor: "#4CAF50"
  });

  // Limpia el carrito (opcional)
  localStorage.removeItem("carrito");
  document.querySelector(".carrito-count").textContent = "0";
}

// === Cerrar factura ===
[btnCerrarFactura, btnCerrarFactura2].forEach(btn => {
  btn?.addEventListener("click", () => {
    modalFactura.style.display = "none";
    modalFactura.setAttribute("aria-hidden", "true");
  });
});


 