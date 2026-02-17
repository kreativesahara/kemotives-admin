const StatCard = ({ title, value, icon, bgColor, iconColor }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value?.toLocaleString() || 0}</h3>
            </div>
            <span className={`${bgColor} p-2 rounded-lg`}>
                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
            </span>
        </div>
    </div>
);

export default StatCard;