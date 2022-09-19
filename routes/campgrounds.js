const express = require('express'); //npm i express
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampgroud } = require('../middleware');
const multer = require('multer'); //npm i multer
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampgroud, catchAsync(campgrounds.createCampground))

// .post(upload.single('image'), (req, res) => {
//     console.log(req.body, req.file);
// })
// .post(upload.multiple('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('IT WORKED!!')
// }) // add the atrivute 'multiple' in the html input

router.get('/new', isLoggedIn, (campgrounds.renderNewForm));

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampgroud, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;