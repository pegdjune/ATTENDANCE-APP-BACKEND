const bcrypt = require('bcryptjs')

const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Apirouter = require('./routes/auth')

const app = express();

const currentDate = new Date().toLocaleDateString();
const time = new Date().toLocaleTimeString();
let GlobalhashedTokens = '';
let previousHour = -1;


// MIDDLEWARES

dotenv.config({ path: './config/config.env'})
require('./config/Db')
app.use(cors())

const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
// app.use(morgan('dev'))


//ROUTES POUR L'API
app.use('/api/v1', Apirouter)
//app.use('/api/v1', require('./routes/features'))

PORT = process.env.PORT || 30002


// Fonction pour générer les tokens
function generateTokens() {
    const currentDate = new Date().toLocaleDateString();
    const tokens = `2SNDTokenRegistration${currentDate}`;
    return tokens;
}

// Générer et enregistrer le QR code
function generateQRCode() {
    const currentDate = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let currentHour = new Date().getHours();

    if (currentHour !== previousHour) {

        const tokens = generateTokens();
        const hashedTokens = crypto.createHash('sha256').update(tokens).digest('hex');
        const qrData = `${currentDate} ${time} Tokens Hash: ${hashedTokens}`;
        GlobalhashedTokens = hashedTokens;

        QRCode.toFile('qrcode.png', qrData, {
            width: 300,
            height: 300
        }, (err) => {
            if (err) throw err;
            console.log('QR Code généré !!!');
        });
    }

}

// Mettre à jour le QR code chaque 12 heures
function updateQRCodeDaily() {
    generateQRCode();
    setInterval(generateQRCode, 300000);
    // setInterval(generateQRCode, 24 * 60 * 60 * 1000); // Mettre à jour toutes les 12 heures
}

// Définir les routes avec Express
app.get('/qrcode.png', (req, res) => {
    const imagePath = path.join(__dirname, 'qrcode.png');
    const imageStream = fs.createReadStream(imagePath);
    imageStream.pipe(res);
});

app.get('/assets/2sndlogo.png', (req, res) => {
    const imagePath = path.join(__dirname, 'assets', '2sndlogo.png');
    const imageStream = fs.createReadStream(imagePath);
    res.setHeader('Content-Type', 'image/png');
    imageStream.pipe(res);
});

app.get('/generate', (req, res) => {
    generateQRCode();
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'QR Code generated' });
});

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlStream = fs.createReadStream(htmlPath);
    res.setHeader('Content-Type', 'text/html');
    htmlStream.pipe(res);
}); 



// Démarrer le serveur Express
app.listen(PORT, async() => {
    console.log(`Serveur démarré sur le port ${PORT}`);

    
    
    updateQRCodeDaily(); // Commencer la mise à jour quotidienne du QR code
    console.log(GlobalhashedTokens);
    const slat = await bcrypt.genSalt(10)
    const password = await bcrypt.hash("superadmin", slat)
    console.log(password)
});
