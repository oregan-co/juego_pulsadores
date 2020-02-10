// socket establecido
let socket; 

// identificativo
let n; 
let MI_PUNTUACION = 0;
let PUNTUACION_CONTRINCANTE = 0;

/* Algunas constantes */
let mi_pulsacion = 0;
let su_pulsacion = 0;

// Yo y el contrincante
const YO = true;
const CONTRINCANTE = false;

// ON/OFF
const ON  = true;
const OFF = false;

 // Comunicación vía socket con servidor
 const PUERTO = 8080;
 const HOST   = "http://localhost"
 const URL    = HOST + ":" + PUERTO; 

var pulsado=false;
let intermitencia;
let final=false;


// Devuelve '.yo' si soy_yo==true y '.contrario' si soy_yo==false
function get_clase_jugador(soy_yo) {
    return ( soy_yo )? '.yo' : '.contrario';
 }

let yo_gano, el_gana;
function resultado(mi_eleccion, su_eleccion) {
    // Empate
    if ( mi_eleccion == su_eleccion ) {
        yo_gano = el_gana = false;
    }

    // Determinacion de ganador
    if ( mi_eleccion > su_eleccion ){
            yo_gano = true;
            el_gana = false; 
    } else {
            yo_gano = false;
            el_gana = true;
    }

    console.log("yo_gano: " + yo_gano + ", el_gana: " + el_gana);

    if (yo_gano==el_gana){
        $("#mis_puntos").text(MI_PUNTUACION);
        $("#sus_puntos").text(PUNTUACION_CONTRINCANTE);
    } else if (el_gana) {
        PUNTUACION_CONTRINCANTE++;
        $("#sus_puntos").text(PUNTUACION_CONTRINCANTE);
    } else if (yo_gano) {
        MI_PUNTUACION++;
        $("#mis_puntos").text(MI_PUNTUACION);
    }

    // Enciende/apaga simbolos de victoria o derrota
    $('.yo .alegre')       .css( 'visibility', (( yo_gano)? 'visible':'hidden' ) );
    $('.yo .triste')       .css( 'visibility', ((!yo_gano)? 'visible':'hidden' ) );
    $('.contrario .alegre').css( 'visibility', (( el_gana)? 'visible':'hidden' ) );
    $('.contrario .triste').css( 'visibility', ((!el_gana)? 'visible':'hidden' ) );
}
// Inicializa el panel de juego. Cada vez que se inicie una nueva partida:
// - Eliminar todos los bordes de las figuras
// - Se ponen interrogantes a OFF
// - Se ponen las imágenes del contrincante a traslucidas
// - Se borran los resultados
function inic() {

    // Borra resultados
    resultado(false,false);

    
}


function arranque(){
    //$("div.yo div.tercio:nth-child(2) div.imagenes img").on('click');
    // apertura de socket con el servidor
    socket       = io.connect(URL); 

    // Reacción frente a la rececpion del identificativo (id=0 o 1)
    socket.on('identificativo', function(id){
        n = id;
    });

    socket.on('rechazo',function(){
        window.open('rechazo.html', '_self');
    });

    socket.on('aceptado',function(){
        let mi_nombre = prompt("Nombre:");
        socket.emit('nombre',mi_nombre);
    });
    socket.on('envio_nombres', function(vector_nombres){
        $("#nom_cont").text(vector_nombres[1-n]);
        $("#mi_nombre").text(vector_nombres[n]);
    });

    //lógica del juego desde punto de vista del usuario
    while(final!=true){
        socket.on('inicio_juego',function(){
            $("#pulsador").click(function(){
                mi_pulsacion++;
            })
            intermitencia = setInterval(function(){
                $("#rival").fadeTo(250,0);
                $("#rival").fadeTo(250,1); }, 550);

        });
    }
    socket.on('final_juego',function(){
        final==true;
    });

    socket.emit('pulsaciones',mi_pulsacion);
    
    socket.on('resultados', function(res){
        resultado(res[n],res[1-n]);
        $("#otra_vez").removeAttr("disabled"); //esto es para activar el botón de jugar otra vez
    })

    socket.on('intermitencia',function(){
        intermitencia = setInterval(function(){
        $("#otra_vez").fadeTo(250,0);
        $("#otra_vez").fadeTo(250,1); }, 550);
    }); 
    
    socket.on('desconexion',function(){
        alert('El jugador rival se ha desconectado');
        socket.emit('reinicio');
        setTimeout(function(){window.open('ppt.html', '_self');},3000);
    });

    // Accion del boton "Jugar otra vez": enviar al servidor mensaje
    // de tipo 'jugar_otra_vez', sin necesidad de argumento adicional
    $("#otra_vez").click(function(){
        socket.emit('jugar_otra_vez'); 
        pulsado=true;
        $("#otra_vez").attr("disabled", true);
        clearInterval(intermitencia);    
    })

    // Recepcion del mensaje de tipo 'nueva_partida': inicialización del juego
    socket.on('nueva_partida', function(){
        inic();
    })

    
    inic();


}



// Arranque de la aplicación
$( function(){ arranque(); } );


