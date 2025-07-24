const app = document.getElementById('app');
let usuarios = [];
let movimientos = [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
let saldo = usuarioActual.cuentas ? usuarioActual.cuentas[0].saldo : 0;

function setTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    document.getElementById('toggle-theme').innerHTML = dark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', dark ? '1' : '0');
}
document.getElementById('toggle-theme').onclick = () => {
    setTheme(!document.body.classList.contains('dark-mode'));
};
setTheme(localStorage.getItem('darkMode') === '1');

async function cargarDatos() {
    try {
        const res = await fetch('data.json');
        const data = await res.json();
        usuarios = data.usuarios;
        movimientos = data.movimientos;
    } catch (e) {
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
}

function setupLogin() {
    const overlay = document.getElementById('login-overlay');
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    togglePassword.onclick = function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
        }
    };
    form.onsubmit = function(e) {
        e.preventDefault();
        const usuario = form.usuario.value;
        const password = form.password.value;
        usuarioActual = usuarios.find(u => u.usuario === usuario && u.password === password);
        if (usuarioActual) {
            overlay.style.display = 'none';
            Swal.fire('Bienvenido', usuarioActual.nombre, 'success');
            renderDashboard();
        } else {
            Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
        }
    };
}

function renderLogin() {
    app.innerHTML = `
    <div class="container mt-5">
        <div class="card p-4 mx-auto" style="max-width:400px;">
            <h2 class="mb-3">Home Banking</h2>
            <form id="loginForm">
                <div class="mb-3">
                    <label>Usuario</label>
                    <input type="text" class="form-control" name="usuario" value="juan">
                </div>
                <div class="mb-3">
                    <label>Contraseña</label>
                    <div class="input-group">
                        <input type="password" class="form-control" name="password" value="1234" id="password">
                        <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <button class="btn btn-primary w-100" type="submit">Ingresar</button>
            </form>
        </div>
    </div>
    `;
    setupLogin();
}

function renderDashboard() {
    const cuentas = usuarioActual.cuentas.map(c => `
        <div class="card">
            <div class="card-body">
                <h5>${c.tipo} (${c.moneda})</h5>
                <p>Saldo: $${c.saldo.toLocaleString()}</p>
                <p>CBU: ${c.cbu}</p>
            </div>
        </div>
    `).join('');
    app.innerHTML = `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Hola, ${usuarioActual.nombre}</h3>
            <button class="btn btn-danger" id="logout"><i class="fas fa-sign-out-alt"></i> Salir</button>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h5>Cuentas</h5>
                ${cuentas}
                <button class="btn btn-success mt-2" id="btnTransferir">Transferir</button>
                <button class="btn btn-info mt-2" id="btnDepositar">Depositar</button>
                <button class="btn btn-warning mt-2" id="btnExtraer">Extraer</button>
            </div>
            <div class="col-md-6">
                <h5>Convertidor de monedas/cripto</h5>
                <div id="convertidor"></div>
            </div>
        </div>
        <h5 class="mt-4">Últimos movimientos</h5>
        <ul class="list-group" id="movimientos"></ul>
    </div>
    `;
    document.getElementById('logout').onclick = () => {
        usuarioActual = null;
        renderLogin();
    };
    document.getElementById('btnTransferir').onclick = transferir;
    document.getElementById('btnDepositar').onclick = depositar;
    document.getElementById('btnExtraer').onclick = extraer;
    renderMovimientos();
    renderConvertidor();
}

window.renderView = function(view) {
    if (view === "inicio") renderInicio();
    else if (view === "transferencias") renderTransferencias();
    else if (view === "convertidor") renderConvertidor();
    else renderInicio();
};

