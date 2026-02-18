import Navbar from "./navbar/navbar.jsx"
import Footer from "./footer"



function Layout({ children }) {
    return (
        <>
            <Navbar />
            <main className="px-2 sm:px-3 min-h-screen max-w-[2000px] mx-auto overflow-x-hidden">
                <div className="w-full max-w-full mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
     
        </>
    )
}

export default Layout
