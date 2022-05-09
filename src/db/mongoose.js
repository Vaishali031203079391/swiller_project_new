const mongoose = require('mongoose')

//mDVk9h68Sqvm1tZK

//mongodb+srv://VaishaliSharath:Eym32y3nvaZHXSoN@cluster0.ocr2e.mongodb.net/swiller?retryWrites=true&w=majority


const URI = 'mongodb+srv://VaishaliSharath:Eym32y3nvaZHXSoN@cluster0.ocr2e.mongodb.net/swiller?retryWrites=true&w=majority'; // process.env.MONGODB_URL;
console.log(URI);
mongoose.connect(URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('Connected to database !!');
    })
    .catch((err)=>{
      console.log('Connection failed !!'+ err.message);
    });

