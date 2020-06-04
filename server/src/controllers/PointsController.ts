import {Request, Response} from 'express'
import knex from '../database/connection'

class PointsController{
    async index(request: Request, response: Response){ 
        const { city, uf, items } = request.query

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()))
        //estou pegando os id dos items que vem no query como String, separando os pela virgula
        //e colocando num vetor. No .map... ele vai em cada um, retirando os espaçamentos antes e dps.
        //sempre que recebo pelo QUERY, é bom certificar o formato. Por isso forço ser Number, String...
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id') //join nela pq ela q armazena as info dos items vinculados àquele ponto
            .whereIn('point_items.items_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct() //pra retornar uma x só, mesmo que o ponto passe mais de 1x nos fitros
            .select('points.*') //buscar todos os itens da tabela points.

        return response.json(points)
    }

    async show(request: Request, response: Response){
        const { id } = request.params
        
        const point = await knex('points').where('id', id).first()

        if(!point){
            return response.status(400).json({ message: 'Point not found' })
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.items_id')//fazer um join na tabela point_items onde o id do item seja igual ao item_id da tabela relacional à chave estrangeira que guarda o id do item vinculado àquele ponto..
            .where('point_items.point_id', id)                          //onde o point_id seja igual ao id passado nos params
            .select('items.id', 'items.title')

        return response.json({ point, items })
    }

    async create(request: Request, response: Response){ 
        const { //recurso de desistruração do js..
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items //1 ou +de1 (array) lembrando q tabela points nao tem a coluna items (que é outra tabela..)
        } = request.body;
    
        const trx = await knex.transaction()

        const point = { //inserindo os campos na tabela.. só q items não é 1 campo da tabela points, n insiro
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            image: 'https://images.unsplash.com/photo-1591103796766-ab23636d8047?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60'
        }
        
        const insertedIds = await trx('points').insert(point)
    
        //relacionamento das tables
        const pointItems = items.map((items_id: number) => { //:number é pra corrigir no ts quando da erro de type 
            return { //retorno um objeto com o id do item, e o id do ponto que acabei de criar..
                items_id,
                point_id: insertedIds[0] //pego sempre essa primeira posicao pq é o point que acabou de ser criado
            }
        })
    
        await trx('point_items').insert(pointItems)
        
        await trx.commit()

        return response.json({ 
            id: insertedIds[0],
            ...point //colocando todos os dados do objeto point aqui dentro + o id do point criado
         })
    }    
}

export default PointsController