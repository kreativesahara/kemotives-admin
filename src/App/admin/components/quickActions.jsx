const QuickAction = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
    </div>
);

export default QuickAction;