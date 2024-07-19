const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const AdminAuth = require("../middleware/AdminAuth");
//let b3Controller = require('../controllers/b3Controller')
const EquitieController = require('../controllers/EquitieController')

//Login
router.post('/user', UserController.create);
router.get("/user" ,UserController.index);
router.get("/user/:id", UserController.findUser);
router.get("/users/:email", UserController.findByEmail);
router.put("/user",AdminAuth,UserController.edit);
router.delete("/suer/:id",AdminAuth,UserController.remove);
router.post("/recoverpassword",UserController.recoverPassword);
router.post("/changepassword",UserController.changePassword);
router.post("/login",UserController.login);

//B3 and BRAPI integration
router.post('/b3request', EquitieController.index);
router.get("/getequeties/:id",UserController.getEquities);
router.post("/brapiStocks", EquitieController.getCurrentStocks);
router.get("/brapiStocks", EquitieController.getBrapiStocks);
router.post("/getStockHistory", EquitieController.saveHistoryStocks);
router.get("/getEquitiesHistory/:cpf",UserController.getEquitiesHistory);

module.exports = router;