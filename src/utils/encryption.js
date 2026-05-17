import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-fallback-key';

// 1. 데이터를 숨기는 함수 (암호화)
export const encryptData = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

// 2. 숨긴 데이터를 다시 읽는 함수 (복호화)
export const decryptData = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // 복호화에 성공하면 원래 글자 반환, 실패하면 원래 텍스트 반환(기존에 암호화 안 된 데이터 호환용)
    return decrypted || ciphertext; 
  } catch (error) {
    return ciphertext;
  }
};