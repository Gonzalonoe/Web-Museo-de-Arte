const express = require('express');
const translate = require('node-google-translate-skidz');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 5000;

const MET_API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req, res)=>{
    res.render('index');
})

async function translateText(text) {
    try{
        if(!text) return '';
        const result = await translate({
            text: text,
            source: 'en',
            target: 'es'
        });
        return result.translation || text;
    }catch (error) {
        console.error('Error durante la traduccion', error);
        return text;
    }
    
}

app.get('/search', async (req, res) => {
    const{ keyword, department, location, page = 1 } = req.query;
    try {
        let searchUrl = `${MET_API_URL}/search?hasImages=true&q=${keyword || ''}`;
    if(department){
        searchUrl += `&department=${department}`;
    }
    if(location){
        searchUrl += `&country=${location}`;
    }
    
    const searchResponse = await axios.get(searchUrl);
    const objectIDs = searchResponse.data.objectIDs;

    if (!objectIDs || objectIDs.length === 0){
        return res.render('error', { error:'No se encontro objetos'});
    }

    const objects = await Promise.all(objectIDs.slice((page - 1) * 20, page * 20).map(async id => {
    try {
        const objectResponse = await axios.get(`${MET_API_URL}/objects/${id}`);
        const objectData = objectResponse.data;

        const translatedTitle = await translateText(objectData.title);
        const translatedCulture = await translateText(objectData.culture);
        const translatedDynasty = await translateText(objectData.dynasty);

        return{

            id: objectData.objectID,
            title: translatedTitle,
            culture: translatedCulture,
            dynasty: translatedDynasty,
            imageUrl: objectData.primaryImageSmall,
            date: objectData.objectDate,
            additionalImages: objectData.additionalImages || []

        };
    }catch (error){
        console.error('Error con la informacion de los objetos', error);
        return null;
    }
    }));
    
    const filteredObjects = objects.filter(obj =>  obj !== null);
    
    res.render('result', {
        objects: filteredObjects,
        page,
        totalPages: Math.ceil(objectIDs.length/20),
        keyword,
        department,
        location
    });
    }catch (error){
        console.error(error);
        res.render('error',{error: 'No se encontro informacion sobre estos items'})
    }
});

app.get('/object/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const objectResponse = await axios.get(`${MET_API_URL}/objects/${id}`);
        const objectData = objectResponse.data;

        const translatedTitle = await translateText(objectData.title);
        const translatedCulture = await translateText(objectData.culture);
        const translatedDynasty = await translateText(objectData.dynasty);

        res.render('object', {
            id: objectData.objectID,
            title: translatedTitle,
            culture: translatedCulture,
            dynasty: translatedDynasty,
            imageUrl: objectData.primaryImageSmall,
            date: objectData.objectDate,
            additionalImages: objectData.additionalImages || []
        });
    }catch(error){
        console.error(error);
        res.render('error',{error: 'No se encontro el item'});
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost::${PORT}`);
});




