import express from 'express';
import {decrypt, encrypt} from "./xxtea";
import {encryptData, decryptData} from "./cast";
import {util} from "node-forge";
const { performance } = require('perf_hooks');
import * as fs from "fs";
import path from "path";


import languageEncoding from "detect-file-encoding-and-language"

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('cp');
});

app.post("/encrypt", (req, res) => {

    
    let startTime = performance.now();

    const encryptedTextXXTEA = encrypt(req.body.enc_text, req.body.key);
    const buffer = util.createBuffer(encryptedTextXXTEA);
    const resultXXTEA = util.encode64(buffer.getBytes());
    
    let endTime = performance.now();
    const encodingTimeXXTEA = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const decryptedTextXXTEA = decrypt(encryptedTextXXTEA, req.body.key);
    endTime = performance.now();
    const decodingTimeXXTEA = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const encryptedTextCAST = encryptData(req.body.enc_text, req.body.key);
    const bufferr = util.createBuffer(encryptedTextCAST);
    const resultCAST = util.encode64(bufferr.getBytes());

    endTime = performance.now();
    const encodingTimeCAST = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const decryptedTextCAST = decryptData(encryptedTextCAST, req.body.key);
    endTime = performance.now();
    const decodingTimeCAST = (endTime - startTime).toFixed(4);


    res.status(200).json({
        encryptedXXTEA: resultXXTEA,
        decryptedXXTEA: decryptedTextXXTEA,
        decodingTimeXXTEA: decodingTimeXXTEA,
        encodingTimeXXTEA: encodingTimeXXTEA,

        encryptedCAST: resultCAST,
        decryptedCAST: decryptedTextCAST,
        decodingTimeCAST: decodingTimeCAST,
        encodingTimeCAST: encodingTimeCAST
    });
});


app.listen(3001, () => console.log(`Server is running at http://localhost:3001`));