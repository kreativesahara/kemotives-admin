// A reusable card component for each subscription plan

export const SubscriptionCard = ({ plan, onSubscribe, loading }) => (
    <div
        className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full ${plan.border || ""
            }`}
    >
        <div className="flex-grow">
            <span className={`px-4 py-1 text-sm ${plan.bgColor || ''} rounded-full`}>
                {plan?.tier}
            </span>
            <h3 className="text-xl font-bold mt-4">{plan.name}</h3>
            <p className="text-3xl font-bold mt-4">
                {plan?.price}
                <span className="text-sm font-normal">{plan.period}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">30-day subscription</p>
            
            {/* Seller posting limit badge */}
            {plan.tier && (
                <div className="mt-3 mb-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${plan.btnColor.split(' ')[0].replace('bg-', 'bg-opacity-20 text-')}`}>
                        <span className="material-symbols-outlined text-sm mr-1">event_list</span>
                        {plan.tier === 'Starter' ? '10 listings' : 
                         plan.tier === 'Basic' ? '25 listings' : 
                         plan.tier === 'Growth' ? '50 listings' : 
                         plan.tier === 'Enterprise' ? '100 listings' : 
                         plan.tier === 'Custom' ? 'Unlimited listings' : 'Limited listings'}
                    </span>
                </div>
            )}
            
            <ul className="mt-6 space-y-4">
                {plan?.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                        <span className="material-symbols-outlined mr-2">check_circle</span>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
        <div className="mt-auto pt-6">
            <button
                className={`w-full text-white py-3 rounded-lg transition-colors duration-300 ${plan.btnColor}`}
                onClick={() => onSubscribe(plan)}
                disabled={loading}
            >
                {plan.btnText}
            </button>
        </div>
    </div>
);