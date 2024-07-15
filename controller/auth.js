import User from "../model/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
export const authController = {
    login: async (req, res) => {
        const { usrname, passwrd } = req.body
        if (!usrname || !passwrd) return res.status(422).json({ message: "Username or password is required." })
        const user = await User.findOne({ userName: usrname })
        if (!user) return res.status(404).json({ message: "No User found with username provided." })
        const match = await bcrypt.compare(passwrd, user.password)
        if (!match) return res.status(401).json({ message: "Incorrect Username or password." })
        const { userName, email } = user
        const accessToken = jwt.sign({ userName, email }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        })
        res.json({ accessToken })
    },
    register: async (req, res) => {
        const { userName, email, passwrd, name } = req.body
        if (!userName || !email || !passwrd || !name) return res.status(422).json({ message: "All fields are required." })
        try {
            const existingUser = await User.findOne({
                $or: [{ userName: userName }, { email: email }]
            });
            if (existingUser) {
                return res.status(409).json({ message: "Username or email already exists." });
            }

            const hashedPassword = await bcrypt.hash(passwrd, 10);
            const user = await User.create({
                email: email,
                password: hashedPassword,
                name: name,
                userName: userName,
            });

            res.status(201).json({ message: "User created successfully." });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }

    }
}