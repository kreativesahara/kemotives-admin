
import Layout from "../components/Layout";
// Define the Pricing component
function Pricing() {  

    return (
        <Layout>
            {/* Remove PageCanonical - canonical is set in updateSeo */}
            <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <p className="text-center mb-12 text-gray-600">Choose the perfect plan for your needs</p>
                </div>
            </div>
        </Layout>
    );
}

export default Pricing;
