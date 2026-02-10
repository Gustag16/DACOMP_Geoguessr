import ExifReader from 'exifreader'
import { useState, useEffect } from 'react'
import { api, fetchCSRFToken } from '../api/api'
import axios from 'axios'
// Pega o link da imagem e já deixa no formato certo pra mandar pro back.
// Pra extrair as outras informações, tem que baixar a imagem tb aq.
// https://drive.usercontent.google.com/download?id=FILE ID

interface LocationData {
    image_url: string
    place_name: string
    latitude: number 
    longitude: number 
    category: string
}

export default function AddLocation() {
    useEffect(() => {
    const initCSRF = async () => {
      console.log('Initializing CSRF...')
      
      // Obtenha o token
      const success = await fetchCSRFToken()
      
      if (success) {
        console.log('CSRF initialized successfully')
        
      } else {
        console.error('Failed to initialize CSRF')
        
        // Fallback: tente sem Secure em dev
        if (import.meta.env.DEV) {
          console.log('Trying without Secure flag...')
        }
      }
    }
    
    initCSRF()
  }, [])

    function getGoogleDriveId(url: string): string | null {
        const parts = url.split('/d/');
        return parts.length > 1 ? parts[1].split('/')[0] : null;
    }
    const [Location, setLocation] = useState<LocationData>({
        image_url: '',
        place_name: '',
        latitude: 0,
        longitude: 0,
        category: ''
    })


    const handleSubmit = () => {
        api.post('api/location/', Location)

        .then(response => {
            console.log('Location added successfully:', response.data);
        })
        .catch(error => {
            console.error('Error adding location:', error);
        });
        
    }

    const get_image_data = async (e: any) => {
        const id = getGoogleDriveId(e.target.value)
        const file_url = `https://drive.google.com/id=${id}`
        setLocation(prev => ({...prev, image_url: file_url}))
        try {
            // Baixa a imagem como Blob (fica só em memória)
            const download_url = `${import.meta.env.VITE_API_URL}/proxy`
            const response = await axios.get(download_url, { params: { id }, responseType: 'blob', headers: { 'Accept': 'image/jpeg', 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5 });
            const blob = response.data;
            console.log(response.headers['content-disposition'])
            const arrayBuffer = await blob.arrayBuffer();
            const tags = ExifReader.load(arrayBuffer);
            

        setLocation(prev => ({...prev, place_name: tags.ImageDescription ? tags.ImageDescription.description : 'Unknown Place'}));
        const reader = new FileReader()
        reader.readAsArrayBuffer(blob)

        reader.onloadend = () => {
            setLocation(prev => ({
                ...prev,
                image_url: `https://drive.google.com/uc?export=download&id=${id}`,
                place_name: response.headers['content-disposition']?.split('filename=')?.[1]?.replace(/['"]/g, '') || 'Unknown Place',
                latitude: Number(tags.GPSLatitude?.description) || 0,
                longitude: Number(tags.GPSLongitude?.description) || 0
            }));
        };
    }
    catch (error) {
        console.error('Error fetching image or reading EXIF data:', error);
    }
    }
    
    useEffect(() => {
        console.log(Location)
    }, [Location])

    return (
        <div>
            <h1>Add Location</h1>
                <input 
                    type="text" 
                    key="image_url" 
                    id="image_url"
                    placeholder="Enter image URL"
                    onChange={get_image_data}
                ></input>
             <input type="text" onChange={(e) => setLocation({...Location, category: e.target.value})} placeholder="Enter category (Norte, Sul, Centro)"></input>
             <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}