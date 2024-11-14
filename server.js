require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
const Car = require('./models/Car');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.static('public/image'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Middleware to protect routes
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(error => console.log('MongoDB connection error:', error));

// Image upload setup with multer
const storage = multer.diskStorage({
    destination: 'public/image',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.redirect('/login');
    } catch (error) {
        res.send('Error creating user');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.session.email = user.email; // Store email in session
            res.redirect('/dashboard');
        } else {
            res.send('Invalid email or password');
        }
    } catch (error) {
        res.send('Error logging in');
    }
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    const cars = await Car.find();
    res.render('dashboard', { email: user.email, cars });
});

app.post('/addCar', isAuthenticated, upload.single('image'), async (req, res) => {
    const { name, model, price } = req.body;
    const image = `/image/${req.file.filename}`;
    const car = new Car({ name, model, price, image });
    await car.save();
    res.redirect('/dashboard');
});

app.get('/editCar/:id', isAuthenticated, async (req, res) => {
    const carId = req.params.id;
    try {
        const car = await Car.findById(carId);
        const email = req.session.email || 'Guest'; // Get email from session
        res.render('editCar', { car: car, email: email });
    } catch (error) {
        res.send('Error fetching car details');
    }
});

app.post('/editCar/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    const carId = req.params.id;
    const { name, model, price } = req.body;
    const image = req.file ? `/image/${req.file.filename}` : undefined;

    try {
        const updatedCar = await Car.findByIdAndUpdate(carId, {
            name,
            model,
            price,
            image: image || undefined
        }, { new: true });
        res.redirect('/dashboard');
    } catch (error) {
        res.send('Error updating car details');
    }
});

app.get('/deleteCar/:id', isAuthenticated, async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (error) {
        res.send('Error deleting car');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/login');
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
