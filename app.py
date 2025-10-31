from flask import Flask, render_template
import matplotlib.pyplot as plt
import os
from flask import request, jsonify

app = Flask(__name__)

RUTA_TXT = os.path.join('templates', 'ventas.txt')
RUTA_GRAFICO = os.path.join('static', 'graficos', 'ventas.png')

def leer_ventas():
    productos = []
    ventas = []
    if os.path.exists(RUTA_TXT):
        with open(RUTA_TXT, 'r', encoding='utf-8') as f:
            for linea in f:
                if ',' in linea:
                    nombre, cantidad = linea.strip().split(',')
                    productos.append(nombre)
                    ventas.append(int(cantidad))
    return productos, ventas

def guardar_ventas(producto, cantidad):
    # Leer ventas actuales
    productos, ventas = leer_ventas()
    if producto in productos:
        idx = productos.index(producto)
        ventas[idx] += cantidad
    else:
        productos.append(producto)
        ventas.append(cantidad)
    
    # Guardar de nuevo en ventas.txt
    with open(RUTA_TXT, 'w', encoding='utf-8') as f:
        for p, v in zip(productos, ventas):
            f.write(f"{p},{v}\n")

def generar_grafico():
    productos, ventas = leer_ventas()
    if not productos:
        return
    plt.figure(figsize=(6,4))
    plt.bar(productos, ventas, color='crimson')
    plt.title('Ventas del Bar The Boomker')
    plt.xlabel('Producto')
    plt.ylabel('Cantidad vendida')
    plt.xticks(rotation=30, ha='right')
    os.makedirs(os.path.dirname(RUTA_GRAFICO), exist_ok=True)
    plt.tight_layout()
    plt.savefig(RUTA_GRAFICO)
    plt.close()

@app.route('/')
def index():
    return render_template('index.html', mostrar_grafico=False)

@app.route('/graficos')
def graficos():
    generar_grafico()
    return ('', 204)

@app.route('/actualizar_ventas', methods=['POST'])
def actualizar_ventas():
    data = request.get_json()
    items = data.get("items", [])
    for item in items:
        nombre = item.get("nombre")
        cantidad = int(item.get("cantidad", 1))
        guardar_ventas(nombre, cantidad)
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True)

