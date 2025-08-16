// ================= Config =================
const API_BASE = "https://censopoblacion.azurewebsites.net/API/indicadores/2/";


const LABELS = {
  alfabetismo: "Índice de alfabetismo (%)",
  anios_prom_estudio: "Años promedio de estudio",
  capital: "Capital",
  depto_id: "Código de departamento",
  edad_promedio: "Edad promedio",
  ext_territorial: "Extensión territorial (km²)",
  id: "ID interno",
  indice_dependencia: "Índice de dependencia (%)",
  indice_masculinidad: "Índice de masculinidad",
  municipio_id: "Código de municipio",
  nombre: "Nombre del municipio",
  pob_edad_014: "Población 0–14 años",
  pob_edad_1564: "Población 15–64 años",
  pob_edad_65: "Población 65+ años",
  pob_pueblo_afrodescendiente: "Población afrodescendiente",
  pob_pueblo_extranjero: "Población extranjera",
  pob_pueblo_garifuna: "Población garífuna",
  pob_pueblo_ladino: "Población ladina",
  pob_pueblo_maya: "Población maya",
  pob_pueblo_xinca: "Población xinca",
  pob_total: "Población total",
  porc_edad_014: "% 0–14 años",
  porc_edad_1564: "% 15–64 años",
  porc_edad_65: "% 65+ años",
  porc_pueblo_afrodescendiente: "% afrodescendiente",
  porc_pueblo_extranjero: "% extranjero",
  porc_pueblo_garifuna: "% garífuna",
  porc_pueblo_ladino: "% ladino",
  porc_pueblo_maya: "% maya",
  porc_pueblo_xinca: "% xinca",
  total_sector_urbano: "Población urbana",
  total_sector_rural: "Población rural",
  porc_sector_urbano: "% urbana",
  porc_sector_rural: "% rural",
  total_sexo_hombre: "Total hombres",
  total_sexo_mujeres: "Total mujeres",
  porc_sexo_hombre: "% hombres",
  porc_sexo_mujeres: "% mujeres",
  prom_hijos_mujer: "Promedio de hijos por mujer",
  prom_personas_hogar: "Promedio de personas por hogar",
  total_hogares: "Total de hogares",
  viviendas_part: "Viviendas particulares"
};

// Ajusta a tus códigos reales
const CODIGOS = {
  "201": "Guastatoya",
  "202": "San Agustín Acasaguastlán",
  "203": "San Cristóbal Acasaguastlán",
  "204": "El Jícaro",
  "205": "Morazán",
  "206": "Sanarate",
  "207": "Sansare",
  "208": "San Antonio La Paz",
  // Si tienes un código departamental (p. ej., 999), agrégalo aquí:
  // "999": "Departamento de El Progreso"
};

// ================= DOM refs =================
const sel = document.getElementById("selectMunicipio");
const btn = document.getElementById("btnActualizar");
const estado = document.getElementById("estado");
const cards = document.getElementById("cardsResumen");
const tbody = document.querySelector("#tablaTodo tbody");
const btnCopiar = document.getElementById("btnCopiar");
const pieSexo   = document.getElementById("pieSexo");
const legendSexo= document.getElementById("legendSexo");
const pieArea   = document.getElementById("pieArea");
const legendArea= document.getElementById("legendArea");
const pieEdad   = document.getElementById("pieEdad");
const legendEdad= document.getElementById("legendEdad");



// Barras (Bootstrap)
const el = (id) => document.getElementById(id);
const barSexo = { hombres: el("pbHombres"), mujeres: el("pbMujeres") };
const labSexo = { hombres: el("lbHombres"), mujeres: el("lbMujeres"), total: el("lbTotalSexo") };
const barEdad = { e014: el("pb014"), e1564: el("pb1564"), e65: el("pb65") };
const labEdad = { e014: el("lb014"), e1564: el("lb1564"), e65: el("lb65"), total: el("lbTotalEdades") };

// ================= Init =================
(function init() {
  sel.innerHTML = Object.entries(CODIGOS)
    .map(([cod, nom]) => `<option value="${cod}">${nom}</option>`)
    .join("");

  // Por defecto usa 201 (seguro devuelve datos). Cambia si quieres otro.
  sel.value = CODIGOS["201"] ? "201" : Object.keys(CODIGOS)[0];
  cargar();
})();
btn.addEventListener("click", cargar);

