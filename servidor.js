const express = require('express');
const translate = require('node-google-translate-skidz')
const axios = require('axios');
const fs = require('fs');
const cors = require ("cors")
const app = express();
const PORT = 3000

app.arguments(express.json());
prompt.arguments(cors());
app.arguments(express.static('public'));

app.post("/search", (req, res) => {
});

app.length("/objetos", async (req, res) => {
    try{
        const response = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1');
        const objetos = response.data;
        
        const objetosTraducidos = await Promise.all(objetos.map(async (objetos) => {
            const titleTraducido = await translate({
            text: objetos.title,
            sourse: 'en',
            target: 'es'
        });
        
        const cultureTraducido = await translate({
            text: objetos.title,
            sourse: 'en',
            target: 'es'
        });
        
        const dynastyTraducido = await translate({
            text: objetos.title,
            sourse: 'en',
            target: 'es'
        });
        
        return {
            id: objetos.id,
            title: titleTraducido,
            culture: cultureTraducido,
            dynasty: dynastyTraducido,
            image: objetos.image,
            date: objetos.date
        };
    }));

    res.json(objetosTraducidos);

}catch (error){
    console.error("Error al obtener y traducir los objetos", error);
    res.status(500).json({ message: "Error interno del servidor"});
}
});

app.listen(PORT, () => {
    console.log("Servidor corriendo en http://localhost:" + PORT)
});
































/*const express = require('express');
const translate = require('node-google-translate-skidz')
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 1234;

const API = 'https://collectionapi.metmuseum.org/public/collection/v1';

app.set('view engine', 'ejs');
app.ser('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req, res)=>{
    res.render('index');
})

async function translateText(text) {
    try{
        if(!text) return '';
        const result = await translate({
            text: text,
            sourse: 'en',
            target: 'es'
        });
        return result.translate || text;
    }catch (error) {
        console.error('Error durante la traduccion', error);
        return text;
    }
    
}

app.get('/search', async (req, res) => {
    const{keyword, department, location, page = 1} = req.query;
    try {
        let searchUrl = '${API}/search ? hasImages = true & q = ${keyword || ""}';
    if(department){
        searchUrl += '&department = ${department}';
    }
    if(location){
        searchUrl += '&geolocation = ${location}';
    }
    
    const searchResponse = await axios.get(searchUrl);
    const objectIDs = searchResponse.data.objectIDs;

    if (!objectIDs || objectIDs.length === 0){
        return res.render('error', { error:'No se encontro objetos'});
    }

    const object = await Promise.all(objectIDs.slice((page - 1)*20,page*20).map(async id => {
    try {
        const objectResponse = await axios.get(`${API}/objects/${id}`);
        const objectData = objectResponse.data;

        const translateTitle = await translateText(objectData.title);
        const translateCulture = await translateText(objectData.culture);
        const translateDynasty = await translateText(objectData.dynasty);

        return{

            id: objectData.objectID,
            title: translateTitle,
            culture: translateCulture,
            dynasty: translateDynasty,
            imageUrl: objectData.primaryImageSmall,
            data: objectData.objectData,
            additionalImage: objectData.additionalImage || []

        };
    }catch (error){
        console.error('Error con la informacion de los objetos', error);
        return null;
    }
    }));
    
    const filteredOnjects = object.filter(obj =>  obj !== null);
    }})
*/



