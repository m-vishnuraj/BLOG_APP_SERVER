const express = require("express");

const app = express();


app.get('/', (req, res) => {
    res.json({
        message: 'Fixware Technologies is the best!'
    });
});

app.listen(8000, () => {
    console.log("server is running on port 8000");
});