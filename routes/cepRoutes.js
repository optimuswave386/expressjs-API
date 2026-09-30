const express = require('express');
const router = express.Router();
const cepController = require('../controllers/cepController');


router.get('/', cepController.getProjects);


// This path is actually /cep/getProjects
router.get('/getProjects', cepController.getProjectsFromDB);
router.get('/getProjects/:itemsperpage', cepController.getProjectsFromDB_withpagination);

// Export the router
module.exports = router;