const express = require('express');
const app = express();
const path = require('path');

// Установите статическую папку
app.use(express.static(path.join(__dirname, 'public')));

// Отправка HTML файла
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
