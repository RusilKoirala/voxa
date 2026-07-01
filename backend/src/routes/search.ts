import express from "express"
import { searchAll } from "../controllers/searchController.js"

const router = express.Router()

// search everything
router.get('/', searchAll)

export default router