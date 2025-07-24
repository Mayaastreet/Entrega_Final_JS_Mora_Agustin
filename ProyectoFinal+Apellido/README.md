# Simulador Home Banking

## Descripción

Este proyecto es un simulador interactivo de Home Banking desarrollado con HTML, CSS y JavaScript. Permite realizar operaciones bancarias básicas como transferencias, depósitos y conversión de monedas/criptomonedas, con una interfaz moderna y adaptable a modo claro/oscuro.

## Funcionalidades

- **Login** Acceso mediante usuario y contraseña, con validación de sesión.
- **Panel de usuario** Visualización de datos de la cuenta, saldo actualizado y últimos movimientos.
- **Depósitos** Simulación de depósitos en la cuenta, actualizando el saldo y los movimientos.
- **Transferencias** Realiza transferencias a otros CBU/CVU, descontando el saldo y registrando el movimiento.
- **Convertidor de monedas/criptomonedas** Conversión entre ARS, USD, Bitcoin y Ethereum usando la API de CoinGecko y una tasa fija para USD/ARS.
- **Movimientos** Registro y visualización de los últimos movimientos realizados.
- **Modo claro/oscuro** Cambia el tema visual del sistema y recuerda la preferencia del usuario.
- **Persistencia de datos** El saldo y los movimientos se guardan por usuario en el navegador, por lo que al cerrar sesión y volver a ingresar, la información se mantiene.

## Tecnologías utilizadas

- HTML, CSS, JavaScript
- Bootstrap 
- SweetAlert
- Axios
- CoinGecko API
- FontAwesome

## Estructura de carpetas

```
ProyectoFinal+Apellido/
│
├── index.html
├── login.html
├── styles.css
├── app.js
├── data.json
├── images/
│   └── logo_banco.png
└── README.md
```

## Uso

1. **Abrir `login.html`**  
   Ingresar usuario y contraseña (por defecto: usuario `juan`, contraseña `1234`).

2. **Navegar por el menú lateral**  
   - Inicio: ver saldo, depositar y movimientos.
   - Transferencias: realizar transferencias.
   - Convertidor: convertir entre monedas y criptomonedas.

3. **Cerrar sesión**  
   Utilizar el botón de cerrar sesión en la parte superior derecha.

## Notas

- El sistema simula datos y operaciones, no realiza transacciones reales.
- El saldo y movimientos se guardan en el navegador por usuario.
- Para probar con otros usuarios, edita el archivo `data.json`.
