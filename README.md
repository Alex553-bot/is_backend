# LlajtaSolutions
App web que tiene como objetivo recuperar nuestras tradiciones culinarias cochabambinas


# RescatandoSabores - API Backend
1. [Introducion](#Introduccion_API)
2. [Prerequisitos](#Prerequisitos_API)
3. [Instalacion](#Instalacion_API)
4. [Configuracion](#Configuracion_API)
5. [Uso](#Uso_Backend)
6. [Ejecucino](#ejecucion_api)

### Introduccion_API
Este README muestra las instrucciones paso a paso para instalacion y ejecucion del proyecto en los diferentes sistemas operativos: Windows, Linux y MacOS. 

### Prerequisitos_API
Antes de realizar la instalacion y ejecucion, es necesario cumplir los siguientes prerequisitos: 
- Tener instalado [NodeJS](https://nodejs.org/en) y npm.
- Que la base de datos este funcionando correctamente.

### Instalacion_API
#### Windows 
1. Abrir la terminal (cmd) o PowerShell, a preferencia. 
2. Navegar sobre el directorio del proyecto utilizando el comando: 
    ```bash
    cd direccion/al/proyecto/api
    ```
3. Ejecutar el siguiente comando, para que descargue las dependencias necesarias. 
    ```bash
    npm install 
    ```

#### Linux
1. Abre una terminal. 
2. Navega al directorio del proyecto: 
    ```bash 
    cd direcion/al/proyecto/api
    ```
3. Ejecutar el siguiente comando para instalar las dependencias del proyecto: 
    ```bash 
    npm install 
    ```
#### MacOS
1. Abrir una terminal 
2. Navegar al directorio del proyecto. 
    ```bash 
    cd direcion/al/proyecto/api
    ```
3. Ejecutar el siguiente comando para instalar las dependencias del proyecto. 
    ```bash 
    npm install 
    ```
### Configuracion_API
Antes de ejecutar el proyecto, se debe tener las siguientes recomendaciones, el servidor se ejecutara sobre el puerto 5000, por lo que este debe estar vacio. 
### Uso_API
Una vez que el servidor este ejecutandose, se vera un mensaje por la terminal iniciado, 'Servidor ejecutandose sobre el puerto 5000'(por defecto). Posteriormente ya se encuentra listo para realizarle peticiones a la API. 
A la hora de realizar peticiones a la API, mirar la terminal, por los mensajes de procesamiento que se encuentra realizando.

### Ejecucion_API
Para la ejucion de la api, vuelva al direccion principal y ejecute el comando: 
```bash
    npm run start
```