function renderInicio() {
    document.getElementById('app').innerHTML = `
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title mb-2">Cuenta: ${usuarioActual.cuentas[0].tipo} (${usuarioActual.cuentas[0].moneda})</h5>
                <p class="card-text mb-1"><strong>CBU:</strong> ${usuarioActual.cuentas[0].cbu}</p>
                <p class="card-text mb-1"><strong>Saldo actual:</strong> $<span id="saldo-cuenta">${saldo.toLocaleString()}</span></p>
                <button class="btn btn-success mt-2" id="btnDepositar"><i class="fas fa-arrow-down"></i> Depositar</button>
            </div>
        </div>
        <div>
            <h6>Últimos movimientos</h6>
            <ul class="list-group" id="movimientos"></ul>
        </div>
    `;
    document.getElementById('btnDepositar').onclick = depositar;
    renderMovimientos();
}

function renderTransferencias() {
    document.getElementById('app').innerHTML = `
        <div class="card mx-auto" style="max-width:400px;">
            <div class="card-body">
                <h5 class="card-title mb-3">Transferir dinero</h5>
                <form id="formTransferir">
                    <div class="mb-3">
                        <label class="form-label">CBU/CVU destino</label>
                        <input type="text" class="form-control" id="cbuDestino" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Monto a transferir</label>
                        <input type="number" class="form-control" id="montoTransferir" min="1" required>
                    </div>
                    <button class="btn btn-primary w-100" type="submit">Transferir</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('formTransferir').onsubmit = function(e) {
        e.preventDefault();
        const monto = parseFloat(document.getElementById('montoTransferir').value);
        if (isNaN(monto) || monto <= 0) {
            Swal.fire('Error', 'Monto inválido', 'error');
            return;
        }
        if (saldo < monto) {
            Swal.fire('Error', 'Saldo insuficiente', 'error');
            return;
        }
        saldo -= monto;
        usuarioActual.cuentas[0].saldo = saldo;
        guardarMovimiento('Transferencia', monto);
        guardarUsuarioActual();
        Swal.fire('Éxito', 'Transferencia realizada', 'success');
        renderTransferencias();
    };
}

function renderConvertidor() {
    document.getElementById('app').innerHTML = `
        <div class="card mx-auto" style="max-width:500px;">
            <div class="card-body">
                <h5 class="card-title mb-3">Convertidor de monedas/criptomonedas</h5>
                <form id="formConvertir" class="row g-2">
                    <div class="col-12 col-md-4">
                        <input type="number" class="form-control" id="montoConvertir" value="1000" min="1" required>
                    </div>
                    <div class="col-6 col-md-4">
                        <select class="form-select" id="monedaOrigen">
                            <option value="ars">ARS</option>
                            <option value="usd">USD</option>
                            <option value="bitcoin">BTC</option>
                            <option value="ethereum">ETH</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-4">
                        <select class="form-select" id="monedaDestino">
                            <option value="usd">USD</option>
                            <option value="ars">ARS</option>
                            <option value="bitcoin">BTC</option>
                            <option value="ethereum">ETH</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-primary w-100" type="submit">Convertir</button>
                    </div>
                </form>
                <div id="resultadoConvertidor" class="mt-3"></div>
            </div>
        </div>
    `;
    document.getElementById('formConvertir').onsubmit = async function(e) {
        e.preventDefault();
        const monto = parseFloat(document.getElementById('montoConvertir').value);
        const origen = document.getElementById('monedaOrigen').value;
        const destino = document.getElementById('monedaDestino').value;
        if (origen === destino) {
            document.getElementById('resultadoConvertidor').innerText = 'Selecciona monedas diferentes';
            return;
        }
        try {
            let resultado = await convertirMoneda(monto, origen, destino);
            document.getElementById('resultadoConvertidor').innerText = `${monto} ${origen.toUpperCase()} = ${resultado} ${destino.toUpperCase()}`;
        } catch {
            document.getElementById('resultadoConvertidor').innerText = 'Error al obtener cotización';
        }
    };
}


async function convertirMoneda(monto, origen, destino) {
    const ids = { ars: 'ars', usd: 'usd', bitcoin: 'bitcoin', ethereum: 'ethereum' };
    const vs = { ars: 'ars', usd: 'usd', bitcoin: 'btc', ethereum: 'eth' };
    if ((origen === 'ars' || origen === 'usd') && (destino === 'ars' || destino === 'usd')) {
        const tasa = 1290;
        if (origen === 'usd' && destino === 'ars') return (monto * tasa).toFixed(2);
        if (origen === 'ars' && destino === 'usd') return (monto / tasa).toFixed(2);
    }
    if ((origen === 'ars' || origen === 'usd') && (destino === 'bitcoin' || destino === 'ethereum')) {
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${destino}&vs_currencies=${vs[origen]}`);
        const precio = res.data[destino][vs[origen]];
        return (monto / precio).toFixed(8);
    }
    if ((origen === 'bitcoin' || origen === 'ethereum') && (destino === 'ars' || destino === 'usd')) {
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${origen}&vs_currencies=${vs[destino]}`);
        const precio = res.data[origen][vs[destino]];
        return (monto * precio).toFixed(2);
    }
    if ((origen === 'bitcoin' || origen === 'ethereum') && (destino === 'bitcoin' || destino === 'ethereum')) {
        const res1 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${origen}&vs_currencies=usd`);
        const res2 = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${destino}&vs_currencies=usd`);
        const origenUsd = res1.data[origen].usd;
        const destinoUsd = res2.data[destino].usd;
        return ((monto * origenUsd) / destinoUsd).toFixed(8);
    }
    throw new Error('Conversión no soportada');
}

function depositar() {
    Swal.fire({
        title: 'Depositar',
        input: 'number',
        inputLabel: 'Monto',
        inputValue: 1000,
        showCancelButton: true,
        preConfirm: (monto) => {
            monto = parseFloat(monto);
            if (isNaN(monto) || monto <= 0) {
                Swal.showValidationMessage('Monto inválido');
                return false;
            }
            return monto;
        }
    }).then(res => {
        if (res.isConfirmed) {
            saldo += res.value;
            usuarioActual.cuentas[0].saldo = saldo;
            guardarMovimiento('Depósito', res.value);
            guardarUsuarioActual();
            renderInicio();
            Swal.fire('Éxito', 'Depósito realizado', 'success');
        }
    });
}

function guardarMovimiento(tipo, monto) {
    let movs = JSON.parse(localStorage.getItem('movimientos') || '[]');
    movs.unshift({
        tipo,
        monto,
        fecha: new Date().toLocaleString('es-AR')
    });
    localStorage.setItem('movimientos', JSON.stringify(movs.slice(0, 10)));
}
function renderMovimientos() {
    let movs = JSON.parse(localStorage.getItem('movimientos') || '[]');
    const ul = document.getElementById('movimientos');
    if (!ul) return;
    ul.innerHTML = movs.length
        ? movs.map(m => `<li class="list-group-item">${m.fecha} - ${m.tipo}: $${m.monto}</li>`).join('')
        : '<li class="list-group-item">Sin movimientos recientes</li>';
}

function guardarUsuarioActual() {
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    if (usuarioActual && usuarioActual.id) {
        localStorage.setItem('saldo_' + usuarioActual.id, usuarioActual.cuentas[0].saldo);
        localStorage.setItem('movimientos_' + usuarioActual.id, JSON.stringify(JSON.parse(localStorage.getItem('movimientos') || '[]')));
    }
}
function restaurarEstadoUsuario() {
    if (usuarioActual && usuarioActual.id) {
        const saldoGuardado = localStorage.getItem('saldo_' + usuarioActual.id);
        if (saldoGuardado !== null) {
            usuarioActual.cuentas[0].saldo = parseFloat(saldoGuardado);
            saldo = usuarioActual.cuentas[0].saldo;
        }
        const movsGuardados = localStorage.getItem('movimientos_' + usuarioActual.id);
        if (movsGuardados) {
            localStorage.setItem('movimientos', movsGuardados);
        }
    }
}
document.addEventListener('DOMContentLoaded', function() {
    restaurarEstadoUsuario();
    window.renderView('inicio');
});