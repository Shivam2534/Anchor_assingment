"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const user = yield User_1.default.create({
            username,
            email,
            password,
        });
        if (user) {
            res.status(201).json({
                user: {
                    _id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user._id.toString()),
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (user && (yield user.comparePassword(password))) {
            res.json({
                user: {
                    _id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                },
                token: generateToken(user._id.toString()),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select('-password');
        if (user) {
            res.json({
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Since we're using JWT, we don't need to do anything server-side
        // The client will remove the token
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
