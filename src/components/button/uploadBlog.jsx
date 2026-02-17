import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function UploadBlog() {
    const navigate = useNavigate()
    const { auth } = useAuth()

    const addProduct = async () => {
        // Check if user is admin (role 5)
        if (auth?.roles === 5 || auth?.roles === 4 ) {
            navigate('/blog/uploadpost', { replace: true })
        } else {
            // Redirect to unauthorized page if not admin
            navigate('/unauthorized', { replace: true })
        }
    }

    // Only show the button if user is admin
    if (auth?.roles !== 5) {
        return null
    }

    return (
        <button className='bg-gray-950 text-white rounded-md  px-3 md:px-4 py-2 text-sm font-medium hover:bg-gray-800 transition duration-300' onClick={addProduct}>
            Upload Blog
        </button>
    )
}

export default UploadBlog