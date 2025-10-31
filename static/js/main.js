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
const pagarBtn = carritoContenedor.querySelector(".btn");
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

/* ===== MODAL NEQUI ===== */
const modalNequi = document.getElementById("modal-nequi");
const cerrarNequi = document.getElementById("cerrar-nequi");
const totalNequi = document.getElementById("total-nequi");
const btnPagarNequi = document.getElementById("btn-pagar-nequi");
const inputTelefono = document.getElementById("telefono-nequi");
const inputClave = document.getElementById("clave-nequi");
const toggleClave = document.getElementById("toggle-clave");

pagarBtn.addEventListener("click", e => {
  e.preventDefault();
  if (!carrito.length) {
    Swal.fire({title:"Tu carrito está vacío", text:"Agrega productos al carrito", icon:"warning", background:"#000", color:"#fff", confirmButtonColor:"#ff6600", confirmButtonText:"Entendido"});
    return;
  }
  totalNequi.textContent = carrito.reduce((acc,i)=>acc+i.precio*i.cantidad,0).toFixed(2);
  inputTelefono.value = inputClave.value = "";
  modalNequi.style.display = "flex";
  modalNequi.setAttribute("aria-hidden","false");
  inputTelefono.focus();
});

cerrarNequi.addEventListener("click", () => { modalNequi.setAttribute("aria-hidden","true"); modalNequi.style.display = "none"; });
modalNequi.addEventListener("click", e => { if(e.target===modalNequi) { modalNequi.setAttribute("aria-hidden","true"); modalNequi.style.display = "none"; } });

toggleClave.onclick = () => {
  inputClave.type = inputClave.type === "password" ? "text" : "password";
  toggleClave.textContent = inputClave.type==="password" ? "👁️" : "🙈";
  inputClave.focus();
};

function validarTelefono(tel) {
  const clean = tel?.replace(/\s+/g,"")||"";
  return /^(?:3\d{9}|\d{10})$/.test(clean) || /^\+57\d{10}$/.test(clean);
}

function validarClave(clave) {
  return typeof clave==="string" && clave.trim().length>=4;
}

/* ===== MODAL FACTURA ===== */
const modalFactura = document.getElementById("modal-factura");
const facturaCliente = document.getElementById("factura-cliente");
const facturaFecha = document.getElementById("factura-fecha");
const facturaItems = document.getElementById("factura-items");
const facturaTotal = document.getElementById("factura-total");
const btnCerrarFactura = document.getElementById("btn-cerrar-factura");

function mostrarFactura(cliente, items) {
  facturaCliente.textContent = cliente;
  facturaFecha.textContent = new Date().toLocaleString();
  facturaItems.innerHTML = "";
  let total=0;
  items.forEach(item=>{
    const subtotal = item.precio*item.cantidad;
    total+=subtotal;
    facturaItems.innerHTML+=`<tr>
      <td>${item.nombre}</td>
      <td>$${item.precio.toFixed(2)}</td>
      <td>${item.cantidad}</td>
      <td>$${subtotal.toFixed(2)}</td>
    </tr>`;
  });
  facturaTotal.textContent=total.toFixed(2);
  modalFactura.style.display="flex";
  modalFactura.setAttribute("aria-hidden","false");
}

btnCerrarFactura.onclick = () => {
  modalFactura.setAttribute("aria-hidden", "true");
  modalFactura.style.display = "none";
};

// Pagar con Nequi
btnPagarNequi.addEventListener("click", () => {
  const tel = inputTelefono.value.trim();
  const clave = inputClave.value.trim();

  if(!validarTelefono(tel)){ alert("Ingresa un número válido"); inputTelefono.focus(); return; }
  if(!validarClave(clave)){ alert("Ingresa una contraseña válida"); inputClave.focus(); return; }

  mostrarFactura(tel, carrito);

  // Enviar ventas al backend
  fetch('/actualizar_ventas',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({items: carrito})
  });

  // Limpiar carrito
  carrito = [];
  localStorage.removeItem("carrito");
  actualizarCarritoUI();

  // Cerrar modal
  modalNequi.setAttribute("aria-hidden","true");
  modalNequi.style.display="none";
});

/* ===== GRÁFICO DE VENTAS ===== */
const btnVerGrafico = document.getElementById("btn-ver-grafico");
const modalGrafico = document.getElementById("modal-grafico");
const cerrarGrafico = document.getElementById("cerrar-grafico");

if(btnVerGrafico && modalGrafico && cerrarGrafico){
  btnVerGrafico.onclick = e=>{
    e.preventDefault();
    fetch("/graficos")
      .then(res=>{ if(res.ok){
        const img = modalGrafico.querySelector("img");
        if(img) img.src="/static/graficos/ventas.png?cache="+Date.now();
        modalGrafico.style.display="flex";
        modalGrafico.setAttribute("aria-hidden","false");
      }})
      .catch(err=>console.error(err));
  };
  cerrarGrafico.onclick = () => { modalGrafico.style.display="none"; modalGrafico.setAttribute("aria-hidden","true"); };
}
