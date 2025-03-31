const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { obfuscateFile } = require('./encrypt'); // Importando a função de criptografia
const os = require('os'); // Para usar o diretório temporário

const app = express();
const port = 3000;

// Configuração do multer para salvar arquivos temporários
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir()); // Usando a pasta temporária do sistema
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Mantém o nome original do arquivo
  }
});
const upload = multer({ storage: storage });

// Serve a página HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MSTBYA6ILNUE3OTMJZNSDSTUAC7BTMLM

// Rota para fazer upload do arquivo e criptografar
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file || path.extname(req.file.originalname) !== '.js') {
    return res.status(400).send('Por favor, envie um arquivo JavaScript.');
  }

  const inputFilePath = req.file.path;
  const outputFilePath = path.join(os.tmpdir(), req.file.originalname); // Criptografa no mesmo caminho, com o mesmo nome

  try {
    await obfuscateFile(inputFilePath, outputFilePath); // Criptografa o arquivo

    res.download(outputFilePath, req.file.originalname, (err) => {
      if (err) {
        console.error('Erro ao enviar o arquivo para download:', err);
      }

      // Apaga os arquivos temporários após o download
      fs.unlinkSync(outputFilePath); // Apaga o arquivo criptografado
    });
  } catch (error) {
    console.error('Erro ao criptografar o arquivo:', error);
    res.status(500).send('Erro ao criptografar o arquivo.');
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
