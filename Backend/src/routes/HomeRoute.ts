
import express, { Router } from "express"
import {GetHome} from "../contoller/HomeContoller.js"

export let homeRoute = express.Router()










homeRoute.get("/GetHome",GetHome)