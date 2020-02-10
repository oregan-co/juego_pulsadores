var express = require('express');
var app = express();
var server = require('http').Server(app); 
var io = require('socket.io')(server);

var PUERTO =  8080;
server.listen(PUERTO, function() {
        console.log('Servidor corriendo en http://localhost:' + PUERTO);       
    }
);
    
app.use(express.static('../html')); // directorio de documentos estáticos
             

// Estas variables serán comunes (las mismas) en todas las conexiones

// indice de cliente
let n_cli = 0;
let vector_nombres = [];
let vector_sockets = [];

// Array -de dos posiciones- con la apuesta de cada cliente
let apuestas      = [];

// Array booleano indicando si ya han apostado o no cada cliente
let apostado      = [false,false];

// Array booleano indicando si ya han clicado nueva partida cada cliente, o no
let nueva_partida = [false,false];


// Establecimiento de conexión con cliente.
// Debe pensarse que la acción se realiza para cada cliente de forma replicada,
// Cada conexión con cada cliente, tiene su espacio de variables propio
// para aquellas variables declaradas localmente en la función 
// (mi_n_cli y socket). Sin embargo, variables como n_cli, apuestas, apostado o
// nueva_partida son globales, y por tanto comunes e idénticas para todos.

io.on('connection', function(socket) {

    let mi_n_cli = n_cli; // Cada conexión tendrá su "mi_n_cli"
    n_cli++;  // Sin embargo, n_cli es la misma variable para todos

    console.log('Cliente conectado, mi_n_cli: ' + mi_n_cli);
    
    vector_sockets[mi_n_cli]=socket;

    if(mi_n_cli>=2){
        vector_sockets[mi_n_cli].emit('rechazo');
    } else {
        vector_sockets[mi_n_cli].emit('aceptado');
    }

    socket.on('nombre', function(nombre) {
        vector_nombres[mi_n_cli]=nombre;
        console.log('Hola, '+ vector_nombres[mi_n_cli]);
        io.emit('envio_nombres',vector_nombres);
    });

    // Mensaje de tipo 'identificativo' con el valor de mi_n_cli
    socket.emit('identificativo', mi_n_cli);

    //lógica del juego desde punto de vista del servidor
    io.emit('inicio_juego');
    setTimeout(10000); //el juego dura 10 segundos
    io.emit('final_juego');

    socket.on('pulsaciones',function(pulsaciones){
        apuestas[n]=pulsaciones;
    });


    io.emit('resultados',apuestas); //mandamos ya los resultados a ambos clientes
        
    

    socket.on('jugar_otra_vez', function(){
        console.log('El jugador ' + mi_n_cli + ' quiere jugar otra vez.')
        apostado=[false,false];
        apuestas=[];
        nueva_partida[mi_n_cli] = true;
        if(!nueva_partida[mi_n_cli] || !nueva_partida[1-mi_n_cli]){
            console.log('Esperando al rival...');
            vector_sockets[1-mi_n_cli].emit('intermitencia');
        }
        if (nueva_partida[0] && nueva_partida[1]) {
            console.log('Difundiendo peticion de nueva_partida');
            apostado      = [false, false];
            nueva_partida = [false, false];
            vector_sockets[mi_n_cli].emit('nueva_partida');
            vector_sockets[1-mi_n_cli].emit('nueva_partida');
        }
    })

    socket.on('disconnect', function(){ 
        console.log('Usuario desconectado, mi_n_cli: ' + mi_n_cli); 
        if(mi_n_cli<2){
            io.emit('envio_nombres',"");
            vector_sockets[1-mi_n_cli].emit('desconexion');      
        }
        n_cli--;
    })


});
               
console.log('Script servidor_ppt.js ejecutado');



