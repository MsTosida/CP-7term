import express from 'express';
import { Request, Response } from 'express';
import { decrypt, encrypt } from "./xxtea";
import { encryptData, decryptData } from "./cast";
import { util } from "node-forge";
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
import * as crypto from "crypto";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('cp');
});

app.get("/time", async (req: Request, res: Response) => {
    const files = [
        'files/text_10.txt',
        'files/text_100.txt',
        'files/text_500.txt',
        'files/text_1000.txt',
        'files/text_2000.txt'
    ];
    const encryptedFilesXXTEA = [
        'files/encX_text_10.txt',
        'files/encX_text_100.txt',
        'files/encX_text_500.txt',
        'files/encX_text_1000.txt',
        'files/encX_text_2000.txt'
    ];

    const encryptedFilesCAST = [
        'files/encC_text_10.txt',
        'files/encC_text_100.txt',
        'files/encC_text_500.txt',
        'files/encC_text_1000.txt',
        'files/encC_text_2000.txt'
    ];

    const encryptionTimesXXTEA = [];
    const decryptionTimesXXTEA = [];
    const encryptionTimesCAST = [];
    const decryptionTimesCAST = [];
    const key = crypto.randomBytes(16);

    for (let i = 0; i < files.length; i++) {
        const text = (await fs.readFile(files[i])).toString('utf-8');

        // Шифрование XXTEA
        const startEncryptXXTEA = process.hrtime();
        const encryptedTextXXTEA = await encrypt(text, key.toString());
        const endEncryptXXTEA = process.hrtime(startEncryptXXTEA);
        const buffer = util.createBuffer(encryptedTextXXTEA);
        const resultXXTEA = util.bytesToHex(buffer.bytes());
        await fs.writeFile(encryptedFilesXXTEA[i], resultXXTEA);
        encryptionTimesXXTEA.push(endEncryptXXTEA[0] * 1000 + endEncryptXXTEA[1] / 1000000);

        // Расшифрование XXTEA
        const startDecryptXXTEA = process.hrtime();
        const decryptedTextXXTEA = await decrypt(encryptedTextXXTEA, key.toString());
        const endDecryptXXTEA = process.hrtime(startDecryptXXTEA);
        decryptionTimesXXTEA.push(endDecryptXXTEA[0] * 1000 + endDecryptXXTEA[1] / 1000000);

        // Шифрование CAST
        const startEncryptCAST = process.hrtime();
        const encryptedTextCAST = await encryptData(text, key.toString()); 
        const endEncryptCAST = process.hrtime(startEncryptCAST);
        const parts = encryptedTextCAST.split(':');
        const encryptedText = parts[1]; 
        await fs.writeFile(encryptedFilesCAST[i], encryptedText);
        encryptionTimesCAST.push(endEncryptCAST[0] * 1000 + endEncryptCAST[1] / 1000000);

        // Расшифрование CAST
        const startDecryptCAST = process.hrtime();
        const decryptedTextCAST = await decryptData(encryptedTextCAST, key.toString());
        const endDecryptCAST = process.hrtime(startDecryptCAST);
        decryptionTimesCAST.push(endDecryptCAST[0] * 1000 + endDecryptCAST[1] / 1000000);

    }

    res.render('time', {
        encryptionTimesXXTEA,
        decryptionTimesXXTEA,
        encryptionTimesCAST,
        decryptionTimesCAST
    });
});

app.post("/encrypt", (req, res) => {
    let startTime = performance.now();
    const encryptedTextXXTEA = encrypt(req.body.enc_text, req.body.key);
    const buffer = util.createBuffer(encryptedTextXXTEA);
    const resultXXTEA = util.bytesToHex(buffer.bytes());
    

    let endTime = performance.now();
    const encodingTimeXXTEA = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const decryptedTextXXTEA = decrypt(encryptedTextXXTEA, req.body.key);
    endTime = performance.now();
    const decodingTimeXXTEA = (endTime - startTime).toFixed(4);

    startTime = performance.now();
    const encryptedTextCAST = encryptData(req.body.enc_text, req.body.key);
    const parts = encryptedTextCAST.split(':');
    const encryptedText = parts[1]; 
    //const bufferr = util.createBuffer(encryptedTextCAST);
    //const resultCAST = util.encode64(bufferr.getBytes());

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

        encryptedCAST: encryptedText,
        decryptedCAST: decryptedTextCAST,
        decodingTimeCAST: decodingTimeCAST,
        encodingTimeCAST: encodingTimeCAST
    });
});


app.listen(3001, () => console.log(`Server is running at http://localhost:3001`));