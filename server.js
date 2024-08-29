import express from 'express';
const port = process.env.PORT || 3000;
const app = express();

app.use(express.static('dist'));

app.listen(port, '0.0.0.0',() => {
    console.log(`HPD Generator listening at http://0.0.0.0:${port}`);
});