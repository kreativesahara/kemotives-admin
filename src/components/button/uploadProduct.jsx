import { useNavigate } from 'react-router-dom'

function UploadProduct() {
    const navigate = useNavigate()
    const addProduct = async () => {
        navigate('/products/upload', { replace: true })
    }
  return (
      <button className='bg-gray-950 text-white rounded-md  px-3 md:px-4 py-2 text-sm font-medium hover:bg-gray-800 transition duration-300' onClick={addProduct}>
          Upload Product
      </button>
  )
}

export default UploadProduct