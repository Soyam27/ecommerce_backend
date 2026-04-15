import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { register } from './controllers/user/auth.ts';
import { errorHandler } from './utils/errorHandler.ts';

const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.post("/user",register);


app.use(errorHandler);

app.listen(8000,()=>{
    console.log("Server is running!")
})