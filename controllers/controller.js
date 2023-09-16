const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const verifyAuth = require('../middleware/VerifyAuth')
const Admin = require('../models/Admin')
const nodemailer =  require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'pegdjune19@gmail.com',
        pass: 'xsebysyoanquecwj',
    },
    secure: true, 
    port: 465,
})

async function sendMail(users, msg) {
 
    const info = await transporter.sendMail({
        from: '2SND TECHNOLOGIES <pegdjune19@gmail.com>',
        to: users.email,
        subject: msg.title,
        html: msg.content ,
        
    })

    console.log("Message  envoyé : %s", info.messageId)
}

function generateRandomPassword(length) {
    // const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let password = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }
  
    return password;
}
  


// CREATION D'UTILISATEUR
module.exports.CreateUser =  async (req, res ) => {
    try {
        //res.setHeader('Content-Type', 'application/json');
        const  { name, email, status, poste, password} = req.body 

        console.log(req.body)
        if(!name || !email || !status || !poste ) {

            res.status(400).json({
                msg: 'please fill the required field',
                success: false
            })
        }

        // verification de l'utilisateur unique 
        var user =  await User.findOne({ email: email})
        if(user) {
            console.log(user)
            return res.status(400).json({
                msg: 'user already exists',
                success: false
            })
        }

        user = new User({
            name,
            email,
            status,
            poste,
            password,
            

        })

        const msg = {
            title: 'Vos informations de connexion',
            content: "<p>Hello</p> <p>Voici vos informations de connexion pour ATTENDANCE REGISTER." + 
            "<p>Nom d'utilisateur :" + user.email +
            " </p> <p>Mot de passe: " + user.password + "</p>",
        }
        sendMail(user, msg).catch(console.error)
     
        const slat = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, slat)
        await user.save()


        // payload || { id: user._id}
        jwt.sign({id: user._id }, process.env.JWT_SECRET, {
            expiresIn: 36000
        }, (err, token)=> {
            if (err) throw err 
            res.status(200).json({token})
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({success:false})
    }
}



// CONNNEXION D'UTILISATEUR
module.exports.LoginUser = async (req, res ) => {

    try {

        const {email, password} = req.body
        if( !email || !password){
            return res.status(400).json({ 
                msg: 'invalid credentials, enter field',
                success: false 
            })
        }
        
        let user = await User.findOne({email}).select('+password')
        if(!user ) return res.status(400).json({
            msg: 'invalid credentials, user dont exist',
            success: false 
        })
        
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch ) return res.status(400).json({ 
            msg: 'invalid credentials, wrong password',
            success: false 
        })
        
        jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: 36000 
        }, (err, token) => {
            if(err) throw err
            res.status(200).json({
                token
            })
        })
    
    } catch (err) {
        console.log(err)
        res.status(400).json({success: false})
    }
    
}



// RECUPERATION DES UTILISATEURS
module.exports.GetUser = async (req, res )=>{ 

    try {
        
        var user = await User.findOne({ email : req.body.email})
        res.status(200).json({
            user,
            sucess : true
            
        }) 
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ msg:'SERVER ERROR'})
    }
}



// CONNEXION DE L'ADMINISTRATEUR 
module.exports.LoginAdmin = async (req, res ) => {

    try {

        const {email, password} = req.body
        if( !email || !password){
            return res.status(400).json({ 
                msg: 'invalid credentials, enter fiels',
                success: false 
            })
        }
        
        let admin = await Admin.findOne({email}).select('+password')
        if(!admin ) return res.status(400).json({
            msg: 'invalid credentials, user dont exist',
            success: false 
        })
        
        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch ) return res.status(400).json({ 
            msg: 'invalid credentials, wrong password',
            success: false 
        })
        
        jwt.sign({id: admin._id}, process.env.JWT_SECRET, {
            expiresIn: 36000 
        }, (err, token) => {
            if(err) throw err
            res.status(200).json({
                token
            })
        })
    
    } catch (err) {
        console.log(err)
        res.status(400).json({success: false})
    }
    
}



// MISE A JOUR MOT DE PASSE ADMINISTRATEUR
module.exports.UpdateAdmin = async (req, res )=> {
    try{
        const admin = await Admin.findOne({ email: req.body.email})
        if(!admin) {
            return res.status(400).json({
                msg: 'admin dont exists',
                success: false
            })
        }

        const newpass = generateRandomPassword(8)
        const msg = {
            title: 'Reinitialisation de votre mot de passe admin',
            content: '<p>Nom Administrateur: ' + admin.email + '</p> <p>Voici votre nouveau mot de passe: ' + newpass +'</p>'
        }
        sendMail(admin,msg)


        const slat = await bcrypt.genSalt(10)
        hashpass = await bcrypt.hash(newpass, slat)        

        const UpdateAdmin = await Admin.findOneAndUpdate(
            { _id: admin._id },
            { $set: {password : hashpass}},
            {new : true}
        )
       
        if (UpdateAdmin){
            console.log('Mot de passe mis a jour avec succes')
            return  res.status(200).json({
                UpdateAdmin,
                success: true
            })
        }else {
            console.log('admin dont find')
            return null
        }


    }catch (err) {
        console.log(err)
        res.status(400).json({ sucess: false})
    }
}


//MISE A JOUR MOT DE PASSE UTILISATEUR
module.exports.UpdateUser = async (req, res )=> {
    try{
        const user = await User.findOne({ email: req.body.email})
        if(!user) {
            return res.status(400).json({
                msg: 'user dont exists',
                success: false
            })
        }

        const newpass = generateRandomPassword(8)
        const msg = {
            title: 'Reinitialisation de votre mot de passe utilisateur',
            content: '<p>Nom utilisateur: ' + user.email + '</p> <p>Voici votre nouveau mot de passe: ' + newpass +'</p>'
        }
        sendMail(user,msg)


        const slat = await bcrypt.genSalt(10)
        hashpass = await bcrypt.hash(newpass, slat)        

        const UpdateUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: {password : hashpass}},
            {new : true}
        )
       
        if (UpdateUser){
            console.log('Mot de passe mis a jour avec succes')
            return  res.status(200).json({
                UpdateUser,
                success: true
            })
        }else {
            console.log('user dont find')
            return null
        }


    }catch (err) {
        console.log(err)
        res.status(400).json({ sucess: false})
    }
}

module.exports.DeleteUser = async (req, res) =>{
    const userId= req.params.userId
    try {
        const result = await User.deleteOne({ _id: userId }); // Supprime l'utilisateur avec cet ID
        if (result.deletedCount === 1) {
          console.log('Utilisateur supprimé avec succès.');
          return true;
        } else {
          console.log("L'utilisateur n'a pas été trouvé ou supprimé.");
          return false;
        }

    }catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.' });
    }
}