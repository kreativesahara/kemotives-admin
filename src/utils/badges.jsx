const Badge = ({ variant, children }) => {
    let classes = "px-2 py-1 rounded-full text-xs ";

    switch (variant) {
        case 'success':
            classes += "bg-green-100 text-green-800";
            break;
        case 'warning':
            classes += "bg-yellow-100 text-yellow-800";
            break;
        case 'destructive':
            classes += "bg-red-100 text-red-800";
            break;
        default:
            classes += "bg-blue-100 text-blue-800";
    }

    return <span className={classes}>{children}</span>;
};

export default Badge;