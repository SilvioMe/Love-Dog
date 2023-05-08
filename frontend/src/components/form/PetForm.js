import { useState } from "react"
import formStyles from './Form.module.css'
import Input from './Input'
import Select from './Select'

function PetForm({handleSubmit, petData, btnText}) {
    const [pet, setPet] = useState(petData || {})
    const [preview, setPreview] = useState([])
    const colors = ['White', 'Black', 'Grey', 'Caramel', 'Tricolored']

    function onFileChange(e) {
        setPreview(Array.from(e.target.files))
        setPet({ ...pet, images: [...e.target.files] })
    }
    function handleChange(e) {
        setPet({ ...pet, [e.target.name]: e.target.value })
    }
    function handleColor(e) {
        setPet({ ...pet, color: e.target.options[e.target.selectedIndex].text })
    }

    function submit(e) {
        e.preventDefault()
        handleSubmit(pet)
    }

    return ( 
        <form onSubmit={submit} className={formStyles.form_container}>
            <div className={formStyles.preview_pet_images}>
                {preview.length > 0
                    ? preview.map((image, index) => (
                        <img
                            src={URL.createObjectURL(image)}
                            alt={pet.name}
                            key={`${pet.name}+${index}`}
                        />
                      ))
                    : pet.images &&
                      pet.images.map((image, index) => (
                        <img
                            src={`${process.env.REACT_APP_API}/images/pets/${image}`}
                            alt={pet.name}
                            key={`${pet.name}+${index}`}
                        />
                      ))}
            </div>
            <Input 
                text="Dog's Image"
                type="file"
                name="images"
                handleOnChange={onFileChange}
                multiple={true}
            />
            <Input 
                text="Dog's Name"
                type="text"
                name="name"
                placeholder="Type the dog's name"
                handleOnChange={handleChange}
                value={pet.name || ''}
            />
            <Input 
                text="Dog's age"
                type="text"
                name="age"
                placeholder="Type the dog's age"
                handleOnChange={handleChange}
                value={pet.age || ''}
            />
            <Input 
                text="Dog's weight"
                type="number"
                name="weight"
                placeholder="Type the dog's weight"
                handleOnChange={handleChange}
                value={pet.weight || ''}
            />
            <Select
                name="color"
                text="Select a color"
                options={colors}
                handleOnChange={handleColor}
                value={pet.color || ''}
            />
            <input type="submit" value={btnText} />
        </form>
    )
}

export default PetForm