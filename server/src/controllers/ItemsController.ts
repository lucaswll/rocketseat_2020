import {Request, Response} from 'express'
import knex from '../database/connection'

class ItemsController{
    async index(request: Request, response: Response) {
        const items = await knex('items').select('*')
     
        const serializesItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.0.110:3333/uploads/${item.image}` 
            }
        })//serialização de dados.. trasformando os dados para 1 novo formato + acessivel pro user
    
        return response.json(serializesItems)
    }
}

export default ItemsController