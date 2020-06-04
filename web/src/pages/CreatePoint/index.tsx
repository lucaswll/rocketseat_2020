import React, { useEffect, useState, ChangeEvent, FormEvent}from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import {Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'

import { LeafletMouseEvent } from 'leaflet'

import './styles.css'

import logo from '../../assets/logo.svg'

//SEMPRE QUE CRIO UM STATE PARA UM ARRAY OU OBJETO, PRECISO SEMPRE INFORMAR MANUALMENTE O TIPO DA VARIAVEL
//QUE SERA ARMAZENADA LA DENTRO2 ↓
interface Item{
    id: number
    title: string
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

//AI, NO STATE TENHO QUE DECLARAR ESTA INTERFACE (representacao do formato que um objeto vai ter)
//o estado dos itens será um ARRAY de itens, por isso vem o [] na frente de Item
const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [selectedUf, setSelectedUf] = useState('0') //armazena qual foi a uf selecionada pelo user
    const [selectedCity, setSelectedCity] = useState('0')

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const history = useHistory()

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data) //posso ver onde estão os itens, dando um console.log(response)
            //e inspecionando na aba console
        });
    }, [])


    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)

            setUfs(ufInitials)
        })
    }, [])

    useEffect(() => { //carregar as cidades sempre que a UF mudar
        if (selectedUf === '0'){
            return
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const citieNames = response.data.map(city => city.nome)

            setCities(citieNames)
        })
    }, [selectedUf]) //o segundo parametro define quando a funcao do 1o parametro deve executar


    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){ //to passando pra ele o valor de um SELECT
        const uf = event.target.value  //traz a uf selecionada

        setSelectedUf(uf)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){ //to passando pra ele o valor de um SELECT
        const city = event.target.value  //traz a uf selecionada

        setSelectedCity(city)
        //console.log(city)
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target //atribuindo a var name, o valor (value) dado pelo evento Input
        
        setFormData({...formData, [name]: value}) //name é o nome do input, q pode ser name, email, wpp
        //dependendo do q ele identificar, ele muda o valor do formData
    }

    const [selectedItems, setSelectedItems] = useState<number[]>([])

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id)

        if(alreadySelected >=0 ){
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems)
        }else {
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        const { name, email, whatsapp } = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        //console.log(data)

        await api.post('/points', data) //comando post para CRIAR um point com os respect. dados
        alert(`Ponto de coleta ${data.name} criado`)

        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-Mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}/>
                        </div>

                        <div className="field">
                        <label htmlFor="Whatsapp">Whatsapp</label>
                        <input 
                            type="text"
                            name="Whatsapp"
                            id="Whatsapp"
                            onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[-16.6500746, -49.3237381]} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => ( //para cada item que ele encontrar.. liste no li // //preciso coloar essa key sempre como a chave primaria..
                        <li 
                        key={item.id}
                        onClick={() => handleSelectItem(item.id)} 
                        className={selectedItems.includes(item.id) ? 'selected' : ''}> 
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                        ))}
                        
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>

            </form>            

        </div>
    )
}

export default CreatePoint