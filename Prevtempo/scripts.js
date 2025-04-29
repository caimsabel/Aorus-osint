const openWeatherKey = "8b78a0432580f19f2cfc2755448a42a6";

// Buscar o tempo atual da cidade e extrair lat/lon
async function buscarCidade(cidade) {
    const dadosTempo = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${openWeatherKey}&lang=pt_br&units=metric`)
        .then(resposta => resposta.json());

    console.log("Dados do Tempo:", dadosTempo);

    const lat = dadosTempo.coord.lat;
    const lon = dadosTempo.coord.lon;

    console.log(`Latitude: ${lat}, Longitude: ${lon}`);

    buscarSolar(lat, lon);
    buscarFWI(lat, lon);
    buscarTweets(lat, lon);
}

// Buscar dados de energia solar
async function buscarSolar(lat, lon) {
    const dataAtual = new Date().toISOString().split('T')[0];
    const dadosSolar = await fetch(`https://api.openweathermap.org/energy/1.0/solar/interval_data?lat=${lat}&lon=${lon}&date=${dataAtual}&interval=hourly&appid=${openWeatherKey}`)
        .then(resposta => resposta.json());

    console.log("Dados de Energia Solar:", dadosSolar);
}

// Buscar índice de risco de fogo (FWI)
async function buscarFWI(lat, lon) {
    const dadosFWI = await fetch(`https://api.openweathermap.org/data/2.5/fwi?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`)
        .then(resposta => resposta.json());

    console.log("Dados de Risco de Fogo (FWI):", dadosFWI);
}

// Função do botão
function cliqueNoBotao() {
    const cidade = document.querySelector(".input-cidade").value;
    buscarCidade(cidade);
    console.log("Cidade digitada:", cidade);
}

// Buscar tweets pelo servidor local
async function buscarTweets(lat, lon) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/tweets?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        console.log("Tweets locais:", data);
        if (data.data) {
            mostrarTweets(data.data);
        } else {
            console.log("Nenhum tweet encontrado na área.");
        }
    } catch (error) {
        console.error("Erro ao buscar tweets:", error);
    }
}

// Função para exibir tweets bonitos
function mostrarTweets(tweets) {
    const caixaMedia = document.querySelector(".caixa-media");
    const divTweets = document.createElement("div");
    divTweets.classList.add("tweets");

    tweets.forEach(tweet => {
        const p = document.createElement("p");
        const texto = tweet.text.toLowerCase();

        if (texto.includes("fogo") || texto.includes("incêndio")) {
            p.innerHTML = `🔥 <b>[fogo]</b> ${tweet.text} <br><small>(${new Date(tweet.created_at).toLocaleString()})</small>`;
        } else if (texto.includes("chuva")) {
            p.innerHTML = `🌧️ <b>[chuva]</b> ${tweet.text} <br><small>(${new Date(tweet.created_at).toLocaleString()})</small>`;
        } else if (texto.includes("seca")) {
            p.innerHTML = `🌵 <b>[seca]</b> ${tweet.text} <br><small>(${new Date(tweet.created_at).toLocaleString()})</small>`;
        } else {
            p.innerHTML = `💨 ${tweet.text} <br><small>(${new Date(tweet.created_at).toLocaleString()})</small>`;
        }
        
        divTweets.appendChild(p);
    });

    caixaMedia.appendChild(divTweets);
}

// Trocar fundo aleatório
const imagem = [
    "images/1d.jpg", "images/2d.jpg", "images/3d.jpg", "images/5d.jpg",
    "images/6d.jpg", "images/7d.jpg", "images/8d.jpg", "images/9d.jpg",
    "images/10d.jpg", "images/11d.jpg", "images/12d.jpg", "images/15d.jpg",
    "images/16d.jpg", "images/17d.jpg", "images/24d.jpg", "images/26.jpg",
    "images/30d.jpg", "images/33d.jpg", "images/40.jpg", "images/lucifer.jpg",
    "images/manha.jpg", "images/solo.jpg", "images/SUPERMAN.jpg", "images/van.jpg",
    "images/violeta.jpg"
];

const imagemAleatoria = imagem[Math.floor(Math.random() * imagem.length)];

document.body.style.backgroundImage = `url('${imagemAleatoria}')`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
document.body.style.backgroundRepeat = "no-repeat";


// Chamar API Flask para buscar câmeras próximas
async function buscarCameras(lat, lon, cidade) {
    try {
        const url = `http://127.0.0.1:5000/cameras?cidade=${encodeURIComponent(cidade)}&lat=${lat}&lon=${lon}`;
        const response = await fetch(url);
        const data = await response.json();
        mostrarCameras(data);
    } catch (err) {
        console.error("Erro ao buscar câmeras:", err);
    }
}

// Mostrar as câmeras no site
function mostrarCameras(lista) {
    const caixa = document.querySelector(".caixa-media");
    const div = document.createElement("div");
    div.classList.add("cameras");

    lista.forEach(cam => {
        const bloco = document.createElement("div");
        bloco.classList.add("camera");
        bloco.innerHTML = `
            <p>📍 ${cam.cidade} - ${cam.distancia_km} km</p>
            <img src="${cam.stream}" width="300" style="border-radius:12px;">
        `;
        div.appendChild(bloco);
    });

    caixa.appendChild(div);
}

function buscarCamerasDaCidade() {
    const cidade = document.querySelector(".input-cidade").value;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${openWeatherKey}&lang=pt_br&units=metric`)
        .then(res => res.json())
        .then(dados => {
            const lat = dados.coord.lat;
            const lon = dados.coord.lon;
            buscarCameras(lat, lon, cidade);
        });
}
