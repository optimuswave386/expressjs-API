const express = require('express');
const router = express.Router();
const designnotesController = require('../controllers/designnotesController');




// This path is actually /cep/getProjects
router.get('/getNotes', designnotesController.getNotesFromDB);
router.get('/getNotes/:itemsperpage', designnotesController.getNotesFromDB_withpagination);



module.exports = router;