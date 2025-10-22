// Mi clave de la API de OMDB
var CLAVE_API = 'b68cb153';
var NUM_PREGUNTAS = 5;

// Variables globales para el juego
var puntuacion = 0;
var rep_Inc = 0; 
var pregunta_Actual = 0; 
var peliculas = [];
var contenedor_Juego;
var marcador_Puntuacion; 

// Función para iniciar el juego
var iniciarJuego = function() { 
    contenedor_Juego = document.getElementById('game-container');
    marcador_Puntuacion = document.getElementById('score');
    
    // Mostrar mensaje de carga
    contenedor_Juego.innerHTML = '<div class="loading">Cargando preguntas...</div>';
    
    // Cargar las películas
    cargarPeliculas();
};

// Función para cargar películas
var cargarPeliculas = function() {
    // Lista de IDs de películas famosas
    var id_Peliculas = ['tt0111161', 'tt0068646', 'tt0468569', 'tt0137523', 'tt0816692'];
    
    // Mezclar los IDs
    var id_Mezclados = [];
    for (var i = 0; i < id_Peliculas.length; i++) {
        id_Mezclados.push(id_Peliculas[i]);
    }
    
    // Mezclar el array
    for (var i = id_Mezclados.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temporal = id_Mezclados[i]; 
        id_Mezclados[i] = id_Mezclados[j];
        id_Mezclados[j] = temporal;
    }
    
    // Cargar cada película
    var pelis_Cargadas = 0;
    for (var i = 0; i < NUM_PREGUNTAS; i++) {
        var id = id_Mezclados[i];
        
        fetch(`https://www.omdbapi.com/?i=${id}&apikey=${CLAVE_API}`)
            .then(function(respuesta) {
                return respuesta.json();
            })
            .then(function(datos_Pelicula) {
                if (datos_Pelicula.Response === 'True') {
                    peliculas.push(datos_Pelicula);
                    pelis_Cargadas = pelis_Cargadas + 1;
                    
                    if (pelis_Cargadas === NUM_PREGUNTAS) {
                        mostrarPregunta();
                    }
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
    }
};

// Función para mezclar un array
var Mezclar_Pel_Resp = function(array) {
    var copia_Original = [];
    
    for (var i = 0; i < array.length; i++) {
        copia_Original.push(array[i]);
    }
    
    for (var i = copia_Original.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temporal = copia_Original[i];
        copia_Original[i] = copia_Original[j];
        copia_Original[j] = temporal;
    }
    
    return copia_Original;
};

// Función para generar respuestas incorrectas
var obtener_resp_inc = function(tipo, callback) {
    var id_Peliculas_Incorrectas = ['tt0114369', 'tt0120737', 'tt0110357'];
    
    var resp_Incorrectas = [];
    var incorrectas_Cargadas = 0;
    
    for (var i = 0; i < id_Peliculas_Incorrectas.length; i++) {
        var id = id_Peliculas_Incorrectas[i];
        
        fetch(`https://www.omdbapi.com/?i=${id}&apikey=${CLAVE_API}`)
            .then(function(respuesta) {
                return respuesta.json();
            })
            .then(function(datos_Pelicula) {
                if (datos_Pelicula.Response === 'True') {
                    if (tipo === 'year') {
                        resp_Incorrectas.push(datos_Pelicula.Year);
                    } else {
                        resp_Incorrectas.push(datos_Pelicula.Title);
                    }
                    incorrectas_Cargadas = incorrectas_Cargadas + 1;
                    
                    if (incorrectas_Cargadas === 3) {
                        callback(resp_Incorrectas);
                    }
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
    }
};

// Función para mostrar una pregunta
var mostrarPregunta = function() {
    if (pregunta_Actual >= NUM_PREGUNTAS) {
        mostrarPantallaFinal();
        return;
    }
    
    var pelicula = peliculas[pregunta_Actual];
    
    var numero_Random = Math.random();
    var tipo_Pregunta = 'title';
    
    if (numero_Random > 0.5) {
        tipo_Pregunta = 'year';
    }
    
    var pregunta = '';
    var resp_Correcta = '';
    
    if (tipo_Pregunta === 'year') {
        pregunta = '¿En qué año se estrenó "' + pelicula.Title + '"?';
        resp_Correcta = pelicula.Year;
        
        obtener_resp_inc('year', function(resp_Incorrectas) {
            renderizar_Pregunta(pelicula, pregunta, resp_Correcta, resp_Incorrectas);
        });
    } else {
        pregunta = '¿Cómo se llama esta película?';
        resp_Correcta = pelicula.Title;
        
        obtener_resp_inc('title', function(resp_Incorrectas) {
            renderizar_Pregunta(pelicula, pregunta, resp_Correcta, resp_Incorrectas);
        });
    }
};

// Función para renderizar la pregunta en pantalla
var renderizar_Pregunta = function(pelicula, pregunta, resp_Correcta, resp_Incorrectas) {
    var opciones_Pregunta = [resp_Correcta];
    
    for (var i = 0; i < resp_Incorrectas.length; i++) {
        opciones_Pregunta.push(resp_Incorrectas[i]);
    }
    
    var opciones_Mix = Mezclar_Pel_Resp(opciones_Pregunta);
    
    var contenidoHTML = '<div class="question-container">';
    
    if (pelicula.Poster !== 'N/A') {
        contenidoHTML += '<img src="' + pelicula.Poster + '" alt="' + pelicula.Title + '" class="movie-poster">';
    }
    
    contenidoHTML += '<div class="question">' + pregunta + '</div>';
    contenidoHTML += '<div class="options">';
    
    for (var i = 0; i < opciones_Mix.length; i++) {
        var opcion = opciones_Mix[i];
        contenidoHTML += '<div class="option" data-answer="' + opcion + '">' + opcion + '</div>';
    }
    
    contenidoHTML += '</div>';
    contenidoHTML += '<div id="result-message"></div>';
    contenidoHTML += '<button class="btn" id="next-btn" style="display: none;">Siguiente pregunta</button>';
    contenidoHTML += '</div>';
    
    contenedor_Juego.innerHTML = contenidoHTML;
    
    configurarListenersOpciones(resp_Correcta);
};

// Función para configurar los listeners
var configurarListenersOpciones = function(resp_Correcta) {
    var opciones = document.querySelectorAll('.option');
    var mensaje_Resultado = document.getElementById('result-message');
    var boton_Siguiente = document.getElementById('next-btn');
    
    for (var i = 0; i < opciones.length; i++) {
        var opcion = opciones[i];
        
        opcion.addEventListener('click', function() {
            if (this.classList.contains('disabled')) {
                return;
            }
            
            var resp_Seleccionada = this.dataset.answer;
            var correcto = false;
            
            if (resp_Seleccionada === resp_Correcta) {
                correcto = true;
            }
            
            var opciones_Pregunta = document.querySelectorAll('.option');
            for (var j = 0; j < opciones_Pregunta.length; j++) {
                var opcionActual = opciones_Pregunta[j];
                opcionActual.classList.add('disabled');
                
                if (opcionActual.dataset.answer === resp_Correcta) {
                    opcionActual.classList.add('correct');
                } else if (opcionActual === this && !correcto) {
                    opcionActual.classList.add('incorrect');
                }
            }
            
            if (correcto) {
                puntuacion = puntuacion + 1;
                marcador_Puntuacion.textContent = puntuacion;
                mensaje_Resultado.innerHTML = '<div class="result-message correct">¡Correcto! 🎉</div>';
            } else {
                rep_Inc = rep_Inc + 1;
                mensaje_Resultado.innerHTML = '<div class="result-message incorrect">Incorrecto 😢</div>';
            }
            
            boton_Siguiente.style.display = 'block';
        });
    }
    
    boton_Siguiente.addEventListener('click', function() {
        pregunta_Actual = pregunta_Actual + 1;
        mostrarPregunta();
    });
};

// Función para mostrar pantalla final
var mostrarPantallaFinal = function() {
    var porcentaje = (puntuacion / NUM_PREGUNTAS) * 100;
    var mensaje = '';
    
    if (porcentaje === 100) {
        mensaje = '¡Perfecto! Eres un experto en cine 🏆';
    } else if (porcentaje >= 60) {
        mensaje = '¡Muy bien! Conoces bastante de películas 🎬';
    } else {
        mensaje = 'Sigue intentando, puedes mejorar 💪';
    }
    
    var htmlFinal = '<div class="final-screen">';
    htmlFinal += '<div class="final-score">' + puntuacion + '/' + NUM_PREGUNTAS + '</div>';
    htmlFinal += '<div class="final-message">' + mensaje + '</div>';
    htmlFinal += '<div class="stats-summary">';
    htmlFinal += '<div class="stat-item">✅ Aciertos: ' + puntuacion + '</div>';
    htmlFinal += '<div class="stat-item">❌ Errores: ' + rep_Inc + '</div>';
    htmlFinal += '</div>';
    htmlFinal += '<button class="btn" onclick="location.reload()">Jugar de nuevo</button>';
    htmlFinal += '</div>';
    
    contenedor_Juego.innerHTML = htmlFinal;
};

// Iniciar el juego
iniciarJuego();