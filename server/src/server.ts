import express from 'express'
import routes from './routes'
import cors from 'cors'
import path from 'path'

const app = express()

app.use(cors()) //permitir abrir a api no frontend
app.use(express.json()) //to fazendo o express entender o corpo da requisicao como json (as get's)
app.use(routes)

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads'))) //static me permite passar arquivos para o user
//o uso do path acima seria pra substituir '../uploads/'; como é uma pasta, coloco __dirname, se fosse 1 arquivo, __filename

app.listen(3333)