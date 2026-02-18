function Layout({ children }) {
    return (
        <>
    
            <main className="px-2 sm:px-3 min-h-screen max-w-[2000px] mx-auto overflow-x-hidden">
                <div className="w-full max-w-full mx-auto">
                    {children}
                </div>
            </main>
    
     
        </>
    )
}

export default Layout
