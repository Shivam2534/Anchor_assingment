"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pollController_1 = require("../controllers/pollController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', pollController_1.getPolls);
router.get('/:id', pollController_1.getPoll);
// Protected routes
router.post('/', auth_1.protect, pollController_1.createPoll);
router.post('/:id/vote', auth_1.protect, pollController_1.vote);
router.delete('/:id', auth_1.protect, pollController_1.deletePoll);
exports.default = router;
