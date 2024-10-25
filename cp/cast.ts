import * as crypto from "crypto";

export const encryptData = (data: string, key: string): string => {
   
    const iv = crypto.randomBytes(8); 
    const cipher = crypto.createCipheriv('cast', Buffer.from(key), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
}

export const decryptData = (encryptedData: string, key: string): string => {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex'); 
    const encryptedText = parts.join(':'); 

    const decipher = crypto.createDecipheriv('cast', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}