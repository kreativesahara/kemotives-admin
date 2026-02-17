import { Link } from 'react-router-dom'
import Logo from '../assets/diksx.png'

function footer() {
    return (
        <div className="min-w-[350px] max-w-[2000px] mx-auto px-5 md:px-20 pb-4  pt-6 bg-slate-100">
            <div className="justify-between py-20 flex flex-col md:py-20 md:flex-row gap-4 md:place-content-center">
                <div className="sm:px-10 px-6 w-full md:w-1/3 md:min-w-[560px] max-w-[580px] text-center md:text-left">
                    <Link to="/home" className="text-2xl font-bold">
                        <img
                            title="Diksx Cars"
                            src={Logo}
                            width="400"
                            height="300"
                            className="w-[125px] h-[100px] mx-auto md:mx-0 sm:p-6 "
                            alt="Diksx cars"
                            loading="lazy"
                        />
                    </Link>
                    <p className="space-y-4 justify-center leading-10 md:font-bold text-xl py-12">
                        The Vehicle Marketplace to find your next Ride.
                        Also With its diverse spare part portfolio, diksx Automotive and spares offers its
                        consumers an attractive and fun selection.
                    </p>
                </div>
                <div className="justify-between px-10 w-full md:w-2/4 md:my-auto sm:justify-between text-center md:text-left">
                    <ul className="md:space-y-9 space-y-6 pb-3">
                        <p className="text-xl font-bold">Navigation</p>
                        <li >
                            <Link to="/home" className="hover:text-blue-600 transition-colors">Home</Link>
                        </li>
                        <li>
                            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/vehicles" className="hover:text-blue-600 transition-colors">Vehicles</Link>
                        </li>
                        <li>
                            <Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                        </li>
                      
                    </ul>
                </div>
                <div className="justify-between px-10 w-full md:w-2/4 md:my-auto text-center md:text-left">
                    <ul className="md:space-y-9 space-y-6 pb-3">
                        <p className="text-xl font-bold">Support</p>
                        <li>
                            <Link to="/support" className="hover:text-blue-600 transition-colors">Help Center</Link>
                        </li>
                        <li>
                            <Link to="/support" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link>
                        </li>
                        <li>
                            <Link to="/become-seller" className="hover:text-blue-600 transition-colors">Become a Seller</Link>
                        </li>
                        <li>
                            <Link to="/support" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className='text-center mx-auto py-4 text-xs md:text-xl md:font-bold md:opacity-65 bg-slate-100'>
                &copy;{new Date().getFullYear()} Diksx Cars.
                Product of Kreative Sahara.
                Copyright <br /><a href='https://mwongerakiogora.vercel.app/'>©mwong.</a> All rights reserved.
            </div>
        </div>
    )
}

export default footer