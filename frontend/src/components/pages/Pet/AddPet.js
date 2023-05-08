import api from '../../../utils/api'

import styles from './AddPet.module.css'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* Components */
import PetForm from '../../form/PetForm'

/* hook */
import useFlashMessage from '../../../hooks/useFlashMessage'


function AddPet() {
    const [token] = useState(localStorage.getItem('token') || '')
    const { setFlashMessage } = useFlashMessage()
    const navigate = useNavigate()

    async function registerPet(pet) {
        let msgType = 'success'

        const formData = new FormData()

        await Object.keys(pet).forEach((key) => {
            if(key === 'images') {
                for(let i = 0; i < pet[key].length; i++) {
                    formData.append('images', pet[key][i])
                }
            } else {
                formData.append(key, pet[key])
            }
        })
        
        const data = await api.post('pets/create', formData, {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((response) => {
            return response.data
        })
        .catch((err) => {
            msgType = 'error'
            return err.response.data
        })

        setFlashMessage(data.message, msgType)
        
        if (msgType !== 'error') {
            navigate('/pet/mypets')
        }
    }



    return (
        <section>
            <div>
                <h1>Add a Pet</h1>
                <p>It will be available for adoption later</p>
            </div>
            <PetForm handleSubmit={registerPet} btnText="Register Pet" />
            
        </section>
    )
}

export default AddPet