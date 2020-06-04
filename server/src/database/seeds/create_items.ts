import Knex from 'knex'
//o seed é uma funcionalidade do knex para ja criar items em uma tabela. No caso abaixo, tabela items

export async function seed(knex: Knex) {
    await knex('items').insert([
        { title: 'Lâmpadas', image: 'lampadas.svg'},
        { title: 'Pilhas e Baterias', image: 'baterias.svg'},
        { title: 'Papéis e Papelão', image: 'papeis-papelao.svg'},
        { title: 'Resíduos Eletrônicos', image: 'eletronicos.svg'},
        { title: 'Resíduos Orgânicos', image: 'organicos.svg'},
        { title: 'Óleo de Cozinha', image: 'oleo.svg'},
    ]) //JA FIZ O CADASTRO DOS ITENS POR AQUI, N PRECISANDO FAZER UM PUT PRO USER
}
//comando para executar este arquivo, após criar um caminho no knexfiles.knex:seed":
//está la no package.json, nos script. Dai basta npm run knex:seed 