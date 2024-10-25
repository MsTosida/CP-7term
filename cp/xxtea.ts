const xxtea = require('xxtea-node');
import {util} from "node-forge";

export const encrypt = (msg: string, key: string) => {
    var encrypt_data = xxtea.encrypt(xxtea.toBytes(msg), xxtea.toBytes(key));
    return encrypt_data; 
};

export const decrypt = (encrypted: util.ByteStringBuffer, key: string) => {
    var decrypt_data = xxtea.decrypt(encrypted, xxtea.toBytes(key));
    return xxtea.toString(decrypt_data); 
};