// ================= Core =================
async function cargar() {
  const codigo = sel.value;
  limpiarUI();
  setEstado("Cargando datos…", "info");

  try {
    const res = await fetch(API_BASE + codigo);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    let data = await res.json();

    // Normaliza si viene como string o arreglo
    if (Array.isArray(data)) data = data[0] ?? {};
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch {}
    }

    renderResumen(data);
    renderBarras(data);
    renderTabla(data);
    renderPasteles(data);

    

    setEstado(`Datos para ${CODIGOS[codigo]} (código ${codigo}).`, "success");
  } catch (e) {
    console.error(e);
    setEstado("No se pudieron cargar los datos. Verifica el código o la conexión.", "danger");
  }
}

function limpiarUI() {
  cards.innerHTML = "";
  tbody.innerHTML = "";
  setEstado("", "info", true);
}

function setEstado(msg, type = "info", hide = false) {
  estado.className = `alert alert-${type}` + (hide ? " d-none" : "");
  estado.textContent = hide ? "" : msg;
}

// ============= Render: tarjetas resumen =============
function renderResumen(d) {
  const total   = num(d.pob_total ?? d.total_poblacion ?? d.total ?? 0);
  const hombres = num(d.total_sexo_hombre ?? d.hombres ?? 0);
  const mujeres = num(d.total_sexo_mujeres ?? d.mujeres ?? 0);

  const e014  = num(d.pob_edad_014 ?? 0);
  const e1564 = num(d.pob_edad_1564 ?? 0);
  const e65   = num(d.pob_edad_65 ?? 0);

  const urbana = num(d.total_sector_urbano ?? d.urbana ?? 0);
  const rural  = num(d.total_sector_rural  ?? d.rural  ?? 0);

  const items = [
    { title: "Población total", value: fmt(total) },
    { title: "Hombres", value: fmt(hombres) },
    { title: "Mujeres", value: fmt(mujeres) },
    { title: "0–14 años", value: fmt(e014) },
    { title: "15–64 años", value: fmt(e1564) },
    { title: "65+ años", value: fmt(e65) },
    { title: "Urbana", value: fmt(urbana) },
    { title: "Rural", value: fmt(rural) }
  ];

  cards.innerHTML = items.map(cardHtml).join("");
}

function cardHtml(it) {
  return `
    <div class="col-6 col-md-3">
      <div class="card text-center h-100">
        <div class="card-body">
          <div class="text-muted">${it.title}</div>
          <div class="fs-4 fw-semibold">${it.value}</div>
        </div>
      </div>
    </div>`;
}

// ============= Render: barras (Bootstrap) =============
function renderBarras(d) {
  const hombres = num(d.total_sexo_hombre ?? 0);
  const mujeres = num(d.total_sexo_mujeres ?? 0);
  const totalSexo = hombres + mujeres;

  labSexo.hombres.textContent = fmt(hombres);
  labSexo.mujeres.textContent = fmt(mujeres);
  labSexo.total.textContent   = fmt(totalSexo);

  const pH = totalSexo ? Math.round((hombres / totalSexo) * 100) : 0;
  const pM = totalSexo ? Math.round((mujeres / totalSexo) * 100) : 0;

  barSexo.hombres.style.width = pH + "%";
  barSexo.hombres.textContent = pH + "%";
  barSexo.mujeres.style.width = pM + "%";
  barSexo.mujeres.textContent = pM + "%";

  const e014  = num(d.pob_edad_014 ?? 0);
  const e1564 = num(d.pob_edad_1564 ?? 0);
  const e65   = num(d.pob_edad_65 ?? 0);
  const totalE = e014 + e1564 + e65;

  labEdad.e014.textContent  = fmt(e014);
  labEdad.e1564.textContent = fmt(e1564);
  labEdad.e65.textContent   = fmt(e65);
  labEdad.total.textContent = fmt(totalE);

  const p014  = totalE ? Math.round((e014  / totalE) * 100) : 0;
  const p1564 = totalE ? Math.round((e1564 / totalE) * 100) : 0;
  const p65   = totalE ? Math.round((e65   / totalE) * 100) : 0;

  barEdad.e014.style.width  = p014 + "%";
  barEdad.e014.textContent  = p014 + "%";
  barEdad.e1564.style.width = p1564 + "%";
  barEdad.e1564.textContent = p1564 + "%";
  barEdad.e65.style.width   = p65 + "%";
  barEdad.e65.textContent   = p65 + "%";
}

