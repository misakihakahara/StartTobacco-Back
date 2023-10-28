const User = require('../models/User')
const Role = require('../models/Role')
const jwt = require('jsonwebtoken')
const { hashSync, compareSync } = require("bcrypt");

const generateToken = (id) => {
    const payload = {
        id,
    }
    return jwt.sign(payload, "jXSFM1kfpDMF7RB7", { expiresIn: '24h' })
}

class AuthController {
    async registration(req, res) {
        try {
            const { fullName, email, phone, password, roles } = req.body;
            if (!fullName && !email && !phone && !password && !roles) {
                res.status(400).json({ status: 400 })
            }
            const hashPassword = hashSync(password, 7)
            const userRole = await Role.findOne({ value: 'Пользователь' })
            const user = await new User({
                fullName,
                email,
                phone,
                password: hashPassword,
                roles: [userRole.value]
            }).save();

            return res.status(200).send(user)
        } catch (e) {
            console.log(e)
        }
    }

    async authorization(req, res) {
        try {
            const { email, password } = req.body;
            if (!email) {
                res.status(401).json({ status: 'Email' })
            }
            const user = await User.findOne({ email })

            if (!user) {
                res.status(401).json({ status: 'user' })
            }
            const validPass = compareSync(password, user.password)
            if (!validPass) {
                return res.status(400).json({ status: 'Password incorrect' })
            }
            const token = generateToken(user._id)

            res.status(200).json({ token })
        } catch (e) {
            console.log(e)
        }
    }
    async changeRole(req, res) {
        const { id, role } = req.body;
        
        try {
            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            user.roles = [role];
            await user.save();
            
            return res.status(200).json({ message: 'User role changed successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }    
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new AuthController();
