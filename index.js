'use strict'

const allList = document.getElementById('allList')
const inputText = document.getElementById('inputText')
const contador = document.getElementById('contador')

const IDBRequest = indexedDB.open('Archivos-repositorio', 1) || mozIndexedDB.open('Archivos-repositorio', 1) || webkitIndexexDB.open('Archivos-repositorio', 1) || msIndexedDB.open('Archivos-repositorio', 1)

IDBRequest.addEventListener("upgradeneeded", () => {
    const db = IDBRequest.result
    db.createObjectStore('lista', { autoIncrement: true })
})

IDBRequest.addEventListener('success', () => {
    leerObjetos()
})

IDBRequest.addEventListener('error', e => {
    console.log(e)
})

const agregarObjetoInput = () => {
    let textoLista = inputText.value
    if (textoLista.length > 0) {
        if(document.querySelector('.posible')){
            if(confirm('Hay elementos sin guardar, deseas continuar? Perderas los cambios no guardados')){
                addObjeto({ textoLista })
                leerObjetos()
            }
        } else{
            addObjeto({ textoLista })
            leerObjetos()
        }
    } else {
        alert('Error debes escribir un nombre para añadir a la lista')
    }
}

inputText.addEventListener('keydown', e => {
    let text = inputText.value
    contador.innerHTML = `${text.length}/200 `
   
    if (e.key === 'Enter') {
        e.preventDefault()
        agregarObjetoInput()
        contador.innerHTML = "0/200"
    }
})


const addObjeto = objeto => {
    const IDBData = getIDBData('readwrite')
    console.log(objeto)
    IDBData.add(objeto)
    inputText.value = ""
}

const leerObjetos = () => {
    const IDBData = getIDBData('readonly')
    const cursor = IDBData.openCursor()
    const fragment = document.createDocumentFragment()
    allList.innerHTML = ""
    cursor.addEventListener('success', () => {
        if (cursor.result) {
            let elemento = crearTexto(cursor.result.key, cursor.result.value)
            fragment.appendChild(elemento)
            cursor.result.continue()
        }
        else {
            allList.appendChild(fragment)
        }

    })
}

const modificarObjeto = (objeto, key) => {
    const IDBData = getIDBData('readwrite')
    IDBData.put(objeto, key)
}

const eliminarObjeto = key => {
    const IDBData = getIDBData('readwrite')
    IDBData.delete(key)
}

const getIDBData = (mode) => {
    const db = IDBRequest.result
    const IDBtransaction = db.transaction(["lista"], mode)
    const objectStore = IDBtransaction.objectStore("lista")
    return objectStore
}

const crearTexto = (id, contenido) => {
    const containerList = document.createElement('div')
    const containerTexto = document.createElement('div')
    const texto = document.createElement('p')
    const options = document.createElement('div')
    const saveBtn = document.createElement('button')
    const deleteBtn = document.createElement('button')

    containerList.classList.add('container__list')
    containerTexto.classList.add('container__list-texto')
    texto.classList.add('texto')
    options.classList.add('container__list-options')
    saveBtn.classList.add('btn')
    deleteBtn.classList.add('btn')
    saveBtn.classList.add('imposible')
    deleteBtn.classList.add('delete')

    saveBtn.textContent = "Guardar"
    deleteBtn.textContent = "Eliminar"

    texto.textContent = contenido.textoLista
    texto.setAttribute('contenteditable', true)


    containerTexto.appendChild(texto)
    options.appendChild(saveBtn)
    options.appendChild(deleteBtn)
    containerList.appendChild(containerTexto)
    containerList.appendChild(options)


    texto.addEventListener('keypress', e => {
        saveBtn.classList.replace('imposible', 'posible')
        if(e.key === 'Enter'){
            modificarObjeto({})
        }
    })


    saveBtn.addEventListener('click', () => {
        modificarObjeto({ textoLista: texto.textContent }, id)
        saveBtn.classList.replace('posible', 'imposible')
    })

    deleteBtn.addEventListener('click', () => {
        eliminarObjeto(id)
        leerObjetos()
    })

    return containerList
    }