// ============= Render: tabla completa =============
function renderTabla(d) {
  try {
    if (typeof d === "string") {
      try { d = JSON.parse(d); } catch {}
    }
    const entries = Object.entries(d || {});
    if (!entries.length) {
      tbody.innerHTML = `<tr><td colspan="2" class="text-muted">Sin datos</td></tr>`;
      return;
    }
    tbody.innerHTML = entries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => {
        const etiqueta = LABELS[k] ?? prettyKey(k);
        const valor = typeof v === "number" ? fmt(v) : esc(String(v));
        return `<tr><td>${etiqueta}</td><td>${valor}</td></tr>`;
      })
      .join("");

    btnCopiar.onclick = () => {
      navigator.clipboard.writeText(JSON.stringify(d, null, 2));
      btnCopiar.textContent = "¡Copiado!";
      setTimeout(() => (btnCopiar.textContent = "Copiar JSON"), 1500);
    };
  } catch (err) {
    console.error("Error en renderTabla:", err);
    tbody.innerHTML = `<tr><td colspan="2" class="text-danger">No se pudo renderizar la tabla.</td></tr>`;
  }
}

// ============= Utils =============
function num(x) {
  const n = Number(String(x ?? "").replaceAll(",", ""));
  return Number.isFinite(n) ? n : 0;
}
function fmt(n) {
  return Number(n).toLocaleString("es-GT");
}
function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function prettyKey(k) {
  return k
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
}

// ============= Gráficas de pastel (donas) =============
function renderPasteles(d){
  // Colores (en línea con tu paleta)
  const C = {
    p1: "rgb(37,99,235)",  // brand-600
    p2: "rgb(236,72,153)", // rosa
    p3: "rgb(34,197,94)",  // verde
    p4: "rgb(6,182,212)",  // cian
    p5: "rgb(245,158,11)"  // ámbar
  };

  // --- SEXO ---
  let ph = num(d.porc_sexo_hombre);
  let pm = num(d.porc_sexo_mujeres);
  // Si no vienen %, calculamos desde totales
  if (!(ph && pm)) {
    const h = num(d.total_sexo_hombre);
    const m = num(d.total_sexo_mujeres);
    const t = h + m;
    ph = t ? (h/t*100) : 0;
    pm = t ? (m/t*100) : 0;
  }
  drawPie(pieSexo, [
    {label:"Hombres", value: ph, color: C.p1},
    {label:"Mujeres", value: pm, color: C.p2}
  ], legendSexo);

  // --- ÁREA ---
  let pu = num(d.porc_sector_urbano);
  let pr = num(d.porc_sector_rural);
  if (!(pu && pr)) {
    const u = num(d.total_sector_urbano);
    const r = num(d.total_sector_rural);
    const t = u + r;
    pu = t ? (u/t*100) : 0;
    pr = t ? (r/t*100) : 0;
  }
  drawPie(pieArea, [
    {label:"Urbana", value: pu, color: C.p3},
    {label:"Rural",  value: pr, color: C.p5}
  ], legendArea);

  // --- EDAD ---
  let p014  = num(d.porc_edad_014);
  let p1564 = num(d.porc_edad_1564);
  let p65   = num(d.porc_edad_65);
  if (!(p014 && p1564 && p65)) {
    const e014  = num(d.pob_edad_014);
    const e1564 = num(d.pob_edad_1564);
    const e65   = num(d.pob_edad_65);
    const t = e014 + e1564 + e65;
    p014  = t ? (e014 /t*100) : 0;
    p1564 = t ? (e1564/t*100) : 0;
    p65   = t ? (e65  /t*100) : 0;
  }
  drawPie(pieEdad, [
    {label:"0–14",  value: p014,  color: C.p3},
    {label:"15–64", value: p1564, color: C.p4},
    {label:"65+",   value: p65,   color: C.p5}
  ], legendEdad);
}

// Dibuja una dona con conic-gradient y genera la leyenda
function drawPie(el, items, legendEl){
  // Normaliza (por si no suman 100 exacto)
  const total = items.reduce((a,b)=>a+Math.max(0,b.value||0),0) || 1;
  const parts = items.map(i => ({...i, pct: (i.value/total)*100}));

  // Gradiente acumulado
  let acc = 0;
  const stops = parts.map(p=>{
    const from = acc;
    acc += p.pct;
    return `${p.color} ${from}% ${acc}%`;
  }).join(", ");
  el.style.background = `conic-gradient(${stops})`;

  // Leyenda
  legendEl.innerHTML = parts.map(p => `
    <li><span class="dot" style="background:${p.color}"></span>
      ${p.label}: ${formatPct(p.pct)}
    </li>`).join("");
}

function formatPct(x){ return (Math.round(x*10)/10).toFixed(1) + "%"; }

