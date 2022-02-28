
let eventos = 'https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json';
let tabla1 = document.getElementById('body1');
let tabla2 = document.getElementById('body2');
let comidas = {}

// función de correlación MCC
let correlation = (lista) =>{
    let tn = lista[0], fn = lista[1], fp = lista[2], tp = lista[3]
    numerador = (tp * tn) - ( fp * fn)
    denominador = ((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn)) ** (1/2)
    return numerador/denominador
}

// obtener datos de la api
let getEvents = () =>{
    return new Promise(function(resolve, reject){
    let req = new XMLHttpRequest();
    req.open('GET', eventos);
    req.onload = function(){
        (req.status == 200)
        ? resolve(JSON.parse(req.response))
        : reject(new Error('No se pudo cargar los productos'))
    }
    req.send()
    
    });
}

// Función principal de cargar los datos
let cargarDatos = async() => {
    try{
        let listaE = await getEvents()
        let eventicos = listaE.map(function(i){
            return i
    })
        return eventicos
    }catch (error) {
        console.log("Error: ", error.message)
    }
}

// Ejecutar carga de la información
let datos = cargarDatos();


// Manipulación de la tabla de eventos y si se convirtió en ardilla
let cargarTabla1 = (i) =>{
    for (let index = 0; index < i.length; index++) {
        const element = i[index];

        let active = '';
        if(element.squirrel){
            active = 'rojito'
        }
        let palabras = ''
        for (let k = 0; k < element.events.length; k++) {
            palabras += element.events[k]
            if(k+1 < element.events.length){ palabras += ', '}
        }
        tabla1.innerHTML += `<tr class="${active} " >
            <th scope="row"> ${index}</th> 
            <th>${palabras}</th>
            <th> ${element.squirrel}</th>
            </tr>`
        
    }
}

// Función que cuenta cuantos casos hay para cada evento
let contador = (event, lista) => {
    // [0] = no aparece y no es Ardilla (True negative)
    // [1] = Aparece y no es ardilla (False negative)
    // [2] = no aparece y es ardilla (False Positive)
    // [3 ] = aparece y es ardilla (True positive)
    let cuenta = [0,0,0,0]
    for (let i = 0; i < lista.length; i++) {
        let revision = lista[i];
        conteo = 0;
        if (revision.events.includes(event)) conteo += 1;
        if (revision.squirrel) conteo += 2;
        cuenta[conteo] += 1;
    }
    return cuenta;
}

// Función donde se genera la correlación de cada evento
let verComidas = (i) =>{
    let comidas = []
    let retorno = []
    for (let index = 0; index < i.length; index++) {
        let element = i[index];
        for (const evento of element.events) {
            if(!comidas.includes(evento)){
                eve = new Object();
                eve.nombre = evento
                eve.correlacion = correlation(contador(evento, i))
                comidas.push(evento)
                retorno.push(eve)
            }
        }
    }
    return retorno

}

// Función para ordenar la lista final de los eventos para la tabla de correlación
let sacarMayor = (lista) =>{
    mayor = -9999;
    pos = 0;
    for (let i = 0; i < lista.length; i++) {
        const jum = lista[i];
        if (lista[i].correlacion > mayor){
            pos = i;
            mayor = lista[i].correlacion;
        }
    }
    return pos
}

// Pintar la tabla de correlación
let mostrarCorrelacion = (i) =>{
    let orden = []
    let tamanio = i.length
    for (let index = 0; index < tamanio; index++) {
        pos = sacarMayor(i)
        orden.push(i.splice(pos, 1))
    }
    let indice = 0
    for (const iterator of orden) {
        tabla2.innerHTML += `<tr class="" >
            <th scope="row"> ${indice}</th> 
            <th>${iterator[0].nombre}</th>
            <th> ${iterator[0].correlacion}</th>
            </tr>`
        indice += 1
    }
    
} 

// función que se ejecuta después de haber cargado los datos
let run = async(i) =>{
    cargarTabla1(i)
    mostrarCorrelacion(
        verComidas(i))
}

datos.then(run)